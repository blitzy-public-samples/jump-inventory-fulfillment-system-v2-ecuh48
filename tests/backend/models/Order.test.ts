import mongoose from 'mongoose';
import { Order } from '../../src/backend/models/Order';
import { OrderStatus } from '../../src/backend/types/OrderStatus';

// Establish a connection to the test database before running tests
beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/test_db');
});

// Close the database connection after all tests are done
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Order Model', () => {
  // Clear the database before each test
  beforeEach(async () => {
    await mongoose.connection.dropDatabase();
  });

  it('should create a new order successfully', async () => {
    // Create a new order object with valid data
    const orderData = {
      shopifyOrderId: 'SHOP123',
      customer: {
        name: 'John Doe',
        email: 'john@example.com',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345',
          country: 'USA'
        }
      },
      orderItems: [
        {
          product: new mongoose.Types.ObjectId(),
          quantity: 2,
          price: 19.99
        }
      ]
    };

    // Save the order to the database
    const order = new Order(orderData);
    await order.save();

    // Assert that the saved order has all the correct properties
    expect(order.shopifyOrderId).toBe(orderData.shopifyOrderId);
    expect(order.customer.name).toBe(orderData.customer.name);
    expect(order.customer.email).toBe(orderData.customer.email);
    expect(order.orderItems.length).toBe(1);
    expect(order.orderItems[0].quantity).toBe(2);
    expect(order.orderItems[0].price).toBe(19.99);

    // Assert that the orderNumber is generated automatically
    expect(order.orderNumber).toBeDefined();
    expect(typeof order.orderNumber).toBe('string');
  });

  it('should require shopifyOrderId and customer information', async () => {
    // Create a new order object without shopifyOrderId and customer information
    const orderData = {
      orderItems: [
        {
          product: new mongoose.Types.ObjectId(),
          quantity: 1,
          price: 9.99
        }
      ]
    };

    // Attempt to save the order to the database
    const order = new Order(orderData);
    let error;
    try {
      await order.save();
    } catch (e) {
      error = e;
    }

    // Assert that validation errors occur for shopifyOrderId and customer fields
    expect(error).toBeDefined();
    expect(error.errors.shopifyOrderId).toBeDefined();
    expect(error.errors['customer.name']).toBeDefined();
    expect(error.errors['customer.email']).toBeDefined();
  });

  it('should set default status to PENDING', async () => {
    // Create a new order object without specifying a status
    const orderData = {
      shopifyOrderId: 'SHOP456',
      customer: {
        name: 'Jane Doe',
        email: 'jane@example.com',
        address: {
          street: '456 Elm St',
          city: 'Othertown',
          state: 'NY',
          zipCode: '67890',
          country: 'USA'
        }
      },
      orderItems: [
        {
          product: new mongoose.Types.ObjectId(),
          quantity: 1,
          price: 29.99
        }
      ]
    };

    // Save the order to the database
    const order = new Order(orderData);
    await order.save();

    // Assert that the saved order has the status PENDING
    expect(order.status).toBe(OrderStatus.PENDING);
  });

  it('should allow setting a custom status', async () => {
    // Create a new order object with a custom status (e.g., PROCESSING)
    const orderData = {
      shopifyOrderId: 'SHOP789',
      customer: {
        name: 'Bob Smith',
        email: 'bob@example.com',
        address: {
          street: '789 Oak St',
          city: 'Somewhere',
          state: 'TX',
          zipCode: '54321',
          country: 'USA'
        }
      },
      orderItems: [
        {
          product: new mongoose.Types.ObjectId(),
          quantity: 3,
          price: 14.99
        }
      ],
      status: OrderStatus.PROCESSING
    };

    // Save the order to the database
    const order = new Order(orderData);
    await order.save();

    // Assert that the saved order has the specified custom status
    expect(order.status).toBe(OrderStatus.PROCESSING);
  });

  it('should calculate total amount correctly', async () => {
    // Create a new order object with multiple order items
    const orderData = {
      shopifyOrderId: 'SHOP101',
      customer: {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        address: {
          street: '101 Pine St',
          city: 'Elsewhere',
          state: 'FL',
          zipCode: '11111',
          country: 'USA'
        }
      },
      orderItems: [
        {
          product: new mongoose.Types.ObjectId(),
          quantity: 2,
          price: 10.00
        },
        {
          product: new mongoose.Types.ObjectId(),
          quantity: 1,
          price: 15.50
        }
      ]
    };

    const order = new Order(orderData);

    // Call the calculateTotalAmount method on the order
    const totalAmount = order.calculateTotalAmount();

    // Assert that the totalAmount is calculated correctly based on item quantities and prices
    expect(totalAmount).toBe(35.50); // (2 * 10.00) + (1 * 15.50) = 35.50
  });

  it('should not save duplicate shopifyOrderIds', async () => {
    // Create and save an order with a specific shopifyOrderId
    const orderData = {
      shopifyOrderId: 'SHOP202',
      customer: {
        name: 'Eve Wilson',
        email: 'eve@example.com',
        address: {
          street: '202 Maple St',
          city: 'Nowhere',
          state: 'CA',
          zipCode: '22222',
          country: 'USA'
        }
      },
      orderItems: [
        {
          product: new mongoose.Types.ObjectId(),
          quantity: 1,
          price: 25.00
        }
      ]
    };

    const order1 = new Order(orderData);
    await order1.save();

    // Attempt to create and save another order with the same shopifyOrderId
    const order2 = new Order(orderData);
    let error;
    try {
      await order2.save();
    } catch (e) {
      error = e;
    }

    // Assert that a duplicate key error occurs
    expect(error).toBeDefined();
    expect(error.code).toBe(11000); // MongoDB duplicate key error code
  });

  it('should update timestamps on save', async () => {
    // Create and save an order
    const orderData = {
      shopifyOrderId: 'SHOP303',
      customer: {
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        address: {
          street: '303 Birch St',
          city: 'Peanutsville',
          state: 'MN',
          zipCode: '33333',
          country: 'USA'
        }
      },
      orderItems: [
        {
          product: new mongoose.Types.ObjectId(),
          quantity: 1,
          price: 30.00
        }
      ]
    };

    const order = new Order(orderData);
    await order.save();

    const originalUpdatedAt = order.updatedAt;

    // Wait for a short time to ensure the timestamp will be different
    await new Promise(resolve => setTimeout(resolve, 100));

    // Update a field in the order
    order.status = OrderStatus.SHIPPED;

    // Save the order again
    await order.save();

    // Assert that the updatedAt timestamp has been updated
    expect(order.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should populate product references in order items', async () => {
    // Create product documents in the database
    const Product = mongoose.model('Product', new mongoose.Schema({ name: String, price: Number }));
    const product1 = await new Product({ name: 'Product 1', price: 10.00 }).save();
    const product2 = await new Product({ name: 'Product 2', price: 20.00 }).save();

    // Create an order with order items referencing these products
    const orderData = {
      shopifyOrderId: 'SHOP404',
      customer: {
        name: 'David Lee',
        email: 'david@example.com',
        address: {
          street: '404 Cedar St',
          city: 'Techville',
          state: 'WA',
          zipCode: '44444',
          country: 'USA'
        }
      },
      orderItems: [
        {
          product: product1._id,
          quantity: 2,
          price: 10.00
        },
        {
          product: product2._id,
          quantity: 1,
          price: 20.00
        }
      ]
    };

    const order = new Order(orderData);
    await order.save();

    // Retrieve the order with populated product references
    const populatedOrder = await Order.findById(order._id).populate('orderItems.product');

    // Assert that the product references in order items are fully populated
    expect(populatedOrder.orderItems[0].product).toHaveProperty('name', 'Product 1');
    expect(populatedOrder.orderItems[1].product).toHaveProperty('name', 'Product 2');
  });

  it('should validate customer address fields', async () => {
    // Create a new order object with missing or invalid customer address fields
    const orderData = {
      shopifyOrderId: 'SHOP505',
      customer: {
        name: 'Frank White',
        email: 'frank@example.com',
        address: {
          street: '505 Elm St',
          // Missing city
          state: 'Invalid', // Invalid state (assuming we have a list of valid states)
          zipCode: '12345', // Valid
          country: 'USA'
        }
      },
      orderItems: [
        {
          product: new mongoose.Types.ObjectId(),
          quantity: 1,
          price: 15.00
        }
      ]
    };

    // Attempt to save the order to the database
    const order = new Order(orderData);
    let error;
    try {
      await order.save();
    } catch (e) {
      error = e;
    }

    // Assert that validation errors occur for the invalid address fields
    expect(error).toBeDefined();
    expect(error.errors['customer.address.city']).toBeDefined();
    expect(error.errors['customer.address.state']).toBeDefined();
  });

  it('should handle adding and removing order items', async () => {
    // Create a new order object
    const orderData = {
      shopifyOrderId: 'SHOP606',
      customer: {
        name: 'Grace Miller',
        email: 'grace@example.com',
        address: {
          street: '606 Pine St',
          city: 'Greentown',
          state: 'OR',
          zipCode: '66666',
          country: 'USA'
        }
      },
      orderItems: [
        {
          product: new mongoose.Types.ObjectId(),
          quantity: 1,
          price: 25.00
        }
      ]
    };

    const order = new Order(orderData);

    // Add multiple order items to the order
    order.orderItems.push({
      product: new mongoose.Types.ObjectId(),
      quantity: 2,
      price: 15.00
    });

    order.orderItems.push({
      product: new mongoose.Types.ObjectId(),
      quantity: 3,
      price: 10.00
    });

    // Save the order to the database
    await order.save();

    expect(order.orderItems.length).toBe(3);

    // Remove an order item
    order.orderItems.splice(1, 1);

    // Save the order again
    await order.save();

    // Assert that the order items array reflects the changes correctly
    expect(order.orderItems.length).toBe(2);
    expect(order.orderItems[0].price).toBe(25.00);
    expect(order.orderItems[1].price).toBe(10.00);
  });
});