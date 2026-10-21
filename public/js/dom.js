/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: DOM Helpers & Notification UI Library
   Primary Owner: Adarsh Bimal (25070122016) - Frontend & UI/UX Lead
   Course Unit Mapping: Unit 3 (JavaScript DOM Manipulation & Dynamic Events)
   ========================================================================== */

const DOM = {
  /**
   * Currency formatter in Indian Rupees (INR)
   * @param {number} amount 
   * @returns {string}
   */
  formatCurrency(amount) {
    const val = Number(amount) || 0;
    return '₹' + val.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  },

  /**
   * Format ISO date string into readable text (e.g. 21 Oct 2026)
   * @param {string|Date} dateStr 
   * @returns {string}
   */
  formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  },

  /**
   * Show alert or toast notification on the page
   * @param {string} containerId 
   * @param {string} message 
   * @param {'success'|'danger'|'info'|'warning'} type 
   */
  showAlert(containerId, message, type = 'info') {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.className = `alert-box alert-${type}`;
    el.innerHTML = `<strong>${type.toUpperCase()}:</strong> ${message}`;
    el.style.display = 'block';
  },

  /**
   * Hide alert
   * @param {string} containerId 
   */
  hideAlert(containerId) {
    const el = document.getElementById(containerId);
    if (el) el.style.display = 'none';
  },

  /**
   * Generate colored HTML badge based on booking or room status
   * @param {string} status 
   * @returns {string} HTML string
   */
  renderStatusBadge(status) {
    const s = String(status).toUpperCase();
    let badgeClass = 'badge-info';
    if (['AVAILABLE', 'PAID', 'SUCCESS'].includes(s)) badgeClass = 'badge-success';
    if (['OCCUPIED', 'CHECKED_IN'].includes(s)) badgeClass = 'badge-primary';
    if (['CLEANING', 'PENDING', 'CHECKOUT_PENDING'].includes(s)) badgeClass = 'badge-warning';
    if (['MAINTENANCE', 'CANCELLED', 'FAILED'].includes(s)) badgeClass = 'badge-danger';
    return `<span class="badge ${badgeClass}">${s}</span>`;
  },

  /**
   * Modal control helpers
   */
  openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.style.display = 'flex';
  },

  closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.style.display = 'none';
  }
};

window.DOM = DOM;
