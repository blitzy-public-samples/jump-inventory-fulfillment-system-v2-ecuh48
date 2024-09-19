import mongoose from 'mongoose';
import { Product } from '../../src/backend/models/Product';

describe('Product Model', () => {
  // Connect to the test database before running tests
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/test_db');
  });

  // Clear the database after each test
  afterEach(async () => {
    await mongoose.connection.dropDatabase();
  });

  // Disconnect from the database after all tests
  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should create a new product successfully', async () => {
    // Create a new product object with valid data
    const productData = {
      name: 'Test Product',
      sku: 'TEST123',
      price: 19.99,
      quantity: 100,
    };

    // Save the product to the database
    const product = new Product(productData);
    const savedProduct = await product.save();

    // Assert that the saved product has all the correct properties
    expect(savedProduct._id).toBeDefined();
    expect(savedProduct.name).toBe(productData.name);
    expect(savedProduct.sku).toBe(productData.sku);
    expect(savedProduct.price).toBe(productData.price);
    expect(savedProduct.quantity).toBe(productData.quantity);
  });

  it('should require name, sku, and price', async () => {
    // Create a new product object without name, sku, and price
    const product = new Product({});

    // Attempt to save the product to the database
    let error;
    try {
      await product.save();
    } catch (e) {
      error = e;
    }

    // Assert that validation errors occur for name, sku, and price fields
    expect(error).toBeDefined();
    expect(error.errors.name).toBeDefined();
    expect(error.errors.sku).toBeDefined();
    expect(error.errors.price).toBeDefined();
  });

  it('should require a unique sku', async () => {
    // Create and save a product with a specific sku
    const product1 = new Product({
      name: 'Product 1',
      sku: 'UNIQUE123',
      price: 9.99,
    });
    await product1.save();

    // Attempt to create and save another product with the same sku
    const product2 = new Product({
      name: 'Product 2',
      sku: 'UNIQUE123',
      price: 14.99,
    });

    // Assert that a duplicate key error occurs
    await expect(product2.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should require price to be non-negative', async () => {
    // Create a new product object with a negative price
    const product = new Product({
      name: 'Negative Price Product',
      sku: 'NEG123',
      price: -10,
    });

    // Attempt to save the product to the database
    let error;
    try {
      await product.save();
    } catch (e) {
      error = e;
    }

    // Assert that a validation error occurs for the price field
    expect(error).toBeDefined();
    expect(error.errors.price).toBeDefined();
  });

  it('should handle optional fields correctly', async () => {
    // Create a new product object with only required fields
    const product = new Product({
      name: 'Basic Product',
      sku: 'BASIC123',
      price: 5.99,
    });

    // Save the product to the database
    const savedProduct = await product.save();

    // Assert that optional fields are undefined or have default values
    expect(savedProduct.quantity).toBe(0);
    expect(savedProduct.description).toBeUndefined();
    expect(savedProduct.tags).toEqual([]);
  });

  it('should calculate volume correctly', async () => {
    // Create a new product object with dimensions (length, width, height)
    const product = new Product({
      name: 'Box Product',
      sku: 'BOX123',
      price: 29.99,
      length: 10,
      width: 5,
      height: 2,
    });

    // Save the product to the database
    const savedProduct = await product.save();

    // Call the getVolume method on the product
    const volume = savedProduct.getVolume();

    // Assert that the volume is calculated correctly (length * width * height)
    expect(volume).toBe(100);
  });

  it('should handle shopifyProductId correctly', async () => {
    // Create a new product object with a shopifyProductId
    const product1 = new Product({
      name: 'Shopify Product',
      sku: 'SHOP123',
      price: 39.99,
      shopifyProductId: '12345678',
    });

    // Save the product to the database
    const savedProduct = await product1.save();

    // Assert that the shopifyProductId is saved correctly
    expect(savedProduct.shopifyProductId).toBe('12345678');

    // Attempt to create another product with the same shopifyProductId
    const product2 = new Product({
      name: 'Another Shopify Product',
      sku: 'SHOP456',
      price: 49.99,
      shopifyProductId: '12345678',
    });

    // Assert that a duplicate key error occurs
    await expect(product2.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should update timestamps on save', async () => {
    // Create and save a product
    const product = new Product({
      name: 'Timestamp Product',
      sku: 'TIME123',
      price: 15.99,
    });
    const savedProduct = await product.save();

    const originalUpdatedAt = savedProduct.updatedAt;

    // Wait for a short time to ensure the timestamp will be different
    await new Promise(resolve => setTimeout(resolve, 100));

    // Update a field in the product
    savedProduct.name = 'Updated Timestamp Product';

    // Save the product again
    const updatedProduct = await savedProduct.save();

    // Assert that the updatedAt timestamp has been updated
    expect(updatedProduct.updatedAt).not.toEqual(originalUpdatedAt);
  });

  it('should handle array fields (tags) correctly', async () => {
    // Create a new product object with an array of tags
    const product = new Product({
      name: 'Tagged Product',
      sku: 'TAG123',
      price: 24.99,
      tags: ['electronics', 'gadget'],
    });

    // Save the product to the database
    let savedProduct = await product.save();

    // Assert that the tags are saved correctly as an array
    expect(savedProduct.tags).toEqual(['electronics', 'gadget']);

    // Add a new tag to the product
    savedProduct.tags.push('bestseller');

    // Save the product again
    savedProduct = await savedProduct.save();

    // Assert that the new tag is added to the array
    expect(savedProduct.tags).toEqual(['electronics', 'gadget', 'bestseller']);
  });

  it('should validate dimension fields as non-negative', async () => {
    // Create a new product object with negative values for length, width, height, or weight
    const product = new Product({
      name: 'Invalid Dimensions Product',
      sku: 'DIM123',
      price: 19.99,
      length: -5,
      width: 10,
      height: -2,
      weight: -1,
    });

    // Attempt to save the product to the database
    let error;
    try {
      await product.save();
    } catch (e) {
      error = e;
    }

    // Assert that validation errors occur for the negative dimension fields
    expect(error).toBeDefined();
    expect(error.errors.length).toBeDefined();
    expect(error.errors.height).toBeDefined();
    expect(error.errors.weight).toBeDefined();
    expect(error.errors.width).toBeUndefined();
  });
});