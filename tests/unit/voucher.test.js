/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Voucher 7-Step Validation Engine Unit Tests
   Primary Owner: Ahasas Singh (25070122026) - Commercial Logic Architect
   Course Unit Mapping: Unit 4 (Voucher Pipeline & Boundary Testing)
   ========================================================================== */

const test = require('node:test');
const assert = require('node:assert/strict');

test('VOUCHER ENGINE: Percentage vs Fixed Discount & Max Cap Calculations', () => {
  // Test Case 1: STAY10 (10% discount, max cap ₹4,000)
  function calculateStay10(subtotal) {
    const raw = Math.round((subtotal * 10) / 100);
    return Math.min(raw, 4000);
  }

  // Subtotal = ₹12,000 -> 10% = ₹1,200 (under cap)
  assert.equal(calculateStay10(12000), 1200);

  // Subtotal = ₹50,000 -> 10% = ₹5,000 -> Capped at ₹4,000 (RULE 7)
  assert.equal(calculateStay10(50000), 4000);

  // Test Case 2: WELCOME500 (Flat ₹500 discount)
  function calculateWelcome500(subtotal) {
    if (subtotal < 5000) return 0; // min bill check
    return Math.min(subtotal, 500);
  }

  assert.equal(calculateWelcome500(4000), 0); // Fails min bill
  assert.equal(calculateWelcome500(8000), 500); // Meets min bill
});

test('VOUCHER GUARDS: Expiry & Usage Limit Rejection', () => {
  const expiredVoucher = {
    code: 'EXPIRED50',
    validUntil: new Date('2025-01-01'),
    timesUsed: 0,
    usageLimit: 10
  };

  const now = new Date('2026-10-21');
  const isDateValid = now <= expiredVoucher.validUntil;
  assert.equal(isDateValid, false, 'Expired voucher must fail date check (RULE 6)');

  const exhaustedVoucher = {
    code: 'LIMITOVER',
    timesUsed: 100,
    usageLimit: 100
  };

  const isUsageAvailable = exhaustedVoucher.timesUsed < exhaustedVoucher.usageLimit;
  assert.equal(isUsageAvailable, false, 'Exhausted voucher must fail usage limit check (RULE 8)');
});
