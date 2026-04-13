/**
 * Logger Configuration - Winston Logger
 * 
 * @author Stellar DeFi Auditor Team
 * @version 1.0.0
 */

import winston from 'winston';

/**
 * Get log level from environment
 */
function getLogLevel(): string {
  return process.env.LOG_LEVEL || 'info';
}

/**
 * Custom log format
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}${stack ? `\n${stack}` : ''}`;
  })
);

/**
 * Console transport configuration
 */
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    logFormat
  ),
});

/**
 * Create Winston logger
 */
export const logger = winston.createLogger({
  level: getLogLevel(),
  format: logFormat,
  transports: [consoleTransport],
});

/**
 * Add file transport for production
 */
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
    })
  );
  
  logger.add(
    new winston.transports.File({ 
      filename: 'logs/combined.log',
    })
  );
}