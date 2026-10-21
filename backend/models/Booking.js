/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Booking Mongoose Model
   Primary Owner: Ahasas Singh (25070122026) - Database Architect
   Co-owners: Akmal Abbas (Booking Lifecycle)
   Course Unit Mapping: Unit 4 (Compound Indexes & 1:N / 1:1 Relations)
   ========================================================================== */

const mongoose = require('mongoose');
const { BOOKING_STATUS, PAYMENT_STATUS } = require('../config/constants');

const bookingSchema = new mongoose.Schema({
  bookingNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  guestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guest',
    required: true,
    index: true // Section 29: Index on guestId for booking history
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
    index: true // Section 29: Index on roomId
  },
  checkInDate: {
    type: Date,
    required: true,
    index: true
  },
  checkOutDate: {
    type: Date,
    required: true,
    index: true
  },
  numberOfGuests: {
    type: Number,
    required: true,
    min: 1
  },
  bookingStatus: {
    type: String,
    enum: Object.values(BOOKING_STATUS),
    default: BOOKING_STATUS.RESERVED,
    index: true
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    default: null
  },
  breakfastOption: {
    type: String,
    enum: ['NONE', 'CONTINENTAL', 'BUFFET', 'PREMIUM'],
    default: 'NONE'
  },
  appliedVoucherCode: {
    type: String,
    default: null
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  subtotal: {
    type: Number,
    default: 0
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  grandTotal: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: Object.values(PAYMENT_STATUS),
    default: PAYMENT_STATUS.PENDING,
    index: true
  },
  checkedInAt: {
    type: Date,
    default: null
  },
  checkedOutAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Section 29 & 30: Compound Index for fast date overlap searches
bookingSchema.index({ roomId: 1, checkInDate: 1, checkOutDate: 1, bookingStatus: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
