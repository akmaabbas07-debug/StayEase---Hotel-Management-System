/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Nodemailer Automated Transactional Email Service
   Primary Owner: Akul Agarwal (25070122030) - DevOps & Supporting Services Lead
   Course Unit Mapping: Unit 3 (Node.js Email Automation via Nodemailer)
   ========================================================================== */

const nodemailer = require('nodemailer');
const Logger = require('../utils/logger');

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: { user, pass }
    });
  } else {
    // Development / Test mode: Create Ethereal test account or simulated console dispatcher
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      Logger.info(`Initialized Ethereal test mailer for ${testAccount.user}`);
    } catch (e) {
      Logger.warn(`Could not create Ethereal account. Using simulated email logger.`);
      transporter = {
        sendMail: async (mailOptions) => {
          Logger.info(`[SIMULATED EMAIL SENT] To: ${mailOptions.to} | Subject: ${mailOptions.subject}`);
          return { messageId: 'simulated-' + Date.now() };
        }
      };
    }
  }

  return transporter;
}

const EmailService = {
  async sendEmail(to, subject, text, html = null) {
    try {
      const mailer = await getTransporter();
      const mailOptions = {
        from: process.env.EMAIL_FROM || '"StayEase Hotel" <no-reply@stayease.hotel>',
        to,
        subject,
        text,
        html: html || `<pre>${text}</pre>`
      };

      const info = await mailer.sendMail(mailOptions);
      Logger.info(`Transactional email sent to ${to}. MessageId: ${info.messageId}`);
      return info;
    } catch (err) {
      Logger.error(`Failed to send email to ${to}: ${err.message}`);
    }
  },

  async sendBookingConfirmation(booking, guest) {
    const subject = `StayEase Booking Confirmation — ${booking.bookingNumber}`;
    const text = `
Dear ${guest.fullName},

Thank you for choosing StayEase Hotel & Suites.
Your reservation has been confirmed:

Booking Reference : ${booking.bookingNumber}
Check-in Date     : ${new Date(booking.checkInDate).toLocaleDateString()}
Check-out Date    : ${new Date(booking.checkOutDate).toLocaleDateString()}
Number of Guests  : ${booking.numberOfGuests}

We look forward to hosting you!
StayEase Reception Desk
    `;
    return this.sendEmail(guest.email, subject, text);
  },

  async sendPaymentReceipt(billData, paymentData) {
    const subject = `StayEase Payment Confirmation — ${billData.invoiceNumber}`;
    const text = `
Dear ${billData.guest.fullName},

Payment received successfully.

Invoice No       : ${billData.invoiceNumber}
Amount Paid      : ₹${billData.breakdown.grandTotal.toFixed(2)}
Payment Method   : ${paymentData.method}
Transaction Ref  : ${paymentData.transactionRef}
Payment Status   : SETTLED

Your official itemized receipt is available at the reception desk or download online.

Warm regards,
StayEase Hotel Accounts
    `;
    return this.sendEmail(billData.guest.email, subject, text);
  }
};

module.exports = EmailService;
