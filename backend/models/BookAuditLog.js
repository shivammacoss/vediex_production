import mongoose from 'mongoose'

const bookAuditLogSchema = new mongoose.Schema({
  // Trade reference
  tradeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trade',
    required: true
  },
  tradeRef: {
    type: String,
    required: true
  },
  
  // User whose trade was affected
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Action details
  action: {
    type: String,
    enum: ['SEND_TO_A_BOOK', 'MOVE_TO_B_BOOK', 'LP_HEDGE_OPENED', 'LP_HEDGE_CLOSED', 'LP_HEDGE_FAILED', 'BOOK_TYPE_CHANGED'],
    required: true
  },
  previousBookType: {
    type: String,
    enum: ['UNASSIGNED', 'A_BOOK', 'B_BOOK'],
    default: 'UNASSIGNED'
  },
  newBookType: {
    type: String,
    enum: ['UNASSIGNED', 'A_BOOK', 'B_BOOK'],
    required: true
  },
  
  // LP details (if applicable)
  lpProvider: {
    type: String,
    default: null
  },
  lpTradeId: {
    type: String,
    default: null
  },
  lpStatus: {
    type: String,
    default: null
  },
  
  // Trade snapshot at time of action
  tradeSnapshot: {
    symbol: String,
    side: String,
    quantity: Number,
    openPrice: Number,
    currentPrice: Number,
    floatingPnl: Number
  },
  
  // Admin who performed the action
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  performedByEmail: {
    type: String,
    required: true
  },
  
  // Additional metadata
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    default: null
  },
  errorDetails: {
    type: String,
    default: null
  },
  
  // Success flag
  success: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

// Indexes for efficient querying
bookAuditLogSchema.index({ tradeId: 1 })
bookAuditLogSchema.index({ userId: 1 })
bookAuditLogSchema.index({ performedBy: 1 })
bookAuditLogSchema.index({ action: 1 })
bookAuditLogSchema.index({ createdAt: -1 })

export default mongoose.model('BookAuditLog', bookAuditLogSchema)
