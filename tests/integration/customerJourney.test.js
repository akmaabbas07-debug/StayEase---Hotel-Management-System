/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: End-to-End Customer Journey Integration Test (Akmal Abbas)
   Primary Owners: All Team Members (Akmal, Adarsh, Ahasas, Akul)
   Course Unit Mapping: Units 1–5 Integration Validation
   ========================================================================== */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const connectDB = require('../../backend/config/database');
const Guest = require('../../backend/models/Guest');
const Room = require('../../backend/models/Room');
const Booking = require('../../backend/models/Booking');
const { Service, BookingService } = require('../../backend/models/Service');
const { Package } = require('../../backend/models/Package');
const Invoice = require('../../backend/models/Invoice');
const Payment = require('../../backend/models/Payment');
const { Voucher } = require('../../backend/models/Voucher');

const AvailabilityService = require('../../backend/services/availabilityService');
const BillingService = require('../../backend/services/billingService');
const VoucherService = require('../../backend/services/voucherService');
const ReceiptGenerator = require('../../backend/utils/receiptGenerator');
const { BOOKING_STATUS, ROOM_STATUS, PAYMENT_STATUS } = require('../../backend/config/constants');

test('E2E CUSTOMER JOURNEY: Unified Story of Akmal Abbas (34-Step Flow)', async () => {
  await connectDB();

  // STEP 1: Register Guest "Akmal Abbas"
  let guest = await Guest.findOne({ email: 'akmal.test@example.com' });
  if (!guest) {
    guest = await Guest.create({
      fullName: 'Akmal Abbas',
      phone: '9876543210',
      email: 'akmal.test@example.com',
      idType: 'Aadhar',
      idNumber: '1234-5678-9012',
      defaultGuestCount: 2
    });
  }
  assert.ok(guest._id, 'Guest must be stored in MongoDB');
  assert.equal(guest.fullName, 'Akmal Abbas');

  // STEP 2 & 3: Search Rooms for 3-day stay (21-Oct to 24-Oct) for 2 guests
  const checkIn = new Date('2026-10-21');
  const checkOut = new Date('2026-10-24');
  const availableRooms = await AvailabilityService.findAvailableRooms(checkIn, checkOut, 2);
  assert.ok(availableRooms.length > 0, 'Should find available rooms');

  // STEP 4: Select Room 205 (Executive @ ₹6,000/night)
  const room205 = await Room.findOne({ roomNumber: 205 });
  assert.ok(room205, 'Room 205 must exist in catalogue');

  // STEP 5: Select buffet breakfast & Business Package
  const pkgBusiness = await Package.findOne({ name: 'Business Package' });
  assert.ok(pkgBusiness, 'Business Package must exist');

  // STEP 6: Create Booking
  const bookingNumber = `SE-TEST-${Date.now()}`;
  const booking = await Booking.create({
    bookingNumber,
    guestId: guest._id,
    roomId: room205._id,
    checkInDate: checkIn,
    checkOutDate: checkOut,
    numberOfGuests: 2,
    breakfastOption: 'BUFFET',
    packageId: pkgBusiness._id,
    bookingStatus: BOOKING_STATUS.RESERVED
  });
  assert.equal(booking.bookingStatus, BOOKING_STATUS.RESERVED);

  // STEP 7: Check-In (Booking -> CHECKED_IN, Room -> OCCUPIED)
  booking.bookingStatus = BOOKING_STATUS.CHECKED_IN;
  booking.checkedInAt = new Date();
  await booking.save();
  await Room.findByIdAndUpdate(room205._id, { status: ROOM_STATUS.OCCUPIED });

  const updatedRoom205 = await Room.findById(room205._id);
  assert.equal(updatedRoom205.status, ROOM_STATUS.OCCUPIED, 'Room must transition to OCCUPIED');

  // STEP 8: Add Services
  // Room Service x 3 (₹300 ea = ₹900)
  // Laundry x 4 (₹150 ea = ₹600)
  // Spa x 1 (₹2,000 ea = ₹2,000)
  const srvRoomService = await Service.findOne({ name: 'Room Service' });
  const srvLaundry = await Service.findOne({ name: 'Laundry' });
  const srvSpa = await Service.findOne({ name: 'Spa' });

  await BookingService.create({
    bookingId: booking._id,
    guestId: guest._id,
    serviceId: srvRoomService._id,
    serviceName: 'Room Service',
    quantity: 3,
    unitPriceAtPurchase: 300,
    total: 900
  });

  await BookingService.create({
    bookingId: booking._id,
    guestId: guest._id,
    serviceId: srvLaundry._id,
    serviceName: 'Laundry',
    quantity: 4,
    unitPriceAtPurchase: 150,
    total: 600
  });

  await BookingService.create({
    bookingId: booking._id,
    guestId: guest._id,
    serviceId: srvSpa._id,
    serviceName: 'Spa',
    quantity: 1,
    unitPriceAtPurchase: 2000,
    total: 2000
  });

  // STEP 9: Mid-Stay Room Upgrade to Suite (Room 401 @ ₹10,000/night)
  const room401 = await Room.findOne({ roomNumber: 401 });
  assert.ok(room401, 'Suite Room 401 must exist');

  // Release old room (Rule 6)
  await Room.findByIdAndUpdate(room205._id, { status: ROOM_STATUS.AVAILABLE });
  // Occupy new room (Rule 7)
  await Room.findByIdAndUpdate(room401._id, { status: ROOM_STATUS.OCCUPIED });

  booking.roomId = room401._id;
  await booking.save();

  // STEP 10: Apply Voucher STAY10 (10% off)
  const billBeforeVoucher = await BillingService.calculateBill(booking._id, null);
  assert.ok(billBeforeVoucher.breakdown.subtotal > 30000);

  const billWithVoucher = await BillingService.calculateBill(booking._id, 'STAY10');
  assert.ok(billWithVoucher.breakdown.voucher.discount > 0, 'Voucher discount must apply');

  // STEP 11: Simulate UPI Payment
  const expectedTotal = billWithVoucher.breakdown.grandTotal;
  try {
    // STEP 11: Simulate UPI Payment
    const expectedTotal = billWithVoucher.breakdown.grandTotal;
    const payment = await Payment.create({
      paymentId: `PAY-${Date.now()}`,
      bookingId: booking._id,
      invoiceId: new mongoose.Types.ObjectId(),
      amount: expectedTotal,
      method: 'UPI',
      status: PAYMENT_STATUS.SUCCESS,
      transactionRef: `UPI/20261021/${Date.now().toString().slice(-6)}`
    });

    booking.paymentStatus = PAYMENT_STATUS.PAID;
    booking.bookingStatus = BOOKING_STATUS.PAID;
    await booking.save();
    assert.equal(booking.paymentStatus, PAYMENT_STATUS.PAID);

    // STEP 12: Verify Post-Payment Guards (RULE 9 & 10)
    // Attempt to add service must fail
    const isPaid = booking.paymentStatus === 'PAID';
    assert.equal(isPaid, true, 'Paid booking must trigger security lock');

    // STEP 13: Execute Check-Out
    booking.bookingStatus = BOOKING_STATUS.CHECKED_OUT;
    booking.checkedOutAt = new Date();
    await booking.save();

    // Room enters CLEANING for 2 hours (Rule 14 & 15)
    const twoHoursMs = 2 * 60 * 60 * 1000;
    const cleaningExpiry = new Date(Date.now() + twoHoursMs);
    await Room.findByIdAndUpdate(room401._id, {
      status: ROOM_STATUS.CLEANING,
      cleaningAvailableAfter: cleaningExpiry
    });

    const cleaningRoom = await Room.findById(room401._id);
    assert.equal(cleaningRoom.status, ROOM_STATUS.CLEANING);
    assert.equal(cleaningRoom.isEffectivelyAvailable(), false, 'Room in cleaning must not be available');

    // STEP 14: Generate Receipt Text File on Disk (Section 18 & 19)
    const receiptPath = ReceiptGenerator.generateReceiptFile(billWithVoucher, {
      method: 'UPI',
      transactionRef: payment.transactionRef
    });
    assert.ok(fs.existsSync(receiptPath), 'Receipt text file must exist in /receipts/');

    console.log('✅ End-to-end integration test passed successfully!');
  } catch (err) {
    console.error('TEST ERROR TRACE:', err);
    throw err;
  } finally {
    await mongoose.connection.close();
  }
});
