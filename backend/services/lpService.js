import crypto from 'crypto'
import LPConfig from '../models/LPConfig.js'
import LPTrade from '../models/LPTrade.js'
import BookAuditLog from '../models/BookAuditLog.js'
import Trade from '../models/Trade.js'

class LPService {
  constructor() {
    this.providers = new Map()
    this.initialized = false
  }

  // Initialize LP providers from database
  async initialize() {
    try {
      const configs = await LPConfig.find({ isActive: true })
      for (const config of configs) {
        this.providers.set(config.providerCode, config)
      }
      this.initialized = true
      console.log(`[LP Service] Initialized with ${this.providers.size} providers`)
    } catch (error) {
      console.error('[LP Service] Initialization error:', error)
    }
  }

  // Get active LP provider
  async getProvider(providerCode = null) {
    if (!this.initialized) await this.initialize()
    
    if (providerCode) {
      return this.providers.get(providerCode)
    }
    
    // Return primary provider
    for (const [code, config] of this.providers) {
      if (config.isPrimary && config.isActive) return config
    }
    
    // Return first active provider
    for (const [code, config] of this.providers) {
      if (config.isActive) return config
    }
    
    return null
  }

  // Generate signature for LP API authentication
  generateSignature(config, timestamp, method, endpoint, body = '') {
    const message = `${timestamp}${method}${endpoint}${body}`
    const credentials = config.getCredentials()
    return crypto
      .createHmac('sha256', credentials.secretKey)
      .update(message)
      .digest('hex')
  }

  // Make authenticated request to LP
  async makeRequest(config, method, endpoint, data = null) {
    const credentials = config.getCredentials()
    const timestamp = Date.now().toString()
    const url = `${config.apiBaseUrl}${endpoint}`
    const body = data ? JSON.stringify(data) : ''
    const signature = this.generateSignature(config, timestamp, method, endpoint, body)

    const headers = {
      'Content-Type': 'application/json',
      'X-API-KEY': credentials.apiKey,
      'X-TIMESTAMP': timestamp,
      'X-SIGNATURE': signature
    }

    if (credentials.accountId) {
      headers['X-ACCOUNT-ID'] = credentials.accountId
    }
    if (credentials.passphrase) {
      headers['X-PASSPHRASE'] = credentials.passphrase
    }

    const options = {
      method,
      headers,
      timeout: config.timeoutMs
    }

    if (data && method !== 'GET') {
      options.body = body
    }

    try {
      const response = await fetch(url, options)
      const responseData = await response.json()
      
      return {
        success: response.ok,
        status: response.status,
        data: responseData
      }
    } catch (error) {
      console.error(`[LP Service] Request error:`, error)
      return {
        success: false,
        status: 0,
        error: error.message
      }
    }
  }

  // Map internal symbol to LP symbol
  mapSymbol(config, internalSymbol) {
    if (config.symbolMapping && config.symbolMapping.has(internalSymbol)) {
      return config.symbolMapping.get(internalSymbol)
    }
    return internalSymbol
  }

  // Place hedge trade on LP
  async placeHedgeTrade(trade, adminId, providerCode = null) {
    const config = await this.getProvider(providerCode)
    if (!config) {
      throw new Error('No active LP provider configured')
    }

    // Check if already hedged
    const existingLpTrade = await LPTrade.findOne({
      internalTradeId: trade._id,
      status: { $in: ['PENDING', 'OPEN'] }
    })

    if (existingLpTrade) {
      throw new Error('Trade is already hedged on LP')
    }

    // Map symbol
    const lpSymbol = this.mapSymbol(config, trade.symbol)

    // Prepare order data
    const orderData = {
      symbol: lpSymbol,
      side: trade.side,
      type: 'MARKET',
      quantity: trade.quantity,
      clientOrderId: `VDX_${trade.tradeId}_${Date.now()}`
    }

    // Create LP trade record
    const lpTrade = new LPTrade({
      internalTradeId: trade._id,
      internalTradeRef: trade.tradeId,
      lpProvider: config.providerCode,
      lpTradeId: orderData.clientOrderId,
      symbol: trade.symbol,
      side: trade.side,
      quantity: trade.quantity,
      openPrice: trade.openPrice,
      status: 'PENDING',
      createdBy: adminId
    })

    await lpTrade.save()

    // Make API call to LP
    let retries = 0
    let lastError = null

    while (retries < config.maxRetries) {
      try {
        const response = await this.makeRequest(
          config,
          'POST',
          config.endpoints.placeOrder,
          orderData
        )

        if (response.success) {
          // Update LP trade with response
          lpTrade.status = 'OPEN'
          lpTrade.lpOrderId = response.data.orderId || response.data.id
          lpTrade.lpOpenPrice = response.data.price || response.data.executedPrice
          lpTrade.openedAt = new Date()
          lpTrade.lpOpenResponse = response.data
          await lpTrade.save()

          // Update internal trade
          trade.bookType = 'A_BOOK'
          trade.lpTradeId = lpTrade.lpTradeId
          trade.lpProvider = config.providerCode
          trade.lpStatus = 'HEDGED'
          trade.bookAssignedAt = new Date()
          trade.bookAssignedBy = adminId
          await trade.save()

          // Update provider stats
          config.stats.totalOrders++
          config.stats.successfulOrders++
          config.stats.lastOrderAt = new Date()
          await config.save()

          return {
            success: true,
            lpTrade,
            lpResponse: response.data
          }
        } else {
          lastError = response.error || response.data?.message || 'LP order failed'
          retries++
          lpTrade.retryCount = retries
          await lpTrade.save()
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * retries))
        }
      } catch (error) {
        lastError = error.message
        retries++
        lpTrade.retryCount = retries
        await lpTrade.save()
        await new Promise(resolve => setTimeout(resolve, 1000 * retries))
      }
    }

    // All retries failed
    lpTrade.status = 'FAILED'
    lpTrade.errorMessage = lastError
    await lpTrade.save()

    // Update provider stats
    config.stats.totalOrders++
    config.stats.failedOrders++
    config.stats.lastError = lastError
    config.stats.lastErrorAt = new Date()
    await config.save()

    throw new Error(`LP hedge failed after ${config.maxRetries} retries: ${lastError}`)
  }

  // Close hedge trade on LP
  async closeHedgeTrade(trade, adminId) {
    const lpTrade = await LPTrade.findOne({
      internalTradeId: trade._id,
      status: 'OPEN'
    })

    if (!lpTrade) {
      throw new Error('No open LP hedge found for this trade')
    }

    const config = await this.getProvider(lpTrade.lpProvider)
    if (!config) {
      throw new Error('LP provider not found')
    }

    // Prepare close order data
    const closeData = {
      orderId: lpTrade.lpOrderId,
      symbol: this.mapSymbol(config, trade.symbol),
      quantity: lpTrade.quantity
    }

    try {
      const response = await this.makeRequest(
        config,
        'POST',
        config.endpoints.closeOrder,
        closeData
      )

      if (response.success) {
        lpTrade.status = 'CLOSED'
        lpTrade.lpClosePrice = response.data.price || response.data.executedPrice
        lpTrade.lpPnl = response.data.pnl || 0
        lpTrade.closedAt = new Date()
        lpTrade.closedBy = adminId
        lpTrade.lpCloseResponse = response.data
        await lpTrade.save()

        // Update internal trade LP status
        trade.lpStatus = 'CLOSED'
        await trade.save()

        return {
          success: true,
          lpTrade,
          lpResponse: response.data
        }
      } else {
        throw new Error(response.error || response.data?.message || 'LP close failed')
      }
    } catch (error) {
      lpTrade.errorMessage = error.message
      await lpTrade.save()
      throw error
    }
  }

  // Get LP trade status
  async getLPTradeStatus(lpTradeId) {
    const lpTrade = await LPTrade.findOne({ lpTradeId })
    if (!lpTrade) return null

    const config = await this.getProvider(lpTrade.lpProvider)
    if (!config) return lpTrade

    try {
      const endpoint = config.endpoints.getOrder.replace('{orderId}', lpTrade.lpOrderId)
      const response = await this.makeRequest(config, 'GET', endpoint)

      if (response.success) {
        return {
          ...lpTrade.toObject(),
          lpLiveData: response.data
        }
      }
    } catch (error) {
      console.error('[LP Service] Get status error:', error)
    }

    return lpTrade
  }

  // Create audit log entry
  async createAuditLog(data) {
    try {
      const auditLog = new BookAuditLog(data)
      await auditLog.save()
      return auditLog
    } catch (error) {
      console.error('[LP Service] Audit log error:', error)
    }
  }

  // Update LP config at runtime
  updateConfig(config) {
    this.runtimeConfig = {
      apiUrl: config.apiUrl || process.env.LP_API_URL || 'https://api.corecen.com',
      apiKey: config.apiKey || process.env.LP_API_KEY || '',
      apiSecret: config.apiSecret || process.env.LP_API_SECRET || ''
    }
    console.log('[LP Service] Runtime config updated')
  }

  // Get runtime config or env config
  getCorecenConfig() {
    return this.runtimeConfig || {
      apiUrl: process.env.LP_API_URL || 'https://api.corecen.com',
      apiKey: process.env.LP_API_KEY || '',
      apiSecret: process.env.LP_API_SECRET || ''
    }
  }

  // Check if LP is configured
  isConfigured() {
    const config = this.getCorecenConfig()
    return !!(config.apiKey && config.apiSecret && config.apiUrl)
  }

  // Generate HMAC signature for Corecen API
  generateCorecenSignature(timestamp, method, path, body = '') {
    const config = this.getCorecenConfig()
    const signatureData = timestamp + method + path + body
    return crypto
      .createHmac('sha256', config.apiSecret)
      .update(signatureData)
      .digest('hex')
  }

  // Push A-Book trade to Corecen
  async pushTradeToCorecen(trade, user) {
    const config = this.getCorecenConfig()
    
    if (!config.apiKey || !config.apiSecret) {
      console.log('[LP Service] Corecen API credentials not configured, skipping trade push')
      return { success: false, message: 'LP credentials not configured' }
    }

    const timestamp = Date.now().toString()
    const method = 'POST'
    const path = '/api/v1/broker-api/trades/push'
    
    const tradeData = {
      external_trade_id: trade.tradeId || trade._id.toString(),
      user_id: user._id.toString(),
      user_email: user.email,
      user_name: user.firstName || user.name || 'Unknown',
      symbol: trade.symbol,
      side: trade.side.toUpperCase(),
      volume: trade.quantity || trade.volume,
      open_price: trade.openPrice,
      sl: trade.stopLoss || 0,
      tp: trade.takeProfit || 0,
      margin: trade.marginUsed || trade.margin || 0,
      leverage: trade.leverage || 100,
      trading_account_id: trade.tradingAccountId?.toString() || '',
      opened_at: trade.openedAt?.toISOString() || new Date().toISOString()
    }

    const body = JSON.stringify(tradeData)
    const signature = this.generateCorecenSignature(timestamp, method, path, body)

    try {
      const response = await fetch(`${config.apiUrl}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': config.apiKey,
          'X-Timestamp': timestamp,
          'X-Signature': signature
        },
        body
      })

      const data = await response.json()
      
      if (response.ok) {
        console.log(`[LP Service] Trade ${trade.tradeId} pushed to Corecen successfully`)
        return { success: true, data }
      } else {
        console.error(`[LP Service] Failed to push trade to Corecen:`, data)
        return { success: false, error: data.error?.message || 'Push failed' }
      }
    } catch (error) {
      console.error('[LP Service] Error pushing trade to Corecen:', error)
      return { success: false, error: error.message }
    }
  }

  // Close A-Book trade on Corecen
  async closeTradeOnCorecen(trade) {
    const config = this.getCorecenConfig()
    
    console.log(`[LP Service] ========== CLOSE TRADE REQUEST ==========`)
    console.log(`[LP Service] Trade ID: ${trade.tradeId}`)
    console.log(`[LP Service] LP API URL: ${config.apiUrl}`)
    console.log(`[LP Service] LP API Key configured: ${!!config.apiKey}`)
    console.log(`[LP Service] LP API Secret configured: ${!!config.apiSecret}`)
    
    if (!config.apiKey || !config.apiSecret) {
      console.error('[LP Service] ✗ Corecen API credentials not configured')
      console.log(`[LP Service] ==========================================`)
      return { success: false, message: 'LP credentials not configured' }
    }

    const timestamp = Date.now().toString()
    const method = 'POST'
    const path = '/api/v1/broker-api/trades/close'
    
    const closeData = {
      external_trade_id: trade.tradeId || trade._id.toString(),
      close_price: trade.closePrice,
      pnl: trade.pnl || trade.realizedPnl || 0,
      closed_by: trade.closedBy || 'USER',
      closed_at: trade.closedAt?.toISOString() || new Date().toISOString()
    }

    console.log(`[LP Service] Close payload:`, JSON.stringify(closeData, null, 2))

    const body = JSON.stringify(closeData)
    const signature = this.generateCorecenSignature(timestamp, method, path, body)

    try {
      console.log(`[LP Service] Sending close request to ${config.apiUrl}${path}`)
      
      const response = await fetch(`${config.apiUrl}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': config.apiKey,
          'X-Timestamp': timestamp,
          'X-Signature': signature
        },
        body
      })

      const data = await response.json()
      
      if (response.ok) {
        console.log(`[LP Service] ✓ Trade ${trade.tradeId} closed on Corecen`)
        console.log(`[LP Service] Response:`, JSON.stringify(data, null, 2))
        console.log(`[LP Service] ==========================================`)
        return { success: true, data }
      } else {
        console.error(`[LP Service] ✗ Failed to close trade on Corecen`)
        console.error(`[LP Service] HTTP Status: ${response.status}`)
        console.error(`[LP Service] Response:`, JSON.stringify(data, null, 2))
        console.log(`[LP Service] ==========================================`)
        return { success: false, error: data.error?.message || 'Close failed' }
      }
    } catch (error) {
      console.error('[LP Service] ✗ Error closing trade on Corecen:', error.message)
      console.log(`[LP Service] ==========================================`)
      return { success: false, error: error.message }
    }
  }
}

// Singleton instance
const lpService = new LPService()

export default lpService
