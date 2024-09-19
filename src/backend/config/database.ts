// Import dotenv for environment variable management
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// MongoDB connection URI
const MONGODB_URI: string = process.env.MONGODB_URI;

// Database name
const DB_NAME: string = process.env.DB_NAME;

// Database user
const DB_USER: string = process.env.DB_USER;

// Database password
const DB_PASSWORD: string = process.env.DB_PASSWORD;

// Database host
const DB_HOST: string = process.env.DB_HOST;

// Database port
const DB_PORT: number = parseInt(process.env.DB_PORT, 10);

// Export database configuration object
export default {
  MONGODB_URI,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT
};