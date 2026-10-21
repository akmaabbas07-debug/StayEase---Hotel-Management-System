/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Services REST API Routes
   Primary Owner: Ahasas Singh (25070122026) - Database Architect
   Course Unit Mapping: Unit 3 (Node.js Routing)
   ========================================================================== */

const express = require('express');
const router = express.Router();
const ServiceController = require('../controllers/serviceController');

router.get('/', ServiceController.getServices);
router.get('/:id', ServiceController.getServiceById);
router.post('/', ServiceController.createService);
router.put('/:id', ServiceController.updateService);
router.delete('/:id', ServiceController.deleteService);

module.exports = router;
