// MetaAPI Price Service - Real-time market data via MetaAPI Cloud
// Docs: https://metaapi.cloud/docs/client/

import MetaApi from 'metaapi.cloud-sdk'
import dotenv from 'dotenv'

dotenv.config()

const METAAPI_TOKEN = process.env.METAAPI_TOKEN || ''
const METAAPI_ACCOUNT_ID = process.env.METAAPI_ACCOUNT_ID || ''

// Price cache
const priceCache = new Map()

// Callbacks
let onPriceUpdate = null
let onConnectionChange = null

// Connection state
let isConnected = false
let connection = null
let account = null
let api = null

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

// Connect to MetaAPI
async function connect() {
  if (!METAAPI_TOKEN || !METAAPI_ACCOUNT_ID) {
    console.log('[MetaAPI] ERROR: Missing METAAPI_TOKEN or METAAPI_ACCOUNT_ID in .env')
    return
  }

  console.log('[MetaAPI] Initializing connection...')

  try {
    // Create MetaAPI instance
    api = new MetaApi(METAAPI_TOKEN)
    
    // Get account
    account = await api.metatraderAccountApi.getAccount(METAAPI_ACCOUNT_ID)
    
    console.log(`[MetaAPI] Account: ${account.name} (${account.type})`)
    console.log(`[MetaAPI] State: ${account.state}, Connection Status: ${account.connectionStatus}`)
    
    // Deploy account if needed
    if (account.state !== 'DEPLOYED') {
      console.log('[MetaAPI] Deploying account...')
      await account.deploy()
    }
    
    // Wait for account to connect
    console.log('[MetaAPI] Waiting for API server connection...')
    await account.waitConnected()
    
    // Create streaming connection
    connection = account.getStreamingConnection()
    
    // Add price listener
    connection.addSynchronizationListener({
      onSymbolPriceUpdated: (instanceIndex, price) => {
        handlePriceUpdate(price)
      },
      onConnected: (instanceIndex, replicas) => {
        console.log('[MetaAPI] Streaming connection established')
        isConnected = true
        if (onConnectionChange) onConnectionChange(true)
      },
      onDisconnected: (instanceIndex) => {
        console.log('[MetaAPI] Streaming connection lost')
        isConnected = false
        if (onConnectionChange) onConnectionChange(false)
      },
      onSymbolPricesUpdated: (instanceIndex, prices, equity, margin, freeMargin, marginLevel) => {
        // Batch price updates
        prices.forEach(price => handlePriceUpdate(price))
      }
    })
    
    // Connect to streaming
    await connection.connect()
    
    // Wait for synchronization
    console.log('[MetaAPI] Waiting for synchronization...')
    await connection.waitSynchronized()
    
    console.log('[MetaAPI] Connected and synchronized!')
    isConnected = true
    if (onConnectionChange) onConnectionChange(true)
    
    // Subscribe to symbols
    await subscribeToSymbols()
    
    // Log status after 5 seconds
    setTimeout(() => {
      console.log(`[MetaAPI] Price cache: ${priceCache.size} symbols`)
    }, 5000)
    
  } catch (error) {
    console.error('[MetaAPI] Connection error:', error.message)
    isConnected = false
    
    // Retry connection after 30 seconds
    setTimeout(connect, 30000)
  }
}

// Subscribe to market data for symbols
async function subscribeToSymbols() {
  if (!connection) return
  
  console.log(`[MetaAPI] Subscribing to ${ALL_SYMBOLS.length} symbols...`)
  
  let subscribed = 0
  let failed = 0
  
  for (const symbol of ALL_SYMBOLS) {
    try {
      await connection.subscribeToMarketData(symbol)
      subscribed++
    } catch (error) {
      // Symbol might not be available on this broker
      failed++
    }
  }
  
  console.log(`[MetaAPI] Subscribed: ${subscribed}, Failed: ${failed}`)
}

// Handle price update from MetaAPI
function handlePriceUpdate(price) {
  if (!price || !price.symbol) return
  
  const symbol = price.symbol
  const bid = price.bid || 0
  const ask = price.ask || 0
  
  if (bid <= 0 || ask <= 0) return
  
  const priceData = {
    bid,
    ask,
    mid: (bid + ask) / 2,
    time: price.time ? new Date(price.time).getTime() : Date.now(),
    spread: ask - bid
  }
  
  priceCache.set(symbol, priceData)
  
  if (onPriceUpdate) {
    onPriceUpdate(symbol, priceData)
  }
}

// Disconnect from MetaAPI
async function disconnect() {
  if (connection) {
    try {
      await connection.close()
    } catch (e) {}
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

// Fetch price (from cache, MetaAPI doesn't have REST for real-time)
async function fetchPriceREST(symbol) {
  return priceCache.get(symbol) || null
}

// Fetch batch prices
async function fetchBatchPricesREST(symbols) {
  const prices = {}
  for (const symbol of symbols) {
    const cached = priceCache.get(symbol)
    if (cached) prices[symbol] = cached
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
    accountState: account?.state || 'UNKNOWN',
    connectionStatus: account?.connectionStatus || 'UNKNOWN',
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
  
  if (connection && isConnected) {
    try {
      await connection.subscribeToMarketData(symbol)
      return true
    } catch (error) {
      console.error(`[MetaAPI] Failed to subscribe to ${symbol}:`, error.message)
      return false
    }
  }
  return false
}

// Get terminal state (positions, orders, etc.)
async function getTerminalState() {
  if (!connection) return null
  return connection.terminalState
}

// Get account information
async function getAccountInfo() {
  if (!connection) return null
  return connection.terminalState?.accountInformation
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
