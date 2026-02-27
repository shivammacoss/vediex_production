import crypto from 'crypto'

// LP API credentials (should be set in .env)
const LP_API_KEY = process.env.LP_API_KEY || ''
const LP_API_SECRET = process.env.LP_API_SECRET || ''

/**
 * HMAC authentication middleware for LP price feed endpoints
 * Validates requests from Corecen LP using HMAC-SHA256 signatures
 */
export function lpAuthMiddleware(req, res, next) {
  // Skip auth if LP credentials not configured (dev mode)
  if (!LP_API_KEY || !LP_API_SECRET) {
    console.warn('[LP Auth] LP credentials not configured - allowing request (dev mode)')
    return next()
  }

  const apiKey = req.headers['x-api-key']
  const timestamp = req.headers['x-timestamp']
  const signature = req.headers['x-signature']

  // Validate required headers
  if (!apiKey || !timestamp || !signature) {
    return res.status(401).json({
      success: false,
      message: 'Missing authentication headers'
    })
  }

  // Validate API key
  if (apiKey !== LP_API_KEY) {
    return res.status(401).json({
      success: false,
      message: 'Invalid API key'
    })
  }

  // Validate timestamp (allow 5 minute window)
  const requestTime = parseInt(timestamp, 10)
  const now = Date.now()
  const maxAge = 5 * 60 * 1000 // 5 minutes

  if (isNaN(requestTime) || Math.abs(now - requestTime) > maxAge) {
    return res.status(401).json({
      success: false,
      message: 'Request timestamp expired or invalid'
    })
  }

  // Generate expected signature
  // Corecen sends: METHOD + URL_PATH + TIMESTAMP + BODY
  const method = req.method.toUpperCase()
  // Use the path portion only (e.g., /api/lp/prices/batch), not the full URL
  const path = req.originalUrl || req.url
  const body = req.body ? JSON.stringify(req.body) : ''
  const message = `${method}${path}${timestamp}${body}`
  const expectedSignature = crypto
    .createHmac('sha256', LP_API_SECRET)
    .update(message)
    .digest('hex')
  
  // Debug logging for signature mismatch
  if (signature !== expectedSignature) {
    console.log('[LP Auth] Signature mismatch debug:')
    console.log('  Method:', method)
    console.log('  Path:', path)
    console.log('  Timestamp:', timestamp)
    console.log('  Body length:', body.length)
    console.log('  Expected sig:', expectedSignature.substring(0, 16) + '...')
    console.log('  Received sig:', signature.substring(0, 16) + '...')
  }

  // Validate signature
  if (signature !== expectedSignature) {
    return res.status(401).json({
      success: false,
      message: 'Invalid signature'
    })
  }

  next()
}

export default lpAuthMiddleware
