import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, authorize } from '../../src/backend/middleware/auth';
import { User } from '../../src/backend/models/User';
import { AuthConfig } from '../../src/backend/config/auth';
import { UserRole } from '../../src/backend/types/UserRole';

// Mock User.findById
jest.mock('../../src/backend/models/User', () => ({
  User: {
    findById: jest.fn(),
  },
}));

// Mock jwt.verify
jest.mock('jsonwebtoken', () => ({
  ...jest.requireActual('jsonwebtoken'),
  verify: jest.fn(),
}));

// Helper function to create a mock Express app with authentication middleware
const createMockApp = (authMiddleware: any = authenticate) => {
  const app = express();
  app.use(authMiddleware);
  app.get('/test', (req: any, res) => {
    res.json({ user: req.user });
  });
  return app;
};

describe('Authentication Middleware', () => {
  test('should allow access with a valid token', async () => {
    const mockUser = { _id: '123', email: 'test@example.com', role: UserRole.USER };
    const token = jwt.sign({ userId: mockUser._id }, AuthConfig.jwtSecret, { expiresIn: '1h' });
    
    (User.findById as jest.Mock).mockResolvedValue(mockUser);
    (jwt.verify as jest.Mock).mockReturnValue({ userId: mockUser._id });

    const app = createMockApp();
    const response = await request(app)
      .get('/test')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.user).toEqual(mockUser);
  });

  test('should deny access without a token', async () => {
    const app = createMockApp();
    const response = await request(app).get('/test');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });

  test('should deny access with an invalid token', async () => {
    const invalidToken = 'invalid.token.here';
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const app = createMockApp();
    const response = await request(app)
      .get('/test')
      .set('Authorization', `Bearer ${invalidToken}`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });

  test('should deny access with an expired token', async () => {
    const mockUser = { _id: '123', email: 'test@example.com', role: UserRole.USER };
    const expiredToken = jwt.sign({ userId: mockUser._id }, AuthConfig.jwtSecret, { expiresIn: '0s' });
    
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('jwt expired');
    });

    const app = createMockApp();
    const response = await request(app)
      .get('/test')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
    expect(response.body.error).toContain('expired');
  });

  test('should attach user object to request on successful authentication', async () => {
    const mockUser = { _id: '123', email: 'test@example.com', role: UserRole.USER };
    const token = jwt.sign({ userId: mockUser._id }, AuthConfig.jwtSecret, { expiresIn: '1h' });
    
    (User.findById as jest.Mock).mockResolvedValue(mockUser);
    (jwt.verify as jest.Mock).mockReturnValue({ userId: mockUser._id });

    const app = createMockApp();
    const response = await request(app)
      .get('/test')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.user).toEqual(mockUser);
  });
});

describe('Authorization Middleware', () => {
  test('should allow access for authorized roles', async () => {
    const mockUser = { _id: '123', email: 'admin@example.com', role: UserRole.ADMIN };
    const token = jwt.sign({ userId: mockUser._id }, AuthConfig.jwtSecret, { expiresIn: '1h' });
    
    (User.findById as jest.Mock).mockResolvedValue(mockUser);
    (jwt.verify as jest.Mock).mockReturnValue({ userId: mockUser._id });

    const app = createMockApp([authenticate, authorize([UserRole.ADMIN])]);
    const response = await request(app)
      .get('/test')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
  });

  test('should deny access for unauthorized roles', async () => {
    const mockUser = { _id: '123', email: 'user@example.com', role: UserRole.USER };
    const token = jwt.sign({ userId: mockUser._id }, AuthConfig.jwtSecret, { expiresIn: '1h' });
    
    (User.findById as jest.Mock).mockResolvedValue(mockUser);
    (jwt.verify as jest.Mock).mockReturnValue({ userId: mockUser._id });

    const app = createMockApp([authenticate, authorize([UserRole.ADMIN])]);
    const response = await request(app)
      .get('/test')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.error).toContain('insufficient permissions');
  });

  test('should allow access for multiple authorized roles', async () => {
    const mockAdmin = { _id: '123', email: 'admin@example.com', role: UserRole.ADMIN };
    const mockManager = { _id: '456', email: 'manager@example.com', role: UserRole.MANAGER };
    
    const adminToken = jwt.sign({ userId: mockAdmin._id }, AuthConfig.jwtSecret, { expiresIn: '1h' });
    const managerToken = jwt.sign({ userId: mockManager._id }, AuthConfig.jwtSecret, { expiresIn: '1h' });

    (User.findById as jest.Mock).mockImplementation((id) => {
      if (id === mockAdmin._id) return Promise.resolve(mockAdmin);
      if (id === mockManager._id) return Promise.resolve(mockManager);
      return Promise.resolve(null);
    });

    (jwt.verify as jest.Mock).mockImplementation((token) => {
      if (token === adminToken) return { userId: mockAdmin._id };
      if (token === managerToken) return { userId: mockManager._id };
      throw new Error('Invalid token');
    });

    const app = createMockApp([authenticate, authorize([UserRole.ADMIN, UserRole.MANAGER])]);
    
    const adminResponse = await request(app)
      .get('/test')
      .set('Authorization', `Bearer ${adminToken}`);

    const managerResponse = await request(app)
      .get('/test')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(adminResponse.status).toBe(200);
    expect(managerResponse.status).toBe(200);
  });
});