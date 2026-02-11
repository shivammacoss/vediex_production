import mongoose from 'mongoose'

const paymentMethodSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Bank Transfer', 'UPI', 'QR Code', 'Token'],
    required: true
  },
  // Bank Transfer fields
  bankName: {
    type: String
  },
  accountNumber: {
    type: String
  },
  accountHolderName: {
    type: String
  },
  ifscCode: {
    type: String
  },
  // UPI fields
  upiId: {
    type: String
  },
  // QR Code fields
  qrCodeImage: {
    type: String
  },
  // Token fields
  tokenName: {
    type: String
  },
  tokenNetwork: {
    type: String
  },
  tokenAddress: {
    type: String
  },
  minimumAmount: {
    type: Number,
    default: 500
  },
  require2FA: {
    type: Boolean,
    default: false
  },
  // Common fields
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

export default mongoose.model('PaymentMethod', paymentMethodSchema)
