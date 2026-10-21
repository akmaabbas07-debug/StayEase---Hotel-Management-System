/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Payment Mongoose Model
   Primary Owner: Ahasas Singh (25070122026) - Database Architect
   Course Unit Mapping: Unit 4 (Transaction Records & Foreign Key Relations)
   ========================================================================== */

const mongoose = require('mongoose');
const { PAYMENT_STATUS } = require('../config/constants');

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    index: true // Section 29: Index on bookingId
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  method: {
    type: String,
    required: true,
    enum: ['CASH', 'CARD', 'UPI']
  },
  status: {
    type: String,
    enum: Object.values(PAYMENT_STATUS),
    default: PAYMENT_STATUS.PENDING
  },
  transactionRef: {
    type: String,
    required: true,
    index: true // Section 29: Index on transactionRef
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Payment', paymentSchema);
