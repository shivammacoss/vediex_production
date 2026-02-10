// MetaAPI Price Service - Real-time market data via MetaAPI REST + WebSocket
// Using direct REST API calls instead of SDK (SDK is browser-only)
// Docs: https://metaapi.cloud/docs/client/

import WebSocket from 'ws'
import dotenv from 'dotenv'

dotenv.config()

const METAAPI_TOKEN = process.env.METAAPI_TOKEN || ''
const METAAPI_ACCOUNT_ID = process.env.METAAPI_ACCOUNT_ID || ''

// API endpoints
const API_URL = 'https://mt-client-api-v1.agiliumtrade.agiliumtrade.ai'
const PROVISIONING_API = 'https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai'

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
const FOREX_SYMBOLS = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'NZDUSD', 'USDCAD',
  'EURGBP', 'EURJPY', 'GBPJPY', 'EURCHF', 'EURAUD', 'EURCAD', 'AUDCAD',
  'AUDJPY', 'CADJPY', 'CHFJPY', 'NZDJPY', 'AUDNZD', 'CADCHF', 'GBPCHF',
  'GBPNZD', 'EURNZD', 'NZDCAD', 'NZDCHF', 'AUDCHF', 'GBPAUD', 'GBPCAD'
]

const CRYPTO_SYMBOLS = [
  'BTCUSD', 'ETHUSD', 'LTCUSD', 'XRPUSD', 'BCHUSD', 'ADAUSD', 'DOTUSD',
  'LINKUSD', 'UNIUSD', 'DOGEUSD', 'SOLUSD', 'MATICUSD', 'AVAXUSD', 'ATOMUSD'
]

const METAL_SYMBOLS = [
  'XAUUSD', 'XAGUSD', 'XPTUSD', 'XPDUSD'
]

const ENERGY_SYMBOLS = [
  'USOIL', 'UKOIL', 'NGAS'
]

const INDEX_SYMBOLS = [
  'US30', 'US500', 'USTEC', 'DE30', 'UK100', 'JP225'
]

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
  // Only log occasionally to avoid spam
  if (!fetchAllPrices.lastLog || Date.now() - fetchAllPrices.lastLog > 30000) {
    console.log('[MetaAPI] Fetching prices for all symbols...')
    fetchAllPrices.lastLog = Date.now()
  }
  
  let successCount = 0
  let failCount = 0
  
  // Fetch in batches to avoid rate limiting
  const batchSize = 10
  for (let i = 0; i < ALL_SYMBOLS.length; i += batchSize) {
    const batch = ALL_SYMBOLS.slice(i, i + batchSize)
    
    await Promise.all(batch.map(async (symbol) => {
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
        } else {
          failCount++
        }
      } catch (e) {
        failCount++
      }
    }))
    
    // Small delay between batches
    await new Promise(r => setTimeout(r, 100))
  }
  
  // Only log summary occasionally
  if (!fetchAllPrices.lastLog || Date.now() - fetchAllPrices.lastLog > 30000) {
    console.log(`[MetaAPI] Fetched prices: ${successCount} success, ${failCount} failed`)
  }
}

// Connect to MetaAPI
async function connect() {
  if (!METAAPI_TOKEN || !METAAPI_ACCOUNT_ID) {
    console.log('[MetaAPI] ERROR: Missing METAAPI_TOKEN or METAAPI_ACCOUNT_ID in .env')
    return
  }

  console.log('[MetaAPI] Initializing connection...')
  console.log(`[MetaAPI] Account ID: ${METAAPI_ACCOUNT_ID.substring(0, 8)}...`)
  console.log(`[MetaAPI] Token: ${METAAPI_TOKEN.substring(0, 10)}...`)

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
    
    // Start polling for price updates every 2 seconds
    if (pricePollingInterval) clearInterval(pricePollingInterval)
    pricePollingInterval = setInterval(async () => {
      try {
        await fetchAllPrices()
      } catch (e) {
        console.error('[MetaAPI] Price polling error:', e.message)
      }
    }, 2000)
    
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
