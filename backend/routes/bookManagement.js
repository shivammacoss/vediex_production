import express from 'express'
import Trade from '../models/Trade.js'
import LPTrade from '../models/LPTrade.js'
import LPConfig from '../models/LPConfig.js'
import BookAuditLog from '../models/BookAuditLog.js'
import User from '../models/User.js'
import Admin from '../models/Admin.js'
import lpService from '../services/lpService.js'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

// Get LP settings from environment variables
const getLpSettings = () => {
  return {
    lpApiKey: process.env.LP_API_KEY || '',
    lpApiSecret: process.env.LP_API_SECRET || '',
    lpApiUrl: process.env.LP_API_URL || 'https://api.corecen.com',
    corecenWsUrl: process.env.CORECEN_WS_URL || process.env.LP_API_URL || 'https://api.corecen.com',
    enabled: process.env.LP_ENABLED === 'true'
  }
}

// Middleware to verify superadmin
const verifySuperAdmin = async (req, res, next) => {
  try {
    const adminId = req.headers['x-admin-id'] || req.body.adminId
    if (!adminId) {
      return res.status(401).json({ success: false, message: 'Admin ID required' })
    }

    const admin = await Admin.findById(adminId)
    if (!admin || admin.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Superadmin access required' })
    }

    req.admin = admin
    next()
  } catch (error) {
    res.status(500).json({ success: false, message: 'Auth error', error: error.message })
  }
}

// GET /admin/trades/running - Get all running trades with book info
router.get('/trades/running', verifySuperAdmin, async (req, res) => {
  try {
    const { bookType, symbol, userId, page = 1, limit = 50 } = req.query
    
    const filter = { status: 'OPEN' }
    if (bookType && bookType !== 'ALL') filter.bookType = bookType
    if (symbol) filter.symbol = { $regex: symbol, $options: 'i' }
    if (userId) filter.userId = userId

    const trades = await Trade.find(filter)
      .populate('userId', 'name email')
      .populate('tradingAccountId', 'accountNumber accountType')
      .sort({ openedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean()

    const total = await Trade.countDocuments(filter)

    // Get book type counts
    const bookCounts = await Trade.aggregate([
      { $match: { status: 'OPEN' } },
      { $group: { _id: '$bookType', count: { $sum: 1 } } }
    ])

    const counts = {
      UNASSIGNED: 0,
      A_BOOK: 0,
      B_BOOK: 0,
      total: 0
    }
    bookCounts.forEach(b => {
      counts[b._id] = b.count
      counts.total += b.count
    })

    res.json({
      success: true,
      trades,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      bookCounts: counts
    })
  } catch (error) {
    console.error('Get running trades error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /admin/trade/:tradeId - Get trade details with LP info
router.get('/trade/:tradeId', verifySuperAdmin, async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.tradeId)
      .populate('userId', 'name email')
      .populate('tradingAccountId')
      .populate('bookAssignedBy', 'name email')
      .lean()

    if (!trade) {
      return res.status(404).json({ success: false, message: 'Trade not found' })
    }

    // Get LP trade if exists
    const lpTrade = await LPTrade.findOne({ internalTradeId: trade._id }).lean()

    // Get audit logs
    const auditLogs = await BookAuditLog.find({ tradeId: trade._id })
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()

    res.json({
      success: true,
      trade,
      lpTrade,
      auditLogs
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// POST /admin/trade/send-to-a-book - Send trade to A-Book (LP)
router.post('/trade/send-to-a-book', verifySuperAdmin, async (req, res) => {
  try {
    const { tradeId, lpProvider, notes } = req.body
    const admin = req.admin

    const trade = await Trade.findById(tradeId).populate('userId', 'name email')
    if (!trade) {
      return res.status(404).json({ success: false, message: 'Trade not found' })
    }

    if (trade.status !== 'OPEN') {
      return res.status(400).json({ success: false, message: 'Trade is not open' })
    }

    if (trade.bookType === 'A_BOOK' && trade.lpStatus === 'HEDGED') {
      return res.status(400).json({ success: false, message: 'Trade is already in A-Book' })
    }

    const previousBookType = trade.bookType

    // Create audit log entry
    const auditData = {
      tradeId: trade._id,
      tradeRef: trade.tradeId,
      userId: trade.userId._id,
      action: 'SEND_TO_A_BOOK',
      previousBookType,
      newBookType: 'A_BOOK',
      tradeSnapshot: {
        symbol: trade.symbol,
        side: trade.side,
        quantity: trade.quantity,
        openPrice: trade.openPrice,
        currentPrice: trade.currentPrice,
        floatingPnl: trade.floatingPnl
      },
      performedBy: admin._id,
      performedByEmail: admin.email,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      notes
    }

    try {
      // Place hedge trade on LP
      const result = await lpService.placeHedgeTrade(trade, admin._id, lpProvider)

      auditData.lpProvider = result.lpTrade.lpProvider
      auditData.lpTradeId = result.lpTrade.lpTradeId
      auditData.lpStatus = 'HEDGED'
      auditData.success = true

      await lpService.createAuditLog(auditData)

      res.json({
        success: true,
        message: 'Trade sent to A-Book successfully',
        trade: await Trade.findById(tradeId).lean(),
        lpTrade: result.lpTrade
      })
    } catch (lpError) {
      auditData.success = false
      auditData.errorDetails = lpError.message
      auditData.action = 'LP_HEDGE_FAILED'
      await lpService.createAuditLog(auditData)

      res.status(500).json({
        success: false,
        message: 'Failed to hedge on LP',
        error: lpError.message
      })
    }
  } catch (error) {
    console.error('Send to A-Book error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// POST /admin/trade/move-to-b-book - Move trade to B-Book
router.post('/trade/move-to-b-book', verifySuperAdmin, async (req, res) => {
  try {
    const { tradeId, notes } = req.body
    const admin = req.admin

    const trade = await Trade.findById(tradeId).populate('userId', 'name email')
    if (!trade) {
      return res.status(404).json({ success: false, message: 'Trade not found' })
    }

    if (trade.status !== 'OPEN') {
      return res.status(400).json({ success: false, message: 'Trade is not open' })
    }

    if (trade.bookType === 'B_BOOK') {
      return res.status(400).json({ success: false, message: 'Trade is already in B-Book' })
    }

    const previousBookType = trade.bookType

    // If trade was in A-Book, close LP hedge first
    if (trade.bookType === 'A_BOOK' && trade.lpStatus === 'HEDGED') {
      try {
        await lpService.closeHedgeTrade(trade, admin._id)
      } catch (lpError) {
        console.error('LP close error:', lpError)
        // Continue anyway - log the error
      }
    }

    // Update trade to B-Book
    trade.bookType = 'B_BOOK'
    trade.bookAssignedAt = new Date()
    trade.bookAssignedBy = admin._id
    await trade.save()

    // Create audit log
    await lpService.createAuditLog({
      tradeId: trade._id,
      tradeRef: trade.tradeId,
      userId: trade.userId._id,
      action: 'MOVE_TO_B_BOOK',
      previousBookType,
      newBookType: 'B_BOOK',
      tradeSnapshot: {
        symbol: trade.symbol,
        side: trade.side,
        quantity: trade.quantity,
        openPrice: trade.openPrice,
        currentPrice: trade.currentPrice,
        floatingPnl: trade.floatingPnl
      },
      performedBy: admin._id,
      performedByEmail: admin.email,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      notes,
      success: true
    })

    res.json({
      success: true,
      message: 'Trade moved to B-Book successfully',
      trade: await Trade.findById(tradeId).lean()
    })
  } catch (error) {
    console.error('Move to B-Book error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /admin/book-audit-logs - Get audit logs
router.get('/book-audit-logs', verifySuperAdmin, async (req, res) => {
  try {
    const { tradeId, userId, action, page = 1, limit = 50 } = req.query
    
    const filter = {}
    if (tradeId) filter.tradeId = tradeId
    if (userId) filter.userId = userId
    if (action) filter.action = action

    const logs = await BookAuditLog.find(filter)
      .populate('performedBy', 'name email')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean()

    const total = await BookAuditLog.countDocuments(filter)

    res.json({
      success: true,
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /admin/lp-providers - Get LP providers
router.get('/lp-providers', verifySuperAdmin, async (req, res) => {
  try {
    const providers = await LPConfig.find({ isActive: true })
    res.json({
      success: true,
      providers: providers.map(p => p.toSafeJSON())
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// POST /admin/lp-provider - Create/Update LP provider
router.post('/lp-provider', verifySuperAdmin, async (req, res) => {
  try {
    const { 
      _id, providerName, providerCode, apiBaseUrl, 
      apiKey, secretKey, accountId, passphrase,
      endpoints, symbolMapping, isActive, isPrimary,
      maxRetries, timeoutMs, supportedSymbols
    } = req.body

    let provider
    if (_id) {
      provider = await LPConfig.findById(_id)
      if (!provider) {
        return res.status(404).json({ success: false, message: 'Provider not found' })
      }
      Object.assign(provider, {
        providerName, providerCode, apiBaseUrl,
        endpoints, isActive, isPrimary, maxRetries, timeoutMs, supportedSymbols
      })
      if (apiKey && apiKey !== '********') provider.apiKey = apiKey
      if (secretKey && secretKey !== '********') provider.secretKey = secretKey
      if (accountId && accountId !== '********') provider.accountId = accountId
      if (passphrase && passphrase !== '********') provider.passphrase = passphrase
      if (symbolMapping) provider.symbolMapping = new Map(Object.entries(symbolMapping))
      provider.updatedBy = req.admin._id
    } else {
      provider = new LPConfig({
        providerName, providerCode, apiBaseUrl,
        apiKey, secretKey, accountId, passphrase,
        endpoints, isActive, isPrimary, maxRetries, timeoutMs, supportedSymbols,
        createdBy: req.admin._id
      })
      if (symbolMapping) provider.symbolMapping = new Map(Object.entries(symbolMapping))
    }

    await provider.save()

    // Reinitialize LP service
    await lpService.initialize()

    res.json({
      success: true,
      message: _id ? 'Provider updated' : 'Provider created',
      provider: provider.toSafeJSON()
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /admin/book-stats - Get book statistics
router.get('/book-stats', verifySuperAdmin, async (req, res) => {
  try {
    // Get trade counts by book type
    const bookStats = await Trade.aggregate([
      { $match: { status: 'OPEN' } },
      {
        $group: {
          _id: '$bookType',
          count: { $sum: 1 },
          totalVolume: { $sum: '$quantity' },
          totalMargin: { $sum: '$marginUsed' }
        }
      }
    ])

    // Get LP trade stats
    const lpStats = await LPTrade.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    // Get recent audit actions
    const recentActions = await BookAuditLog.find()
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    res.json({
      success: true,
      bookStats,
      lpStats,
      recentActions
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// ============================================
// USER-BASED BOOK MANAGEMENT (Concordex style)
// ============================================

// GET /api/book/users - Get all users with book type info
router.get('/users', async (req, res) => {
  try {
    const { bookType, search } = req.query
    
    let query = {}
    let conditions = []
    
    if (bookType && bookType !== 'all') {
      if (bookType === 'B') {
        conditions.push({ $or: [{ bookType: 'B' }, { bookType: { $exists: false } }, { bookType: null }] })
      } else {
        conditions.push({ bookType: bookType })
      }
    }
    if (search) {
      conditions.push({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      })
    }
    
    if (conditions.length > 0) {
      query = conditions.length === 1 ? conditions[0] : { $and: conditions }
    }
    
    const users = await User.find(query)
      .select('firstName name email bookType bookChangedAt isBlocked isBanned createdAt')
      .sort({ createdAt: -1 })
    
    const aBookUsers = await User.countDocuments({ bookType: 'A' })
    const bBookUsers = await User.countDocuments({ $or: [{ bookType: 'B' }, { bookType: { $exists: false } }, { bookType: null }] })
    const totalUsers = await User.countDocuments()
    
    res.json({
      success: true,
      users,
      stats: {
        aBookUsers,
        bBookUsers,
        totalUsers
      }
    })
  } catch (error) {
    console.error('Error fetching book users:', error)
    res.status(500).json({ success: false, message: 'Error fetching users', error: error.message })
  }
})

// PUT /api/book/users/:id/transfer - Transfer user to A or B book
// Also accepts optional ibId to assign user to an IB (for IB dashboard visibility)
router.put('/users/:id/transfer', async (req, res) => {
  try {
    const { bookType, ibId } = req.body
    
    if (!bookType || !['A', 'B'].includes(bookType)) {
      return res.status(400).json({ success: false, message: 'Invalid book type. Must be A or B' })
    }
    
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    
    const previousBookType = user.bookType
    user.bookType = bookType
    user.bookChangedAt = new Date()
    
    // If ibId provided, assign user to that IB (for IB dashboard visibility)
    if (ibId) {
      const ibUser = await User.findById(ibId)
      if (ibUser && ibUser.isIB && ibUser.ibStatus === 'ACTIVE') {
        user.parentIBId = ibUser._id
        user.referredBy = ibUser.referralCode
        console.log(`[Book Management] User ${user.email} assigned to IB ${ibUser.firstName} (${ibUser.referralCode})`)
      } else {
        console.warn(`[Book Management] Invalid or inactive IB ID: ${ibId}`)
      }
    }
    
    await user.save()
    
    console.log(`[Book Management] User ${user.email} transferred from ${previousBookType || 'B'} Book to ${bookType} Book`)
    
    res.json({
      success: true,
      message: `User transferred to ${bookType} Book successfully`,
      user: {
        _id: user._id,
        firstName: user.firstName || user.name,
        email: user.email,
        bookType: user.bookType,
        bookChangedAt: user.bookChangedAt,
        parentIBId: user.parentIBId,
        referredBy: user.referredBy
      }
    })
  } catch (error) {
    console.error('Error transferring user:', error)
    res.status(500).json({ success: false, message: 'Error transferring user', error: error.message })
  }
})

// PUT /api/book/users/:id/assign-ib - Assign user to an IB (for IB dashboard visibility)
router.put('/users/:id/assign-ib', async (req, res) => {
  try {
    const { ibId } = req.body
    
    if (!ibId) {
      return res.status(400).json({ success: false, message: 'IB ID is required' })
    }
    
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    
    const ibUser = await User.findById(ibId)
    if (!ibUser) {
      return res.status(404).json({ success: false, message: 'IB not found' })
    }
    
    if (!ibUser.isIB || ibUser.ibStatus !== 'ACTIVE') {
      return res.status(400).json({ success: false, message: 'Target user is not an active IB' })
    }
    
    const previousIBId = user.parentIBId
    user.parentIBId = ibUser._id
    user.referredBy = ibUser.referralCode
    await user.save()
    
    console.log(`[Book Management] User ${user.email} assigned to IB ${ibUser.firstName} (${ibUser.referralCode}), previous IB: ${previousIBId || 'none'}`)
    
    res.json({
      success: true,
      message: `User assigned to IB ${ibUser.firstName} successfully`,
      user: {
        _id: user._id,
        firstName: user.firstName || user.name,
        email: user.email,
        bookType: user.bookType,
        parentIBId: user.parentIBId,
        referredBy: user.referredBy
      },
      ib: {
        _id: ibUser._id,
        firstName: ibUser.firstName,
        email: ibUser.email,
        referralCode: ibUser.referralCode
      }
    })
  } catch (error) {
    console.error('Error assigning user to IB:', error)
    res.status(500).json({ success: false, message: 'Error assigning user to IB', error: error.message })
  }
})

// PUT /api/book/users/bulk-transfer - Bulk transfer users to A or B book
// Also accepts optional ibId to assign all users to an IB
router.put('/users/bulk-transfer', async (req, res) => {
  try {
    const { userIds, bookType, ibId } = req.body
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No users selected' })
    }
    
    if (!bookType || !['A', 'B'].includes(bookType)) {
      return res.status(400).json({ success: false, message: 'Invalid book type. Must be A or B' })
    }
    
    const updateFields = { 
      bookType: bookType,
      bookChangedAt: new Date()
    }
    
    // If ibId provided, assign all users to that IB
    if (ibId) {
      const ibUser = await User.findById(ibId)
      if (ibUser && ibUser.isIB && ibUser.ibStatus === 'ACTIVE') {
        updateFields.parentIBId = ibUser._id
        updateFields.referredBy = ibUser.referralCode
        console.log(`[Book Management] Bulk assigning ${userIds.length} users to IB ${ibUser.firstName} (${ibUser.referralCode})`)
      } else {
        console.warn(`[Book Management] Invalid or inactive IB ID for bulk transfer: ${ibId}`)
      }
    }
    
    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: updateFields }
    )
    
    console.log(`[Book Management] Bulk transferred ${result.modifiedCount} users to ${bookType} Book`)
    
    res.json({
      success: true,
      message: `${result.modifiedCount} users transferred to ${bookType} Book successfully`,
      modifiedCount: result.modifiedCount
    })
  } catch (error) {
    console.error('Error bulk transferring users:', error)
    res.status(500).json({ success: false, message: 'Error transferring users', error: error.message })
  }
})

// ============================================
// LP CONNECTION SETTINGS
// ============================================

// GET /api/book/lp-status - Check LP connection status
router.get('/lp-status', async (req, res) => {
  try {
    const settings = getLpSettings()
    
    if (!settings.lpApiUrl) {
      return res.json({
        success: true,
        connected: false,
        message: 'LP API URL not configured'
      })
    }
    
    const baseUrl = settings.lpApiUrl.replace(/\/api\/?$/, '')
    const healthUrl = `${baseUrl}/health`
    
    try {
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(3000)
      })
      
      if (response.ok) {
        res.json({
          success: true,
          connected: true,
          message: 'LP is connected and responding',
          lpUrl: settings.lpApiUrl
        })
      } else {
        res.json({
          success: true,
          connected: false,
          message: `LP returned status ${response.status}`
        })
      }
    } catch (fetchError) {
      res.json({
        success: true,
        connected: false,
        message: fetchError.code === 'ECONNREFUSED' 
          ? 'LP server is not running' 
          : fetchError.name === 'TimeoutError' 
            ? 'LP connection timed out' 
            : fetchError.message
      })
    }
  } catch (error) {
    console.error('Error checking LP status:', error)
    res.json({
      success: false,
      connected: false,
      message: 'Error checking LP status'
    })
  }
})

// GET /api/book/lp-settings - Get LP connection settings
router.get('/lp-settings', async (req, res) => {
  try {
    const settings = getLpSettings()
    
    const maskedSettings = {
      ...settings,
      lpApiKey: settings.lpApiKey ? `${settings.lpApiKey.substring(0, 8)}...${settings.lpApiKey.slice(-8)}` : '',
      lpApiSecret: settings.lpApiSecret ? `${'*'.repeat(32)}...${settings.lpApiSecret.slice(-8)}` : ''
    }
    
    res.json({
      success: true,
      settings: maskedSettings,
      fullSettings: settings
    })
  } catch (error) {
    console.error('Error fetching LP settings:', error)
    res.status(500).json({ success: false, message: 'Error fetching LP settings', error: error.message })
  }
})

// PUT /api/book/lp-settings - Update LP connection settings (runtime only)
router.put('/lp-settings', async (req, res) => {
  try {
    const { lpApiKey, lpApiSecret, lpApiUrl, corecenWsUrl } = req.body
    
    // Update runtime settings (for permanent changes, update .env)
    if (lpService.updateConfig) {
      lpService.updateConfig({
        apiUrl: lpApiUrl || process.env.LP_API_URL || 'http://localhost:3001',
        apiKey: lpApiKey || process.env.LP_API_KEY || '',
        apiSecret: lpApiSecret || process.env.LP_API_SECRET || ''
      })
    }
    
    console.log('[Book Management] LP settings updated (runtime)')
    
    res.json({
      success: true,
      message: 'LP settings updated (runtime only). For permanent changes, update .env file and restart server.'
    })
  } catch (error) {
    console.error('Error updating LP settings:', error)
    res.status(500).json({ success: false, message: 'Error updating LP settings', error: error.message })
  }
})

// POST /api/book/test-lp-connection - Test LP connection
router.post('/test-lp-connection', async (req, res) => {
  try {
    const { lpApiKey, lpApiSecret, lpApiUrl } = req.body
    
    if (!lpApiUrl) {
      return res.status(400).json({ success: false, message: 'LP API URL is required' })
    }
    
    const healthUrl = `${lpApiUrl}/health`
    
    console.log(`[Book Management] Testing LP connection to ${healthUrl}`)
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000)
    })
    
    if (response.ok) {
      const data = await response.json()
      
      if (lpApiKey && lpApiSecret) {
        try {
          const crypto = await import('crypto')
          const timestamp = Date.now().toString()
          const method = 'GET'
          const path = '/api/v1/broker-api/trades/stats'
          const body = ''
          
          const signatureData = timestamp + method + path + body
          const signature = crypto.createHmac('sha256', lpApiSecret)
            .update(signatureData)
            .digest('hex')
          
          const authTestUrl = `${lpApiUrl}${path}`
          const authResponse = await fetch(authTestUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': lpApiKey,
              'X-Timestamp': timestamp,
              'X-Signature': signature
            },
            signal: AbortSignal.timeout(5000)
          })
          
          if (authResponse.ok) {
            res.json({
              success: true,
              message: 'Connection successful! LP is reachable and credentials are valid.',
              lpStatus: data
            })
          } else {
            const authData = await authResponse.json().catch(() => ({}))
            res.json({
              success: true,
              message: `LP is reachable but authentication failed: ${authData.error?.message || 'Check your API key and secret.'}`,
              lpStatus: data,
              authStatus: 'failed'
            })
          }
        } catch (authError) {
          res.json({
            success: true,
            message: 'LP is reachable. Authentication test skipped.',
            lpStatus: data
          })
        }
      } else {
        res.json({
          success: true,
          message: 'Connection successful! LP is reachable. Add API credentials for full integration.',
          lpStatus: data
        })
      }
    } else {
      res.json({
        success: false,
        message: `LP returned status ${response.status}. Check the URL and ensure LP is running.`
      })
    }
  } catch (error) {
    console.error('Error testing LP connection:', error)
    
    let message = 'Connection failed. '
    if (error.name === 'TimeoutError' || error.code === 'ETIMEDOUT') {
      message += 'Request timed out. Check if the LP server is running and accessible.'
    } else if (error.code === 'ECONNREFUSED') {
      message += 'Connection refused. Ensure the LP server is running on the specified URL.'
    } else {
      message += error.message
    }
    
    res.json({
      success: false,
      message
    })
  }
})

export default router
