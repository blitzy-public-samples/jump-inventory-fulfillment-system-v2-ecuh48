import winston from 'winston';
import { LoggerConfig } from '../config/logger';

class Logger {
  private logger: winston.Logger;

  constructor() {
    // Create Winston logger instance
    this.logger = winston.createLogger({
      level: LoggerConfig.level,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [],
    });

    // Add console transport with appropriate level and format
    this.logger.add(new winston.transports.Console({
      format: winston.format.simple(),
    }));

    // Add file transport for error logs
    this.logger.add(new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }));

    // Add file transport for combined logs
    this.logger.add(new winston.transports.File({
      filename: 'logs/combined.log',
    }));

    // Configure log rotation if specified in LoggerConfig
    if (LoggerConfig.rotation) {
      const { maxSize, maxFiles } = LoggerConfig.rotation;
      this.logger.add(new winston.transports.File({
        filename: 'logs/rotated.log',
        maxsize: maxSize,
        maxFiles: maxFiles,
      }));
    }
  }

  // Log an info message
  info(message: string, meta?: object): void {
    this.logger.info(message, meta);
  }

  // Log an error message
  error(message: string, error: Error, meta?: object): void {
    this.logger.error(message, { error, ...meta });
  }

  // Log a warning message
  warn(message: string, meta?: object): void {
    this.logger.warn(message, meta);
  }

  // Log a debug message
  debug(message: string, meta?: object): void {
    this.logger.debug(message, meta);
  }
}

export default new Logger();