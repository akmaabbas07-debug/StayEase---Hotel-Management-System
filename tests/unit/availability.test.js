/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Room Availability & Overlap Unit Tests
   Primary Owner: Akmal Abbas (25070122028) - Backend Architect
   Course Unit Mapping: Unit 3 & 4 (Algorithm & Business Rule Verification)
   ========================================================================== */

const test = require('node:test');
const assert = require('node:assert/strict');
const Validator = require('../../backend/utils/validator');

test('RULE 2: Checkout date must be strictly after checkin date', () => {
  // Valid stay: 21 Oct to 24 Oct (3 nights)
  const validCheck = Validator.validateDateInterval('2026-10-21', '2026-10-24');
  assert.equal(validCheck.isValid, true);
  assert.equal(validCheck.nights, 3);

  // Invalid: Same day stay (0 nights)
  const sameDay = Validator.validateDateInterval('2026-10-21', '2026-10-21');
  assert.equal(sameDay.isValid, false);
  assert.match(sameDay.error, /after check-in date/i);

  // Invalid: Checkout before checkin
  const backwards = Validator.validateDateInterval('2026-10-25', '2026-10-21');
  assert.equal(backwards.isValid, false);
});

test('SECTION 30: Date Overlap Algorithm Logic', () => {
  // Overlap Formula: reqCheckIn < existingCheckOut AND reqCheckOut > existingCheckIn
  const existingIn = new Date('2026-10-21').getTime();
  const existingOut = new Date('2026-10-24').getTime();

  function checkOverlap(reqInStr, reqOutStr) {
    const rIn = new Date(reqInStr).getTime();
    const rOut = new Date(reqOutStr).getTime();
    return (rIn < existingOut) && (rOut > existingIn);
  }

  // Exact match -> Overlaps
  assert.equal(checkOverlap('2026-10-21', '2026-10-24'), true);

  // Inside interval -> Overlaps
  assert.equal(checkOverlap('2026-10-22', '2026-10-23'), true);

  // Partial overlap beginning -> Overlaps
  assert.equal(checkOverlap('2026-10-19', '2026-10-22'), true);

  // Partial overlap end -> Overlaps
  assert.equal(checkOverlap('2026-10-23', '2026-10-26'), true);

  // Adjoining checkout day (guest leaves morning, new guest arrives afternoon) -> No overlap!
  assert.equal(checkOverlap('2026-10-24', '2026-10-27'), false);

  // Completely before -> No overlap
  assert.equal(checkOverlap('2026-10-15', '2026-10-18'), false);
});
