/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Reports REST API Routes
   Primary Owner: Ahasas Singh (25070122026) - Database Architect
   Course Unit Mapping: Unit 3 (Node.js Routing)
   ========================================================================== */

const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');

router.get('/dashboard', ReportController.getDashboardAnalytics);

module.exports = router;
