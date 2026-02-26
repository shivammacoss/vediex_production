import express from 'express'
import { lpAuthMiddleware } from '../middleware/lpAuth.js'
import infowayService from '../services/infowayService.js'

const router = express.Router()

/**
 * POST /api/lp/prices/batch
 * Receive batch price updates from Corecen LP
 * 
 * Request body:
 * {
 *   brokerId: string,
 *   ticks: Array<{ symbol, bid, ask, spread, timestamp, source }>,
 *   timestamp: number
 * }
 */
router.post('/prices/batch', lpAuthMiddleware, (req, res) => {
  try {
    const { ticks, timestamp } = req.body

    if (!ticks || !Array.isArray(ticks)) {
      return res.status(400).json({
        success: false,
        message: 'ticks array required'
      })
    }

    let updated = 0
    for (const tick of ticks) {
      if (tick.symbol && typeof tick.bid === 'number' && typeof tick.ask === 'number') {
        infowayService.updatePrice(tick.symbol, {
          bid: tick.bid,
          ask: tick.ask,
          spread: tick.spread || (tick.ask - tick.bid),
          timestamp: tick.timestamp || timestamp || Date.now(),
          source: tick.source || 'CORECEN'
        })
        updated++
      }
    }

    res.json({
      success: true,
      message: `Updated ${updated} prices`,
      count: updated
    })
  } catch (error) {
    console.error('[LP] Batch price update error:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

/**
 * POST /api/lp/prices
 * Receive single price update from Corecen LP
 */
router.post('/prices', lpAuthMiddleware, (req, res) => {
  try {
    const { symbol, bid, ask, spread, timestamp, source } = req.body

    if (!symbol || typeof bid !== 'number' || typeof ask !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'symbol, bid, and ask required'
      })
    }

    infowayService.updatePrice(symbol, {
      bid,
      ask,
      spread: spread || (ask - bid),
      timestamp: timestamp || Date.now(),
      source: source || 'CORECEN'
    })

    res.json({
      success: true,
      message: `Updated price for ${symbol}`
    })
  } catch (error) {
    console.error('[LP] Single price update error:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

/**
 * GET /api/lp/status
 * Get LP connection status
 */
router.get('/status', (req, res) => {
  const status = infowayService.getConnectionStatus()
  res.json({
    success: true,
    status: {
      ...status,
      source: 'CORECEN',
      mode: 'LP_FEED'
    }
  })
})

export default router
