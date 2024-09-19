import mongoose from 'mongoose';
import { InventoryItem } from '../../src/backend/models/InventoryItem';
import { Product } from '../../src/backend/models/Product';

describe('InventoryItem Model', () => {
  // Connect to the test database before running tests
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost/test_inventory_db');
  });

  // Clear the database and close the connection after tests
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  // Clear the collections before each test
  beforeEach(async () => {
    await InventoryItem.deleteMany({});
    await Product.deleteMany({});
  });

  it('should create a new inventory item successfully', async () => {
    // Create a sample product
    const product = await Product.create({
      name: 'Test Product',
      sku: 'TEST123',
      description: 'A test product',
      price: 9.99,
    });

    // Create a new inventory item object with valid data
    const inventoryItemData = {
      product: product._id,
      quantity: 100,
      location: 'Warehouse A',
      reorderPoint: 20,
    };

    // Save the inventory item to the database
    const inventoryItem = await InventoryItem.create(inventoryItemData);

    // Assert that the saved inventory item has all the correct properties
    expect(inventoryItem.product).toEqual(product._id);
    expect(inventoryItem.quantity).toBe(100);
    expect(inventoryItem.location).toBe('Warehouse A');
    expect(inventoryItem.reorderPoint).toBe(20);
    expect(inventoryItem.lastRestockedAt).toBeDefined();
  });

  it('should require product, quantity, and location', async () => {
    // Create a new inventory item object without product, quantity, and location
    const invalidItem = new InventoryItem({});

    // Attempt to save the inventory item to the database
    let error;
    try {
      await invalidItem.save();
    } catch (e) {
      error = e;
    }

    // Assert that validation errors occur for product, quantity, and location fields
    expect(error).toBeDefined();
    expect(error.errors.product).toBeDefined();
    expect(error.errors.quantity).toBeDefined();
    expect(error.errors.location).toBeDefined();
  });

  it('should require quantity to be non-negative', async () => {
    // Create a sample product
    const product = await Product.create({
      name: 'Test Product',
      sku: 'TEST123',
      description: 'A test product',
      price: 9.99,
    });

    // Create a new inventory item object with a negative quantity
    const invalidItem = new InventoryItem({
      product: product._id,
      quantity: -10,
      location: 'Warehouse A',
    });

    // Attempt to save the inventory item to the database
    let error;
    try {
      await invalidItem.save();
    } catch (e) {
      error = e;
    }

    // Assert that a validation error occurs for the quantity field
    expect(error).toBeDefined();
    expect(error.errors.quantity).toBeDefined();
  });

  it('should set default reorderPoint to 0', async () => {
    // Create a sample product
    const product = await Product.create({
      name: 'Test Product',
      sku: 'TEST123',
      description: 'A test product',
      price: 9.99,
    });

    // Create a new inventory item object without specifying reorderPoint
    const inventoryItem = await InventoryItem.create({
      product: product._id,
      quantity: 100,
      location: 'Warehouse A',
    });

    // Assert that the saved inventory item has reorderPoint set to 0
    expect(inventoryItem.reorderPoint).toBe(0);
  });

  it('should populate product reference', async () => {
    // Create a sample product
    const product = await Product.create({
      name: 'Test Product',
      sku: 'TEST123',
      description: 'A test product',
      price: 9.99,
    });

    // Create a new inventory item object referencing the product
    const inventoryItem = await InventoryItem.create({
      product: product._id,
      quantity: 100,
      location: 'Warehouse A',
    });

    // Retrieve the inventory item with populated product reference
    const populatedItem = await InventoryItem.findById(inventoryItem._id).populate('product');

    // Assert that the product reference is fully populated with correct data
    expect(populatedItem?.product).toBeDefined();
    expect(populatedItem?.product.name).toBe('Test Product');
    expect(populatedItem?.product.sku).toBe('TEST123');
  });

  it('should update lastRestockedAt when adjusting quantity', async () => {
    // Create a sample product
    const product = await Product.create({
      name: 'Test Product',
      sku: 'TEST123',
      description: 'A test product',
      price: 9.99,
    });

    // Create a new inventory item object
    const inventoryItem = await InventoryItem.create({
      product: product._id,
      quantity: 100,
      location: 'Warehouse A',
    });

    const originalRestockedAt = inventoryItem.lastRestockedAt;

    // Wait for a short time to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 100));

    // Call the adjustQuantity method to increase the quantity
    await inventoryItem.adjustQuantity(50);

    // Assert that the lastRestockedAt field is updated to a recent timestamp
    expect(inventoryItem.lastRestockedAt).toBeDefined();
    expect(inventoryItem.lastRestockedAt?.getTime()).toBeGreaterThan(originalRestockedAt!.getTime());
  });

  it('should correctly determine if item is low in stock', async () => {
    // Create a sample product
    const product = await Product.create({
      name: 'Test Product',
      sku: 'TEST123',
      description: 'A test product',
      price: 9.99,
    });

    // Create a new inventory item object with quantity below reorderPoint
    const inventoryItem = await InventoryItem.create({
      product: product._id,
      quantity: 5,
      location: 'Warehouse A',
      reorderPoint: 10,
    });

    // Call the isLowStock method
    expect(inventoryItem.isLowStock()).toBe(true);

    // Adjust the quantity to be above reorderPoint
    await inventoryItem.adjustQuantity(10);

    // Assert that isLowStock now returns false
    expect(inventoryItem.isLowStock()).toBe(false);
  });

  it('should handle multiple inventory items for the same product', async () => {
    // Create a sample product
    const product = await Product.create({
      name: 'Test Product',
      sku: 'TEST123',
      description: 'A test product',
      price: 9.99,
    });

    // Create multiple inventory items for the same product with different locations
    await InventoryItem.create({
      product: product._id,
      quantity: 100,
      location: 'Warehouse A',
    });

    await InventoryItem.create({
      product: product._id,
      quantity: 50,
      location: 'Warehouse B',
    });

    // Retrieve all inventory items for the product
    const inventoryItems = await InventoryItem.find({ product: product._id });

    // Assert that all items are correctly associated with the product
    expect(inventoryItems.length).toBe(2);
    expect(inventoryItems[0].product).toEqual(product._id);
    expect(inventoryItems[1].product).toEqual(product._id);
    expect(inventoryItems[0].location).not.toBe(inventoryItems[1].location);
  });

  it('should update timestamps on save', async () => {
    // Create and save an inventory item
    const product = await Product.create({
      name: 'Test Product',
      sku: 'TEST123',
      description: 'A test product',
      price: 9.99,
    });

    const inventoryItem = await InventoryItem.create({
      product: product._id,
      quantity: 100,
      location: 'Warehouse A',
    });

    const originalUpdatedAt = inventoryItem.updatedAt;

    // Wait for a short time to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 100));

    // Update a field in the inventory item
    inventoryItem.quantity = 150;
    await inventoryItem.save();

    // Assert that the updatedAt timestamp has been updated
    expect(inventoryItem.updatedAt?.getTime()).toBeGreaterThan(originalUpdatedAt!.getTime());
  });

  it('should handle quantity adjustments correctly', async () => {
    // Create a sample product
    const product = await Product.create({
      name: 'Test Product',
      sku: 'TEST123',
      description: 'A test product',
      price: 9.99,
    });

    // Create a new inventory item object with initial quantity
    const inventoryItem = await InventoryItem.create({
      product: product._id,
      quantity: 100,
      location: 'Warehouse A',
    });

    // Call adjustQuantity method with positive and negative values
    await inventoryItem.adjustQuantity(50);
    expect(inventoryItem.quantity).toBe(150);

    await inventoryItem.adjustQuantity(-30);
    expect(inventoryItem.quantity).toBe(120);

    // Assert that adjustQuantity throws an error if resulting quantity would be negative
    await expect(inventoryItem.adjustQuantity(-150)).rejects.toThrow('Quantity cannot be negative');
  });
});