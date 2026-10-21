/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Secure File Upload Endpoint (Multer Guard)
   Primary Owner: Akul Agarwal (25070122030) - DevOps & Security Lead
   Course Unit Mapping: Unit 3 (Node.js File Upload via Multer, MIME Type Guard)
   ========================================================================== */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { Document } = require('../models/Document');
const { MAX_FILE_SIZE_BYTES, ALLOWED_FILE_TYPES } = require('../config/constants');
const Logger = require('../utils/logger');

// Storage configuration with safe sanitized filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    // Generate safe alphanumeric filename with timestamp to prevent path traversal
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '');
    const uniqueName = `doc-${Date.now()}-${safeBase || 'proof'}${ext}`;
    cb(null, uniqueName);
  }
});

// File filter guard (Unit 3 Security)
const fileFilter = (req, file, cb) => {
  if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type ${file.mimetype}. Only PDF, JPG, and PNG files are accepted.`), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter
});

// POST /api/upload
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No document file provided.' });
    }

    const { guestId, bookingId } = req.body;

    const doc = await Document.create({
      guestId: guestId || new require('mongoose').Types.ObjectId(),
      bookingId: bookingId || null,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      filePath: `uploads/${req.file.filename}`
    });

    Logger.info(`Uploaded identity proof document: ${req.file.filename} (${req.file.size} bytes) for Guest ${guestId || 'Pending'}`);

    res.status(201).json({
      success: true,
      message: 'Document uploaded and verified successfully.',
      document: doc
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
