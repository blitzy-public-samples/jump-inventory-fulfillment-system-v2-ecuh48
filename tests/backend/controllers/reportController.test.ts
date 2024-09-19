import request from 'supertest';
import app from '../../src/backend/app';
import Order from '../../src/backend/models/Order';
import InventoryItem from '../../src/backend/models/InventoryItem';
import { ReportType } from '../../src/backend/types/ReportType';

// Mock Order and InventoryItem models
jest.mock('../../src/backend/models/Order');
jest.mock('../../src/backend/models/InventoryItem');

describe('Report Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/reports/generate - should generate a sales report', async () => {
    // Mock Order.find to return sample order data
    const mockOrders = [
      { _id: '1', total: 100, createdAt: new Date() },
      { _id: '2', total: 200, createdAt: new Date() },
    ];
    (Order.find as jest.Mock).mockResolvedValue(mockOrders);

    // Send GET request to /api/reports/generate with query params for sales report
    const response = await request(app)
      .get('/api/reports/generate')
      .query({ type: ReportType.SALES });

    // Assert that the response status is 200
    expect(response.status).toBe(200);

    // Assert that the response body contains the correct sales report data
    expect(response.body).toHaveProperty('totalSales', 300);
    expect(response.body).toHaveProperty('orderCount', 2);
  });

  it('GET /api/reports/generate - should generate an inventory report', async () => {
    // Mock InventoryItem.find to return sample inventory data
    const mockInventory = [
      { _id: '1', name: 'Item 1', quantity: 10 },
      { _id: '2', name: 'Item 2', quantity: 5 },
    ];
    (InventoryItem.find as jest.Mock).mockResolvedValue(mockInventory);

    // Send GET request to /api/reports/generate with query params for inventory report
    const response = await request(app)
      .get('/api/reports/generate')
      .query({ type: ReportType.INVENTORY });

    // Assert that the response status is 200
    expect(response.status).toBe(200);

    // Assert that the response body contains the correct inventory report data
    expect(response.body).toHaveProperty('totalItems', 2);
    expect(response.body).toHaveProperty('totalQuantity', 15);
  });

  it('GET /api/reports/generate - should generate a fulfillment report', async () => {
    // Mock Order.find to return sample order data with fulfillment information
    const mockOrders = [
      { _id: '1', status: 'fulfilled', fulfillmentDate: new Date() },
      { _id: '2', status: 'pending' },
    ];
    (Order.find as jest.Mock).mockResolvedValue(mockOrders);

    // Send GET request to /api/reports/generate with query params for fulfillment report
    const response = await request(app)
      .get('/api/reports/generate')
      .query({ type: ReportType.FULFILLMENT });

    // Assert that the response status is 200
    expect(response.status).toBe(200);

    // Assert that the response body contains the correct fulfillment report data
    expect(response.body).toHaveProperty('totalOrders', 2);
    expect(response.body).toHaveProperty('fulfilledOrders', 1);
    expect(response.body).toHaveProperty('pendingOrders', 1);
  });

  it('GET /api/reports/generate - should return 400 for invalid report type', async () => {
    // Send GET request to /api/reports/generate with an invalid report type
    const response = await request(app)
      .get('/api/reports/generate')
      .query({ type: 'INVALID_TYPE' });

    // Assert that the response status is 400
    expect(response.status).toBe(400);

    // Assert that the response body contains an error message about invalid report type
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('Invalid report type');
  });

  it('GET /api/reports/generate - should handle date range for sales and fulfillment reports', async () => {
    // Mock Order.find to return sample order data within a specific date range
    const mockOrders = [
      { _id: '1', total: 100, createdAt: new Date('2023-01-01') },
      { _id: '2', total: 200, createdAt: new Date('2023-01-15') },
    ];
    (Order.find as jest.Mock).mockResolvedValue(mockOrders);

    // Send GET request to /api/reports/generate with query params for sales report and date range
    const response = await request(app)
      .get('/api/reports/generate')
      .query({
        type: ReportType.SALES,
        startDate: '2023-01-01',
        endDate: '2023-01-31',
      });

    // Assert that the response status is 200
    expect(response.status).toBe(200);

    // Assert that the response body contains report data only for the specified date range
    expect(response.body).toHaveProperty('totalSales', 300);
    expect(response.body).toHaveProperty('orderCount', 2);
  });

  it('GET /api/reports/generate - should handle errors during report generation', async () => {
    // Mock Order.find to throw an error
    (Order.find as jest.Mock).mockRejectedValue(new Error('Database error'));

    // Send GET request to /api/reports/generate
    const response = await request(app)
      .get('/api/reports/generate')
      .query({ type: ReportType.SALES });

    // Assert that the response status is 500
    expect(response.status).toBe(500);

    // Assert that the response body contains an error message
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('Error generating report');
  });
});