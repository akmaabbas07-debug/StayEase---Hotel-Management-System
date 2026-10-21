/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: File System Logger (hotel.log)
   Primary Owner: Akul Agarwal (25070122030) - DevOps & Security Lead
   Course Unit Mapping: Unit 3 (Node.js File System 'fs' Module & Logging)
   ========================================================================== */

const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '..', 'logs');
const logFile = path.join(logDir, 'hotel.log');

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

function getTimestamp() {
  const now = new Date();
  return now.toISOString().replace('T', ' ').substring(0, 19);
}

const Logger = {
  /**
   * Append log entry to hotel.log
   * @param {string} level 
   * @param {string} message 
   * @param {object} [meta] 
   */
  log(level, message, meta = null) {
    const timestamp = getTimestamp();
    const metaStr = meta ? ` | Meta: ${JSON.stringify(meta)}` : '';
    const line = `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}\n`;

    // Console output for terminal debugging
    console.log(`[StayEase] ${line.trim()}`);

    // File System append (Node.js fs module requirement)
    fs.appendFile(logFile, line, (err) => {
      if (err) console.error('[Logger Error] Failed writing to hotel.log:', err);
    });
  },

  info(message, meta) {
    this.log('INFO', message, meta);
  },

  warn(message, meta) {
    this.log('WARN', message, meta);
  },

  error(message, meta) {
    this.log('ERROR', message, meta);
  },

  event(eventName, message, meta) {
    this.log(`EVENT: ${eventName}`, message, meta);
  },

  /**
   * Retrieve the latest N lines from hotel.log
   * @param {number} lineCount 
   * @returns {Promise<string>}
   */
  async getRecentLogs(lineCount = 50) {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(logFile)) {
        return resolve('[System] No log entries yet.');
      }
      fs.readFile(logFile, 'utf8', (err, data) => {
        if (err) return reject(err);
        const lines = data.trim().split('\n');
        const recent = lines.slice(-lineCount).join('\n');
        resolve(recent);
      });
    });
  }
};

module.exports = Logger;
