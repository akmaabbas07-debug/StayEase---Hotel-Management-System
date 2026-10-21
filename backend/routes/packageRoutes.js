/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Package REST API Routes
   Primary Owner: Ahasas Singh (25070122026) - Database Architect
   Course Unit Mapping: Unit 3 (Node.js Routing)
   ========================================================================== */

const express = require('express');
const router = express.Router();
const PackageController = require('../controllers/packageController');

router.get('/', PackageController.getPackages);
router.get('/breakfast', PackageController.getBreakfastOptions);
router.post('/', PackageController.createPackage);

module.exports = router;
