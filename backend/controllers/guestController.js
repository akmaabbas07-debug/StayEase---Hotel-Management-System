/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Guest Controller & CRUD Operations
   Primary Owner: Akmal Abbas (25070122028) - Backend & System Integration
   Co-owners: Akul Agarwal (Regex Validation)
   Course Unit Mapping: Unit 4 (MongoDB CRUD), Unit 3 (Input Sanitization)
   ========================================================================== */

const Guest = require('../models/Guest');
const Validator = require('../utils/validator');
const hotelEvents = require('../events/hotelEvents');

const GuestController = {
  // CREATE Guest (Section 4 & 27)
  async createGuest(req, res) {
    try {
      const validation = Validator.validateGuest(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ success: false, message: validation.errors.join(' ') });
      }

      const { fullName, phone, email, idType, idNumber, defaultGuestCount } = req.body;

      // Check if existing guest
      let guest = await Guest.findOne({ email: email.trim().toLowerCase() });
      if (guest) {
        // Update existing guest details
        guest.fullName = Validator.sanitize(fullName);
        guest.phone = phone.replace(/\D/g, '');
        guest.idType = idType;
        guest.idNumber = Validator.sanitize(idNumber);
        await guest.save();
      } else {
        guest = await Guest.create({
          fullName: Validator.sanitize(fullName),
          phone: phone.replace(/\D/g, ''),
          email: email.trim().toLowerCase(),
          idType,
          idNumber: Validator.sanitize(idNumber),
          defaultGuestCount: defaultGuestCount || 1
        });
        hotelEvents.emit('guestRegistered', guest);
      }

      res.status(201).json({ success: true, data: guest });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // READ Guests with URL search query parameter (Unit 3 URL module)
  async getGuests(req, res) {
    try {
      const { search } = req.query;
      const query = {};
      if (search) {
        query.$or = [
          { fullName: { $regex: search, $options: 'i' } },
          { phone: { $regex: search } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      const guests = await Guest.find(query).sort({ createdAt: -1 }).limit(50);
      res.json({ success: true, data: guests });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // READ single guest
  async getGuestById(req, res) {
    try {
      const guest = await Guest.findById(req.params.id);
      if (!guest) return res.status(404).json({ success: false, message: 'Guest not found' });
      res.json({ success: true, data: guest });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // UPDATE guest
  async updateGuest(req, res) {
    try {
      const guest = await Guest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!guest) return res.status(404).json({ success: false, message: 'Guest not found' });
      res.json({ success: true, data: guest });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // DELETE guest
  async deleteGuest(req, res) {
    try {
      const guest = await Guest.findByIdAndDelete(req.params.id);
      if (!guest) return res.status(404).json({ success: false, message: 'Guest not found' });
      res.json({ success: true, message: 'Guest deleted successfully' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

module.exports = GuestController;
