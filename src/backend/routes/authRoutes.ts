import express from 'express';
import * as authController from '../controllers/authController';
import { validateLogin, validateRegister } from '../middleware/validation';
import rateLimiter from '../middleware/rateLimiter';

// Create an Express router instance
const router = express.Router();

// Route for user login
// Apply rate limiting and login validation middleware
router.post('/login', rateLimiter, validateLogin, authController.login);

// Route for user registration
// Apply registration validation middleware
router.post('/register', validateRegister, authController.register);

// Route for refreshing authentication token
router.post('/refresh-token', authController.refreshToken);

// Route for user logout
router.post('/logout', authController.logout);

export default router;