/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: 7-Step Voucher Validation & Discount Engine
   Primary Owner: Ahasas Singh (25070122026) - Commercial Logic Architect
   Course Unit Mapping: Unit 4 (Complex Query Verification & Business Safeguards)
   ========================================================================== */

const { Voucher, VoucherUsage } = require('../models/Voucher');
const Logger = require('../utils/logger');

const VoucherService = {
  /**
   * Complete 7-step server-side voucher validation workflow (Section 13)
   * NEVER trust client-side discount calculations.
   * @param {string} voucherCode 
   * @param {object} context - { subtotal, guestId, roomType, packageId, services }
   * @returns {Promise<{ valid: boolean, discount: number, voucher?: object, error?: string }>}
   */
  async validateAndCalculateDiscount(voucherCode, context) {
    if (!voucherCode || typeof voucherCode !== 'string') {
      return { valid: false, discount: 0, error: 'Voucher code is required.' };
    }

    const code = voucherCode.trim().toUpperCase();
    const now = new Date();
    const { subtotal = 0, guestId, roomType } = context;

    // STEP 1: Voucher exists in database
    const voucher = await Voucher.findOne({ code });
    if (!voucher) {
      Logger.warn(`Voucher validation failed: Code '${code}' does not exist.`);
      return { valid: false, discount: 0, error: `Voucher code '${code}' is invalid.` };
    }

    // STEP 2: Voucher is active
    if (!voucher.isActive) {
      Logger.warn(`Voucher validation failed: Code '${code}' is deactivated.`);
      return { valid: false, discount: 0, error: `Voucher '${code}' is no longer active.` };
    }

    // STEP 3: Current date within validity window (validFrom <= now <= validUntil)
    if (now < new Date(voucher.validFrom)) {
      return { valid: false, discount: 0, error: `Voucher '${code}' is not yet valid.` };
    }
    if (now > new Date(voucher.validUntil)) {
      Logger.warn(`Voucher validation failed: Code '${code}' expired on ${voucher.validUntil}.`);
      return { valid: false, discount: 0, error: `Voucher '${code}' has expired.` };
    }

    // STEP 4: Global usage limit not exceeded (timesUsed < usageLimit)
    if (voucher.timesUsed >= voucher.usageLimit) {
      Logger.warn(`Voucher validation failed: Code '${code}' reached usage limit (${voucher.timesUsed}/${voucher.usageLimit}).`);
      return { valid: false, discount: 0, error: `Voucher '${code}' has reached its global redemption limit.` };
    }

    // STEP 5: Per-user usage limit verification
    if (guestId) {
      const userRedemptions = await VoucherUsage.countDocuments({
        voucherId: voucher._id,
        guestId
      });
      if (userRedemptions >= voucher.perUserLimit) {
        Logger.warn(`Voucher validation failed: Guest ${guestId} exceeded personal limit for '${code}'.`);
        return { valid: false, discount: 0, error: `You have already redeemed voucher '${code}' the maximum allowed times (${voucher.perUserLimit}).` };
      }
    }

    // STEP 6: Minimum bill requirement met (subtotal >= minBillAmount)
    if (subtotal < voucher.minBillAmount) {
      return { 
        valid: false, 
        discount: 0, 
        error: `Voucher '${code}' requires a minimum subtotal of ₹${voucher.minBillAmount.toLocaleString('en-IN')}. (Current: ₹${subtotal.toLocaleString('en-IN')}).` 
      };
    }

    // STEP 7: Category restrictions (room types, packages, services)
    if (voucher.applicableRoomTypes && voucher.applicableRoomTypes.length > 0) {
      if (!roomType || !voucher.applicableRoomTypes.includes(roomType)) {
        return { 
          valid: false, 
          discount: 0, 
          error: `Voucher '${code}' is only applicable for ${voucher.applicableRoomTypes.join(', ')} rooms.` 
        };
      }
    }

    // ALL CHECKS PASSED: Compute discount mathematically on server
    let discount = 0;
    if (voucher.discountType === 'PERCENTAGE') {
      const rawDiscount = Math.round((subtotal * voucher.discountValue) / 100);
      discount = voucher.maxDiscount ? Math.min(rawDiscount, voucher.maxDiscount) : rawDiscount;
    } else if (voucher.discountType === 'FIXED') {
      discount = Math.min(subtotal, voucher.discountValue);
    }

    Logger.info(`Voucher '${code}' successfully validated for subtotal ₹${subtotal}. Calculated discount: ₹${discount}`);
    return {
      valid: true,
      discount,
      voucher
    };
  },

  /**
   * Record voucher redemption after final successful payment
   */
  async recordVoucherRedemption(voucherId, voucherCode, guestId, bookingId, discountApplied) {
    await VoucherUsage.create({
      voucherId,
      voucherCode,
      guestId,
      bookingId,
      discountApplied
    });
    await Voucher.findByIdAndUpdate(voucherId, { $inc: { timesUsed: 1 } });
    Logger.info(`Recorded voucher usage for '${voucherCode}' on booking ${bookingId}`);
  }
};

module.exports = VoucherService;
