// utils/logger.js
import winston from "winston";
import path from "path";

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat
  ),
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),
    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join("logs", "combined.log"),
    }),
    // Write error logs to error.log
    new winston.transports.File({
      filename: path.join("logs", "error.log"),
      level: "error",
    }),
  ],
  // Don't exit on handled exceptions
  exitOnError: false,
});

// If we're in production, don't log to console
if (process.env.NODE_ENV === "PRODUCTION") {
  logger.transports[0].silent = true;
}

export default logger;
