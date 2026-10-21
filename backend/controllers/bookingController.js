/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Booking Lifecycle & Hotel Workflow Controller
   Primary Owner: Akmal Abbas (25070122028) - Backend & System Integration
   Co-owners: Ahasas Singh (Commercial Calculations), Akul Agarwal (Events/Audit)
   Course Unit Mapping: Unit 3 (State Transitions, EventEmitter), Unit 4 (1:N, N:M)
   ========================================================================== */

const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Guest = require('../models/Guest');
const { Service, BookingService } = require('../models/Service');
const { Package } = require('../models/Package');
const { AuditLog } = require('../models/Document');
const AvailabilityService = require('../services/availabilityService');
const BillingService = require('../services/billingService');
const hotelEvents = require('../events/hotelEvents');
const Validator = require('../utils/validator');
const { BOOKING_STATUS, ROOM_STATUS, CLEANING_DURATION_MS } = require('../config/constants');
const Logger = require('../utils/logger');

const BookingController = {
  // CREATE BOOKING (Section 6 & 27)
  async createBooking(req, res) {
    try {
      const {
        guestId,
        roomId,
        checkInDate,
        checkOutDate,
        numberOfGuests,
        packageId,
        breakfastOption
      } = req.body;

      // RULE 2: Date interval check
      const dateCheck = Validator.validateDateInterval(checkInDate, checkOutDate);
      if (!dateCheck.isValid) {
        return res.status(400).json({ success: false, message: dateCheck.error });
      }

      // Check Room existence & capacity (RULE 3 & 4)
      const room = await Room.findById(roomId);
      if (!room || !room.isActive) {
        return res.status(404).json({ success: false, message: 'Selected room is invalid or deactivated.' });
      }

      const guests = parseInt(numberOfGuests, 10) || 1;
      if (guests > room.capacity) {
        return res.status(400).json({ 
          success: false, 
          message: `Guest count (${guests}) exceeds room ${room.roomNumber} capacity of ${room.capacity}.` 
        });
      }

      // RULE 1: Overlap double-booking check
      const isAvailable = await AvailabilityService.isRoomAvailableForStay(roomId, checkInDate, checkOutDate);
      if (!isAvailable) {
        return res.status(400).json({ 
          success: false, 
          message: `Room ${room.roomNumber} is already booked for overlapping dates. Please choose another room.` 
        });
      }

      // Check Guest existence
      const guest = await Guest.findById(guestId);
      if (!guest) {
        return res.status(404).json({ success: false, message: 'Guest record not found.' });
      }

      // Generate formatted Booking ID: SE-YYYY-XXXXX
      const year = new Date().getFullYear();
      const count = await Booking.countDocuments();
      const bookingNumber = `SE-${year}-${String(count + 101).padStart(5, '0')}`;

      const booking = await Booking.create({
        bookingNumber,
        guestId,
        roomId,
        checkInDate: dateCheck.inDate,
        checkOutDate: dateCheck.outDate,
        numberOfGuests: guests,
        packageId: packageId || null,
        breakfastOption: breakfastOption || 'NONE',
        bookingStatus: BOOKING_STATUS.RESERVED
      });

      hotelEvents.emit('bookingCreated', booking);

      // Pre-calculate initial invoice
      const bill = await BillingService.calculateBill(booking._id);

      res.status(201).json({ success: true, data: booking, bill });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // READ Booking by ID or bookingNumber
  async getBooking(req, res) {
    try {
      const { id } = req.params;
      const query = id.startsWith('SE-') ? { bookingNumber: id } : { _id: id };
      const booking = await Booking.findOne(query)
        .populate('guestId')
        .populate('roomId')
        .populate('packageId');

      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found.' });
      }

      const bill = await BillingService.calculateBill(booking._id);
      res.json({ success: true, data: booking, bill });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // CHECK-IN (Section 7)
  async checkIn(req, res) {
    try {
      const { id } = req.params;
      const query = id.startsWith('SE-') ? { bookingNumber: id } : { _id: id };
      const booking = await Booking.findOne(query).populate('roomId');

      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found.' });
      }

      if (booking.bookingStatus !== BOOKING_STATUS.RESERVED) {
        return res.status(400).json({ 
          success: false, 
          message: `Cannot check in booking with status ${booking.bookingStatus}. Must be RESERVED.` 
        });
      }

      booking.bookingStatus = BOOKING_STATUS.CHECKED_IN;
      booking.checkedInAt = new Date();
      await booking.save();

      // Transition Room status to OCCUPIED
      await Room.findByIdAndUpdate(booking.roomId._id, {
        status: ROOM_STATUS.OCCUPIED
      });

      // Audit Log
      await AuditLog.create({
        action: 'CHECK_IN',
        entityType: 'BOOKING',
        entityId: booking._id,
        details: { roomNumber: booking.roomId.roomNumber, guestId: booking.guestId }
      });

      hotelEvents.emit('guestCheckedIn', {
        bookingNumber: booking.bookingNumber,
        roomNumber: booking.roomId.roomNumber
      });

      res.json({ success: true, message: 'Guest checked in successfully. Room marked as OCCUPIED.', data: booking });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // MID-STAY ROOM UPGRADE (Section 8)
  async upgradeRoom(req, res) {
    try {
      const { id } = req.params;
      const { newRoomId } = req.body;

      const query = id.startsWith('SE-') ? { bookingNumber: id } : { _id: id };
      const booking = await Booking.findOne(query).populate('roomId');

      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found.' });
      }

      // RULE 10: Upgrade cannot happen after final payment or checkout
      if ([BOOKING_STATUS.PAID, BOOKING_STATUS.CHECKED_OUT].includes(booking.bookingStatus) || booking.paymentStatus === 'PAID') {
        return res.status(400).json({ 
          success: false, 
          message: 'Action Blocked (RULE 10): Upgrade cannot happen after checkout or final payment.' 
        });
      }

      // Check target room
      const targetRoom = await Room.findById(newRoomId);
      if (!targetRoom || !targetRoom.isActive) {
        return res.status(404).json({ success: false, message: 'Target upgrade room not found.' });
      }

      // Check availability for remaining stay
      const isAvailable = await AvailabilityService.isRoomAvailableForStay(
        newRoomId, 
        booking.checkInDate, 
        booking.checkOutDate, 
        booking._id
      );
      if (!isAvailable) {
        return res.status(400).json({ 
          success: false, 
          message: `Target Room ${targetRoom.roomNumber} is unavailable for these dates.` 
        });
      }

      const oldRoom = booking.roomId;

      // RULE 6: Release original room to AVAILABLE
      await Room.findByIdAndUpdate(oldRoom._id, { status: ROOM_STATUS.AVAILABLE });

      // RULE 7: Mark new room as OCCUPIED (if already checked in) or RESERVED
      const newStatus = booking.bookingStatus === BOOKING_STATUS.CHECKED_IN ? ROOM_STATUS.OCCUPIED : ROOM_STATUS.RESERVED;
      await Room.findByIdAndUpdate(targetRoom._id, { status: newStatus });

      // Update booking
      booking.roomId = targetRoom._id;
      await booking.save();

      // RULE 9: Audit log
      await AuditLog.create({
        action: 'ROOM_UPGRADE',
        entityType: 'ROOM',
        entityId: targetRoom._id,
        details: {
          bookingNumber: booking.bookingNumber,
          fromRoom: oldRoom.roomNumber,
          toRoom: targetRoom.roomNumber,
          rateDifference: targetRoom.pricePerNight - oldRoom.pricePerNight
        }
      });

      hotelEvents.emit('roomUpgraded', {
        bookingNumber: booking.bookingNumber,
        oldRoom: oldRoom.roomNumber,
        newRoom: targetRoom.roomNumber
      });

      // RULE 5 & 8: Recalculate bill with upgraded room charges
      const updatedBill = await BillingService.calculateBill(booking._id);

      res.json({ 
        success: true, 
        message: `Upgraded from Room ${oldRoom.roomNumber} to Room ${targetRoom.roomNumber}!`,
        bill: updatedBill 
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // ADD SERVICE TO BOOKING (Section 11)
  async addService(req, res) {
    try {
      const { id } = req.params;
      const { serviceId, quantity = 1 } = req.body;

      const query = id.startsWith('SE-') ? { bookingNumber: id } : { _id: id };
      const booking = await Booking.findOne(query);

      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

      // RULE 9: Cannot add service to a paid or checked-out booking
      if (booking.paymentStatus === 'PAID' || booking.bookingStatus === BOOKING_STATUS.CHECKED_OUT) {
        return res.status(400).json({ 
          success: false, 
          message: 'Action Blocked (RULE 9): A final-paid/closed booking cannot receive new services.' 
        });
      }

      // RULE 5: Inactive service cannot be added
      const service = await Service.findById(serviceId);
      if (!service || !service.isAvailable) {
        return res.status(400).json({ 
          success: false, 
          message: 'Action Blocked (RULE 5): Selected service is not available.' 
        });
      }

      const qty = Math.max(1, parseInt(quantity, 10));
      const total = qty * service.unitPrice;

      // RULE 16: Lock historical purchase unit price in bookingServices
      const bookingService = await BookingService.create({
        bookingId: booking._id,
        guestId: booking.guestId,
        serviceId: service._id,
        serviceName: service.name,
        quantity: qty,
        unitPriceAtPurchase: service.unitPrice,
        total
      });

      hotelEvents.emit('serviceAdded', {
        bookingNumber: booking.bookingNumber,
        serviceName: service.name,
        quantity: qty,
        unitPriceAtPurchase: service.unitPrice
      });

      const updatedBill = await BillingService.calculateBill(booking._id);
      res.status(201).json({ success: true, data: bookingService, bill: updatedBill });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // REMOVE SERVICE FROM BOOKING
  async removeService(req, res) {
    try {
      const { id, serviceId } = req.params;
      const query = id.startsWith('SE-') ? { bookingNumber: id } : { _id: id };
      const booking = await Booking.findOne(query);

      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

      if (booking.paymentStatus === 'PAID') {
        return res.status(400).json({ success: false, message: 'Cannot modify a settled booking.' });
      }

      await BookingService.findOneAndDelete({ bookingId: booking._id, _id: serviceId });
      const updatedBill = await BillingService.calculateBill(booking._id);
      res.json({ success: true, message: 'Service removed from booking.', bill: updatedBill });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // APPLY VOUCHER TO BOOKING (Section 12 & 13)
  async applyVoucher(req, res) {
    try {
      const { id } = req.params;
      const { voucherCode } = req.body;

      const query = id.startsWith('SE-') ? { bookingNumber: id } : { _id: id };
      const booking = await Booking.findOne(query);

      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

      // RULE 11: A final-paid booking cannot have a voucher changed
      if (booking.paymentStatus === 'PAID') {
        return res.status(400).json({ 
          success: false, 
          message: 'Action Blocked (RULE 11): Cannot apply or modify voucher on a paid booking.' 
        });
      }

      const bill = await BillingService.calculateBill(booking._id, voucherCode);

      if (!bill.breakdown.voucher.code) {
        return res.status(400).json({ 
          success: false, 
          message: `Voucher validation failed for '${voucherCode}'. Requirements not met.` 
        });
      }

      hotelEvents.emit('voucherApplied', {
        bookingNumber: booking.bookingNumber,
        voucherCode,
        discountAmount: bill.breakdown.voucher.discount
      });

      res.json({ success: true, message: `Voucher '${voucherCode}' applied!`, bill });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // REMOVE VOUCHER FROM BOOKING
  async removeVoucher(req, res) {
    try {
      const { id } = req.params;
      const query = id.startsWith('SE-') ? { bookingNumber: id } : { _id: id };
      const booking = await Booking.findOne(query);

      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

      if (booking.paymentStatus === 'PAID') {
        return res.status(400).json({ success: false, message: 'Cannot modify voucher on a settled booking.' });
      }

      booking.appliedVoucherCode = null;
      booking.discountAmount = 0;
      await booking.save();

      const bill = await BillingService.calculateBill(booking._id, null);
      res.json({ success: true, message: 'Voucher removed from booking.', bill });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // GET DYNAMIC BILL (Section 14 & 15)
  async getBill(req, res) {
    try {
      const { id } = req.params;
      const query = id.startsWith('SE-') ? { bookingNumber: id } : { _id: id };
      const booking = await Booking.findOne(query);

      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

      const bill = await BillingService.calculateBill(booking._id);
      res.json({ success: true, bill });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // CHECK-OUT (Section 17)
  async checkOut(req, res) {
    try {
      const { id } = req.params;
      const query = id.startsWith('SE-') ? { bookingNumber: id } : { _id: id };
      const booking = await Booking.findOne(query).populate('roomId');

      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

      if (booking.bookingStatus === BOOKING_STATUS.CHECKED_OUT) {
        return res.status(400).json({ success: false, message: 'Guest has already checked out.' });
      }

      // Mark Booking as CHECKED_OUT
      booking.bookingStatus = BOOKING_STATUS.CHECKED_OUT;
      booking.checkedOutAt = new Date();
      await booking.save();

      // RULE 14 & 15: Room enters CLEANING status with 2-hour duration timestamp
      const cleaningExpiry = new Date(Date.now() + CLEANING_DURATION_MS);
      await Room.findByIdAndUpdate(booking.roomId._id, {
        status: ROOM_STATUS.CLEANING,
        cleaningAvailableAfter: cleaningExpiry
      });

      // Audit Log
      await AuditLog.create({
        action: 'CHECK_OUT',
        entityType: 'BOOKING',
        entityId: booking._id,
        details: {
          roomNumber: booking.roomId.roomNumber,
          cleaningAvailableAfter: cleaningExpiry
        }
      });

      hotelEvents.emit('guestCheckedOut', {
        bookingNumber: booking.bookingNumber,
        roomNumber: booking.roomId.roomNumber,
        cleaningAvailableAfter: cleaningExpiry
      });

      res.json({ 
        success: true, 
        message: `Guest checked out. Room ${booking.roomId.roomNumber} set to CLEANING until ${cleaningExpiry.toLocaleTimeString('en-IN')}.`,
        cleaningAvailableAfter: cleaningExpiry
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

module.exports = BookingController;
