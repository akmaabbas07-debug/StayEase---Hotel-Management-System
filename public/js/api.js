/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Centralized REST API Client
   Primary Owners: Adarsh Bimal (25070122016) & Akmal Abbas (25070122028)
   Course Unit Mapping: Unit 3 (Node.js HTTP, URL Query Strings, Fetch API)
   ========================================================================== */

const API = {
  baseUrl: '/api',

  /**
   * Helper request handler with JSON parsing and error wrapping
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {})
      }
    };

    // If body is FormData (e.g. file upload), let browser set Content-Type with boundary
    if (options.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = (data && data.message) || `HTTP Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }
      return data;
    } catch (err) {
      console.warn(`[API Client Warning] Failed call to ${endpoint}:`, err.message);
      throw err;
    }
  },

  /* ---------------- ROOMS & AVAILABILITY ---------------- */
  async getRooms(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/rooms?${params.toString()}`);
  },

  async checkAvailability(checkIn, checkOut, guests, type = '') {
    const params = new URLSearchParams({ checkIn, checkOut, guests, type });
    return this.request(`/rooms/availability?${params.toString()}`);
  },

  /* ---------------- GUEST & BOOKINGS ---------------- */
  async registerGuest(guestData) {
    return this.request('/guests', {
      method: 'POST',
      body: JSON.stringify(guestData)
    });
  },

  async createBooking(bookingData) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  },

  async getBooking(bookingId) {
    return this.request(`/bookings/${encodeURIComponent(bookingId)}`);
  },

  async checkIn(bookingId) {
    return this.request(`/bookings/${encodeURIComponent(bookingId)}/check-in`, {
      method: 'POST'
    });
  },

  async checkOut(bookingId) {
    return this.request(`/bookings/${encodeURIComponent(bookingId)}/checkout`, {
      method: 'POST'
    });
  },

  async upgradeRoom(bookingId, newRoomId) {
    return this.request(`/bookings/${encodeURIComponent(bookingId)}/upgrade`, {
      method: 'POST',
      body: JSON.stringify({ newRoomId })
    });
  },

  /* ---------------- SERVICES & PACKAGES ---------------- */
  async addService(bookingId, serviceId, quantity) {
    return this.request(`/bookings/${encodeURIComponent(bookingId)}/services`, {
      method: 'POST',
      body: JSON.stringify({ serviceId, quantity })
    });
  },

  async removeService(bookingId, serviceId) {
    return this.request(`/bookings/${encodeURIComponent(bookingId)}/services/${encodeURIComponent(serviceId)}`, {
      method: 'DELETE'
    });
  },

  async updatePackage(bookingId, packageId) {
    return this.request(`/bookings/${encodeURIComponent(bookingId)}/package`, {
      method: 'POST',
      body: JSON.stringify({ packageId })
    });
  },

  async updateBreakfast(bookingId, breakfastOption) {
    return this.request(`/bookings/${encodeURIComponent(bookingId)}/breakfast`, {
      method: 'POST',
      body: JSON.stringify({ breakfastOption })
    });
  },

  /* ---------------- VOUCHERS & BILLING ---------------- */
  async applyVoucher(bookingId, voucherCode) {
    return this.request(`/bookings/${encodeURIComponent(bookingId)}/voucher/apply`, {
      method: 'POST',
      body: JSON.stringify({ voucherCode })
    });
  },

  async removeVoucher(bookingId) {
    return this.request(`/bookings/${encodeURIComponent(bookingId)}/voucher/remove`, {
      method: 'POST'
    });
  },

  async getBill(bookingId) {
    return this.request(`/bookings/${encodeURIComponent(bookingId)}/bill`);
  },

  /* ---------------- PAYMENT & RECEIPTS ---------------- */
  async processPayment(bookingId, amount, method, transactionRef = '') {
    return this.request(`/bookings/${encodeURIComponent(bookingId)}/pay`, {
      method: 'POST',
      body: JSON.stringify({ amount, method, transactionRef })
    });
  },

  async getReceiptUrl(bookingId) {
    return `${this.baseUrl}/bookings/${encodeURIComponent(bookingId)}/receipt`;
  },

  /* ---------------- FILE UPLOAD (Unit 3 Multer) ---------------- */
  async uploadDocument(formData) {
    return this.request('/upload', {
      method: 'POST',
      body: formData
    });
  },

  /* ---------------- REPORTS & LOGS ---------------- */
  async getDashboardReports() {
    return this.request('/reports/dashboard');
  },

  async getSystemLogs(lines = 50) {
    return this.request(`/logs?lines=${lines}`);
  }
};

window.API = API;
