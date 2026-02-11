// MetaAPI Price Service - Real-time market data via MetaAPI REST + WebSocket
// Using direct REST API calls instead of SDK (SDK is browser-only)
// Docs: https://metaapi.cloud/docs/client/

import WebSocket from 'ws'
import dotenv from 'dotenv'

dotenv.config()

const METAAPI_TOKEN = process.env.METAAPI_TOKEN || ''
const METAAPI_ACCOUNT_ID = process.env.METAAPI_ACCOUNT_ID || ''

// API endpoints - MetaAPI uses region-specific endpoints
// Default to New York region, can be overridden in .env
const REGION = process.env.METAAPI_REGION || 'vint-hill'
const API_URL = `https://mt-client-api-v1.${REGION}.agiliumtrade.ai`
const PROVISIONING_API = `https://mt-provisioning-api-v1.${REGION}.agiliumtrade.ai`

// Price cache
const priceCache = new Map()

// Callbacks
let onPriceUpdate = null
let onConnectionChange = null

// Connection state
let isConnected = false
let ws = null
let reconnectTimeout = null
let pricePollingInterval = null

// Symbol lists for different asset classes
// Reduced list to avoid rate limiting - only most popular symbols
const FOREX_SYMBOLS = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF',
  'EURGBP', 'EURJPY', 'GBPJPY'
]

const CRYPTO_SYMBOLS = [
  'BTCUSD', 'ETHUSD'
]

const METAL_SYMBOLS = [
  'XAUUSD', 'XAGUSD'
]

const ENERGY_SYMBOLS = [
  'XTIUSD'
]

const INDEX_SYMBOLS = [
  'US30', 'US500'
]

// Rate limiting state
let rateLimitedUntil = 0

// All symbols to subscribe
let ALL_SYMBOLS = [
  ...FOREX_SYMBOLS,
  ...CRYPTO_SYMBOLS,
  ...METAL_SYMBOLS,
  ...ENERGY_SYMBOLS,
  ...INDEX_SYMBOLS
]

// Symbol mapping (internal -> MetaAPI format if different)
const SYMBOL_MAP = {}
ALL_SYMBOLS.forEach(s => { SYMBOL_MAP[s] = s })

// Categorize symbol
function categorizeSymbol(symbol) {
  if (FOREX_SYMBOLS.includes(symbol)) return 'Forex'
  if (CRYPTO_SYMBOLS.includes(symbol)) return 'Crypto'
  if (METAL_SYMBOLS.includes(symbol)) return 'Metals'
  if (ENERGY_SYMBOLS.includes(symbol)) return 'Energy'
  if (INDEX_SYMBOLS.includes(symbol)) return 'Indices'
  return 'Other'
}

// Make API request
async function apiRequest(url, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'auth-token': METAAPI_TOKEN,
      'Content-Type': 'application/json'
    }
  }
  if (body) options.body = JSON.stringify(body)
  
  const response = await fetch(url, options)
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

// Get account info
async function getAccountDetails() {
  try {
    const url = `${PROVISIONING_API}/users/current/accounts/${METAAPI_ACCOUNT_ID}`
    return await apiRequest(url)
  } catch (error) {
    console.error('[MetaAPI] Failed to get account details:', error.message)
    return null
  }
}

// Fetch current price for a symbol via REST
async function fetchSymbolPrice(symbol) {
  try {
    const url = `${API_URL}/users/current/accounts/${METAAPI_ACCOUNT_ID}/symbols/${symbol}/current-price`
    const data = await apiRequest(url)
    return data
  } catch (error) {
    // Check for rate limiting
    if (error.message.includes('429')) {
      return 'RATE_LIMITED'
    }
    // Log first few errors for debugging
    if (!fetchSymbolPrice.errorLogged) {
      console.error(`[MetaAPI] Price fetch error for ${symbol}:`, error.message)
      fetchSymbolPrice.errorLogged = true
    }
    return null
  }
}
fetchSymbolPrice.errorLogged = false

// Fetch prices for all symbols
async function fetchAllPrices() {
  // Check if we're rate limited
  if (Date.now() < rateLimitedUntil) {
    console.log(`[MetaAPI] Rate limited, waiting ${Math.ceil((rateLimitedUntil - Date.now()) / 1000)}s...`)
    return
  }
  
  let successCount = 0
  let failCount = 0
  let rateLimited = false
  
  // Fetch one symbol at a time with delay to avoid rate limiting
  for (const symbol of ALL_SYMBOLS) {
    if (rateLimited) break
    
    try {
      const price = await fetchSymbolPrice(symbol)
      if (price && price.bid && price.ask) {
        const priceData = {
          bid: price.bid,
          ask: price.ask,
          mid: (price.bid + price.ask) / 2,
          time: Date.now(),
          spread: price.ask - price.bid
        }
        priceCache.set(symbol, priceData)
        
        if (onPriceUpdate) {
          onPriceUpdate(symbol, priceData)
        }
        successCount++
      } else if (price === 'RATE_LIMITED') {
        rateLimited = true
        rateLimitedUntil = Date.now() + 60000 // Wait 60 seconds
        console.log('[MetaAPI] Rate limited! Pausing for 60 seconds...')
      } else {
        failCount++
      }
    } catch (e) {
      failCount++
    }
    
    // 500ms delay between each request
    await new Promise(r => setTimeout(r, 500))
  }
  
  // Log summary
  if (successCount > 0 || !fetchAllPrices.lastLog || Date.now() - fetchAllPrices.lastLog > 30000) {
    console.log(`[MetaAPI] Prices: ${successCount} success, ${failCount} failed, cache size: ${priceCache.size}`)
    fetchAllPrices.lastLog = Date.now()
  }
}
fetchAllPrices.lastLog = 0

// Connect to MetaAPI
async function connect() {
  if (!METAAPI_TOKEN || !METAAPI_ACCOUNT_ID) {
    console.log('[MetaAPI] ERROR: Missing METAAPI_TOKEN or METAAPI_ACCOUNT_ID in .env')
    return
  }

  console.log('[MetaAPI] Initializing connection...')
  console.log(`[MetaAPI] Account ID: ${METAAPI_ACCOUNT_ID.substring(0, 8)}...`)
  console.log(`[MetaAPI] Token: ${METAAPI_TOKEN.substring(0, 10)}...`)
  console.log(`[MetaAPI] Region: ${REGION}`)
  console.log(`[MetaAPI] API URL: ${API_URL}`)

  try {
    // Get account details first
    const account = await getAccountDetails()
    if (account) {
      console.log(`[MetaAPI] Account: ${account.name} (${account.type})`)
      console.log(`[MetaAPI] State: ${account.state}, Connection Status: ${account.connectionStatus}`)
    } else {
      console.log('[MetaAPI] WARNING: Could not get account details - check credentials')
    }
    
    // Fetch initial prices
    await fetchAllPrices()
    
    isConnected = true
    if (onConnectionChange) onConnectionChange(true)
    
    console.log(`[MetaAPI] Connected! Price cache: ${priceCache.size} symbols`)
    
    // Start polling for price updates every 15 seconds (to avoid rate limiting)
    if (pricePollingInterval) clearInterval(pricePollingInterval)
    pricePollingInterval = setInterval(async () => {
      try {
        await fetchAllPrices()
      } catch (e) {
        console.error('[MetaAPI] Price polling error:', e.message)
      }
    }, 15000)
    
  } catch (error) {
    console.error('[MetaAPI] Connection error:', error.message)
    isConnected = false
    
    // Retry connection after 30 seconds
    reconnectTimeout = setTimeout(connect, 30000)
  }
}

// Disconnect
function disconnect() {
  if (pricePollingInterval) {
    clearInterval(pricePollingInterval)
    pricePollingInterval = null
  }
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout)
    reconnectTimeout = null
  }
  if (ws) {
    ws.close()
    ws = null
  }
  isConnected = false
  console.log('[MetaAPI] Disconnected')
}

// Get price from cache
function getPrice(symbol) {
  return priceCache.get(symbol) || null
}

// Get all prices
function getAllPrices() {
  return Object.fromEntries(priceCache)
}

// Get price cache reference
function getPriceCache() {
  return priceCache
}

// Fetch price via REST
async function fetchPriceREST(symbol) {
  // Try cache first
  const cached = priceCache.get(symbol)
  if (cached) return cached
  
  // Fetch from API
  const price = await fetchSymbolPrice(symbol)
  if (price && price.bid && price.ask) {
    const priceData = {
      bid: price.bid,
      ask: price.ask,
      mid: (price.bid + price.ask) / 2,
      time: Date.now(),
      spread: price.ask - price.bid
    }
    priceCache.set(symbol, priceData)
    return priceData
  }
  return null
}

// Fetch batch prices
async function fetchBatchPricesREST(symbols) {
  const prices = {}
  for (const symbol of symbols) {
    const cached = priceCache.get(symbol)
    if (cached) {
      prices[symbol] = cached
    } else {
      const price = await fetchPriceREST(symbol)
      if (price) prices[symbol] = price
    }
  }
  return prices
}

// Set price update callback
function setOnPriceUpdate(callback) {
  onPriceUpdate = callback
}

// Set connection change callback
function setOnConnectionChange(callback) {
  onConnectionChange = callback
}

// Check if connected
function isWebSocketConnected() {
  return isConnected
}

// Get connection status
function getConnectionStatus() {
  return {
    isConnected,
    priceCount: priceCache.size
  }
}

// Get symbol name
function getSymbolName(symbol) {
  return symbol
}

// Get dynamic symbols
function getDynamicSymbols() {
  return {
    forex: FOREX_SYMBOLS,
    crypto: CRYPTO_SYMBOLS,
    metals: METAL_SYMBOLS,
    energy: ENERGY_SYMBOLS,
    indices: INDEX_SYMBOLS
  }
}

// Add custom symbol to subscription
async function addSymbol(symbol) {
  if (!ALL_SYMBOLS.includes(symbol)) {
    ALL_SYMBOLS.push(symbol)
    SYMBOL_MAP[symbol] = symbol
  }
  
  // Fetch price for new symbol
  const price = await fetchPriceREST(symbol)
  return price !== null
}

// Get terminal state (not available via REST)
async function getTerminalState() {
  return null
}

// Get account information
async function getAccountInfo() {
  return await getAccountDetails()
}

export default {
  connect,
  disconnect,
  getPrice,
  getAllPrices,
  getPriceCache,
  fetchPriceREST,
  fetchBatchPricesREST,
  setOnPriceUpdate,
  setOnConnectionChange,
  isWebSocketConnected,
  getConnectionStatus,
  categorizeSymbol,
  getSymbolName,
  getDynamicSymbols,
  addSymbol,
  getTerminalState,
  getAccountInfo,
  get SYMBOL_MAP() { return SYMBOL_MAP },
  get ALL_SYMBOLS() { return ALL_SYMBOLS },
  FOREX_SYMBOLS,
  CRYPTO_SYMBOLS,
  METAL_SYMBOLS,
  ENERGY_SYMBOLS,
  INDEX_SYMBOLS
}
