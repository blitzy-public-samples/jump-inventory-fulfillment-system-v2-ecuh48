import mongoose from 'mongoose';
import { connectToDatabase, disconnectFromDatabase } from '../../src/backend/utils/database';
import { DatabaseConfig } from '../../src/backend/config/database';
import { logger } from '../../src/backend/utils/logger';

// Mock mongoose and logger
jest.mock('mongoose');
jest.mock('../../src/backend/utils/logger');

// Mock process.exit
const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);

describe('Database Utility Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('connectToDatabase should establish a connection to MongoDB', async () => {
    // Mock mongoose.connect to resolve successfully
    (mongoose.connect as jest.Mock).mockResolvedValue(undefined);

    await connectToDatabase();

    // Assert that mongoose.connect was called with the correct MongoDB URI from DatabaseConfig
    expect(mongoose.connect).toHaveBeenCalledWith(DatabaseConfig.MONGODB_URI, expect.any(Object));

    // Assert that a success message was logged
    expect(logger.info).toHaveBeenCalledWith('Connected to MongoDB successfully');
  });

  test('connectToDatabase should handle connection errors', async () => {
    // Mock mongoose.connect to reject with an error
    const mockError = new Error('Connection failed');
    (mongoose.connect as jest.Mock).mockRejectedValue(mockError);

    await connectToDatabase();

    // Assert that the error was caught and logged
    expect(logger.error).toHaveBeenCalledWith('Failed to connect to MongoDB:', mockError);

    // Assert that the process exits with status code 1
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  test('disconnectFromDatabase should close the MongoDB connection', async () => {
    // Mock mongoose.disconnect to resolve successfully
    (mongoose.disconnect as jest.Mock).mockResolvedValue(undefined);

    await disconnectFromDatabase();

    // Assert that mongoose.disconnect was called
    expect(mongoose.disconnect).toHaveBeenCalled();

    // Assert that a success message was logged
    expect(logger.info).toHaveBeenCalledWith('Disconnected from MongoDB');
  });

  test('disconnectFromDatabase should handle disconnection errors', async () => {
    // Mock mongoose.disconnect to reject with an error
    const mockError = new Error('Disconnection failed');
    (mongoose.disconnect as jest.Mock).mockRejectedValue(mockError);

    await disconnectFromDatabase();

    // Assert that the error was caught and logged
    expect(logger.error).toHaveBeenCalledWith('Error disconnecting from MongoDB:', mockError);
  });

  test('connectToDatabase should use the correct connection options', async () => {
    // Mock mongoose.connect
    (mongoose.connect as jest.Mock).mockResolvedValue(undefined);

    await connectToDatabase();

    // Assert that mongoose.connect was called with the correct options
    expect(mongoose.connect).toHaveBeenCalledWith(
      DatabaseConfig.MONGODB_URI,
      expect.objectContaining({
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
    );
  });

  test('connectToDatabase should handle connection events', async () => {
    // Mock mongoose.connection events
    const mockOn = jest.fn();
    (mongoose.connection as any).on = mockOn;

    await connectToDatabase();

    // Assert that event listeners were set up
    expect(mockOn).toHaveBeenCalledWith('connected', expect.any(Function));
    expect(mockOn).toHaveBeenCalledWith('error', expect.any(Function));
    expect(mockOn).toHaveBeenCalledWith('disconnected', expect.any(Function));

    // Simulate events and check logging
    const connectedCallback = mockOn.mock.calls.find(call => call[0] === 'connected')[1];
    connectedCallback();
    expect(logger.info).toHaveBeenCalledWith('Mongoose connected to DB');

    const errorCallback = mockOn.mock.calls.find(call => call[0] === 'error')[1];
    const mockConnectionError = new Error('Connection error');
    errorCallback(mockConnectionError);
    expect(logger.error).toHaveBeenCalledWith('MongoDB connection error:', mockConnectionError);

    const disconnectedCallback = mockOn.mock.calls.find(call => call[0] === 'disconnected')[1];
    disconnectedCallback();
    expect(logger.info).toHaveBeenCalledWith('Mongoose disconnected');
  });

  test('connectToDatabase should retry connection on failure', async () => {
    // Mock mongoose.connect to fail twice and succeed on third attempt
    (mongoose.connect as jest.Mock)
      .mockRejectedValueOnce(new Error('First failure'))
      .mockRejectedValueOnce(new Error('Second failure'))
      .mockResolvedValueOnce(undefined);

    await connectToDatabase();

    // Assert that mongoose.connect was called three times
    expect(mongoose.connect).toHaveBeenCalledTimes(3);

    // Assert that success message was logged after successful connection
    expect(logger.info).toHaveBeenCalledWith('Connected to MongoDB successfully');
  });
});