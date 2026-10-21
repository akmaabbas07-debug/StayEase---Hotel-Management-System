/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: RoomType Mongoose Model
   Primary Owner: Ahasas Singh (25070122026) - Database Architect
   Course Unit Mapping: Unit 4 (MongoDB 1:N Relationships & Constraints)
   ========================================================================== */

const mongoose = require('mongoose');

const roomTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['Standard', 'Deluxe', 'Executive', 'Suite']
  },
  basePrice: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  description: {
    type: String
  },
  amenities: [{
    type: String
  }]
});

module.exports = mongoose.model('RoomType', roomTypeSchema);
