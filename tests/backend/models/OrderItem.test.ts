import mongoose from 'mongoose';
import { OrderItem } from '../../src/backend/models/OrderItem';
import { Product } from '../../src/backend/models/Product';

describe('OrderItem Model', () => {
  // Connect to the test database before running tests
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST as string);
  });

  // Clear the database after each test
  afterEach(async () => {
    await mongoose.connection.dropDatabase();
  });

  // Disconnect from the database after all tests
  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should create a new order item successfully', async () => {
    // Create a sample product
    const product = await Product.create({
      name: 'Test Product',
      sku: 'TEST123',
      price: 10.99,
      quantity: 100
    });

    // Create a new order item object with valid data
    const orderItemData = {
      product: product._id,
      quantity: 2,
      price: 10.99
    };

    // Save the order item to the database
    const orderItem = await OrderItem.create(orderItemData);

    // Assert that the saved order item has all the correct properties
    expect(orderItem.product).toEqual(product._id);
    expect(orderItem.quantity).toBe(2);
    expect(orderItem.price).toBe(10.99);
    expect(orderItem.sku).toBe('TEST123');
    expect(orderItem.name).toBe('Test Product');
  });

  it('should require product, quantity, and price', async () => {
    // Create a new order item object without product, quantity, and price
    const orderItem = new OrderItem({});

    // Attempt to save the order item to the database
    let error;
    try {
      await orderItem.save();
    } catch (e) {
      error = e;
    }

    // Assert that validation errors occur for product, quantity, and price fields
    expect(error).toBeDefined();
    expect(error.errors.product).toBeDefined();
    expect(error.errors.quantity).toBeDefined();
    expect(error.errors.price).toBeDefined();
  });

  it('should require quantity to be at least 1', async () => {
    // Create a sample product
    const product = await Product.create({
      name: 'Test Product',
      sku: 'TEST123',
      price: 10.99,
      quantity: 100
    });

    // Create a new order item object with quantity less than 1
    const orderItem = new OrderItem({
      product: product._id,
      quantity: 0,
      price: 10.99
    });

    // Attempt to save the order item to the database
    let error;
    try {
      await orderItem.save();
    } catch (e) {
      error = e;
    }

    // Assert that a validation error occurs for the quantity field
    expect(error).toBeDefined();
    expect(error.errors.quantity).toBeDefined();
  });

  it('should require price to be non-negative', async () => {
    // Create a sample product
    const product = await Product.create({
      name: 'Test Product',
      sku: 'TEST123',
      price: 10.99,
      quantity: 100
    });

    // Create a new order item object with a negative price
    const orderItem = new OrderItem({
      product: product._id,
      quantity: 2,
      price: -1
    });

    // Attempt to save the order item to the database
    let error;
    try {
      await orderItem.save();
    } catch (e) {
      error = e;
    }

    // Assert that a validation error occurs for the price field
    expect(error).toBeDefined();
    expect(error.errors.price).toBeDefined();
  });

  it('should calculate subtotal correctly', async () => {
    // Create a sample product
    const product = await Product.create({
      name: 'Test Product',
      sku: 'TEST123',
      price: 10.99,
      quantity: 100
    });

    // Create a new order item object with quantity and price
    const orderItem = await OrderItem.create({
      product: product._id,
      quantity: 3,
      price: 10.99
    });

    // Call the calculateSubtotal method on the order item
    const subtotal = orderItem.calculateSubtotal();

    // Assert that the subtotal is calculated correctly (quantity * price)
    expect(subtotal).toBeCloseTo(32.97, 2);
  });

  it('should populate product reference', async () => {
    // Create a sample product
    const product = await Product.create({
      name: 'Test Product',
      sku: 'TEST123',
      price: 10.99,
      quantity: 100
    });

    // Create a new order item object referencing the product
    const orderItem = await OrderItem.create({
      product: product._id,
      quantity: 2,
      price: 10.99
    });

    // Retrieve the order item with populated product reference
    const populatedOrderItem = await OrderItem.findById(orderItem._id).populate('product');

    // Assert that the product reference is fully populated with correct data
    expect(populatedOrderItem?.product).toBeDefined();
    expect(populatedOrderItem?.product.name).toBe('Test Product');
    expect(populatedOrderItem?.product.sku).toBe('TEST123');
  });

  it('should update sku and name when product changes', async () => {
    // Create a sample product
    const product = await Product.create({
      name: 'Test Product',
      sku: 'TEST123',
      price: 10.99,
      quantity: 100
    });

    // Create a new order item object referencing the product
    const orderItem = await OrderItem.create({
      product: product._id,
      quantity: 2,
      price: 10.99
    });

    // Update the product's sku and name
    product.sku = 'UPDATED123';
    product.name = 'Updated Product';

    // Save the product
    await product.save();

    // Retrieve the order item
    const updatedOrderItem = await OrderItem.findById(orderItem._id);

    // Assert that the order item's sku and name are updated to match the product
    expect(updatedOrderItem?.sku).toBe('UPDATED123');
    expect(updatedOrderItem?.name).toBe('Updated Product');
  });

  it('should handle rounding of price to two decimal places', async () => {
    // Create a sample product
    const product = await Product.create({
      name: 'Test Product',
      sku: 'TEST123',
      price: 10.99,
      quantity: 100
    });

    // Create a new order item object with a price having more than two decimal places
    const orderItem = await OrderItem.create({
      product: product._id,
      quantity: 2,
      price: 10.999999
    });

    // Retrieve the saved order item
    const savedOrderItem = await OrderItem.findById(orderItem._id);

    // Assert that the price is rounded to two decimal places
    expect(savedOrderItem?.price).toBe(11.00);
  });
});