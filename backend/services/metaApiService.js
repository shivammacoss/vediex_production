import dotenv from 'dotenv'
import { createRequire } from 'module'
dotenv.config()

const require = createRequire(import.meta.url)

// MetaAPI Configuration
const META_API_TOKEN = process.env.META_API_TOKEN || ''
const META_API_ACCOUNT_ID = process.env.META_API_ACCOUNT_ID || ''

// Price cache
const priceCache = new Map()

// Event callbacks
let onPriceUpdate = null
let onConnectionChange = null
let isConnected = false
let connection = null

// Symbol mapping
const SYMBOL_MAP = {
  'EURUSD': 'EURUSD', 'GBPUSD': 'GBPUSD', 'USDJPY': 'USDJPY', 'USDCHF': 'USDCHF',
  'AUDUSD': 'AUDUSD', 'NZDUSD': 'NZDUSD', 'USDCAD': 'USDCAD',
  'EURGBP': 'EURGBP', 'EURJPY': 'EURJPY', 'GBPJPY': 'GBPJPY', 'EURCHF': 'EURCHF',
  'EURAUD': 'EURAUD', 'EURCAD': 'EURCAD', 'AUDCAD': 'AUDCAD', 'AUDJPY': 'AUDJPY',
  'CADJPY': 'CADJPY', 'CHFJPY': 'CHFJPY', 'NZDJPY': 'NZDJPY', 'AUDNZD': 'AUDNZD',
  'XAUUSD': 'XAUUSD', 'XAGUSD': 'XAGUSD',
  'USOIL': 'USOIL', 'UKOIL': 'UKOIL',
  'BTCUSD': 'BTCUSD', 'ETHUSD': 'ETHUSD', 'BNBUSD': 'BNBUSD', 'SOLUSD': 'SOLUSD',
  'XRPUSD': 'XRPUSD', 'ADAUSD': 'ADAUSD', 'DOGEUSD': 'DOGEUSD', 'DOTUSD': 'DOTUSD',
  'LINKUSD': 'LINKUSD', 'MATICUSD': 'MATICUSD', 'LTCUSD': 'LTCUSD',
  'AVAXUSD': 'AVAXUSD', 'ATOMUSD': 'ATOMUSD', 'SHIBUSD': 'SHIBUSD',
  'UNIUSD': 'UNIUSD', 'TRXUSD': 'TRXUSD', 'ETCUSD': 'ETCUSD'
}

const ALL_SYMBOLS = Object.keys(SYMBOL_MAP)

const STREAMING_SYMBOLS = [
  // Forex Majors
  'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'NZDUSD', 'USDCAD',
  // Forex Crosses
  'EURGBP', 'EURJPY', 'GBPJPY', 'EURCHF', 'EURAUD', 'EURCAD',
  'AUDCAD', 'AUDJPY', 'CADJPY', 'CHFJPY', 'NZDJPY', 'AUDNZD',
  // Metals
  'XAUUSD', 'XAGUSD',
  // Commodities
  'USOIL', 'UKOIL'
]

// Connect to MetaAPI using SDK
async function connect() {
  if (!META_API_TOKEN || !META_API_ACCOUNT_ID) {
    console.log('[MetaAPI] Missing credentials')
    return
  }

  try {
    console.log('[MetaAPI] Loading SDK...')
    const MetaApi = require('metaapi.cloud-sdk').default
    
    console.log('[MetaAPI] Initializing...')
    const metaApi = new MetaApi(META_API_TOKEN)
    
    const account = await metaApi.metatraderAccountApi.getAccount(META_API_ACCOUNT_ID)
    console.log(`[MetaAPI] Account state: ${account.state}`)
    
    if (account.state !== 'DEPLOYED') {
      console.log('[MetaAPI] Deploying account...')
      await account.deploy()
      await account.waitDeployed()
    }
    
    connection = account.getStreamingConnection()
    
    // Full synchronization listener with all required methods
    connection.addSynchronizationListener({
      // Price updates - the main ones we need
      onSymbolPriceUpdated: async (instanceIndex, price) => {
        if (price.bid && price.ask) {
          const priceData = { bid: price.bid, ask: price.ask, time: Date.now() }
          priceCache.set(price.symbol, priceData)
          if (onPriceUpdate) onPriceUpdate(price.symbol, priceData)
        }
      },
      onSymbolPricesUpdated: async (instanceIndex, prices) => {
        for (const price of prices) {
          if (price.bid && price.ask) {
            const priceData = { bid: price.bid, ask: price.ask, time: Date.now() }
            priceCache.set(price.symbol, priceData)
            if (onPriceUpdate) onPriceUpdate(price.symbol, priceData)
          }
        }
      },
      // Connection events
      onConnected: async () => console.log('[MetaAPI] Stream connected'),
      onDisconnected: async () => console.log('[MetaAPI] Stream disconnected'),
      onBrokerConnectionStatusChanged: async (i, connected) => {
        console.log(`[MetaAPI] Broker: ${connected ? 'connected' : 'disconnected'}`)
      },
      // Required stub methods to prevent errors
      onAccountInformationUpdated: async () => {},
      onPositionUpdated: async () => {},
      onPositionRemoved: async () => {},
      onPositionsReplaced: async () => {},
      onPendingOrdersReplaced: async () => {},
      onOrderUpdated: async () => {},
      onOrderCompleted: async () => {},
      onOrdersReplaced: async () => {},
      onHistoryOrderAdded: async () => {},
      onDealAdded: async () => {},
      onDealsSynchronized: async () => {},
      onHistoryOrdersSynchronized: async () => {},
      onPendingOrdersSynchronized: async () => {},
      onPositionsSynchronized: async () => {},
      onSynchronizationStarted: async () => {},
      onSymbolSpecificationUpdated: async () => {},
      onSymbolSpecificationsUpdated: async () => {},
      onSymbolSpecificationRemoved: async () => {},
      onSymbolPriceUpdated: async (instanceIndex, price) => {
        if (price.bid && price.ask) {
          const priceData = { bid: price.bid, ask: price.ask, time: Date.now() }
          priceCache.set(price.symbol, priceData)
          if (onPriceUpdate) onPriceUpdate(price.symbol, priceData)
        }
      },
      onCandlesUpdated: async () => {},
      onTicksUpdated: async () => {},
      onBooksUpdated: async () => {},
      onSubscriptionDowngraded: async () => {},
      onStreamClosed: async () => {},
      onHealthStatus: async () => {},
      onSignalClientUpdated: async () => {}
    })
    
    await connection.connect()
    console.log('[MetaAPI] Waiting for sync...')
    await connection.waitSynchronized()
    
    console.log('[MetaAPI] Synchronized!')
    isConnected = true
    if (onConnectionChange) onConnectionChange(true)
    
    // Subscribe to market data
    for (const symbol of STREAMING_SYMBOLS) {
      try {
        await connection.subscribeToMarketData(symbol)
      } catch (e) {}
    }
    console.log(`[MetaAPI] Subscribed to ${STREAMING_SYMBOLS.length} symbols`)
    
  } catch (error) {
    console.error('[MetaAPI] Error:', error.message)
    isConnected = false
    setTimeout(connect, 30000)
  }
}

function disconnect() {
  if (connection) { connection.close(); connection = null }
  isConnected = false
}

function getPrice(symbol) { return priceCache.get(symbol) || null }
function getAllPrices() { return Object.fromEntries(priceCache) }
function getPriceCache() { return priceCache }
async function fetchPriceREST(symbol) { return priceCache.get(symbol) || null }
async function fetchBatchPricesREST(symbols) {
  const prices = {}
  for (const symbol of symbols) {
    const cached = priceCache.get(symbol)
    if (cached) prices[symbol] = cached
  }
  return prices
}

function setOnPriceUpdate(callback) { onPriceUpdate = callback }
function setOnConnectionChange(callback) { onConnectionChange = callback }
function isWebSocketConnected() { return isConnected }

async function subscribeToSymbols(symbols) {
  if (!connection) return
  for (const symbol of symbols) {
    try { await connection.subscribeToMarketData(symbol) } catch (e) {}
  }
}

async function unsubscribeFromSymbols(symbols) {
  if (!connection) return
  for (const symbol of symbols) {
    try { await connection.unsubscribeFromMarketData(symbol) } catch (e) {}
  }
}

function startRestPolling() {}
function stopRestPolling() {}

export default {
  connect, disconnect, getPrice, getAllPrices, getPriceCache,
  fetchPriceREST, fetchBatchPricesREST, subscribeToSymbols, unsubscribeFromSymbols,
  setOnPriceUpdate, setOnConnectionChange, isWebSocketConnected,
  startRestPolling, stopRestPolling, SYMBOL_MAP, ALL_SYMBOLS
}
