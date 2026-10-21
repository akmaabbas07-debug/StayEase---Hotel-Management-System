/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Shared System Constants & Business Rules Configuration
   Primary Owners: Akmal Abbas (25070122028) & Ahasas Singh (25070122026)
   Course Unit Mapping: Unit 3 (Node.js Modules), Unit 4 (Data Constraints)
   ========================================================================== */

module.exports = {
  // Business Constraints & Rules
  TAX_RATE_GST: 0.18,                   // 18% GST (Rule 12 & Section 14)
  CLEANING_DURATION_HOURS: 2,           // 2 Hours room sanitation window (Rule 14 & 15)
  CLEANING_DURATION_MS: 2 * 60 * 60 * 1000,

  // Room Status Enums (Section 4 & 5)
  ROOM_STATUS: {
    AVAILABLE: 'AVAILABLE',
    RESERVED: 'RESERVED',
    CHECKED_IN: 'CHECKED_IN',
    OCCUPIED: 'OCCUPIED',
    CHECKOUT_PENDING: 'CHECKOUT_PENDING',
    CLEANING: 'CLEANING',
    MAINTENANCE: 'MAINTENANCE'
  },

  // Booking Status Enums (Section 6)
  BOOKING_STATUS: {
    RESERVED: 'RESERVED',
    CHECKED_IN: 'CHECKED_IN',
    OCCUPIED: 'OCCUPIED',
    CHECKOUT_PENDING: 'CHECKOUT_PENDING',
    PAID: 'PAID',
    CHECKED_OUT: 'CHECKED_OUT',
    CANCELLED: 'CANCELLED'
  },

  // Payment Status Enums (Section 16)
  PAYMENT_STATUS: {
    PENDING: 'PENDING',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED',
    REFUNDED: 'REFUNDED'
  },

  // Invoice Status Enums
  INVOICE_STATUS: {
    PENDING: 'PENDING',
    PAID: 'PAID',
    CANCELLED: 'CANCELLED'
  },

  // File Upload Security Limits (Unit 3 - Akul Agarwal)
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
};
