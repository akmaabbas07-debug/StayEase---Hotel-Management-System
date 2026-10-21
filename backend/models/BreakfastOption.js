/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: BreakfastOption Mongoose Model
   Primary Owner: Ahasas Singh (25070122026) - Database Architect
   Course Unit Mapping: Unit 4 (MongoDB Schema & Data Constraints)
   ========================================================================== */

const mongoose = require('mongoose');

const breakfastOptionSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    enum: ['NONE', 'CONTINENTAL', 'BUFFET', 'PREMIUM']
  },
  name: {
    type: String,
    required: true
  },
  pricePerPersonPerDay: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String
  }
});

module.exports = mongoose.model('BreakfastOption', breakfastOptionSchema);
