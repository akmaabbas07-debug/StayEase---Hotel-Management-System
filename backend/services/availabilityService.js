/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Room Availability & Overlap Service
   Primary Owner: Akmal Abbas (25070122028) - Backend Architect
   Co-owners: Ahasas Singh (Room Schemas)
   Course Unit Mapping: Unit 3 (Algorithm Logic), Unit 4 (MongoDB Queries)
   ========================================================================== */

const Room = require('../models/Room');
const Booking = require('../models/Booking');
const { BOOKING_STATUS, ROOM_STATUS } = require('../config/constants');
const Logger = require('../utils/logger');

const AvailabilityService = {
  /**
   * Find available rooms for a given stay interval and guest count
   * Implements Section 30 Overlap Detection:
   * reqCheckIn < existingCheckOut AND reqCheckOut > existingCheckIn
   * @param {Date|string} checkIn 
   * @param {Date|string} checkOut 
   * @param {number} [guests=1] 
   * @param {string} [roomType] 
   * @returns {Promise<Array>}
   */
  async findAvailableRooms(checkIn, checkOut, guests = 1, roomType = null) {
    const reqIn = new Date(checkIn);
    const reqOut = new Date(checkOut);
    const guestCount = parseInt(guests, 10) || 1;

    // First: Run lazy auto-cleaning check on any rooms currently in CLEANING status (Rule 14 & 15)
    await this.refreshCleaningRooms();

    // Query active bookings that overlap the requested period
    // Conflicting booking statuses: RESERVED, CHECKED_IN, OCCUPIED, CHECKOUT_PENDING, PAID
    // Non-conflicting: CANCELLED, CHECKED_OUT
    const overlappingBookings = await Booking.find({
      bookingStatus: { 
        $in: [
          BOOKING_STATUS.RESERVED,
          BOOKING_STATUS.CHECKED_IN,
          BOOKING_STATUS.OCCUPIED,
          BOOKING_STATUS.CHECKOUT_PENDING,
          BOOKING_STATUS.PAID
        ] 
      },
      checkInDate: { $lt: reqOut },
      checkOutDate: { $gt: reqIn }
    }).select('roomId');

    const blockedRoomIds = overlappingBookings.map(b => b.roomId.toString());

    // Build room query
    const query = {
      isActive: true,
      capacity: { $gte: guestCount },
      status: { $nin: [ROOM_STATUS.MAINTENANCE] } // Rooms under maintenance are excluded
    };

    if (roomType) {
      query.type = roomType;
    }

    const allCandidateRooms = await Room.find(query).lean();

    // Annotate availability status for requested dates
    const results = allCandidateRooms.map(room => {
      const isBlockedByDate = blockedRoomIds.includes(room._id.toString());
      const isUnderMaintenance = room.status === ROOM_STATUS.MAINTENANCE;
      const isCurrentlyCleaning = room.status === ROOM_STATUS.CLEANING && 
                                  room.cleaningAvailableAfter && 
                                  new Date() < new Date(room.cleaningAvailableAfter);

      const isAvailableForStay = !isBlockedByDate && !isUnderMaintenance && !isCurrentlyCleaning;

      return {
        ...room,
        isAvailableForDates: isAvailableForStay,
        unavailabilityReason: isBlockedByDate 
          ? 'Booked by an overlapping reservation' 
          : isUnderMaintenance 
            ? 'Room is under maintenance' 
            : isCurrentlyCleaning 
              ? 'Room is undergoing sanitization' 
              : null
      };
    });

    Logger.info(`Room availability queried for ${reqIn.toISOString().split('T')[0]} to ${reqOut.toISOString().split('T')[0]} (${guestCount} guests). Found ${results.filter(r => r.isAvailableForDates).length} available.`);
    return results;
  },

  /**
   * Check if a specific room is available for dates
   */
  async isRoomAvailableForStay(roomId, checkIn, checkOut, excludeBookingId = null) {
    const reqIn = new Date(checkIn);
    const reqOut = new Date(checkOut);

    const bookingQuery = {
      roomId,
      bookingStatus: { 
        $in: [
          BOOKING_STATUS.RESERVED,
          BOOKING_STATUS.CHECKED_IN,
          BOOKING_STATUS.OCCUPIED,
          BOOKING_STATUS.CHECKOUT_PENDING,
          BOOKING_STATUS.PAID
        ] 
      },
      checkInDate: { $lt: reqOut },
      checkOutDate: { $gt: reqIn }
    };

    if (excludeBookingId) {
      bookingQuery._id = { $ne: excludeBookingId };
    }

    const conflict = await Booking.findOne(bookingQuery);
    return !conflict;
  },

  /**
   * Auto-refresh rooms in CLEANING status whose cleaning period has expired (Rule 15)
   */
  async refreshCleaningRooms() {
    const now = new Date();
    const expiredCleaningRooms = await Room.find({
      status: ROOM_STATUS.CLEANING,
      cleaningAvailableAfter: { $lte: now }
    });

    for (const room of expiredCleaningRooms) {
      room.status = ROOM_STATUS.AVAILABLE;
      room.cleaningAvailableAfter = null;
      await room.save();
      Logger.event('roomCleaningCompleted', `Sanitization window expired for Room ${room.roomNumber}. Status restored to AVAILABLE.`);
    }
  }
};

module.exports = AvailabilityService;
