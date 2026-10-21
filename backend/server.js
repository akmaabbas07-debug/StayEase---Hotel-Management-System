/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Main Node.js HTTP Server & Express Application Bootstrap
   Primary Owner: Akmal Abbas (25070122028) - Backend Architect & Lead Integrator
   Co-owners: Akul Agarwal (Security & Middleware), Ahasas Singh (Database)
   Course Unit Mapping: Unit 3 (Node.js HTTP, URL, FS, Events), Unit 4 (MongoDB)
   ========================================================================== */

require('dotenv').config();
const express = require('express');
const path = require('path');
const url = require('url'); // Explicitly import Node.js URL module (Section 21)
const connectDB = require('./config/database');
const Logger = require('./utils/logger');

// Import Routes
const guestRoutes = require('./routes/guestRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const packageRoutes = require('./routes/packageRoutes');
const voucherRoutes = require('./routes/voucherRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Import Controllers for cross-mounting
const PaymentController = require('./controllers/paymentController');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB (Unit 4)
connectDB();

// Core Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom Request Logger & Node.js URL Module Demonstration (Section 21)
app.use((req, res, next) => {
  // Parse incoming request URL using native Node.js URL module
  const parsedUrl = url.parse(req.url, true);
  req.parsedUrl = parsedUrl;

  const queryKeys = Object.keys(parsedUrl.query);
  const queryStr = queryKeys.length > 0 ? ` ?${new URLSearchParams(parsedUrl.query).toString()}` : '';
  Logger.info(`HTTP ${req.method} ${parsedUrl.pathname}${queryStr}`);
  next();
});

// Serve Frontend Static Assets (Unit 1 & Unit 2)
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API Endpoints
app.use('/api/guests', guestRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/upload', uploadRoutes);

// Direct cross-mounted routes for convenience and spec compliance
app.post('/api/bookings/:id/pay', PaymentController.processPayment);
app.get('/api/bookings/:id/receipt', PaymentController.downloadReceipt);

// Node.js File System Live Log Viewer Route (Section 19)
app.get('/api/logs', async (req, res) => {
  try {
    const lines = parseInt(req.query.lines, 10) || 50;
    const recentLogs = await Logger.getRecentLogs(lines);
    res.setHeader('Content-Type', 'text/plain');
    res.send(recentLogs);
  } catch (err) {
    res.status(500).send(`Error reading hotel.log: ${err.message}`);
  }
});

// Root fallback to index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  Logger.error(`Unhandled Express Error: ${err.message}`, { stack: err.stack });
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    Logger.info(`StayEase HTTP Server successfully started on http://localhost:${PORT}`);
    console.log(`================================================================`);
    console.log(`🏨  StayEase Hotel Management System is live!`);
    console.log(`🌐  URL: http://localhost:${PORT}`);
    console.log(`📊  Admin: http://localhost:${PORT}/admin.html`);
    console.log(`📝  Log: backend/logs/hotel.log`);
    console.log(`================================================================`);
  });
}

module.exports = app;
