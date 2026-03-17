// Broker Price Service - Real-time market data via WebSocket
// Supports: Forex, Crypto, US Stocks, Metals, Energy
// Data feed handled by broker - no API key required

import WebSocket from 'ws'
import Charges from '../models/Charges.js'

// Protocol codes
const PROTOCOL = {
  SUBSCRIBE_TRADE: 10000,
  TRADE_RESPONSE: 10001,
  TRADE_PUSH: 10002,
  SUBSCRIBE_DEPTH: 10003,
  DEPTH_RESPONSE: 10004,
  DEPTH_PUSH: 10005,
  HEARTBEAT: 10010
}

// Price cache
const priceCache = new Map()

// Callbacks
let onPriceUpdate = null
let onConnectionChange = null

// Connection state
let isConnected = false
let priceSource = 'LOCAL' // 'LOCAL' or 'CORECEN'
const connections = {}
let heartbeatIntervals = {}

// Dynamic symbol lists (fetched from Infoway API)
let dynamicSymbols = {
  forex: [],
  crypto: [],
  stocks: [],
  metals: [],
  energy: []
}

// Symbol name mappings (fetched from API)
const symbolNames = {}

// Fallback symbol lists (used if API fetch fails)
const FOREX_SYMBOLS = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'NZDUSD', 'USDCAD',
  'EURGBP', 'EURJPY', 'GBPJPY', 'EURCHF', 'EURAUD', 'EURCAD', 'AUDCAD',
  'AUDJPY', 'CADJPY', 'CHFJPY', 'NZDJPY', 'AUDNZD', 'CADCHF', 'GBPCHF',
  'GBPNZD', 'EURNZD', 'NZDCAD', 'NZDCHF', 'AUDCHF', 'GBPAUD', 'GBPCAD',
  'USDSGD', 'USDHKD', 'USDZAR', 'USDTRY', 'USDMXN', 'USDPLN', 'USDSEK',
  'USDNOK', 'USDDKK', 'USDCNH', 'EURPLN', 'EURSEK', 'EURNOK', 'EURDKK',
  'GBPSEK', 'GBPNOK', 'CHFSEK', 'SEKJPY', 'NOKJPY', 'SGDJPY', 'ZARJPY'
]

const CRYPTO_SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT',
  'TRXUSDT', 'LINKUSDT', 'MATICUSDT', 'DOTUSDT', 'SHIBUSDT', 'LTCUSDT', 'BCHUSDT',
  'AVAXUSDT', 'XLMUSDT', 'UNIUSDT', 'ATOMUSDT', 'ETCUSDT', 'FILUSDT', 'ICPUSDT',
  'VETUSDT', 'NEARUSDT', 'GRTUSDT', 'AAVEUSDT', 'MKRUSDT', 'ALGOUSDT', 'FTMUSDT',
  'SANDUSDT', 'MANAUSDT', 'AXSUSDT', 'THETAUSDT', 'FLOWUSDT', 'SNXUSDT', 'EOSUSDT',
  'CHZUSDT', 'ENJUSDT', 'PEPEUSDT', 'ARBUSDT', 'OPUSDT', 'SUIUSDT', 'APTUSDT',
  'INJUSDT', 'TONUSDT', 'HBARUSDT', 'NEOUSDT', 'FETUSDT', 'RNDRUSDT', 'WLDUSDT',
  'SEIUSDT', 'TIAUSDT', 'BLURUSDT', '1INCHUSDT', 'BONKUSDT', 'FLOKIUSDT', 'ORDIUSDT',
  'BTCUSD', 'ETHUSD', 'BNBUSD', 'SOLUSD', 'XRPUSD', 'ADAUSD', 'DOGEUSD', 'TRXUSD',
  'LINKUSD', 'MATICUSD', 'DOTUSD', 'SHIBUSD', 'LTCUSD', 'BCHUSD', 'AVAXUSD',
  'XLMUSD', 'UNIUSD', 'ATOMUSD', 'ETCUSD', 'FILUSD', 'ICPUSD', 'VETUSD', 'NEARUSD'
]

const STOCK_SYMBOLS = [
  'AAPL.US', 'MSFT.US', 'GOOGL.US', 'AMZN.US', 'NVDA.US', 'META.US', 'TSLA.US',
  'BRK-B.US', 'JPM.US', 'V.US', 'JNJ.US', 'WMT.US', 'PG.US', 'MA.US', 'UNH.US',
  'HD.US', 'DIS.US', 'BAC.US', 'ADBE.US', 'CRM.US', 'NFLX.US', 'CSCO.US',
  'PFE.US', 'TMO.US', 'ABT.US', 'COST.US', 'PEP.US', 'AVGO.US', 'NKE.US',
  'MRK.US', 'ABBV.US', 'KO.US', 'LLY.US', 'CVX.US', 'MCD.US', 'WFC.US',
  'DHR.US', 'ACN.US', 'NEE.US', 'TXN.US', 'PM.US', 'BMY.US', 'UPS.US',
  'QCOM.US', 'RTX.US', 'HON.US', 'INTC.US', 'AMD.US', 'PYPL.US', 'SBUX.US'
]

const METAL_SYMBOLS = [
  'XAUUSD', 'XAGUSD', 'XPTUSD', 'XPDUSD', 'XAUEUR', 'XAUAUD', 'XAUGBP',
  'XAUCHF', 'XAUJPY', 'XAGEUR', 'XAGAUD', 'XAGGBP'
]

const ENERGY_SYMBOLS = [
  'USOIL', 'UKOIL', 'NGAS', 'BRENT', 'WTI', 'GASOLINE', 'HEATING'
]

// Map internal symbols to Infoway format
let SYMBOL_MAP = {}

// Build ALL_SYMBOLS list (will be updated after API fetch)
let ALL_SYMBOLS = []

// Map crypto symbols: internal (BTCUSD) -> Infoway (BTCUSDT)
const CRYPTO_INTERNAL_TO_INFOWAY = {}
const CRYPTO_INFOWAY_TO_INTERNAL = {}

// Initialize symbols from static lists (broker provides data feed)
function initializeSymbols() {
  console.log('[Broker] Initializing symbols from static lists...')
  
  // Use static symbol lists
  dynamicSymbols.forex = FOREX_SYMBOLS
  dynamicSymbols.crypto = CRYPTO_SYMBOLS
  dynamicSymbols.stocks = STOCK_SYMBOLS
  dynamicSymbols.metals = METAL_SYMBOLS
  dynamicSymbols.energy = ENERGY_SYMBOLS
  
  // Build crypto mappings
  dynamicSymbols.crypto.forEach(s => {
    if (s.endsWith('USDT')) {
      const internal = s.replace('USDT', 'USD')
      CRYPTO_INTERNAL_TO_INFOWAY[internal] = s
      CRYPTO_INFOWAY_TO_INTERNAL[s] = internal
    }
  })
  
  // Build ALL_SYMBOLS and SYMBOL_MAP
  const allSymbols = new Set()
  
  // Add forex symbols
  dynamicSymbols.forex.forEach(s => {
    allSymbols.add(s)
    SYMBOL_MAP[s] = s
  })
  
  // Add crypto symbols (convert USDT to USD for internal use)
  dynamicSymbols.crypto.forEach(s => {
    const internal = s.endsWith('USDT') ? s.replace('USDT', 'USD') : s
    allSymbols.add(internal)
    SYMBOL_MAP[internal] = s
  })
  
  // Add stock symbols (remove .US suffix for internal use)
  dynamicSymbols.stocks.forEach(s => {
    const internal = s.replace('.US', '')
    allSymbols.add(internal)
    SYMBOL_MAP[internal] = s
  })
  
  // Add metal symbols
  dynamicSymbols.metals.forEach(s => {
    allSymbols.add(s)
    SYMBOL_MAP[s] = s
  })
  
  // Add energy symbols
  dynamicSymbols.energy.forEach(s => {
    allSymbols.add(s)
    SYMBOL_MAP[s] = s
  })
  
  ALL_SYMBOLS = Array.from(allSymbols)
  
  console.log(`[Broker] Loaded symbols - Forex: ${dynamicSymbols.forex.length}, Crypto: ${dynamicSymbols.crypto.length}, Stocks: ${dynamicSymbols.stocks.length}, Metals: ${dynamicSymbols.metals.length}, Energy: ${dynamicSymbols.energy.length}`)
  console.log(`[Broker] Total symbols: ${ALL_SYMBOLS.length}`)
}

// Generate unique trace ID
function generateTraceId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Initialize broker service (prices received from Corecen LP)
function connect() {
  console.log('[Broker] Initializing price service...')
  console.log('[Broker] Prices will be received from Corecen LP')

  // Initialize symbols from static lists
  initializeSymbols()

  // Mark as connected (will receive prices from Corecen)
  isConnected = true
  priceSource = 'CORECEN'
  if (onConnectionChange) onConnectionChange(true)
  
  console.log('[Broker] Price service ready - waiting for Corecen LP feed')
  console.log(`[Broker] Supported symbols - Forex: ${dynamicSymbols.forex.length}, Crypto: ${dynamicSymbols.crypto.length}, Stocks: ${dynamicSymbols.stocks.length}, Metals: ${dynamicSymbols.metals.length}, Energy: ${dynamicSymbols.energy.length}`)
}

function disconnect() {
  isConnected = false
  console.log('[Broker] Price service disconnected')
}

function getPrice(symbol) {
  return priceCache.get(symbol) || null
}

function getAllPrices() {
  return Object.fromEntries(priceCache)
}

function getPriceCache() {
  return priceCache
}

async function fetchPriceREST(symbol) {
  return priceCache.get(symbol) || null
}

async function fetchBatchPricesREST(symbols) {
  const prices = {}
  for (const symbol of symbols) {
    const cached = priceCache.get(symbol)
    if (cached) prices[symbol] = cached
  }
  return prices
}

function setOnPriceUpdate(callback) {
  onPriceUpdate = callback
}

function setOnConnectionChange(callback) {
  onConnectionChange = callback
}

function isWebSocketConnected() {
  return isConnected
}

function getConnectionStatus() {
  return {
    isConnected,
    priceCount: priceCache.size,
    priceSource
  }
}

/**
 * Update price from Corecen LP feed
 * Removes Infoway market spread and applies default spread
 * Called by LP routes when receiving price updates
 */
async function updatePrice(symbol, priceData) {
  const { bid, ask, spread, timestamp, source } = priceData
  
  // Calculate mid price from Infoway data (removing their spread)
  const midPrice = (bid + ask) / 2
  
  // Store both clean and spread prices for different use cases
  priceCache.set(symbol, {
    bid: midPrice,      // Zero spread for broker platform
    ask: midPrice,      // Zero spread for broker platform
    spread: 0,          // Zero spread for broker platform
    midPrice: midPrice, // Store mid price for reference
    timestamp: timestamp || Date.now(),
    source: 'CORECEN_CLEAN'
  })
  
  // Mark as connected if we're receiving prices
  if (!isConnected) {
    isConnected = true
    priceSource = 'CORECEN_CLEAN'
    if (onConnectionChange) onConnectionChange(true)
  }
  
  // Notify subscribers (for WebSocket broadcast)
  if (onPriceUpdate) {
    onPriceUpdate(symbol, priceCache.get(symbol))
  }
}

/**
 * Get price with appropriate spread based on book assignment
 * @param {string} symbol - Symbol to get price for
 * @param {string} bookType - 'A_BOOK', 'B_BOOK', or null for broker platform
 * @returns {Object} Price data with appropriate spread
 */
async function getPriceWithSpread(symbol, bookType = null) {
  const basePrice = priceCache.get(symbol)
  if (!basePrice) return null
  
  // For broker platform trading (no book assignment) - zero spread
  if (!bookType || bookType === 'B_BOOK') {
    return {
      bid: basePrice.midPrice,
      ask: basePrice.midPrice,
      spread: 0,
      timestamp: basePrice.timestamp,
      source: 'BROKER_PLATFORM'
    }
  }
  
  // For A-Book users - apply default spread for LP/Corecen
  if (bookType === 'A_BOOK') {
    const segment = categorizeSymbol(symbol)
    const defaultSpread = await getDefaultSpread(symbol, segment)
    
    let newBid, newAsk, newSpread
    
    if (defaultSpread.type === 'FIXED') {
      let spreadValue = defaultSpread.value
      
      if (segment === 'Forex') {
        spreadValue = spreadValue * 0.0001
        if (symbol.includes('JPY')) spreadValue *= 100
      }
      
      newBid = basePrice.midPrice - spreadValue
      newAsk = basePrice.midPrice + spreadValue
      newSpread = newAsk - newBid
    } else {
      const spreadAmount = basePrice.midPrice * (defaultSpread.value / 100)
      newBid = basePrice.midPrice - spreadAmount
      newAsk = basePrice.midPrice + spreadAmount
      newSpread = newAsk - newBid
    }
    
    console.log(`[Infoway] ${symbol} A-Book: bid=${newBid.toFixed(5)}, ask=${newAsk.toFixed(5)}, spread=${newSpread.toFixed(5)} (LP/Corecen)`)
    
    return {
      bid: newBid,
      ask: newAsk,
      spread: newSpread,
      timestamp: basePrice.timestamp,
      source: 'A_BOOK_LP'
    }
  }
  
  return basePrice
}

// Categorize symbol for frontend
function categorizeSymbol(symbol) {
  // Check symbol lists
  if (FOREX_SYMBOLS.includes(symbol)) return 'Forex'
  if (METAL_SYMBOLS.includes(symbol)) return 'Metals'
  if (ENERGY_SYMBOLS.includes(symbol)) return 'Energy'
  if (STOCK_SYMBOLS.includes(symbol) || STOCK_SYMBOLS.includes(symbol + '.US')) return 'Stocks'
  
  // Check crypto (both USDT and USD versions)
  const cryptoInternal = symbol.endsWith('USD') ? symbol.replace('USD', 'USDT') : symbol
  if (CRYPTO_SYMBOLS.includes(symbol) || CRYPTO_SYMBOLS.includes(cryptoInternal)) return 'Crypto'
  
  return 'Other'
}

// Get symbol name from API data
function getSymbolName(symbol) {
  return symbolNames[symbol] || symbol
}

// Calculate default spread for a symbol using Charges system
async function getDefaultSpread(symbol, segment) {
  try {
    // Get global/default charges for this segment
    const charges = await Charges.getChargesForTrade(null, symbol, segment, null)
    
    if (charges.spreadValue > 0) {
      console.log(`[Infoway] Using default spread for ${symbol}: ${charges.spreadValue} (${charges.spreadType})`)
      return { value: charges.spreadValue, type: charges.spreadType }
    }
    
    // Fallback default spreads if no charges configured
    const fallbackSpreads = {
      'Forex': { value: 1.5, type: 'FIXED' },      // 1.5 pips
      'Metals': { value: 50, type: 'FIXED' },      // 50 cents
      'Crypto': { value: 10, type: 'FIXED' },      // $10
      'Energy': { value: 0.05, type: 'FIXED' },     // 5 cents
      'Stocks': { value: 0.01, type: 'FIXED' }      // 1 cent
    }
    
    const fallback = fallbackSpreads[segment] || { value: 0, type: 'FIXED' }
    console.log(`[Infoway] Using fallback spread for ${symbol}: ${fallback.value} (${fallback.type})`)
    return fallback
  } catch (error) {
    console.error(`[Infoway] Error getting default spread for ${symbol}:`, error)
    return { value: 0, type: 'FIXED' }
  }
}

// Get dynamic symbols for frontend
function getDynamicSymbols() {
  return dynamicSymbols
}

export default {
  connect,
  disconnect,
  getPrice,
  getPriceWithSpread, // New function for book-based pricing
  getAllPrices,
  getPriceCache,
  fetchPriceREST,
  fetchBatchPricesREST,
  setOnPriceUpdate,
  setOnConnectionChange,
  isWebSocketConnected,
  getConnectionStatus,
  updatePrice,
  categorizeSymbol,
  getSymbolName,
  getDynamicSymbols,
  get SYMBOL_MAP() { return SYMBOL_MAP },
  get ALL_SYMBOLS() { return ALL_SYMBOLS },
  FOREX_SYMBOLS,
  CRYPTO_SYMBOLS,
  STOCK_SYMBOLS,
  METAL_SYMBOLS,
  ENERGY_SYMBOLS
}
