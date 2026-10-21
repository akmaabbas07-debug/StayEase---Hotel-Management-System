/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Payment REST API Routes
   Primary Owner: Ahasas Singh (25070122026) - Commercial Logic Architect
   Course Unit Mapping: Unit 3 (Node.js Routing)
   ========================================================================== */

const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');

router.post('/pay/:id', PaymentController.processPayment);
router.get('/receipt/:id', PaymentController.downloadReceipt);

module.exports = router;
