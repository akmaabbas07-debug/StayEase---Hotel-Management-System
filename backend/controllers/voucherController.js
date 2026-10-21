/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Voucher Controller & Validation API
   Primary Owner: Ahasas Singh (25070122026) - Commercial Logic Architect
   Course Unit Mapping: Unit 4 (Voucher CRUD & 7-Step Server Validation Pipeline)
   ========================================================================== */

const { Voucher } = require('../models/Voucher');
const VoucherService = require('../services/voucherService');

const VoucherController = {
  // READ all active vouchers
  async getVouchers(req, res) {
    try {
      const vouchers = await Voucher.find({ isActive: true }).sort({ code: 1 });
      res.json({ success: true, count: vouchers.length, data: vouchers });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // PREVIEW / VALIDATE Voucher without applying (Section 13)
  async validateVoucher(req, res) {
    try {
      const { voucherCode, subtotal, guestId, roomType } = req.body;
      const result = await VoucherService.validateAndCalculateDiscount(voucherCode, {
        subtotal: parseFloat(subtotal) || 0,
        guestId,
        roomType
      });

      if (!result.valid) {
        return res.status(400).json({ success: false, message: result.error });
      }

      res.json({
        success: true,
        message: `Voucher ${result.voucher.code} is valid.`,
        discount: result.discount,
        voucher: result.voucher
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // CREATE Voucher (Admin CRUD)
  async createVoucher(req, res) {
    try {
      const voucher = await Voucher.create(req.body);
      res.status(201).json({ success: true, data: voucher });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // UPDATE Voucher
  async updateVoucher(req, res) {
    try {
      const voucher = await Voucher.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!voucher) return res.status(404).json({ success: false, message: 'Voucher not found' });
      res.json({ success: true, data: voucher });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // DELETE Voucher
  async deleteVoucher(req, res) {
    try {
      const voucher = await Voucher.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
      if (!voucher) return res.status(404).json({ success: false, message: 'Voucher not found' });
      res.json({ success: true, message: `Voucher ${voucher.code} deactivated.` });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

module.exports = VoucherController;
