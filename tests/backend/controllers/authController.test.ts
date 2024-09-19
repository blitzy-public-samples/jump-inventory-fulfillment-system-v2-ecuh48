import request from 'supertest';
import app from '../../src/backend/app';
import User from '../../src/backend/models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import authConfig from '../../src/backend/config/auth';

// Mock User model methods
jest.mock('../../src/backend/models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

describe('Auth Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      // Mock User.findOne to return null (user doesn't exist)
      (User.findOne as jest.Mock).mockResolvedValue(null);

      // Mock User.create to return a new user object
      const newUser = { _id: 'user_id', username: 'testuser', email: 'test@example.com' };
      (User.create as jest.Mock).mockResolvedValue(newUser);

      // Send POST request to /api/auth/register with valid user data
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', email: 'test@example.com', password: 'password123' });

      // Assert that the response status is 201
      expect(response.status).toBe(201);

      // Assert that the response body contains user data without password
      expect(response.body).toEqual(expect.objectContaining({
        user: expect.objectContaining({
          _id: 'user_id',
          username: 'testuser',
          email: 'test@example.com',
        }),
      }));
      expect(response.body.user.password).toBeUndefined();

      // Assert that User.create was called with correct data
      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
        username: 'testuser',
        email: 'test@example.com',
        password: expect.any(String),
      }));
    });

    it('should return 400 if username already exists', async () => {
      // Mock User.findOne to return an existing user
      (User.findOne as jest.Mock).mockResolvedValue({ username: 'testuser' });

      // Send POST request to /api/auth/register with existing username
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', email: 'test@example.com', password: 'password123' });

      // Assert that the response status is 400
      expect(response.status).toBe(400);

      // Assert that the response body contains an error message
      expect(response.body).toEqual(expect.objectContaining({
        error: expect.stringContaining('Username already exists'),
      }));
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user and return JWT token', async () => {
      // Create a test user with hashed password
      const testUser = { _id: 'user_id', username: 'testuser', password: 'hashedpassword' };

      // Mock User.findOne to return the test user
      (User.findOne as jest.Mock).mockResolvedValue(testUser);

      // Mock bcrypt.compare to return true
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Mock jwt.sign to return a token
      (jwt.sign as jest.Mock).mockReturnValue('mocked_token');

      // Send POST request to /api/auth/login with valid credentials
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'password123' });

      // Assert that the response status is 200
      expect(response.status).toBe(200);

      // Assert that the response body contains a token
      expect(response.body).toEqual(expect.objectContaining({
        token: 'mocked_token',
      }));

      // Verify that the token is valid and contains correct user data
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user_id' }),
        authConfig.jwtSecret,
        expect.objectContaining({ expiresIn: authConfig.jwtExpiresIn })
      );
    });

    it('should return 401 for invalid credentials', async () => {
      // Mock User.findOne to return null (user doesn't exist)
      (User.findOne as jest.Mock).mockResolvedValue(null);

      // Send POST request to /api/auth/login with invalid credentials
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'nonexistent', password: 'wrongpassword' });

      // Assert that the response status is 401
      expect(response.status).toBe(401);

      // Assert that the response body contains an error message
      expect(response.body).toEqual(expect.objectContaining({
        error: expect.stringContaining('Invalid credentials'),
      }));
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    it('should refresh the JWT token', async () => {
      // Create a test user
      const testUser = { _id: 'user_id', username: 'testuser' };

      // Generate a valid refresh token for the test user
      const refreshToken = 'valid_refresh_token';

      // Mock User.findById to return the test user
      (User.findById as jest.Mock).mockResolvedValue(testUser);

      // Mock jwt.verify to return decoded token
      (jwt.verify as jest.Mock).mockReturnValue({ userId: 'user_id' });

      // Mock jwt.sign to return a new access token
      (jwt.sign as jest.Mock).mockReturnValue('new_access_token');

      // Send POST request to /api/auth/refresh-token with valid refresh token
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken });

      // Assert that the response status is 200
      expect(response.status).toBe(200);

      // Assert that the response body contains a new access token
      expect(response.body).toEqual(expect.objectContaining({
        accessToken: 'new_access_token',
      }));

      // Verify that the new access token is valid and contains correct user data
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user_id' }),
        authConfig.jwtSecret,
        expect.objectContaining({ expiresIn: authConfig.jwtExpiresIn })
      );
    });

    it('should return 401 for invalid refresh token', async () => {
      // Mock jwt.verify to throw an error
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Send POST request to /api/auth/refresh-token with invalid refresh token
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: 'invalid_token' });

      // Assert that the response status is 401
      expect(response.status).toBe(401);

      // Assert that the response body contains an error message
      expect(response.body).toEqual(expect.objectContaining({
        error: expect.stringContaining('Invalid refresh token'),
      }));
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should blacklist the refresh token', async () => {
      // Create a test user
      const testUser = { _id: 'user_id', username: 'testuser' };

      // Generate a valid refresh token for the test user
      const refreshToken = 'valid_refresh_token';

      // Mock jwt.verify to return decoded token
      (jwt.verify as jest.Mock).mockReturnValue({ userId: 'user_id' });

      // Send POST request to /api/auth/logout with valid refresh token
      const response = await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken });

      // Assert that the response status is 200
      expect(response.status).toBe(200);

      // Assert that the refresh token is added to the blacklist
      // Note: This assertion depends on how you implement token blacklisting in your application
      // You may need to adjust this based on your actual implementation
      expect(response.body).toEqual(expect.objectContaining({
        message: expect.stringContaining('Logged out successfully'),
      }));
    });
  });
});