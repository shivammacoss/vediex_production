import mongoose from 'mongoose'

const lpTradeSchema = new mongoose.Schema({
  // Reference to internal trade
  internalTradeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trade',
    required: true
  },
  internalTradeRef: {
    type: String,
    required: true
  },
  
  // LP Provider details
  lpProvider: {
    type: String,
    required: true
  },
  lpTradeId: {
    type: String,
    required: true
  },
  lpOrderId: {
    type: String,
    default: null
  },
  
  // Trade details (mirrored from internal trade)
  symbol: {
    type: String,
    required: true
  },
  side: {
    type: String,
    enum: ['BUY', 'SELL'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  openPrice: {
    type: Number,
    required: true
  },
  closePrice: {
    type: Number,
    default: null
  },
  
  // LP specific fields
  lpOpenPrice: {
    type: Number,
    default: null
  },
  lpClosePrice: {
    type: Number,
    default: null
  },
  lpCommission: {
    type: Number,
    default: 0
  },
  lpSwap: {
    type: Number,
    default: 0
  },
  lpPnl: {
    type: Number,
    default: 0
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['PENDING', 'OPEN', 'CLOSED', 'FAILED', 'CANCELLED'],
    default: 'PENDING'
  },
  errorMessage: {
    type: String,
    default: null
  },
  retryCount: {
    type: Number,
    default: 0
  },
  
  // Timestamps
  sentAt: {
    type: Date,
    default: Date.now
  },
  openedAt: {
    type: Date,
    default: null
  },
  closedAt: {
    type: Date,
    default: null
  },
  
  // Admin tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  closedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Raw LP response storage
  lpOpenResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  lpCloseResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, { timestamps: true })

// Index for quick lookups
lpTradeSchema.index({ internalTradeId: 1 })
lpTradeSchema.index({ lpTradeId: 1 })
lpTradeSchema.index({ status: 1 })

export default mongoose.model('LPTrade', lpTradeSchema)
