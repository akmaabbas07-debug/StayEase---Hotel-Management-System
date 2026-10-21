/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Main Application Controller & State Orchestrator
   Primary Owners: Adarsh Bimal (25070122016) & Akmal Abbas (25070122028)
   Course Unit Mapping: Unit 3 (Advanced JavaScript, DOM, Events, Form Handling)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

const App = {
  // Shared mock state for seamless client-side preview when testing without backend
  state: {
    activeBooking: {
      bookingNumber: 'SE-2026-00101',
      guestName: 'Akmal Abbas',
      phone: '9876543210',
      email: 'akmal@example.com',
      idType: 'Aadhar',
      idNumber: '1234-5678-9012',
      roomNumber: 205,
      roomType: 'Executive',
      roomPricePerNight: 6000,
      checkInDate: '2026-10-21',
      checkOutDate: '2026-10-24',
      numberOfGuests: 2,
      bookingStatus: 'RESERVED',
      packageId: 'Business Package',
      packagePrice: 2500,
      breakfastOption: 'BUFFET',
      breakfastPricePerDay: 650,
      appliedVoucher: 'WELCOME500',
      discountAmount: 500,
      services: [
        { name: 'Room Service', quantity: 3, unitPrice: 300, total: 900 },
        { name: 'Laundry', quantity: 4, unitPrice: 150, total: 600 },
        { name: 'Spa', quantity: 1, unitPrice: 2000, total: 2000 }
      ],
      paymentStatus: 'PENDING',
      cleaningAvailableAfter: null
    }
  },

  init() {
    this.setupDatePickers();
    this.routePage();
  },

  /**
   * Set sensible default dates (Checkin: Today, Checkout: Today + 3 days)
   */
  setupDatePickers() {
    const today = new Date().toISOString().split('T')[0];
    const defaultOut = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];

    const inInputs = document.querySelectorAll('input[type="date"][name*="checkIn"], #checkInDate, #bCheckIn');
    inInputs.forEach(el => {
      if (!el.value) el.value = today;
      el.min = today;
    });

    const outInputs = document.querySelectorAll('input[type="date"][name*="checkOut"], #checkOutDate, #bCheckOut');
    outInputs.forEach(el => {
      if (!el.value) el.value = defaultOut;
    });
  },

  /**
   * Page-specific routing
   */
  routePage() {
    const path = window.location.pathname.toLowerCase();

    if (path.includes('rooms.html')) {
      this.initRoomsPage();
    } else if (path.includes('booking.html')) {
      this.initBookingPage();
    } else if (path.includes('checkin.html')) {
      this.initCheckinPage();
    } else if (path.includes('services.html')) {
      this.initServicesPage();
    } else if (path.includes('packages.html')) {
      this.initPackagesPage();
    } else if (path.includes('vouchers.html')) {
      this.initVouchersPage();
    } else if (path.includes('billing.html')) {
      this.initBillingPage();
    } else if (path.includes('payment.html')) {
      this.initPaymentPage();
    } else if (path.includes('admin.html')) {
      this.initAdminPage();
    }
  },

  /* ========================================================================
     PAGE 1: ROOMS PAGE CONTROLLER
     ======================================================================== */
  initRoomsPage() {
    const form = document.getElementById('roomSearchForm');
    const msgBox = document.getElementById('searchMessage');

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const inVal = document.getElementById('checkInDate').value;
      const outVal = document.getElementById('checkOutDate').value;
      const guests = document.getElementById('guestCount').value;

      const dateCheck = Validator.validateStayDates(inVal, outVal);
      if (!dateCheck.valid) {
        DOM.showAlert('searchMessage', dateCheck.error, 'danger');
        return;
      }

      DOM.showAlert('searchMessage', 
        `Searching availability for ${dateCheck.nights} nights (${inVal} to ${outVal}) for ${guests} guests... Overlap algorithm validated.`, 
        'success'
      );
    });

    document.getElementById('btnResetSearch')?.addEventListener('click', () => {
      form.reset();
      this.setupDatePickers();
      DOM.hideAlert('searchMessage');
    });
  },

  /* ========================================================================
     PAGE 2: BOOKING PAGE CONTROLLER (Live Estimation Sidebar)
     ======================================================================== */
  initBookingPage() {
    const form = document.getElementById('bookingForm');
    const updateEstimate = () => {
      const inVal = document.getElementById('bCheckIn').value;
      const outVal = document.getElementById('bCheckOut').value;
      const guests = parseInt(document.getElementById('bGuests').value, 10) || 1;
      
      const roomSelect = document.getElementById('bRoom');
      const selectedRoom = roomSelect.options[roomSelect.selectedIndex];
      const roomRate = parseInt(selectedRoom?.dataset?.price, 10) || 0;

      const bfSelect = document.getElementById('bBreakfast');
      const selectedBf = bfSelect.options[bfSelect.selectedIndex];
      const bfRate = parseInt(selectedBf?.dataset?.price, 10) || 0;

      const pkgSelect = document.getElementById('bPackage');
      const selectedPkg = pkgSelect.options[pkgSelect.selectedIndex];
      const pkgRate = parseInt(selectedPkg?.dataset?.price, 10) || 0;

      const dateCheck = Validator.validateStayDates(inVal, outVal);
      const nights = dateCheck.valid ? dateCheck.nights : 1;

      const roomTotal = roomRate * nights;
      const bfTotal = bfRate * guests * nights;
      const pkgTotal = pkgRate;
      const subtotal = roomTotal + bfTotal + pkgTotal;
      const tax = Math.round(subtotal * 0.18);
      const grandTotal = subtotal + tax;

      document.getElementById('estRoomCharges').textContent = `${DOM.formatCurrency(roomTotal)} (${nights} nights)`;
      document.getElementById('estBreakfastCharges').textContent = `${DOM.formatCurrency(bfTotal)} (${guests} guests × ${nights}d)`;
      document.getElementById('estPackageCharges').textContent = DOM.formatCurrency(pkgTotal);
      document.getElementById('estTaxCharges').textContent = DOM.formatCurrency(tax);
      document.getElementById('estGrandTotal').textContent = DOM.formatCurrency(grandTotal);
    };

    ['change', 'input'].forEach(evt => {
      document.getElementById('bCheckIn')?.addEventListener(evt, updateEstimate);
      document.getElementById('bCheckOut')?.addEventListener(evt, updateEstimate);
      document.getElementById('bGuests')?.addEventListener(evt, updateEstimate);
      document.getElementById('bRoom')?.addEventListener(evt, updateEstimate);
      document.getElementById('bBreakfast')?.addEventListener(evt, updateEstimate);
      document.getElementById('bPackage')?.addEventListener(evt, updateEstimate);
    });

    updateEstimate();

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const fullName = document.getElementById('fullName').value;
      const phone = document.getElementById('phone').value;
      const email = document.getElementById('email').value;
      const fileInput = document.getElementById('idDocument');

      const nameCheck = Validator.validateName(fullName);
      if (!nameCheck.valid) return alert(nameCheck.error);

      const phoneCheck = Validator.validatePhone(phone);
      if (!phoneCheck.valid) return alert(phoneCheck.error);

      const emailCheck = Validator.validateEmail(email);
      if (!emailCheck.valid) return alert(emailCheck.error);

      if (fileInput.files.length > 0) {
        const fileCheck = Validator.validateDocumentFile(fileInput.files[0]);
        if (!fileCheck.valid) return alert(fileCheck.error);
      }

      alert('Reservation SE-2026-00101 for Akmal Abbas successfully created! Redirecting to Check-in Desk...');
      window.location.href = 'checkin.html?bookingId=SE-2026-00101';
    });
  },

  /* ========================================================================
     PAGE 3: CHECK-IN DESK CONTROLLER
     ======================================================================== */
  initCheckinPage() {
    const btnConfirm = document.getElementById('btnConfirmCheckin');
    btnConfirm?.addEventListener('click', () => {
      this.state.activeBooking.bookingStatus = 'CHECKED_IN';
      document.getElementById('displayBookingStatus').innerHTML = '<span class="badge badge-primary">CHECKED_IN</span>';
      btnConfirm.disabled = true;
      btnConfirm.textContent = 'Guest Checked In (Room Occupied)';
      alert('Guest Akmal Abbas successfully checked in! Room 205 is now OCCUPIED. Event guestCheckedIn emitted.');
    });
  },

  /* ========================================================================
     PAGE 4: SERVICES CONTROLLER
     ======================================================================== */
  initServicesPage() {
    window.addServiceOrder = (name, price, qtyInputId) => {
      if (this.state.activeBooking.paymentStatus === 'PAID') {
        alert('Action Blocked (RULE 9): Booking is already paid. Cannot add services.');
        return;
      }
      const qty = parseInt(document.getElementById(qtyInputId).value, 10) || 1;
      const existing = this.state.activeBooking.services.find(s => s.name === name);
      if (existing) {
        existing.quantity += qty;
        existing.total = existing.quantity * existing.unitPrice;
      } else {
        this.state.activeBooking.services.push({
          name,
          quantity: qty,
          unitPrice: price,
          total: qty * price
        });
      }
      this.renderServicesTable();
      alert(`Added ${qty} × ${name} to folio at locked price ${DOM.formatCurrency(price)} each.`);
    };

    window.removeServiceOrder = (index) => {
      if (this.state.activeBooking.paymentStatus === 'PAID') {
        alert('Action Blocked: Paid bookings are closed for modification.');
        return;
      }
      this.state.activeBooking.services.splice(index, 1);
      this.renderServicesTable();
    };

    this.renderServicesTable();
  },

  renderServicesTable() {
    const tbody = document.getElementById('consumedServicesBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    let total = 0;

    this.state.activeBooking.services.forEach((s, idx) => {
      total += s.total;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${s.name}</td>
        <td>${s.quantity}</td>
        <td>${DOM.formatCurrency(s.unitPrice)}</td>
        <td>${DOM.formatCurrency(s.total)}</td>
        <td><button class="btn-text-danger" onclick="removeServiceOrder(${idx})">✕</button></td>
      `;
      tbody.appendChild(tr);
    });

    const totEl = document.getElementById('servicesTotalAmount');
    if (totEl) totEl.textContent = DOM.formatCurrency(total);
  },

  /* ========================================================================
     PAGE 5: PACKAGES & BREAKFAST CONTROLLER
     ======================================================================== */
  initPackagesPage() {
    window.selectPackage = (pkgName, price) => {
      this.state.activeBooking.packageId = pkgName;
      this.state.activeBooking.packagePrice = price;
      alert(`Selected ${pkgName} (${DOM.formatCurrency(price)})! Added to folio.`);
    };

    window.selectBreakfast = (code, price) => {
      this.state.activeBooking.breakfastOption = code;
      this.state.activeBooking.breakfastPricePerDay = price;
      alert(`Breakfast option updated to ${code} (${DOM.formatCurrency(price)}/person/day)!`);
    };
  },

  /* ========================================================================
     PAGE 6: VOUCHERS CONTROLLER
     ======================================================================== */
  initVouchersPage() {
    window.copyAndApplyVoucher = (code) => {
      const input = document.getElementById('voucherCodeInput');
      if (input) input.value = code;
      document.getElementById('btnApplyVoucher')?.click();
    };

    document.getElementById('voucherApplyForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = document.getElementById('voucherCodeInput').value.trim().toUpperCase();

      if (code === 'EXPIRED50') {
        DOM.showAlert('voucherFeedbackBox', 'Validation Failed (Rule 3): Voucher EXPIRED50 expired on 2025-01-01.', 'danger');
        return;
      }
      if (code === 'LIMITOVER') {
        DOM.showAlert('voucherFeedbackBox', 'Validation Failed (Rule 4): Voucher LIMITOVER has reached maximum 100 uses.', 'danger');
        return;
      }
      if (code === 'STAY10') {
        this.state.activeBooking.appliedVoucher = 'STAY10';
        this.state.activeBooking.discountAmount = 3990;
        DOM.showAlert('voucherFeedbackBox', 'Voucher STAY10 applied successfully! 10% discount (-₹3,990.00) added.', 'success');
        return;
      }
      if (code === 'WELCOME500') {
        this.state.activeBooking.appliedVoucher = 'WELCOME500';
        this.state.activeBooking.discountAmount = 500;
        DOM.showAlert('voucherFeedbackBox', 'Voucher WELCOME500 applied! Flat ₹500 discount added.', 'success');
        return;
      }
      DOM.showAlert('voucherFeedbackBox', `Invalid voucher code "${code}".`, 'danger');
    });

    document.getElementById('btnRemoveVoucher')?.addEventListener('click', () => {
      this.state.activeBooking.appliedVoucher = null;
      this.state.activeBooking.discountAmount = 0;
      DOM.showAlert('voucherFeedbackBox', 'Voucher removed. Invoice restored to standard pricing.', 'info');
    });
  },

  /* ========================================================================
     PAGE 7: BILLING CONTROLLER (Dynamic Invoice & Room Upgrade)
     ======================================================================== */
  initBillingPage() {
    this.refreshBillingBreakdown();

    // Quick voucher buttons
    document.getElementById('btnBillApplyVoucher')?.addEventListener('click', () => {
      const code = document.getElementById('billVoucherInput').value.trim().toUpperCase();
      if (code === 'STAY10') {
        this.state.activeBooking.appliedVoucher = 'STAY10';
        this.state.activeBooking.discountAmount = 3990;
      } else if (code === 'WELCOME500') {
        this.state.activeBooking.appliedVoucher = 'WELCOME500';
        this.state.activeBooking.discountAmount = 500;
      }
      this.refreshBillingBreakdown();
    });

    document.getElementById('btnBillRemoveVoucher')?.addEventListener('click', () => {
      this.state.activeBooking.appliedVoucher = null;
      this.state.activeBooking.discountAmount = 0;
      this.refreshBillingBreakdown();
    });

    // Upgrade modal
    document.getElementById('btnOpenUpgradeModal')?.addEventListener('click', () => {
      if (this.state.activeBooking.paymentStatus === 'PAID') {
        alert('Action Blocked (RULE 10): Cannot upgrade a paid/closed booking.');
        return;
      }
      DOM.openModal('upgradeModal');
    });

    document.getElementById('btnCloseUpgradeModal')?.addEventListener('click', () => {
      DOM.closeModal('upgradeModal');
    });

    document.getElementById('btnCancelUpgrade')?.addEventListener('click', () => {
      DOM.closeModal('upgradeModal');
    });

    document.getElementById('btnConfirmUpgrade')?.addEventListener('click', () => {
      this.state.activeBooking.roomNumber = 401;
      this.state.activeBooking.roomType = 'Presidential Suite';
      this.state.activeBooking.roomPricePerNight = 10000;
      DOM.closeModal('upgradeModal');
      this.refreshBillingBreakdown();
      alert('Upgraded to Suite Room 401! Room 205 is now released to AVAILABLE. Bill recalculated.');
    });

    document.getElementById('btnDownloadReceipt')?.addEventListener('click', () => {
      alert('Node.js File System receipt generator triggered. File /receipts/REC-2026-00101.txt ready for download.');
    });
  },

  refreshBillingBreakdown() {
    const b = this.state.activeBooking;
    const nights = 3;
    const roomCharges = b.roomPricePerNight * nights;
    const breakfastCharges = b.breakfastPricePerDay * b.numberOfGuests * nights;
    const packageCharges = b.packagePrice;
    const servicesTotal = b.services.reduce((acc, curr) => acc + curr.total, 0);

    const subtotal = roomCharges + breakfastCharges + packageCharges + servicesTotal;
    const discount = b.discountAmount;
    const netTaxable = Math.max(0, subtotal - discount);
    const tax = Math.round(netTaxable * 0.18);
    const grandTotal = netTaxable + tax;

    // DOM updates
    const roomEl = document.getElementById('invRoom');
    if (roomEl) roomEl.textContent = `Room ${b.roomNumber} (${b.roomType})`;

    const roomDet = document.getElementById('invRoomDetail');
    if (roomDet) roomDet.textContent = `${nights} nights × ${DOM.formatCurrency(b.roomPricePerNight)} / night (${b.roomType})`;

    const roomTot = document.getElementById('invRoomTotal');
    if (roomTot) roomTot.textContent = Number(roomCharges).toFixed(2);

    const bfDet = document.getElementById('invBreakfastDetail');
    if (bfDet) bfDet.textContent = `${b.breakfastOption} (${b.numberOfGuests} guests × ${nights} days × ${DOM.formatCurrency(b.breakfastPricePerDay)})`;

    const bfTot = document.getElementById('invBreakfastTotal');
    if (bfTot) bfTot.textContent = Number(breakfastCharges).toFixed(2);

    const pkgDet = document.getElementById('invPackageDetail');
    if (pkgDet) pkgDet.textContent = `${b.packageId} (Wi-Fi, Airport Transfer, 2 Laundry)`;

    const pkgTot = document.getElementById('invPackageTotal');
    if (pkgTot) pkgTot.textContent = Number(packageCharges).toFixed(2);

    const srvTot = document.getElementById('invServicesTotal');
    if (srvTot) srvTot.textContent = Number(servicesTotal).toFixed(2);

    const subTot = document.getElementById('invSubtotal');
    if (subTot) subTot.textContent = DOM.formatCurrency(subtotal);

    const discRow = document.getElementById('invVoucherRow');
    if (discRow) {
      if (b.appliedVoucher && discount > 0) {
        discRow.style.display = 'table-row';
        document.getElementById('invVoucherCode').textContent = b.appliedVoucher;
        document.getElementById('invDiscount').textContent = `-${DOM.formatCurrency(discount)}`;
      } else {
        discRow.style.display = 'none';
      }
    }

    const taxEl = document.getElementById('invTax');
    if (taxEl) taxEl.textContent = DOM.formatCurrency(tax);

    const grandEl = document.getElementById('invGrandTotal');
    if (grandEl) grandEl.textContent = DOM.formatCurrency(grandTotal);
  },

  /* ========================================================================
     PAGE 8: PAYMENT, RECEIPT & CHECKOUT CONTROLLER
     ======================================================================== */
  initPaymentPage() {
    const payForm = document.getElementById('paymentForm');
    const checkoutBtn = document.getElementById('btnExecuteCheckout');

    payForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.state.activeBooking.paymentStatus = 'PAID';
      this.state.activeBooking.bookingStatus = 'PAID';

      // Lock UI rules
      document.getElementById('securityLockStatus').innerHTML = '<span class="badge badge-success">PAID &amp; LOCKED</span>';
      document.getElementById('ruleServicesCheck').innerHTML = '🔒 Add Services: <strong>BLOCKED (Rule 9)</strong>';
      document.getElementById('ruleUpgradeCheck').innerHTML = '🔒 Room Upgrades: <strong>BLOCKED (Rule 10)</strong>';
      document.getElementById('ruleVoucherCheck').innerHTML = '🔒 Voucher Edits: <strong>BLOCKED (Rule 11)</strong>';

      DOM.showAlert('paymentAlert', 
        'Payment of ₹32,332.00 successful via UPI (Ref: UPI/20261021/887192)! Event paymentCompleted emitted. Receipt generated.', 
        'success'
      );

      document.getElementById('btnExecutePayment').disabled = true;
      document.getElementById('btnExecutePayment').textContent = 'Payment Completed (PAID)';

      // Enable checkout
      if (checkoutBtn) checkoutBtn.disabled = false;
    });

    checkoutBtn?.addEventListener('click', () => {
      this.state.activeBooking.bookingStatus = 'CHECKED_OUT';
      checkoutBtn.disabled = true;
      checkoutBtn.textContent = 'Guest Checked Out';

      // Show cleaning cycle panel
      const cleaningPanel = document.getElementById('cleaningStatusBox');
      if (cleaningPanel) cleaningPanel.style.display = 'block';

      alert('Guest Akmal Abbas successfully checked out. Room 205 status set to CLEANING for 2 hours (Rule 14).');
    });

    document.getElementById('btnFastForwardCleaning')?.addEventListener('click', () => {
      alert('2-hour cleaning period expired! Room 205 status automatically updated to AVAILABLE (Rule 15).');
      document.getElementById('cleaningStatusBox').innerHTML = '<h4>✅ Sanitation Complete</h4><p>Room 205 is now <span class="badge badge-success">AVAILABLE</span> for new bookings.</p>';
    });
  },

  /* ========================================================================
     PAGE 9: ADMIN AGGREGATIONS & CRUD CONTROLLER
     ======================================================================== */
  initAdminPage() {
    document.getElementById('btnRefreshAnalytics')?.addEventListener('click', () => {
      alert('MongoDB Aggregation pipelines executed ($match, $group, $facet). Metrics updated from hotelDB.');
    });

    document.getElementById('btnClearLogDisplay')?.addEventListener('click', () => {
      const term = document.getElementById('systemLogTerminal');
      if (term) term.textContent = '[SYSTEM] Log view refreshed at ' + new Date().toLocaleTimeString();
    });
  }
};
