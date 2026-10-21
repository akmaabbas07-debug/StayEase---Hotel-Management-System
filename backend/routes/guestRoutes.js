/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Guest REST API Routes
   Primary Owner: Akmal Abbas (25070122028) - Backend & System Integration
   Course Unit Mapping: Unit 3 (Node.js Routing & URL Query Parsing)
   ========================================================================== */

const express = require('express');
const router = express.Router();
const GuestController = require('../controllers/guestController');

router.post('/', GuestController.createGuest);
router.get('/', GuestController.getGuests);
router.get('/:id', GuestController.getGuestById);
router.put('/:id', GuestController.updateGuest);
router.delete('/:id', GuestController.deleteGuest);

module.exports = router;
