/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Server-side Security & Validation Engine
   Primary Owner: Akul Agarwal (25070122030) - DevOps & Security Lead
   Course Unit Mapping: Unit 3 (Node.js Validation, RegExp, Security & Sanitization)
   ========================================================================== */

const Validator = {
  patterns: {
    fullName: /^[A-Za-z\s]{3,60}$/,
    phone: /^[6-9]\d{9}$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    voucherCode: /^[A-Z0-9_-]{3,20}$/,
    upiId: /^[\w.-]+@[\w.-]+$/
  },

  sanitize(input) {
    if (typeof input !== 'string') return input;
    return input
      .trim()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  validateGuest(payload) {
    const errors = [];
    if (!payload.fullName || !this.patterns.fullName.test(payload.fullName.trim())) {
      errors.push('Full name is required (3–60 alphabetic characters and spaces only).');
    }
    if (!payload.phone || !this.patterns.phone.test(String(payload.phone).replace(/\D/g, ''))) {
      errors.push('A valid 10-digit Indian mobile number is required.');
    }
    if (!payload.email || !this.patterns.email.test(payload.email.trim().toLowerCase())) {
      errors.push('A valid email address is required.');
    }
    if (!payload.idType) {
      errors.push('Identity proof type is required.');
    }
    if (!payload.idNumber || String(payload.idNumber).trim().length < 4) {
      errors.push('A valid identity document number is required.');
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  validateDateInterval(checkIn, checkOut) {
    if (!checkIn || !checkOut) {
      return { isValid: false, error: 'Both checkInDate and checkOutDate are mandatory.' };
    }
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);

    if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) {
      return { isValid: false, error: 'Invalid date format.' };
    }

    inDate.setHours(0, 0, 0, 0);
    outDate.setHours(0, 0, 0, 0);

    const diffMs = outDate.getTime() - inDate.getTime();
    if (diffMs <= 0) {
      return { isValid: false, error: 'Check-out date must be strictly after check-in date (RULE 2).' };
    }

    const nights = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return { isValid: true, nights, inDate, outDate };
  }
};

module.exports = Validator;
