/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Room Controller & Availability Endpoints
   Primary Owner: Akmal Abbas (25070122028) - Backend & System Integration
   Co-owners: Ahasas Singh (Room Schemas)
   Course Unit Mapping: Unit 4 (MongoDB CRUD & Indexes), Unit 3 (URL Query Handling)
   ========================================================================== */

const Room = require('../models/Room');
const AvailabilityService = require('../services/availabilityService');

const RoomController = {
  // Query Real-time Room Availability with Date Overlap Algorithm (Section 4 & 30)
  async checkAvailability(req, res) {
    try {
      const { checkIn, checkOut, guests, type } = req.query;

      if (!checkIn || !checkOut) {
        return res.status(400).json({ 
          success: false, 
          message: 'Both checkIn and checkOut dates are required as URL query parameters.' 
        });
      }

      const rooms = await AvailabilityService.findAvailableRooms(checkIn, checkOut, guests, type);
      res.json({ success: true, count: rooms.length, data: rooms });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // READ all rooms with URL query filtering (e.g. /rooms?type=Deluxe&status=AVAILABLE)
  async getRooms(req, res) {
    try {
      const { type, status } = req.query;
      const query = { isActive: true };
      if (type) query.type = type;
      if (status) query.status = status;

      const rooms = await Room.find(query).sort({ roomNumber: 1 });
      res.json({ success: true, count: rooms.length, data: rooms });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getRoomById(req, res) {
    try {
      const room = await Room.findById(req.params.id);
      if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
      res.json({ success: true, data: room });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // CREATE Room (Admin CRUD - Section 5 & 27)
  async createRoom(req, res) {
    try {
      const { roomNumber, floor, type, capacity, pricePerNight, amenities } = req.body;
      const existing = await Room.findOne({ roomNumber });
      if (existing) {
        return res.status(400).json({ success: false, message: `Room number ${roomNumber} already exists.` });
      }

      const room = await Room.create({
        roomNumber,
        floor,
        type,
        capacity,
        pricePerNight,
        amenities: amenities || []
      });

      res.status(201).json({ success: true, data: room });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // UPDATE Room (Admin CRUD)
  async updateRoom(req, res) {
    try {
      const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
      res.json({ success: true, data: room });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // DELETE / DEACTIVATE Room
  async deleteRoom(req, res) {
    try {
      const room = await Room.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
      if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
      res.json({ success: true, message: `Room ${room.roomNumber} deactivated successfully.` });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

module.exports = RoomController;
