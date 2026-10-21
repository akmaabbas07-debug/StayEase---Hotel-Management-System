/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Payment & Receipt Controller
   Primary Owner: Ahasas Singh (25070122026) - Commercial Logic Architect
   Co-owners: Akul Agarwal (Receipt File System & Email), Akmal Abbas (Events)
   Course Unit Mapping: Unit 3 (Node.js File Stream, Events, Nodemailer), Unit 4 (1:1 Payment)
   ========================================================================== */

const path = require('path');
const fs = require('fs');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Invoice = require('../models/Invoice');
const BillingService = require('../services/billingService');
const VoucherService = require('../services/voucherService');
const ReceiptGenerator = require('../utils/receiptGenerator');
const EmailService = require('../services/emailService');
const hotelEvents = require('../events/hotelEvents');
const { BOOKING_STATUS, PAYMENT_STATUS, INVOICE_STATUS } = require('../config/constants');
const Logger = require('../utils/logger');

const PaymentController = {
  // SIMULATE PAYMENT SETTLEMENT (Section 16 & 17)
  async processPayment(req, res) {
    try {
      const { id } = req.params; // bookingId or bookingNumber
      const { amount, method = 'UPI', transactionRef } = req.body;

      const query = id.startsWith('SE-') ? { bookingNumber: id } : { _id: id };
      const booking = await Booking.findOne(query).populate('guestId');

      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found.' });
      }

      if (booking.paymentStatus === 'PAID') {
        return res.status(400).json({ success: false, message: 'This booking has already been settled and paid.' });
      }

      // Re-calculate live bill on the server (Source of Truth)
      const billData = await BillingService.calculateBill(booking._id);
      const expectedTotal = billData.breakdown.grandTotal;

      // RULE 13: Payment amount must match server-generated invoice amount
      const submittedAmount = parseFloat(amount);
      if (Math.abs(submittedAmount - expectedTotal) > 1.0) { // allow 1 rupee rounding margin
        return res.status(400).json({ 
          success: false, 
          message: `Payment Rejected (RULE 13): Submitted amount ₹${submittedAmount} does not match server invoice total ₹${expectedTotal}.` 
        });
      }

      // Generate payment transaction ID
      const paymentId = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const txRef = transactionRef || `${method}/${new Date().toISOString().replace(/\D/g, '').slice(0, 8)}/${Math.floor(100000 + Math.random() * 900000)}`;

      // 1. Create Payment record
      const invoice = await Invoice.findOne({ bookingId: booking._id });
      const payment = await Payment.create({
        paymentId,
        bookingId: booking._id,
        invoiceId: invoice._id,
        amount: expectedTotal,
        method: ['CASH', 'CARD', 'UPI'].includes(method.toUpperCase()) ? method.toUpperCase() : 'UPI',
        status: PAYMENT_STATUS.SUCCESS,
        transactionRef: txRef
      });

      // 2. Mark Booking & Invoice as PAID (Rules 9, 10, 11 apply from now on)
      booking.paymentStatus = PAYMENT_STATUS.PAID;
      booking.bookingStatus = BOOKING_STATUS.PAID;
      await booking.save();

      invoice.status = INVOICE_STATUS.PAID;
      invoice.paidAt = new Date();
      await invoice.save();

      // 3. Record Voucher Usage if a coupon was used
      if (booking.appliedVoucherCode && billData.breakdown.voucher.discount > 0) {
        const { Voucher } = require('../models/Voucher');
        const vDoc = await Voucher.findOne({ code: booking.appliedVoucherCode });
        if (vDoc) {
          await VoucherService.recordVoucherRedemption(
            vDoc._id,
            booking.appliedVoucherCode,
            booking.guestId._id,
            booking._id,
            billData.breakdown.voucher.discount
          );
        }
      }

      // 4. Generate Official Receipt on disk (Node.js File System - Section 18 & 19)
      const receiptPath = ReceiptGenerator.generateReceiptFile(billData, {
        method: payment.method,
        transactionRef: payment.transactionRef
      });

      // 5. Send Email Receipt (Unit 3 Nodemailer)
      await EmailService.sendPaymentReceipt(billData, {
        method: payment.method,
        transactionRef: payment.transactionRef
      });

      // 6. Emit paymentCompleted event
      hotelEvents.emit('paymentCompleted', {
        invoiceNumber: invoice.invoiceNumber,
        bookingNumber: booking.bookingNumber,
        amount: payment.amount,
        method: payment.method,
        transactionRef: payment.transactionRef
      });

      res.status(200).json({
        success: true,
        message: 'Payment settled successfully! Booking and invoice are marked as PAID. All post-payment rules locked.',
        payment,
        invoice,
        receiptUrl: `/api/bookings/${booking.bookingNumber}/receipt`
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // DOWNLOAD RECEIPT FILE (Section 18 & 19)
  async downloadReceipt(req, res) {
    try {
      const { id } = req.params;
      const query = id.startsWith('SE-') ? { bookingNumber: id } : { _id: id };
      const booking = await Booking.findOne(query);

      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

      const invoiceNumber = `INV-${booking.bookingNumber.replace('SE-', '')}`;
      const receiptFile = path.join(__dirname, '..', 'receipts', `REC-${invoiceNumber}.txt`);

      if (!fs.existsSync(receiptFile)) {
        // Regenerate if not on disk
        const billData = await BillingService.calculateBill(booking._id);
        ReceiptGenerator.generateReceiptFile(billData, {
          method: 'UPI',
          transactionRef: 'SYSTEM-REGEN'
        });
      }

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename=REC-${invoiceNumber}.txt`);
      const fileStream = fs.createReadStream(receiptFile);
      fileStream.pipe(res);
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

module.exports = PaymentController;
