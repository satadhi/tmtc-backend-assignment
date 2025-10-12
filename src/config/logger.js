const { createLogger, format, transports } = require('winston');
const path = require('path');

// Ensure logs folder exists
const fs = require('fs');
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const logger = createLogger({
  level: 'info', // minimum level to log
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(
      ({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`
    )
  ),
  transports: [
    new transports.Console(), // prints logs to console
    new transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }), // only errors
    new transports.File({ filename: path.join(logDir, 'combined.log') }), // all logs
  ],
});

module.exports = logger;
