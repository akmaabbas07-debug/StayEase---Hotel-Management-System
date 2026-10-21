/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Voucher & VoucherUsage Mongoose Models
   Primary Owner: Ahasas Singh (25070122026) - Database Architect
   Course Unit Mapping: Unit 4 (Voucher Indexes, Constraints & Redemption Records)
   ========================================================================== */

const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true // Section 29: Index on voucher code
  },
  description: {
    type: String
  },
  discountType: {
    type: String,
    required: true,
    enum: ['PERCENTAGE', 'FIXED']
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  minBillAmount: {
    type: Number,
    default: 0
  },
  maxDiscount: {
    type: Number,
    default: null
  },
  validFrom: {
    type: Date,
    required: true,
    index: true // Section 29: Index on validFrom
  },
  validUntil: {
    type: Date,
    required: true,
    index: true // Section 29: Index on validUntil
  },
  usageLimit: {
    type: Number,
    default: 100
  },
  timesUsed: {
    type: Number,
    default: 0
  },
  perUserLimit: {
    type: Number,
    default: 1
  },
  applicableRoomTypes: [{
    type: String
  }],
  applicablePackages: [{
    type: String
  }],
  applicableServices: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
});

const Voucher = mongoose.model('Voucher', voucherSchema);

// Per-User Usage Tracking Collection
const voucherUsageSchema = new mongoose.Schema({
  voucherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Voucher',
    required: true,
    index: true
  },
  voucherCode: {
    type: String,
    required: true
  },
  guestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guest',
    required: true,
    index: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  discountApplied: {
    type: Number,
    required: true
  },
  usedAt: {
    type: Date,
    default: Date.now
  }
});

const VoucherUsage = mongoose.model('VoucherUsage', voucherUsageSchema);

module.exports = {
  Voucher,
  VoucherUsage
};
