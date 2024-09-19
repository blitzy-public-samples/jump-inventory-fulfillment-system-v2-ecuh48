import mongoose from 'mongoose';
import { logger } from './logger';
import { DatabaseConfig } from '../config/database';

/**
 * Function to establish a connection to the MongoDB database
 */
export async function connectToDatabase(): Promise<void> {
  // Log attempt to connect to the database
  logger.info('Attempting to connect to the database...');

  try {
    // Use mongoose.connect with the MongoDB URI from DatabaseConfig
    await mongoose.connect(DatabaseConfig.mongoURI, {
      // Set mongoose connection options
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });

    // Add event listener for successful connection
    mongoose.connection.on('connected', () => {
      logger.info('Successfully connected to the database');
    });

    // Add event listener for connection errors
    mongoose.connection.on('error', (err) => {
      logger.error(`Database connection error: ${err}`);
    });

    // Add event listener for disconnection
    mongoose.connection.on('disconnected', () => {
      logger.warn('Database connection disconnected');
    });

  } catch (error) {
    logger.error(`Failed to connect to the database: ${error}`);
    throw error;
  }
}

/**
 * Function to close the database connection
 */
export async function disconnectFromDatabase(): Promise<void> {
  // Log attempt to disconnect from the database
  logger.info('Attempting to disconnect from the database...');

  try {
    // Use mongoose.disconnect to close the connection
    await mongoose.disconnect();
    
    // Log successful disconnection
    logger.info('Successfully disconnected from the database');
  } catch (error) {
    logger.error(`Failed to disconnect from the database: ${error}`);
    throw error;
  }
}