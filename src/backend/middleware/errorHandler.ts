import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Middleware to handle errors and send appropriate responses
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  // Log the error using the logger utility
  logger.error(`Error: ${err.message}`, { stack: err.stack });

  // Determine the status code based on the error type
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  // Set a default error message if not provided
  const message = err.message || 'An unexpected error occurred';

  // Prepare the error response
  const errorResponse: { message: string; stack?: string } = { message };

  // If in development environment, include error stack in the response
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  // Send JSON response with error details
  if (!res.headersSent) {
    res.status(statusCode).json(errorResponse);
  } else {
    // If headers are already sent, call next(err) to let Express handle it
    next(err);
  }
};

// Middleware to handle 404 Not Found errors
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  // Create a new Error object with 'Not Found' message
  const error = new Error('Not Found');

  // Set status code to 404
  res.status(404);

  // Call next() with the error to pass it to the error handler
  next(error);
};