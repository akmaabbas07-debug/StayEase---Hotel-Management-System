/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Document & AuditLog Mongoose Models
   Primary Owner: Akul Agarwal (25070122030) - Security & Audit Lead
   Course Unit Mapping: Unit 3 (File Upload Metadata & Security Audit Logs)
   ========================================================================== */

const mongoose = require('mongoose');

// Document Proof Upload Metadata Model (Section 20)
const documentSchema = new mongoose.Schema({
  guestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guest',
    required: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  },
  originalName: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const Document = mongoose.model('Document', documentSchema);

// Audit & Lifecycle Log Model (Section 8)
const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['CHECK_IN', 'ROOM_UPGRADE', 'SERVICE_ADDED', 'VOUCHER_APPLIED', 'PAYMENT_COMPLETED', 'CHECK_OUT']
  },
  entityType: {
    type: String,
    required: true,
    enum: ['BOOKING', 'ROOM', 'PAYMENT', 'VOUCHER']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  actor: {
    type: String,
    default: 'Reception Staff'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = {
  Document,
  AuditLog
};
