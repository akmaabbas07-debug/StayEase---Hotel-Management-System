/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Voucher REST API Routes
   Primary Owner: Ahasas Singh (25070122026) - Commercial Logic Architect
   Course Unit Mapping: Unit 3 (Node.js Routing)
   ========================================================================== */

const express = require('express');
const router = express.Router();
const VoucherController = require('../controllers/voucherController');

router.get('/', VoucherController.getVouchers);
router.post('/validate', VoucherController.validateVoucher);
router.post('/', VoucherController.createVoucher);
router.put('/:id', VoucherController.updateVoucher);
router.delete('/:id', VoucherController.deleteVoucher);

module.exports = router;
