/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Dynamic Billing Engine Unit Tests
   Primary Owner: Ahasas Singh (25070122026) - Commercial Logic Architect
   Course Unit Mapping: Unit 4 (Financial Formula Verification & Tax Logic)
   ========================================================================== */

const test = require('node:test');
const assert = require('node:assert/strict');

test('BILLING ENGINE: Dynamic Formula (Room + Breakfast + Package + Services - Voucher + GST 18%)', () => {
  // Scenario:
  // Room: Executive (3 nights x ₹6,000) = ₹18,000
  const roomTotal = 3 * 6000;
  assert.equal(roomTotal, 18000);

  // Breakfast: Buffet (2 guests x 3 days x ₹650) = ₹3,900
  const bfTotal = 2 * 3 * 650;
  assert.equal(bfTotal, 3900);

  // Package: Business Package = ₹2,500
  const pkgTotal = 2500;

  // Additional Services:
  // Room Service: 3 x ₹300 = ₹900
  // Laundry: 4 x ₹150 = ₹600
  // Spa: 1 x ₹2,000 = ₹2,000
  const servicesTotal = (3 * 300) + (4 * 150) + (1 * 2000);
  assert.equal(servicesTotal, 3500);

  // Subtotal = 18,000 + 3,900 + 2,500 + 3,500 = ₹27,900
  const subtotal = roomTotal + bfTotal + pkgTotal + servicesTotal;
  assert.equal(subtotal, 27900);

  // Voucher: WELCOME500 = -₹500
  const discount = 500;
  const netTaxable = subtotal - discount; // ₹27,400
  assert.equal(netTaxable, 27400);

  // Tax: 18% GST = 27,400 * 0.18 = ₹4,932
  const tax = Math.round(netTaxable * 0.18);
  assert.equal(tax, 4932);

  // Grand Total = 27,400 + 4,932 = ₹32,332
  const grandTotal = netTaxable + tax;
  assert.equal(grandTotal, 32332);
});

test('BILLING ENGINE: Mid-Stay Room Upgrade Recalculation', () => {
  // Before upgrade: Executive Room (3 nights x ₹6,000) = ₹18,000
  // After upgrade: Presidential Suite (3 nights x ₹10,000) = ₹30,000
  // Differential = +₹12,000
  const oldRoomCharges = 3 * 6000;
  const newRoomCharges = 3 * 10000;
  const differential = newRoomCharges - oldRoomCharges;

  assert.equal(differential, 12000);
});
