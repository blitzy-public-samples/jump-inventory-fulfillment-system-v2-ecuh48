// Import dotenv for environment variable management
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Secret key for JWT token generation and verification
const JWT_SECRET: string = process.env.JWT_SECRET;

// JWT token expiration time (default: 1 hour)
const JWT_EXPIRATION: string = process.env.JWT_EXPIRATION || '1h';

// Secret key for refresh token generation and verification
const REFRESH_TOKEN_SECRET: string = process.env.REFRESH_TOKEN_SECRET;

// Refresh token expiration time (default: 7 days)
const REFRESH_TOKEN_EXPIRATION: string = process.env.REFRESH_TOKEN_EXPIRATION || '7d';

// Number of salt rounds for bcrypt password hashing (default: 10)
const BCRYPT_SALT_ROUNDS: number = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;

// Export authentication configuration object
export default {
  JWT_SECRET,
  JWT_EXPIRATION,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRATION,
  BCRYPT_SALT_ROUNDS
};