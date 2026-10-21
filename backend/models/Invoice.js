/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Invoice Mongoose Model (1:1 Relationship with Booking)
   Primary Owner: Ahasas Singh (25070122026) - Database Architect
   Course Unit Mapping: Unit 4 (One-to-One Relationships & Embedded Document Schemas)
   ========================================================================== */

const mongoose = require('mongoose');
const { INVOICE_STATUS } = require('../config/constants');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true, // One-to-One: One final booking has exactly one final invoice (Section 26)
    index: true
  },
  guestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guest',
    required: true
  },
  roomCharges: {
    roomNumber: Number,
    roomType: String,
    pricePerNight: Number,
    nights: Number,
    total: Number
  },
  breakfastCharges: {
    option: String,
    pricePerPerson: Number,
    guests: Number,
    days: Number,
    total: Number
  },
  packageCharges: {
    packageName: String,
    price: Number
  },
  serviceCharges: [{
    name: String,
    quantity: Number,
    unitPrice: Number,
    total: Number
  }],
  subtotal: {
    type: Number,
    required: true
  },
  voucher: {
    code: String,
    discount: Number
  },
  taxRate: {
    type: Number,
    default: 0.18
  },
  taxAmount: {
    type: Number,
    required: true
  },
  grandTotal: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(INVOICE_STATUS),
    default: INVOICE_STATUS.PENDING
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  paidAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
