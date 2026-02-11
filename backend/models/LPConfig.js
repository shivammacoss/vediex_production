import mongoose from 'mongoose'
import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.LP_ENCRYPTION_KEY || 'vediex-lp-encryption-key-32char!'
const IV_LENGTH = 16

// Encryption helper
function encrypt(text) {
  if (!text) return null
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

// Decryption helper
function decrypt(text) {
  if (!text) return null
  try {
    const textParts = text.split(':')
    const iv = Buffer.from(textParts.shift(), 'hex')
    const encryptedText = Buffer.from(textParts.join(':'), 'hex')
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv)
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString()
  } catch (error) {
    console.error('Decryption error:', error)
    return null
  }
}

const lpConfigSchema = new mongoose.Schema({
  // Provider identification
  providerName: {
    type: String,
    required: true,
    unique: true
  },
  providerCode: {
    type: String,
    required: true,
    unique: true
  },
  
  // API Configuration
  apiBaseUrl: {
    type: String,
    required: true
  },
  apiKey: {
    type: String,
    required: true,
    set: encrypt,
    get: decrypt
  },
  secretKey: {
    type: String,
    required: true,
    set: encrypt,
    get: decrypt
  },
  
  // Additional auth fields (optional)
  accountId: {
    type: String,
    default: null,
    set: encrypt,
    get: decrypt
  },
  passphrase: {
    type: String,
    default: null,
    set: encrypt,
    get: decrypt
  },
  
  // API endpoints configuration
  endpoints: {
    placeOrder: { type: String, default: '/order' },
    closeOrder: { type: String, default: '/order/close' },
    getOrder: { type: String, default: '/order/{orderId}' },
    getPositions: { type: String, default: '/positions' },
    getBalance: { type: String, default: '/balance' }
  },
  
  // Symbol mapping (internal symbol -> LP symbol)
  symbolMapping: {
    type: Map,
    of: String,
    default: new Map()
  },
  
  // Settings
  isActive: {
    type: Boolean,
    default: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  timeoutMs: {
    type: Number,
    default: 30000
  },
  
  // Rate limiting
  rateLimit: {
    requestsPerSecond: { type: Number, default: 10 },
    requestsPerMinute: { type: Number, default: 300 }
  },
  
  // Supported features
  supportedSymbols: [{
    type: String
  }],
  supportedOrderTypes: [{
    type: String,
    enum: ['MARKET', 'LIMIT', 'STOP']
  }],
  
  // Statistics
  stats: {
    totalOrders: { type: Number, default: 0 },
    successfulOrders: { type: Number, default: 0 },
    failedOrders: { type: Number, default: 0 },
    lastOrderAt: { type: Date, default: null },
    lastError: { type: String, default: null },
    lastErrorAt: { type: Date, default: null }
  },
  
  // Admin tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { 
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
})

// Don't expose encrypted fields in JSON by default
lpConfigSchema.methods.toSafeJSON = function() {
  const obj = this.toObject()
  obj.apiKey = obj.apiKey ? '********' : null
  obj.secretKey = obj.secretKey ? '********' : null
  obj.accountId = obj.accountId ? '********' : null
  obj.passphrase = obj.passphrase ? '********' : null
  return obj
}

// Get decrypted credentials
lpConfigSchema.methods.getCredentials = function() {
  return {
    apiKey: this.apiKey,
    secretKey: this.secretKey,
    accountId: this.accountId,
    passphrase: this.passphrase
  }
}

export default mongoose.model('LPConfig', lpConfigSchema)
