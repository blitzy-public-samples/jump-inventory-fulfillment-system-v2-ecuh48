import winston from 'winston';
import { logger } from '../../src/backend/utils/logger';
import { LoggerConfig } from '../../src/backend/config/logger';

// Mock winston modules
jest.mock('winston', () => ({
  createLogger: jest.fn(),
  transports: {
    File: jest.fn(),
    Console: jest.fn(),
  },
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    printf: jest.fn(),
  },
}));

describe('Logger Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create a logger instance with correct configuration', () => {
    // Import the logger module to trigger its initialization
    require('../../src/backend/utils/logger');

    // Assert that winston.createLogger was called with the correct configuration
    expect(winston.createLogger).toHaveBeenCalledTimes(1);
    const loggerConfig = (winston.createLogger as jest.Mock).mock.calls[0][0];

    // Assert that the configuration includes console and file transports
    expect(loggerConfig.transports).toHaveLength(3); // Console, error file, and combined file
    expect(winston.transports.Console).toHaveBeenCalled();
    expect(winston.transports.File).toHaveBeenCalledTimes(2);
  });

  test('should log messages at different levels', () => {
    // Mock the logger's log method
    const mockLog = jest.spyOn(logger, 'log');

    // Call logger methods with test messages
    logger.info('Info message');
    logger.warn('Warning message');
    logger.error('Error message');
    logger.debug('Debug message');

    // Assert that the log method was called for each level with the correct parameters
    expect(mockLog).toHaveBeenCalledTimes(4);
    expect(mockLog).toHaveBeenCalledWith('info', 'Info message');
    expect(mockLog).toHaveBeenCalledWith('warn', 'Warning message');
    expect(mockLog).toHaveBeenCalledWith('error', 'Error message');
    expect(mockLog).toHaveBeenCalledWith('debug', 'Debug message');
  });

  test('should format log messages correctly', () => {
    // Mock the winston format functions
    const mockPrintf = jest.fn();
    (winston.format.printf as jest.Mock).mockReturnValue(mockPrintf);

    // Import the logger module to trigger its initialization
    require('../../src/backend/utils/logger');

    // Assert that the logger uses combine, timestamp, and printf formats
    expect(winston.format.combine).toHaveBeenCalled();
    expect(winston.format.timestamp).toHaveBeenCalled();
    expect(winston.format.printf).toHaveBeenCalled();

    // Verify that the printf format function generates the expected log string
    const printfFn = (winston.format.printf as jest.Mock).mock.calls[0][0];
    const logEntry = { timestamp: '2023-05-01T12:00:00Z', level: 'info', message: 'Test message' };
    const formattedLog = printfFn(logEntry);
    expect(formattedLog).toBe('2023-05-01T12:00:00Z [info]: Test message');
  });

  test('should use correct log file paths', () => {
    // Import the logger module to trigger its initialization
    require('../../src/backend/utils/logger');

    // Assert that File transport was created with the correct file paths for error and combined logs
    expect(winston.transports.File).toHaveBeenCalledWith(expect.objectContaining({
      filename: LoggerConfig.errorLogPath,
      level: 'error',
    }));
    expect(winston.transports.File).toHaveBeenCalledWith(expect.objectContaining({
      filename: LoggerConfig.combinedLogPath,
    }));
  });

  test('should handle errors when logging', () => {
    // Mock the logger's log method to throw an error
    const mockLog = jest.spyOn(logger, 'log').mockImplementation(() => {
      throw new Error('Logging error');
    });

    // Attempt to log a message
    expect(() => logger.info('Test message')).not.toThrow();

    // Assert that the error is caught and doesn't crash the application
    expect(mockLog).toHaveBeenCalled();
  });

  test('should apply log rotation settings correctly', () => {
    // Set log rotation settings in LoggerConfig
    LoggerConfig.maxSize = '10m';
    LoggerConfig.maxFiles = '7d';

    // Import the logger module to trigger its initialization
    require('../../src/backend/utils/logger');

    // Assert that File transports were created with the correct rotation settings
    expect(winston.transports.File).toHaveBeenCalledWith(expect.objectContaining({
      maxsize: 10 * 1024 * 1024, // 10m in bytes
      maxFiles: '7d',
    }));
  });

  test('should use correct log levels based on the environment', () => {
    // Set NODE_ENV to 'production'
    process.env.NODE_ENV = 'production';

    // Import the logger module
    const productionLogger = require('../../src/backend/utils/logger').logger;

    // Assert that the logger's level is set to 'info'
    expect(productionLogger.level).toBe('info');

    // Set NODE_ENV to 'development'
    process.env.NODE_ENV = 'development';

    // Re-import the logger module
    jest.resetModules();
    const developmentLogger = require('../../src/backend/utils/logger').logger;

    // Assert that the logger's level is set to 'debug'
    expect(developmentLogger.level).toBe('debug');
  });

  test('should include metadata in log messages', () => {
    // Mock the logger's log method
    const mockLog = jest.spyOn(logger, 'log');

    // Call logger.info with a message and metadata object
    const metadata = { userId: '123', action: 'login' };
    logger.info('User logged in', metadata);

    // Assert that the log method was called with the message and metadata included
    expect(mockLog).toHaveBeenCalledWith('info', 'User logged in', metadata);
  });
});