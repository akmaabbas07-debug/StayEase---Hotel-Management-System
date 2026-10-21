/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Room REST API Routes
   Primary Owner: Akmal Abbas (25070122028) - Backend & System Integration
   Course Unit Mapping: Unit 3 (Node.js Routing & URL Parameters)
   ========================================================================== */

const express = require('express');
const router = express.Router();
const RoomController = require('../controllers/roomController');

router.get('/availability', RoomController.checkAvailability);
router.get('/', RoomController.getRooms);
router.get('/:id', RoomController.getRoomById);
router.post('/', RoomController.createRoom);
router.put('/:id', RoomController.updateRoom);
router.delete('/:id', RoomController.deleteRoom);

module.exports = router;
