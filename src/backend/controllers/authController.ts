import { Request, Response } from 'express';
import { User } from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config/auth';

// Handle user login and generate JWT token
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract username and password from request body
    const { username, password } = req.body;

    // Find user by username in the database
    const user = await User.findOne({ username });

    // If user not found, return 401 Unauthorized
    if (!user) {
      res.status(401).json({ message: 'Invalid username or password' });
      return;
    }

    // Compare provided password with stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // If passwords don't match, return 401 Unauthorized
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid username or password' });
      return;
    }

    // Generate JWT token with user information
    const token = jwt.sign({ id: user._id }, config.jwtSecret, {
      expiresIn: config.jwtExpirationTime,
    });

    // Return token and user information in response
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Handle user registration
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract user information from request body
    const { username, email, password } = req.body;

    // Check if username already exists
    const existingUser = await User.findOne({ username });

    // If username exists, return 400 Bad Request
    if (existingUser) {
      res.status(400).json({ message: 'Username already exists' });
      return;
    }

    // Hash the provided password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with hashed password
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    // Save user to the database
    await newUser.save();

    // Return success message and user information (excluding password)
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Refresh JWT token for authenticated users
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract refresh token from request body
    const { refreshToken } = req.body;

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as { id: string };

    // If token is invalid, return 401 Unauthorized
    if (!decoded) {
      res.status(401).json({ message: 'Invalid refresh token' });
      return;
    }

    // Find user by ID from token payload
    const user = await User.findById(decoded.id);

    // If user not found, return 401 Unauthorized
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    // Generate new access token
    const newAccessToken = jwt.sign({ id: user._id }, config.jwtSecret, {
      expiresIn: config.jwtExpirationTime,
    });

    // Return new access token in response
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};