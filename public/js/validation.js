/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Client-side Input Validation & Regex Engine
   Primary Owner: Akul Agarwal (25070122030) - Security & Validation Lead
   Co-owners: Adarsh Bimal (25070122016) - Frontend & UI/UX Lead
   Course Unit Mapping: Unit 3 (RegExp, Form Validation, Input Sanitization)
   ========================================================================== */

const Validator = {
  // Regex Patterns according to Course Unit 3 Syllabus
  patterns: {
    fullName: /^[A-Za-z\s]{3,60}$/,
    phone: /^[6-9]\d{9}$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    voucherCode: /^[A-Z0-9_-]{3,20}$/,
    upiId: /^[\w.-]+@[\w.-]+$/
  },

  /**
   * Validate full name
   * @param {string} name 
   * @returns {{ valid: boolean, error?: string }}
   */
  validateName(name) {
    if (!name || typeof name !== 'string') return { valid: false, error: 'Full name is required.' };
    const trimmed = name.trim();
    if (trimmed.length < 3 || trimmed.length > 60) {
      return { valid: false, error: 'Name must be between 3 and 60 characters.' };
    }
    if (!this.patterns.fullName.test(trimmed)) {
      return { valid: false, error: 'Name may only contain alphabetic letters and single spaces.' };
    }
    return { valid: true };
  },

  /**
   * Validate Indian 10-digit mobile number
   * @param {string} phone 
   * @returns {{ valid: boolean, error?: string }}
   */
  validatePhone(phone) {
    if (!phone) return { valid: false, error: 'Phone number is required.' };
    const cleanPhone = phone.replace(/\D/g, '');
    if (!this.patterns.phone.test(cleanPhone)) {
      return { valid: false, error: 'Phone number must be a valid 10-digit mobile number starting with 6-9.' };
    }
    return { valid: true };
  },

  /**
   * Validate email address
   * @param {string} email 
   * @returns {{ valid: boolean, error?: string }}
   */
  validateEmail(email) {
    if (!email) return { valid: false, error: 'Email address is required.' };
    const trimmed = email.trim().toLowerCase();
    if (!this.patterns.email.test(trimmed)) {
      return { valid: false, error: 'Please enter a valid email address (e.g., guest@example.com).' };
    }
    return { valid: true };
  },

  /**
   * Validate stay date interval (RULE 2: Checkout date must be after checkin date)
   * @param {string|Date} checkIn 
   * @param {string|Date} checkOut 
   * @returns {{ valid: boolean, error?: string, nights?: number }}
   */
  validateStayDates(checkIn, checkOut) {
    if (!checkIn || !checkOut) {
      return { valid: false, error: 'Both Check-In and Check-Out dates are required.' };
    }
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);

    if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) {
      return { valid: false, error: 'Invalid date format provided.' };
    }

    // Set hours to 0 to compare calendar dates
    inDate.setHours(0, 0, 0, 0);
    outDate.setHours(0, 0, 0, 0);

    const diffMs = outDate.getTime() - inDate.getTime();
    if (diffMs <= 0) {
      return { valid: false, error: 'Check-Out date must be strictly after Check-In date (minimum 1 night).' };
    }

    const nights = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return { valid: true, nights };
  },

  /**
   * Validate guest count against room capacity (RULE 3)
   * @param {number} guestCount 
   * @param {number} capacity 
   * @returns {{ valid: boolean, error?: string }}
   */
  validateCapacity(guestCount, capacity) {
    const guests = parseInt(guestCount, 10);
    const maxCap = parseInt(capacity, 10);
    if (isNaN(guests) || guests < 1) {
      return { valid: false, error: 'At least 1 guest is required.' };
    }
    if (guests > maxCap) {
      return { valid: false, error: `Guest count (${guests}) exceeds selected room capacity (${maxCap}).` };
    }
    return { valid: true };
  },

  /**
   * Validate file upload metadata (Unit 3 File Upload Security)
   * @param {File} file 
   * @returns {{ valid: boolean, error?: string }}
   */
  validateDocumentFile(file) {
    if (!file) return { valid: false, error: 'ID Proof document file is required.' };
    
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Only PDF, JPG, and PNG documents are allowed.' };
    }

    const maxBytes = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxBytes) {
      return { valid: false, error: 'File size exceeds maximum allowed limit of 5MB.' };
    }

    return { valid: true };
  },

  /**
   * Sanitize text against XSS/HTML injection (Unit 3 Security)
   * @param {string} str 
   * @returns {string}
   */
  sanitize(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};

// Export for Node/CommonJS or attach to browser window
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Validator;
} else {
  window.Validator = Validator;
}
