/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Hotel Event Bus (Node.js EventEmitter)
   Primary Owner: Akmal Abbas (25070122028) - Backend & System Integration
   Co-owners: Akul Agarwal (Logger & Email integration)
   Course Unit Mapping: Unit 3 (Node.js Events Module, EventEmitter Architecture)
   ========================================================================== */

const EventEmitter = require('events');
const Logger = require('../utils/logger');

class HotelEventEmitter extends EventEmitter {}

const hotelEvents = new HotelEventEmitter();

// EVENT LISTENERS & SIDE-EFFECTS (Unit 3 Node.js Events Demonstration)

hotelEvents.on('guestRegistered', (guest) => {
  Logger.event('guestRegistered', `Guest ${guest.fullName} registered with ID ${guest.idType} (${guest.idNumber})`);
});

hotelEvents.on('bookingCreated', (booking) => {
  Logger.event('bookingCreated', `Booking ${booking.bookingNumber} created for Room ${booking.roomId?.roomNumber || booking.roomId}`);
});

hotelEvents.on('guestCheckedIn', (data) => {
  Logger.event('guestCheckedIn', `Booking ${data.bookingNumber} checked in. Room marked as OCCUPIED.`);
});

hotelEvents.on('roomUpgraded', (data) => {
  Logger.event('roomUpgraded', `Booking ${data.bookingNumber} upgraded from Room ${data.oldRoom} to Room ${data.newRoom}.`);
});

hotelEvents.on('serviceAdded', (data) => {
  Logger.event('serviceAdded', `Added ${data.quantity}x ${data.serviceName} at unit rate ₹${data.unitPriceAtPurchase} to booking ${data.bookingNumber}.`);
});

hotelEvents.on('voucherApplied', (data) => {
  Logger.event('voucherApplied', `Voucher ${data.voucherCode} applied to booking ${data.bookingNumber}. Discount: ₹${data.discountAmount}.`);
});

hotelEvents.on('paymentCompleted', (data) => {
  Logger.event('paymentCompleted', `Payment of ₹${data.amount} received via ${data.method} (Ref: ${data.transactionRef}) for invoice ${data.invoiceNumber}.`);
});

hotelEvents.on('guestCheckedOut', (data) => {
  Logger.event('guestCheckedOut', `Guest checked out of Room ${data.roomNumber}. Room status set to CLEANING for 2 hours.`);
});

hotelEvents.on('roomCleaningCompleted', (data) => {
  Logger.event('roomCleaningCompleted', `Sanitization complete for Room ${data.roomNumber}. Status restored to AVAILABLE.`);
});

module.exports = hotelEvents;
