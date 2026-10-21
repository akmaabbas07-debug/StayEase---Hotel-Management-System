/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Service & BookingService Models (N:M Junction)
   Primary Owner: Ahasas Singh (25070122026) - Database Architect
   Course Unit Mapping: Unit 4 (Many-to-Many Modeling & Historical Price Locking)
   ========================================================================== */

const mongoose = require('mongoose');

// Base Service Master Model
const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true,
    enum: ['FOOD', 'HOUSEKEEPING', 'TRANSPORT', 'WELLNESS', 'MISC'],
    index: true // Section 29: Index on service category
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  taxRate: {
    type: Number,
    default: 0.18
  }
});

const Service = mongoose.model('Service', serviceSchema);

// Many-to-Many Junction Model: Booking <-> Services (Section 11 & 26)
const bookingServiceSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    index: true
  },
  guestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guest',
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  serviceName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  // RULE 16: Crucial historical purchase price lock so future service catalogue price edits don't change past bills!
  unitPriceAtPurchase: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  addedBy: {
    type: String,
    default: 'Reception Staff'
  }
});

const BookingService = mongoose.model('BookingService', bookingServiceSchema);

module.exports = {
  Service,
  BookingService
};
