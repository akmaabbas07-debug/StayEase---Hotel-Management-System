/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: MongoDB Database Connection Engine
   Primary Owner: Ahasas Singh (25070122026) - Database Architect
   Course Unit Mapping: Unit 4 (MongoDB Connection, Connection Pooling & Administration)
   ========================================================================== */

const mongoose = require('mongoose');
const Logger = require('../utils/logger');

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hotelDB';

  try {
    const conn = await mongoose.connect(mongoURI, {
      autoIndex: true, // Build defined schema indexes (Section 29)
      serverSelectionTimeoutMS: 5000
    });

    Logger.info(`Connected to MongoDB database: ${conn.connection.name} on host ${conn.connection.host}:${conn.connection.port}`);
    console.log(`[StayEase Database] MongoDB connected: ${conn.connection.name}`);
    return conn;
  } catch (err) {
    Logger.error(`MongoDB Connection Error: ${err.message}`);
    console.error(`[StayEase Database Error] Failed to connect to MongoDB: ${err.message}`);
    // Don't crash immediately in dev/test, allow graceful recovery
    return null;
  }
};

module.exports = connectDB;
