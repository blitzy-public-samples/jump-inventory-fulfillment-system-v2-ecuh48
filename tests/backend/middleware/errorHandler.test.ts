import express from 'express';
import request from 'supertest';
import { errorHandler, notFoundHandler } from '../../src/backend/middleware/errorHandler';
import logger from '../../src/backend/utils/logger';

// Mock the logger.error method
jest.mock('../../src/backend/utils/logger', () => ({
  error: jest.fn(),
}));

// Helper function to create a mock Express app with error handling middleware
const createMockApp = (): express.Application => {
  const app = express();
  
  // Add a test route that throws an error
  app.get('/error', (req, res, next) => {
    throw new Error('Test error');
  });
  
  // Add notFoundHandler middleware
  app.use(notFoundHandler);
  
  // Add errorHandler middleware
  app.use(errorHandler);
  
  return app;
};

describe('Error Handler Middleware', () => {
  test('should handle errors and return JSON response', async () => {
    const app = createMockApp();
    const response = await request(app).get('/error');
    
    expect(response.status).toBe(500);
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.body).toHaveProperty('error', 'Internal Server Error');
  });

  test('should handle 404 errors', async () => {
    const app = createMockApp();
    const response = await request(app).get('/non-existent-route');
    
    expect(response.status).toBe(404);
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.body).toHaveProperty('error', 'Not Found');
  });

  test('should log errors', async () => {
    const app = createMockApp();
    await request(app).get('/error');
    
    expect(logger.error).toHaveBeenCalledWith(expect.any(Error));
  });

  test('should include stack trace in development environment', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    const app = createMockApp();
    const response = await request(app).get('/error');
    
    expect(response.body).toHaveProperty('stack');
    
    process.env.NODE_ENV = originalEnv;
  });

  test('should not include stack trace in production environment', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    const app = createMockApp();
    const response = await request(app).get('/error');
    
    expect(response.body).not.toHaveProperty('stack');
    
    process.env.NODE_ENV = originalEnv;
  });

  test('should handle errors with custom status codes', async () => {
    const app = express();
    app.get('/custom-error', (req, res, next) => {
      const error: any = new Error('Custom error');
      error.statusCode = 418;
      throw error;
    });
    app.use(errorHandler);
    
    const response = await request(app).get('/custom-error');
    
    expect(response.status).toBe(418);
    expect(response.body).toHaveProperty('error', 'Custom error');
  });

  test('should handle async errors', async () => {
    const app = express();
    app.get('/async-error', async (req, res, next) => {
      throw new Error('Async error');
    });
    app.use(errorHandler);
    
    const response = await request(app).get('/async-error');
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Internal Server Error');
  });
});