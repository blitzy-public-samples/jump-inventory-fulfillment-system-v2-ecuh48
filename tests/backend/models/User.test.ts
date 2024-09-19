import mongoose from 'mongoose';
import { User } from '../../src/backend/models/User';
import { UserRole } from '../../src/backend/types/UserRole';

describe('User Model', () => {
  // Connect to the test database before running tests
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/test_db');
  });

  // Clear the database after each test
  afterEach(async () => {
    await User.deleteMany({});
  });

  // Disconnect from the database after all tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should create a new user successfully', async () => {
    // Create a new user object with valid data
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    };

    // Save the user to the database
    const user = new User(userData);
    await user.save();

    // Assert that the saved user has all the correct properties
    expect(user.username).toBe(userData.username);
    expect(user.email).toBe(userData.email);
    expect(user.firstName).toBe(userData.firstName);
    expect(user.lastName).toBe(userData.lastName);

    // Assert that the password is hashed
    expect(user.password).not.toBe(userData.password);
    expect(user.password).toHaveLength(60); // bcrypt hash length
  });

  it('should require username, email, and password', async () => {
    // Create a new user object without username, email, and password
    const user = new User({});

    // Attempt to save the user to the database
    let error;
    try {
      await user.save();
    } catch (e) {
      error = e;
    }

    // Assert that validation errors occur for username, email, and password
    expect(error).toBeDefined();
    expect(error.errors.username).toBeDefined();
    expect(error.errors.email).toBeDefined();
    expect(error.errors.password).toBeDefined();
  });

  it('should require a valid email', async () => {
    // Create a new user object with an invalid email
    const user = new User({
      username: 'testuser',
      email: 'invalid-email',
      password: 'password123',
    });

    // Attempt to save the user to the database
    let error;
    try {
      await user.save();
    } catch (e) {
      error = e;
    }

    // Assert that a validation error occurs for the email field
    expect(error).toBeDefined();
    expect(error.errors.email).toBeDefined();
  });

  it('should set default role to WAREHOUSE_STAFF', async () => {
    // Create a new user object without specifying a role
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });

    // Save the user to the database
    await user.save();

    // Assert that the saved user has the role WAREHOUSE_STAFF
    expect(user.role).toBe(UserRole.WAREHOUSE_STAFF);
  });

  it('should allow setting a custom role', async () => {
    // Create a new user object with a custom role (e.g., ADMIN)
    const user = new User({
      username: 'adminuser',
      email: 'admin@example.com',
      password: 'password123',
      role: UserRole.ADMIN,
    });

    // Save the user to the database
    await user.save();

    // Assert that the saved user has the specified custom role
    expect(user.role).toBe(UserRole.ADMIN);
  });

  it('should hash the password before saving', async () => {
    // Create a new user object with a plain text password
    const plainTextPassword = 'password123';
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: plainTextPassword,
    });

    // Save the user to the database
    await user.save();

    // Assert that the saved user's password is not the plain text password
    expect(user.password).not.toBe(plainTextPassword);

    // Assert that the saved user's password is a valid bcrypt hash
    expect(user.password).toHaveLength(60);
    expect(user.password).toMatch(/^\$2[aby]\$\d{2}\$.{53}$/);
  });

  it("should have a virtual 'fullName' property", async () => {
    // Create a new user object with firstName and lastName
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    });

    // Save the user to the database
    await user.save();

    // Assert that the saved user has a 'fullName' property
    expect(user.fullName).toBeDefined();

    // Assert that the 'fullName' is a concatenation of firstName and lastName
    expect(user.fullName).toBe('John Doe');
  });

  it('should not save duplicate usernames', async () => {
    // Create and save a user with a specific username
    const user1 = new User({
      username: 'testuser',
      email: 'test1@example.com',
      password: 'password123',
    });
    await user1.save();

    // Attempt to create and save another user with the same username
    const user2 = new User({
      username: 'testuser',
      email: 'test2@example.com',
      password: 'password456',
    });

    // Assert that a duplicate key error occurs
    await expect(user2.save()).rejects.toThrow(mongoose.Error.MongoError);
  });

  it('should not save duplicate emails', async () => {
    // Create and save a user with a specific email
    const user1 = new User({
      username: 'testuser1',
      email: 'test@example.com',
      password: 'password123',
    });
    await user1.save();

    // Attempt to create and save another user with the same email
    const user2 = new User({
      username: 'testuser2',
      email: 'test@example.com',
      password: 'password456',
    });

    // Assert that a duplicate key error occurs
    await expect(user2.save()).rejects.toThrow(mongoose.Error.MongoError);
  });

  it('should update lastLogin when calling updateLastLogin method', async () => {
    // Create and save a user
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });
    await user.save();

    // Store the initial lastLogin value
    const initialLastLogin = user.lastLogin;

    // Wait for a short time to ensure the timestamp changes
    await new Promise(resolve => setTimeout(resolve, 10));

    // Call the updateLastLogin method on the user
    await user.updateLastLogin();

    // Assert that the lastLogin field has been updated to a recent timestamp
    expect(user.lastLogin).toBeDefined();
    expect(user.lastLogin).not.toEqual(initialLastLogin);
    expect(user.lastLogin.getTime()).toBeGreaterThan(initialLastLogin.getTime());
  });
});