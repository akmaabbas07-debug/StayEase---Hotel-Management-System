/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Dynamic Billing & Invoice Calculation Engine
   Primary Owner: Ahasas Singh (25070122026) - Commercial Logic Architect
   Course Unit Mapping: Unit 4 (Dynamic Calculations, 1:1 Invoices & Financial Guards)
   ========================================================================== */

const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { Service, BookingService } = require('../models/Service');
const { Package } = require('../models/Package');
const BreakfastOption = require('../models/BreakfastOption');
const Invoice = require('../models/Invoice');
const VoucherService = require('./voucherService');
const { TAX_RATE_GST, BOOKING_STATUS } = require('../config/constants');
const Logger = require('../utils/logger');

const BillingService = {
  /**
   * Dynamically calculate invoice for a booking.
   * NEVER hardcodes totals. Recalculates dynamically from live booking parameters.
   * @param {string|ObjectId} bookingId 
   * @param {string} [overrideVoucherCode] 
   * @returns {Promise<object>}
   */
  async calculateBill(bookingId, overrideVoucherCode = null) {
    const booking = await Booking.findById(bookingId)
      .populate('roomId')
      .populate('guestId')
      .populate('packageId');

    if (!booking) {
      throw new Error(`Booking ${bookingId} not found.`);
    }

    const room = booking.roomId;
    if (!room) {
      throw new Error(`Room data missing for booking ${bookingId}`);
    }

    // 1. Calculate Stay Nights
    const inDate = new Date(booking.checkInDate);
    const outDate = new Date(booking.checkOutDate);
    const diffMs = outDate.getTime() - inDate.getTime();
    const nights = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    // 2. Room Charges
    const roomRate = room.pricePerNight;
    const roomChargesTotal = nights * roomRate;
    const roomCharges = {
      roomNumber: room.roomNumber,
      roomType: room.type,
      pricePerNight: roomRate,
      nights,
      total: roomChargesTotal
    };

    // 3. Breakfast Charges (Section 9)
    let bfPricePerDay = 0;
    if (booking.breakfastOption && booking.breakfastOption !== 'NONE') {
      const bfOption = await BreakfastOption.findOne({ code: booking.breakfastOption });
      if (bfOption) {
        bfPricePerDay = bfOption.pricePerPersonPerDay;
      }
    }
    const breakfastChargesTotal = bfPricePerDay * (booking.numberOfGuests || 1) * nights;
    const breakfastCharges = {
      option: booking.breakfastOption || 'NONE',
      pricePerPerson: bfPricePerDay,
      guests: booking.numberOfGuests || 1,
      days: nights,
      total: breakfastChargesTotal
    };

    // 4. Package Charges (Section 10)
    let packageChargesTotal = 0;
    let packageName = 'None';
    if (booking.packageId) {
      packageChargesTotal = booking.packageId.price || 0;
      packageName = booking.packageId.name || 'Custom Package';
    }
    const packageCharges = {
      packageName,
      price: packageChargesTotal
    };

    // 5. Additional Services (Section 11) - Fetch locked prices from bookingServices
    const consumedServices = await BookingService.find({ bookingId: booking._id });
    let serviceChargesTotal = 0;
    const serviceCharges = consumedServices.map(cs => {
      serviceChargesTotal += cs.total;
      return {
        name: cs.serviceName,
        quantity: cs.quantity,
        unitPrice: cs.unitPriceAtPurchase, // Historical locked price (Rule 16)
        total: cs.total
      };
    });

    // 6. Subtotal
    const subtotal = roomChargesTotal + breakfastChargesTotal + packageChargesTotal + serviceChargesTotal;

    // 7. Voucher Validation & Discount
    const voucherCodeToTest = overrideVoucherCode !== undefined ? overrideVoucherCode : booking.appliedVoucherCode;
    let discount = 0;
    let appliedCode = null;

    if (voucherCodeToTest) {
      const voucherRes = await VoucherService.validateAndCalculateDiscount(voucherCodeToTest, {
        subtotal,
        guestId: booking.guestId?._id,
        roomType: room.type,
        packageId: booking.packageId?._id
      });

      if (voucherRes.valid) {
        discount = voucherRes.discount;
        appliedCode = voucherRes.voucher.code;
      } else {
        Logger.warn(`Voucher '${voucherCodeToTest}' could not be applied: ${voucherRes.error}`);
      }
    }

    // 8. Tax & Grand Total (Rule 12)
    const netTaxable = Math.max(0, subtotal - discount);
    const taxAmount = Math.round(netTaxable * TAX_RATE_GST);
    const grandTotal = netTaxable + taxAmount;

    // 9. Sync values back to Booking record in DB
    booking.subtotal = subtotal;
    booking.discountAmount = discount;
    booking.taxAmount = taxAmount;
    booking.grandTotal = grandTotal;
    booking.appliedVoucherCode = appliedCode;
    await booking.save();

    // 10. Sync to 1:1 Invoice collection (Section 26)
    const invoiceNumber = `INV-${booking.bookingNumber.replace('SE-', '')}`;
    const invoice = await Invoice.findOneAndUpdate(
      { bookingId: booking._id },
      {
        invoiceNumber,
        bookingId: booking._id,
        guestId: booking.guestId._id,
        roomCharges,
        breakfastCharges,
        packageCharges,
        serviceCharges,
        subtotal,
        voucher: {
          code: appliedCode || 'None',
          discount
        },
        taxRate: TAX_RATE_GST,
        taxAmount,
        grandTotal,
        status: booking.paymentStatus === 'PAID' ? 'PAID' : 'PENDING'
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    Logger.info(`Calculated bill for ${booking.bookingNumber}: Subtotal: ₹${subtotal}, Discount: -₹${discount}, Tax: ₹${taxAmount}, Grand Total: ₹${grandTotal}`);

    return {
      bookingNumber: booking.bookingNumber,
      invoiceNumber: invoice.invoiceNumber,
      guest: {
        fullName: booking.guestId?.fullName,
        phone: booking.guestId?.phone,
        email: booking.guestId?.email,
        idType: booking.guestId?.idType,
        idNumber: booking.guestId?.idNumber
      },
      stayDates: {
        checkIn: inDate.toISOString().split('T')[0],
        checkOut: outDate.toISOString().split('T')[0],
        nights,
        guests: booking.numberOfGuests
      },
      breakdown: {
        roomCharges,
        breakfastCharges,
        packageCharges,
        serviceCharges,
        subtotal,
        voucher: {
          code: appliedCode,
          discount
        },
        taxRate: TAX_RATE_GST,
        taxAmount,
        grandTotal
      },
      paymentStatus: booking.paymentStatus,
      bookingStatus: booking.bookingStatus
    };
  }
};

module.exports = BillingService;
