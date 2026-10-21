/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Booking REST API Routes
   Primary Owner: Akmal Abbas (25070122028) - Backend & System Integration
   Course Unit Mapping: Unit 3 (Node.js Routing, URL Parameters & HTTP Methods)
   ========================================================================== */

const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/bookingController');

router.post('/', BookingController.createBooking);
router.get('/:id', BookingController.getBooking);
router.post('/:id/check-in', BookingController.checkIn);
router.post('/:id/upgrade', BookingController.upgradeRoom);
router.post('/:id/services', BookingController.addService);
router.delete('/:id/services/:serviceId', BookingController.removeService);
router.post('/:id/voucher/apply', BookingController.applyVoucher);
router.post('/:id/voucher/remove', BookingController.removeVoucher);
router.get('/:id/bill', BookingController.getBill);
router.post('/:id/checkout', BookingController.checkOut);

module.exports = router;
