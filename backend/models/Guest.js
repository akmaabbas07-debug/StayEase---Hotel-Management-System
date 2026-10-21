/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Guest Mongoose Model
   Primary Owner: Ahasas Singh (25070122026) - Database Architect
   Course Unit Mapping: Unit 4 (MongoDB Schema, Types, Constraints & Indexes)
   ========================================================================== */

const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is mandatory'],
    trim: true,
    minlength: 3,
    maxlength: 60
  },
  phone: {
    type: String,
    required: [true, 'Phone number is mandatory'],
    trim: true,
    index: true
  },
  email: {
    type: String,
    required: [true, 'Email address is mandatory'],
    trim: true,
    lowercase: true,
    index: true
  },
  idType: {
    type: String,
    required: [true, 'Identity proof type is mandatory'],
    enum: ['Aadhar', 'Passport', 'Driving License', 'Voter ID']
  },
  idNumber: {
    type: String,
    required: [true, 'Identity proof number is mandatory'],
    trim: true
  },
  defaultGuestCount: {
    type: Number,
    default: 1,
    min: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Guest', guestSchema);
