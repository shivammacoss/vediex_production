import express from 'express'
import Trade from '../models/Trade.js'
import LPTrade from '../models/LPTrade.js'
import LPConfig from '../models/LPConfig.js'
import BookAuditLog from '../models/BookAuditLog.js'
import User from '../models/User.js'
import Admin from '../models/Admin.js'
import lpService from '../services/lpService.js'

const router = express.Router()

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

export default router
