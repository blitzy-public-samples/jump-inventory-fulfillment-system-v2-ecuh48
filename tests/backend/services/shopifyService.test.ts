import { ShopifyService } from '../../src/backend/services/ShopifyService';
import { Shopify } from '@shopify/shopify-api';
import { Order } from '../../src/backend/models/Order';
import { InventoryItem } from '../../src/backend/models/InventoryItem';
import { ShopifyConfig } from '../../src/backend/config/shopify';

// Mock Shopify.Clients.Rest
jest.mock('@shopify/shopify-api', () => ({
  Shopify: {
    Clients: {
      Rest: jest.fn()
    }
  }
}));

// Mock ShopifyConfig
jest.mock('../../src/backend/config/shopify');

describe('ShopifyService', () => {
  let shopifyService: ShopifyService;
  let mockShopifyClient: any;

  beforeEach(() => {
    mockShopifyClient = {
      get: jest.fn(),
      put: jest.fn(),
      post: jest.fn()
    };
    (Shopify.Clients.Rest as jest.Mock).mockImplementation(() => mockShopifyClient);
    shopifyService = new ShopifyService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize Shopify client correctly', () => {
    shopifyService.initializeShopify();
    expect(Shopify.Clients.Rest).toHaveBeenCalledWith(ShopifyConfig);
  });

  test('should fetch orders from Shopify', async () => {
    const sampleOrderData = {
      orders: [
        { id: '1', name: 'Order 1' },
        { id: '2', name: 'Order 2' }
      ]
    };
    mockShopifyClient.get.mockResolvedValue({ body: sampleOrderData });

    const orders = await shopifyService.fetchOrders();

    expect(mockShopifyClient.get).toHaveBeenCalledWith({ path: 'orders' });
    expect(orders).toHaveLength(2);
    expect(orders[0]).toBeInstanceOf(Order);
    expect(orders[1]).toBeInstanceOf(Order);
  });

  test('should sync order status with Shopify', async () => {
    const order = new Order('1', 'fulfilled');
    await shopifyService.syncOrder(order);

    expect(mockShopifyClient.put).toHaveBeenCalledWith({
      path: 'orders/1',
      data: { order: { status: 'fulfilled' } }
    });
  });

  test('should sync inventory levels with Shopify', async () => {
    const inventoryItem = new InventoryItem('1', 'Product 1', 10);
    await shopifyService.syncInventory(inventoryItem);

    expect(mockShopifyClient.post).toHaveBeenCalledWith({
      path: 'inventory_levels/set',
      data: { inventory_item_id: '1', available: 10 }
    });
  });

  test('should create a webhook for Shopify events', async () => {
    await shopifyService.createWebhook('orders/create', 'https://example.com/webhook');

    expect(mockShopifyClient.post).toHaveBeenCalledWith({
      path: 'webhooks',
      data: {
        webhook: {
          topic: 'orders/create',
          address: 'https://example.com/webhook',
          format: 'json'
        }
      }
    });
  });

  test('should handle Shopify API errors correctly', async () => {
    const error = new Error('Shopify API Error');
    mockShopifyClient.get.mockRejectedValue(error);

    await expect(shopifyService.fetchOrders()).rejects.toThrow('Shopify API Error');
    // Add additional assertions for error logging if applicable
  });

  test('should retry failed Shopify API calls', async () => {
    mockShopifyClient.get
      .mockRejectedValueOnce(new Error('Temporary error'))
      .mockResolvedValueOnce({ body: { orders: [] } });

    await shopifyService.fetchOrders();

    expect(mockShopifyClient.get).toHaveBeenCalledTimes(2);
  });

  test('should handle pagination for large datasets', async () => {
    const page1 = { orders: [{ id: '1' }], link: { next: 'page2' } };
    const page2 = { orders: [{ id: '2' }] };

    mockShopifyClient.get
      .mockResolvedValueOnce({ body: page1, headers: { link: '<page2>; rel="next"' } })
      .mockResolvedValueOnce({ body: page2, headers: {} });

    const orders = await shopifyService.fetchOrders();

    expect(mockShopifyClient.get).toHaveBeenCalledTimes(2);
    expect(orders).toHaveLength(2);
  });

  test('should validate input data before sending to Shopify', async () => {
    const invalidOrder = new Order('', 'invalid_status');

    await expect(shopifyService.syncOrder(invalidOrder)).rejects.toThrow('Invalid order data');
  });

  test('should handle Shopify rate limits', async () => {
    const rateLimitHeaders = {
      'x-shopify-shop-api-call-limit': '39/40'
    };

    mockShopifyClient.get
      .mockResolvedValueOnce({ body: { orders: [] }, headers: rateLimitHeaders })
      .mockResolvedValueOnce({ body: { orders: [] }, headers: rateLimitHeaders });

    await shopifyService.fetchOrders();
    await shopifyService.fetchOrders();

    // Add assertions to check if rate limiting logic is implemented
    // This might involve checking for delays between calls or other rate limiting strategies
  });
});