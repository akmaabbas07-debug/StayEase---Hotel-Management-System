/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Room Mongoose Model
   Primary Owner: Ahasas Singh (25070122026) - Database Architect
   Course Unit Mapping: Unit 4 (MongoDB Indexes & Lifecycle Status Constraints)
   ========================================================================== */

const mongoose = require('mongoose');
const { ROOM_STATUS } = require('../config/constants');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: Number,
    required: [true, 'Room number is mandatory'],
    unique: true,
    index: true // Section 29: Index on roomNumber for fast room lookup
  },
  floor: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Standard', 'Deluxe', 'Executive', 'Suite'],
    index: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  pricePerNight: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: Object.values(ROOM_STATUS),
    default: ROOM_STATUS.AVAILABLE,
    index: true // Index on status for availability filtering
  },
  cleaningAvailableAfter: {
    type: Date,
    default: null // Timestamp when 2-hour cleaning cycle expires (Rule 14 & 15)
  },
  amenities: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
});

// Helper method: check if room is currently clean and available
roomSchema.methods.isEffectivelyAvailable = function() {
  if (this.status === ROOM_STATUS.AVAILABLE) return true;
  if (this.status === ROOM_STATUS.CLEANING && this.cleaningAvailableAfter) {
    return new Date() >= new Date(this.cleaningAvailableAfter);
  }
  return false;
};

module.exports = mongoose.model('Room', roomSchema);
