import mongoose from 'mongoose'

const partialCloseHistorySchema = new mongoose.Schema({
  tradeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trade',
    required: true
  },
  tradeIdString: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tradingAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  symbol: {
    type: String,
    required: true
  },
  side: {
    type: String,
    enum: ['BUY', 'SELL'],
    required: true
  },
  originalLot: {
    type: Number,
    required: true
  },
  closedLot: {
    type: Number,
    required: true
  },
  remainingLot: {
    type: Number,
    required: true
  },
  openPrice: {
    type: Number,
    required: true
  },
  closePrice: {
    type: Number,
    required: true
  },
  realizedPnl: {
    type: Number,
    required: true
  },
  commission: {
    type: Number,
    default: 0
  },
  swap: {
    type: Number,
    default: 0
  },
  closedAt: {
    type: Date,
    default: Date.now
  },
  closedBy: {
    type: String,
    enum: ['USER', 'ADMIN', 'SYSTEM'],
    default: 'USER'
  }
}, { timestamps: true })

// Index for faster queries
partialCloseHistorySchema.index({ tradeId: 1 })
partialCloseHistorySchema.index({ userId: 1 })
partialCloseHistorySchema.index({ tradingAccountId: 1 })

export default mongoose.model('PartialCloseHistory', partialCloseHistorySchema)
