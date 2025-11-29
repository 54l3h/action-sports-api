// utils/logger.js
import winston from "winston";

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Create logger instance with console-only transport for Vercel
const logger = winston.createLogger({
  level: "info",
  format: combine(
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat
  ),
  transports: [
    // Console transport only - Vercel captures all console output
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),
  ],
  exitOnError: false,
});

export default logger;
