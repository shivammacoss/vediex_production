// MetaAPI Price Service - Real-time market data via MetaAPI SDK WebSocket Streaming
// Uses MetaAPI SDK for tick-by-tick real-time prices
// Docs: https://metaapi.cloud/docs/client/
// Fallback: Uses Binance API for crypto and simulated prices for forex when MetaAPI fails

import dotenv from 'dotenv'

// Use CommonJS require for MetaAPI SDK (Node.js version, not browser)
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const MetaApi = require('metaapi.cloud-sdk').default
const SynchronizationListener = require('metaapi.cloud-sdk').SynchronizationListener

dotenv.config()

const METAAPI_TOKEN = process.env.METAAPI_TOKEN || ''
const METAAPI_ACCOUNT_ID = process.env.METAAPI_ACCOUNT_ID || ''
const METAAPI_DOMAIN = process.env.METAAPI_DOMAIN || 'agiliumtrade.agiliumtrade.ai'

// MetaAPI SDK instance
let api = null
let account = null
let connection = null
let quoteListener = null

// Fallback mode flag
let useFallbackPrices = false
let fallbackInitialized = false

// Price cache
const priceCache = new Map()

// Callbacks
let onPriceUpdate = null
let onConnectionChange = null

// Connection state
let isConnected = false
let reconnectTimeout = null
let pricePollingInterval = null

// Symbol lists for different asset classes - Full list (89 instruments)
const FOREX_SYMBOLS = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'NZDUSD', 'USDCAD',
  'EURGBP', 'EURJPY', 'GBPJPY', 'EURCHF', 'EURAUD', 'EURCAD', 'AUDCAD',
  'AUDJPY', 'CADJPY', 'CHFJPY', 'NZDJPY', 'AUDNZD', 'CADCHF', 'GBPCHF',
  'GBPNZD', 'EURNZD', 'NZDCAD', 'NZDCHF', 'AUDCHF', 'GBPAUD', 'GBPCAD',
  'EURSGD', 'USDSGD', 'SGDJPY', 'USDHKD', 'USDMXN', 'USDTRY', 'USDZAR',
  'USDPLN', 'USDSEK', 'USDNOK', 'USDDKK', 'USDCZK', 'USDHUF', 'EURSEK',
  'EURNOK', 'EURDKK', 'EURPLN', 'EURHUF', 'EURCZK', 'EURTRY', 'EURZAR',
  'GBPSEK', 'GBPNOK', 'CHFSEK', 'SEKJPY', 'NOKJPY', 'ZARJPY'
]

const CRYPTO_SYMBOLS = [
  'BTCUSD', 'ETHUSD', 'LTCUSD', 'XRPUSD', 'BCHUSD', 'ADAUSD', 'DOGEUSD',
  'DOTUSD', 'LINKUSD', 'MATICUSD', 'SOLUSD', 'AVAXUSD', 'XLMUSD', 'UNIUSD',
  'ATOMUSD', 'ETCUSD', 'FILUSD', 'VETUSD', 'NEARUSD', 'ALGOUSD'
]

const METAL_SYMBOLS = [
  'XAUUSD', 'XAGUSD', 'XPTUSD', 'XPDUSD', 'XAUEUR', 'XAUAUD', 'XAUGBP',
  'XAUCHF', 'XAUJPY', 'XAGEUR'
]

const ENERGY_SYMBOLS = [
  'XTIUSD', 'XBRUSD', 'XNGUSD', 'USOIL', 'UKOIL'
]

const INDEX_SYMBOLS = [
  'US30', 'US500', 'USTEC', 'DE30', 'UK100', 'JP225', 'AU200', 'FR40', 'EU50', 'HK50'
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
  if (ENERGY_SYMBOLS.includes(symbol)) return 'Commodities'
  if (INDEX_SYMBOLS.includes(symbol)) return 'Indices'
  return 'Other'
}

// ============ FALLBACK PRICE PROVIDERS ============

// Base prices for fallback mode (approximate market prices)
const BASE_PRICES = {
  // Forex majors
  EURUSD: 1.0850, GBPUSD: 1.2650, USDJPY: 149.50, USDCHF: 0.8850, AUDUSD: 0.6550, NZDUSD: 0.6150, USDCAD: 1.3550,
  EURGBP: 0.8580, EURJPY: 162.20, GBPJPY: 189.10, EURCHF: 0.9610, EURAUD: 1.6560, EURCAD: 1.4700, AUDCAD: 0.8870,
  AUDJPY: 97.90, CADJPY: 110.30, CHFJPY: 168.90, NZDJPY: 91.90, AUDNZD: 1.0650, CADCHF: 0.6530, GBPCHF: 1.1200,
  // Metals
  XAUUSD: 2650.00, XAGUSD: 31.50, XPTUSD: 1020.00, XPDUSD: 1050.00,
  // Crypto (will be updated from Binance)
  BTCUSD: 97000, ETHUSD: 2650, LTCUSD: 105, XRPUSD: 2.45, BCHUSD: 350, ADAUSD: 0.75, DOGEUSD: 0.25,
  SOLUSD: 195, DOTUSD: 7.5, LINKUSD: 19, MATICUSD: 0.45, AVAXUSD: 38, XLMUSD: 0.42,
  // Indices
  US30: 44200, US500: 6050, USTEC: 21500, DE30: 21800, UK100: 8650, JP225: 39200,
  // Energy
  XTIUSD: 71.50, XBRUSD: 75.20, USOIL: 71.50, UKOIL: 75.20
}

// Binance symbol mapping
const BINANCE_SYMBOL_MAP = {
  BTCUSD: 'BTCUSDT', ETHUSD: 'ETHUSDT', LTCUSD: 'LTCUSDT', XRPUSD: 'XRPUSDT',
  BCHUSD: 'BCHUSDT', ADAUSD: 'ADAUSDT', DOGEUSD: 'DOGEUSDT', SOLUSD: 'SOLUSDT',
  DOTUSD: 'DOTUSDT', LINKUSD: 'LINKUSDT', MATICUSD: 'MATICUSDT', AVAXUSD: 'AVAXUSDT',
  XLMUSD: 'XLMUSDT', UNIUSD: 'UNIUSDT', ATOMUSD: 'ATOMUSDT', ETCUSD: 'ETCUSDT',
  FILUSD: 'FILUSDT', VETUSD: 'VETUSDT', NEARUSD: 'NEARUSDT', ALGOUSD: 'ALGOUSDT'
}

// Fetch crypto prices from Binance (free, no auth required)
async function fetchBinancePrices() {
  try {
    const response = await fetch('https://api.binance.com/api/v3/ticker/price')
    if (!response.ok) return {}
    
    const data = await response.json()
    const prices = {}
    
    for (const [ourSymbol, binanceSymbol] of Object.entries(BINANCE_SYMBOL_MAP)) {
      const ticker = data.find(t => t.symbol === binanceSymbol)
      if (ticker) {
        const price = parseFloat(ticker.price)
        const spread = price * 0.0005 // 0.05% spread
        prices[ourSymbol] = {
          bid: price - spread/2,
          ask: price + spread/2,
          mid: price,
          time: Date.now(),
          spread: spread
        }
      }
    }
    return prices
  } catch (error) {
    console.error('[Fallback] Binance fetch error:', error.message)
    return {}
  }
}

// Generate simulated price with small fluctuation
function generateSimulatedPrice(symbol, basePrice) {
  // Add small random fluctuation (±0.1%)
  const fluctuation = (Math.random() - 0.5) * 0.002
  const price = basePrice * (1 + fluctuation)
  
  // Calculate spread based on asset type
  let spreadPct = 0.0002 // 2 pips for forex
  if (CRYPTO_SYMBOLS.includes(symbol)) spreadPct = 0.001
  if (METAL_SYMBOLS.includes(symbol)) spreadPct = 0.0003
  if (INDEX_SYMBOLS.includes(symbol)) spreadPct = 0.0005
  if (ENERGY_SYMBOLS.includes(symbol)) spreadPct = 0.0004
  
  const spread = price * spreadPct
  return {
    bid: price - spread/2,
    ask: price + spread/2,
    mid: price,
    time: Date.now(),
    spread: spread
  }
}

// Fetch all fallback prices
async function fetchFallbackPrices() {
  console.log('[Fallback] Fetching prices from alternative sources...')
  
  // Get crypto prices from Binance
  const binancePrices = await fetchBinancePrices()
  let binanceCount = Object.keys(binancePrices).length
  
  // Update cache with Binance prices
  for (const [symbol, price] of Object.entries(binancePrices)) {
    priceCache.set(symbol, price)
    if (onPriceUpdate) onPriceUpdate(symbol, price)
  }
  
  // Generate simulated prices for other symbols
  let simulatedCount = 0
  for (const symbol of ALL_SYMBOLS) {
    if (binancePrices[symbol]) continue // Already have from Binance
    
    const basePrice = BASE_PRICES[symbol]
    if (basePrice) {
      const price = generateSimulatedPrice(symbol, basePrice)
      priceCache.set(symbol, price)
      if (onPriceUpdate) onPriceUpdate(symbol, price)
      simulatedCount++
    }
  }
  
  console.log(`[Fallback] Prices updated: ${binanceCount} from Binance, ${simulatedCount} simulated`)
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
    
    // 150ms delay between each request (faster updates)
    await new Promise(r => setTimeout(r, 150))
  }
  
  // Log summary
  if (successCount > 0 || !fetchAllPrices.lastLog || Date.now() - fetchAllPrices.lastLog > 30000) {
    console.log(`[MetaAPI] Prices: ${successCount} success, ${failCount} failed, cache size: ${priceCache.size}`)
    fetchAllPrices.lastLog = Date.now()
  }
}
fetchAllPrices.lastLog = 0

// Quote Listener class for real-time price streaming
class QuoteListener extends SynchronizationListener {
  async onSymbolPriceUpdated(instanceIndex, price) {
    const priceData = {
      bid: price.bid,
      ask: price.ask,
      mid: (price.bid + price.ask) / 2,
      time: Date.now(),
      spread: price.ask - price.bid
    }
    priceCache.set(price.symbol, priceData)
    if (onPriceUpdate) onPriceUpdate(price.symbol, priceData)
  }
  
  async onTicksUpdated(instanceIndex, ticks) {
    for (const tick of ticks) {
      const priceData = {
        bid: tick.bid || tick.ask,
        ask: tick.ask || tick.bid,
        mid: tick.bid && tick.ask ? (tick.bid + tick.ask) / 2 : (tick.bid || tick.ask),
        time: tick.time ? new Date(tick.time).getTime() : Date.now(),
        spread: tick.bid && tick.ask ? tick.ask - tick.bid : 0
      }
      priceCache.set(tick.symbol, priceData)
      if (onPriceUpdate) onPriceUpdate(tick.symbol, priceData)
    }
  }
  
  async onSubscriptionDowngraded(instanceIndex, symbol, updates, unsubscriptions) {
    console.log(`[MetaAPI] Subscription downgraded for ${symbol} due to rate limits`)
  }
  
  async onConnected(instanceIndex, replicas) {
    console.log('[MetaAPI] WebSocket connected')
    isConnected = true
    if (onConnectionChange) onConnectionChange(true)
  }
  
  async onDisconnected(instanceIndex) {
    console.log('[MetaAPI] WebSocket disconnected')
    isConnected = false
    if (onConnectionChange) onConnectionChange(false)
  }
}

// Connect to MetaAPI with fallback support
async function connect() {
  // If no MetaAPI credentials, use fallback immediately
  if (!METAAPI_TOKEN || !METAAPI_ACCOUNT_ID) {
    console.log('[MetaAPI] No credentials - using fallback price providers')
    useFallbackPrices = true
    await startFallbackMode()
    return
  }

  console.log('[MetaAPI] Initializing SDK connection...')
  console.log(`[MetaAPI] Account ID: ${METAAPI_ACCOUNT_ID.substring(0, 8)}...`)
  console.log(`[MetaAPI] Token: ${METAAPI_TOKEN.substring(0, 10)}...`)
  console.log(`[MetaAPI] Domain: ${METAAPI_DOMAIN}`)

  try {
    // Initialize MetaAPI SDK
    api = new MetaApi(METAAPI_TOKEN, { domain: METAAPI_DOMAIN })
    
    // Get account
    account = await api.metatraderAccountApi.getAccount(METAAPI_ACCOUNT_ID)
    console.log(`[MetaAPI] Account: ${account.name} (${account.type})`)
    console.log(`[MetaAPI] State: ${account.state}, Connection Status: ${account.connectionStatus}`)
    
    // Deploy account if not deployed
    if (account.state !== 'DEPLOYED') {
      console.log('[MetaAPI] Deploying account...')
      await account.deploy()
    }
    
    // Wait for connection to broker
    if (account.connectionStatus !== 'CONNECTED') {
      console.log('[MetaAPI] Waiting for broker connection...')
      await account.waitConnected({ timeoutInSeconds: 60 })
    }
    
    // Create streaming connection
    connection = account.getStreamingConnection()
    
    // Add quote listener for real-time prices
    quoteListener = new QuoteListener()
    connection.addSynchronizationListener(quoteListener)
    
    // Connect to MetaAPI WebSocket
    await connection.connect()
    
    // Wait for synchronization
    console.log('[MetaAPI] Waiting for synchronization...')
    await connection.waitSynchronized({ timeoutInSeconds: 120 })
    
    // Subscribe to market data for all symbols
    console.log('[MetaAPI] Subscribing to market data...')
    for (const symbol of ALL_SYMBOLS) {
      try {
        await connection.subscribeToMarketData(symbol, [
          { type: 'quotes', intervalInMilliseconds: 1000 },
          { type: 'ticks' }
        ])
      } catch (e) {
        // Symbol might not be available on this broker
        console.log(`[MetaAPI] Could not subscribe to ${symbol}: ${e.message}`)
      }
    }
    
    isConnected = true
    if (onConnectionChange) onConnectionChange(true)
    
    console.log(`[MetaAPI] Connected with WebSocket streaming! Subscribed symbols: ${ALL_SYMBOLS.length}`)
    
    // Also start fallback polling for symbols not available via MetaAPI
    if (pricePollingInterval) clearInterval(pricePollingInterval)
    pricePollingInterval = setInterval(async () => {
      try {
        // Fetch Binance prices for crypto (more reliable)
        const binancePrices = await fetchBinancePrices()
        for (const [symbol, price] of Object.entries(binancePrices)) {
          priceCache.set(symbol, price)
          if (onPriceUpdate) onPriceUpdate(symbol, price)
        }
      } catch (e) {
        console.error('[MetaAPI] Fallback price polling error:', e.message)
      }
    }, 5000)
    
  } catch (error) {
    console.error('[MetaAPI] SDK Connection error:', error.message)
    console.log('[MetaAPI] Switching to fallback price providers')
    useFallbackPrices = true
    await startFallbackMode()
  }
}

// Start fallback mode
async function startFallbackMode() {
  if (fallbackInitialized) return
  fallbackInitialized = true
  
  console.log('[Fallback] Starting fallback price mode...')
  
  // Fetch initial fallback prices
  await fetchFallbackPrices()
  
  isConnected = true
  if (onConnectionChange) onConnectionChange(true)
  
  console.log(`[Fallback] Initialized! Price cache: ${priceCache.size} symbols`)
  
  // Start polling fallback prices every 5 seconds for more real-time feel
  if (pricePollingInterval) clearInterval(pricePollingInterval)
  pricePollingInterval = setInterval(async () => {
    try {
      await fetchFallbackPrices()
    } catch (e) {
      console.error('[Fallback] Price polling error:', e.message)
    }
  }, 5000)
}

// Disconnect
async function disconnect() {
  if (pricePollingInterval) {
    clearInterval(pricePollingInterval)
    pricePollingInterval = null
  }
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout)
    reconnectTimeout = null
  }
  
  // Close MetaAPI SDK connection
  if (connection) {
    try {
      if (quoteListener) {
        connection.removeSynchronizationListener(quoteListener)
      }
      await connection.close()
    } catch (e) {
      console.error('[MetaAPI] Error closing connection:', e.message)
    }
    connection = null
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
