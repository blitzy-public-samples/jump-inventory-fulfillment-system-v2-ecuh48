import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthConfig } from '../config/auth';

// Middleware to authenticate user requests
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Extract JWT token from request header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // If no token, return 401 Unauthorized
    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Verify token using jwt.verify and AuthConfig.JWT_SECRET
    const decoded = jwt.verify(token, AuthConfig.JWT_SECRET) as { userId: string };

    // Find user by ID from token payload
    const user = await User.findById(decoded.userId);

    // If user not found, return 401 Unauthorized
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Attach user object to request
    req.user = user;

    // Call next() to proceed to the next middleware or route handler
    next();
  } catch (error) {
    // If token is invalid, return 401 Unauthorized
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware to authorize user based on roles
export const authorize = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Check if user's role is included in allowedRoles
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      // If role is not allowed, return 403 Forbidden
      res.status(403).json({ error: 'Access forbidden' });
      return;
    }

    // If role is allowed, call next() to proceed
    next();
  };
};