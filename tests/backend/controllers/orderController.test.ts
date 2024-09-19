import request from 'supertest';
import app from '../../src/backend/app';
import Order from '../../src/backend/models/Order';
import InventoryItem from '../../src/backend/models/InventoryItem';
import ShopifyService from '../../src/backend/services/ShopifyService';
import SendleService from '../../src/backend/services/SendleService';
import { OrderStatus } from '../../src/backend/types/OrderStatus';

// Mock the required modules
jest.mock('../../src/backend/models/Order');
jest.mock('../../src/backend/models/InventoryItem');
jest.mock('../../src/backend/services/ShopifyService');
jest.mock('../../src/backend/services/SendleService');

describe('Order Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/orders - should return all orders', async () => {
    // Mock Order.find to return sample order data
    const sampleOrders = [{ id: '1', status: OrderStatus.PENDING }];
    (Order.find as jest.Mock).mockResolvedValue(sampleOrders);

    // Send GET request to /api/orders
    const response = await request(app).get('/api/orders');

    // Assert that the response status is 200
    expect(response.status).toBe(200);

    // Assert that the response body contains the sample order data
    expect(response.body).toEqual(sampleOrders);
  });

  test('GET /api/orders/:id - should return a specific order', async () => {
    // Create a sample order ID
    const sampleOrderId = '123';

    // Mock Order.findById to return a sample order
    const sampleOrder = { id: sampleOrderId, status: OrderStatus.PROCESSING };
    (Order.findById as jest.Mock).mockResolvedValue(sampleOrder);

    // Send GET request to /api/orders/:id with the sample ID
    const response = await request(app).get(`/api/orders/${sampleOrderId}`);

    // Assert that the response status is 200
    expect(response.status).toBe(200);

    // Assert that the response body contains the sample order data
    expect(response.body).toEqual(sampleOrder);
  });

  test('GET /api/orders/:id - should return 404 if order not found', async () => {
    // Create a non-existent order ID
    const nonExistentOrderId = '999';

    // Mock Order.findById to return null
    (Order.findById as jest.Mock).mockResolvedValue(null);

    // Send GET request to /api/orders/:id with the non-existent ID
    const response = await request(app).get(`/api/orders/${nonExistentOrderId}`);

    // Assert that the response status is 404
    expect(response.status).toBe(404);
  });

  test('POST /api/orders - should create a new order', async () => {
    // Create sample order data
    const sampleOrderData = { items: [{ productId: '1', quantity: 2 }] };

    // Mock Order.create to return the sample order
    const createdOrder = { ...sampleOrderData, id: '123', status: OrderStatus.PENDING };
    (Order.create as jest.Mock).mockResolvedValue(createdOrder);

    // Mock ShopifyService.syncOrder to resolve successfully
    (ShopifyService.syncOrder as jest.Mock).mockResolvedValue(undefined);

    // Send POST request to /api/orders with the sample order data
    const response = await request(app).post('/api/orders').send(sampleOrderData);

    // Assert that the response status is 201
    expect(response.status).toBe(201);

    // Assert that the response body contains the created order data
    expect(response.body).toEqual(createdOrder);

    // Assert that ShopifyService.syncOrder was called with the created order
    expect(ShopifyService.syncOrder).toHaveBeenCalledWith(createdOrder);
  });

  test('PATCH /api/orders/:id - should update order status', async () => {
    // Create a sample order ID
    const sampleOrderId = '123';

    // Create a new order status
    const newStatus = OrderStatus.PROCESSING;

    // Mock Order.findByIdAndUpdate to return the updated order
    const updatedOrder = { id: sampleOrderId, status: newStatus };
    (Order.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedOrder);

    // Mock ShopifyService.syncOrder to resolve successfully
    (ShopifyService.syncOrder as jest.Mock).mockResolvedValue(undefined);

    // Send PATCH request to /api/orders/:id with the new status
    const response = await request(app).patch(`/api/orders/${sampleOrderId}`).send({ status: newStatus });

    // Assert that the response status is 200
    expect(response.status).toBe(200);

    // Assert that the response body contains the updated order data
    expect(response.body).toEqual(updatedOrder);

    // Assert that ShopifyService.syncOrder was called with the updated order
    expect(ShopifyService.syncOrder).toHaveBeenCalledWith(updatedOrder);
  });

  test('POST /api/orders/:id/fulfill - should fulfill an order', async () => {
    // Create a sample order ID
    const sampleOrderId = '123';

    // Mock Order.findById to return a sample order
    const sampleOrder = { id: sampleOrderId, items: [{ productId: '1', quantity: 2 }], status: OrderStatus.PROCESSING };
    (Order.findById as jest.Mock).mockResolvedValue(sampleOrder);

    // Mock InventoryItem.findOneAndUpdate to simulate inventory update
    (InventoryItem.findOneAndUpdate as jest.Mock).mockResolvedValue({ id: '1', quantity: 8 });

    // Mock SendleService.generateShippingLabel to return a sample shipping label
    const sampleShippingLabel = 'SAMPLE_SHIPPING_LABEL';
    (SendleService.generateShippingLabel as jest.Mock).mockResolvedValue(sampleShippingLabel);

    // Mock Order.findByIdAndUpdate to return the fulfilled order
    const fulfilledOrder = { ...sampleOrder, status: OrderStatus.FULFILLED, shippingLabel: sampleShippingLabel };
    (Order.findByIdAndUpdate as jest.Mock).mockResolvedValue(fulfilledOrder);

    // Mock ShopifyService.syncOrder to resolve successfully
    (ShopifyService.syncOrder as jest.Mock).mockResolvedValue(undefined);

    // Send POST request to /api/orders/:id/fulfill
    const response = await request(app).post(`/api/orders/${sampleOrderId}/fulfill`);

    // Assert that the response status is 200
    expect(response.status).toBe(200);

    // Assert that the response body contains the fulfilled order data
    expect(response.body).toEqual(fulfilledOrder);

    // Assert that InventoryItem.findOneAndUpdate was called for each order item
    expect(InventoryItem.findOneAndUpdate).toHaveBeenCalledTimes(1);
    expect(InventoryItem.findOneAndUpdate).toHaveBeenCalledWith(
      { productId: '1' },
      { $inc: { quantity: -2 } },
      { new: true }
    );

    // Assert that SendleService.generateShippingLabel was called
    expect(SendleService.generateShippingLabel).toHaveBeenCalledWith(sampleOrder);

    // Assert that ShopifyService.syncOrder was called with the fulfilled order
    expect(ShopifyService.syncOrder).toHaveBeenCalledWith(fulfilledOrder);
  });

  test('POST /api/orders/:id/fulfill - should return 400 if insufficient inventory', async () => {
    // Create a sample order ID
    const sampleOrderId = '123';

    // Mock Order.findById to return a sample order
    const sampleOrder = { id: sampleOrderId, items: [{ productId: '1', quantity: 2 }], status: OrderStatus.PROCESSING };
    (Order.findById as jest.Mock).mockResolvedValue(sampleOrder);

    // Mock InventoryItem.findOneAndUpdate to simulate insufficient inventory
    (InventoryItem.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

    // Send POST request to /api/orders/:id/fulfill
    const response = await request(app).post(`/api/orders/${sampleOrderId}/fulfill`);

    // Assert that the response status is 400
    expect(response.status).toBe(400);

    // Assert that the response body contains an error message about insufficient inventory
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('Insufficient inventory');
  });
});