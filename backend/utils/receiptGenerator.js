/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: File System Receipt Generator (REC-*.txt)
   Primary Owner: Akul Agarwal (25070122030) - DevOps & Supporting Services Lead
   Course Unit Mapping: Unit 3 (Node.js File System 'fs' Module & Text Formatting)
   ========================================================================== */

const fs = require('fs');
const path = require('path');
const Logger = require('./logger');

const receiptsDir = path.join(__dirname, '..', 'receipts');

if (!fs.existsSync(receiptsDir)) {
  fs.mkdirSync(receiptsDir, { recursive: true });
}

const ReceiptGenerator = {
  /**
   * Generates a formal text receipt file on disk using Node.js File System
   * @param {object} billData 
   * @param {object} paymentData 
   * @returns {string} File path of generated receipt
   */
  generateReceiptFile(billData, paymentData = {}) {
    const invNo = billData.invoiceNumber || 'INV-00000';
    const fileName = `REC-${invNo}.txt`;
    const filePath = path.join(receiptsDir, fileName);

    const b = billData.breakdown;
    const g = billData.guest;
    const s = billData.stayDates;

    let servicesBlock = '';
    if (b.serviceCharges && b.serviceCharges.length > 0) {
      servicesBlock = b.serviceCharges
        .map(sc => `  - ${sc.name.padEnd(25)} Qty: ${String(sc.quantity).padEnd(4)} @ ₹${String(sc.unitPrice).padEnd(6)} = ₹${sc.total.toFixed(2)}`)
        .join('\n');
    } else {
      servicesBlock = '  - None';
    }

    const receiptContent = `
================================================================================
                           STAYEASE HOTEL & SUITES
               Plot 42, Knowledge City, Bangalore, Karnataka, India
                   Phone: +91 80 4912 3456 | GSTIN: 29AAAAA0000A1Z5
================================================================================
                            OFFICIAL PAYMENT RECEIPT
================================================================================
RECEIPT DETAILS:
  Receipt No        : REC-${invNo}
  Invoice No        : ${invNo}
  Booking Reference : ${billData.bookingNumber}
  Payment Date      : ${new Date().toISOString().replace('T', ' ').substring(0, 19)}
  Payment Method    : ${paymentData.method || 'UPI'}
  Transaction Ref   : ${paymentData.transactionRef || 'UPI/20261021/887192'}
  Payment Status    : SUCCESS / SETTLED

GUEST INFORMATION:
  Name              : ${g.fullName}
  Contact           : ${g.phone} | ${g.email}
  Identity Document : ${g.idType} (${g.idNumber})

STAY PARAMETERS:
  Room Number       : Room ${b.roomCharges.roomNumber} (${b.roomCharges.roomType})
  Stay Dates        : ${s.checkIn} to ${s.checkOut} (${s.nights} Nights)
  Number of Guests  : ${s.guests} Adults

--------------------------------------------------------------------------------
ITEMIZED CHARGES BREAKDOWN
--------------------------------------------------------------------------------
1. ROOM CHARGES:
   ${s.nights} Nights @ ₹${b.roomCharges.pricePerNight} / night ............................ ₹${b.roomCharges.total.toFixed(2)}

2. BREAKFAST PLAN (${b.breakfastCharges.option}):
   ${b.breakfastCharges.guests} Guests x ${b.breakfastCharges.days} Days @ ₹${b.breakfastCharges.pricePerPerson} / day ........... ₹${b.breakfastCharges.total.toFixed(2)}

3. HOTEL PACKAGE (${b.packageCharges.packageName}):
   Package Base Fee ............................................ ₹${b.packageCharges.price.toFixed(2)}

4. ADDITIONAL CONSUMED SERVICES:
${servicesBlock}
   Services Total .............................................. ₹${b.serviceCharges.reduce((acc, c) => acc + c.total, 0).toFixed(2)}
--------------------------------------------------------------------------------
SUBTOTAL ....................................................... ₹${b.subtotal.toFixed(2)}
PROMOTIONAL DISCOUNT (${b.voucher.code || 'None'}) ............................ -₹${b.voucher.discount.toFixed(2)}
TAXABLE AMOUNT ................................................. ₹${(b.subtotal - b.voucher.discount).toFixed(2)}
GOODS & SERVICES TAX (GST @ 18%) ............................... ₹${b.taxAmount.toFixed(2)}
================================================================================
GRAND TOTAL PAID ............................................... ₹${b.grandTotal.toFixed(2)}
================================================================================

              Thank you for choosing StayEase Hotel & Suites!
                   We look forward to welcoming you again.
================================================================================
`;

    fs.writeFileSync(filePath, receiptContent.trim() + '\n', 'utf8');
    Logger.info(`Generated official payment receipt text file at: ${filePath}`);
    return filePath;
  }
};

module.exports = ReceiptGenerator;
