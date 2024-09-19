import { SendleService } from '../../src/backend/services/SendleService';
import axios from 'axios';
import { Order } from '../../src/backend/models/Order';
import { SendleConfig } from '../../src/backend/config/sendle';

// Mock axios and SendleConfig
jest.mock('axios');
jest.mock('../../src/backend/config/sendle');

describe('SendleService', () => {
  let sendleService: SendleService;

  beforeEach(() => {
    sendleService = new SendleService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize Sendle API client correctly', () => {
    const mockAxiosCreate = jest.spyOn(axios, 'create');
    sendleService.initializeSendleClient();
    expect(mockAxiosCreate).toHaveBeenCalledWith({
      baseURL: SendleConfig.baseURL,
      headers: {
        'Authorization': `Bearer ${SendleConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  });

  test('should generate a shipping label for an order', async () => {
    const sampleOrder = new Order(/* sample order data */);
    const mockPostResponse = {
      data: {
        tracking_number: 'SENDLE123456',
        label_url: 'https://sendle.com/labels/SENDLE123456.pdf',
      },
    };
    const mockPost = jest.fn().mockResolvedValue(mockPostResponse);
    sendleService['sendleClient'] = { post: mockPost } as any;

    const result = await sendleService.generateShippingLabel(sampleOrder);

    expect(mockPost).toHaveBeenCalledWith('/labels', expect.any(Object));
    expect(result).toEqual({
      trackingNumber: 'SENDLE123456',
      labelUrl: 'https://sendle.com/labels/SENDLE123456.pdf',
    });
  });

  test('should get shipping rates for a package and destination', async () => {
    const packageDetails = { weight: 1, dimensions: { length: 10, width: 10, height: 10 } };
    const destination = { postcode: '2000', country: 'AU' };
    const mockGetResponse = {
      data: [
        { service: 'Standard', price: 10.5 },
        { service: 'Express', price: 15.75 },
      ],
    };
    const mockGet = jest.fn().mockResolvedValue(mockGetResponse);
    sendleService['sendleClient'] = { get: mockGet } as any;

    const result = await sendleService.getShippingRates(packageDetails, destination);

    expect(mockGet).toHaveBeenCalledWith('/quote', { params: expect.any(Object) });
    expect(result).toEqual(mockGetResponse.data);
  });

  test('should track a shipment using tracking number', async () => {
    const trackingNumber = 'SENDLE123456';
    const mockGetResponse = {
      data: {
        status: 'In Transit',
        estimated_delivery: '2023-05-15',
        tracking_events: [
          { timestamp: '2023-05-10T10:00:00Z', description: 'Package picked up' },
        ],
      },
    };
    const mockGet = jest.fn().mockResolvedValue(mockGetResponse);
    sendleService['sendleClient'] = { get: mockGet } as any;

    const result = await sendleService.trackShipment(trackingNumber);

    expect(mockGet).toHaveBeenCalledWith(`/tracking/${trackingNumber}`);
    expect(result).toEqual(mockGetResponse.data);
  });

  test('should handle Sendle API errors correctly', async () => {
    const mockError = new Error('API Error');
    const mockPost = jest.fn().mockRejectedValue(mockError);
    sendleService['sendleClient'] = { post: mockPost } as any;

    await expect(sendleService.generateShippingLabel({} as Order)).rejects.toThrow('API Error');
    // Add assertions for error logging if applicable
  });

  test('should retry failed Sendle API calls', async () => {
    const mockPostFail = jest.fn().mockRejectedValueOnce(new Error('API Error'));
    const mockPostSuccess = jest.fn().mockResolvedValueOnce({ data: { tracking_number: 'SENDLE123456' } });
    sendleService['sendleClient'] = { post: mockPostFail } as any;

    setTimeout(() => {
      sendleService['sendleClient'] = { post: mockPostSuccess } as any;
    }, 1000);

    const result = await sendleService.generateShippingLabel({} as Order);

    expect(mockPostFail).toHaveBeenCalledTimes(1);
    expect(mockPostSuccess).toHaveBeenCalledTimes(1);
    expect(result).toHaveProperty('trackingNumber', 'SENDLE123456');
  });

  test('should validate input data before sending to Sendle', () => {
    const invalidOrder = {} as Order;
    expect(() => sendleService.formatOrderForSendle(invalidOrder)).toThrow();
  });

  test('should handle Sendle rate limits', async () => {
    const mockGet = jest.fn()
      .mockResolvedValueOnce({ headers: { 'x-ratelimit-remaining': '1' } })
      .mockResolvedValueOnce({ headers: { 'x-ratelimit-remaining': '0' } })
      .mockResolvedValueOnce({ data: {} });
    sendleService['sendleClient'] = { get: mockGet } as any;

    await sendleService.trackShipment('SENDLE123456');
    await sendleService.trackShipment('SENDLE123457');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate waiting for rate limit reset
    await sendleService.trackShipment('SENDLE123458');

    expect(mockGet).toHaveBeenCalledTimes(3);
  });

  test('should format order data correctly for Sendle API', () => {
    const sampleOrder = new Order(/* sample order data */);
    const formattedOrder = sendleService.formatOrderForSendle(sampleOrder);

    expect(formattedOrder).toHaveProperty('pickup_address');
    expect(formattedOrder).toHaveProperty('delivery_address');
    expect(formattedOrder).toHaveProperty('package_size');
    expect(formattedOrder).toHaveProperty('weight');
    // Add more specific assertions based on the expected Sendle API format
  });

  test('should handle different package types and sizes', async () => {
    const smallOrder = new Order(/* small package data */);
    const largeOrder = new Order(/* large package data */);
    const mockPost = jest.fn().mockResolvedValue({ data: {} });
    sendleService['sendleClient'] = { post: mockPost } as any;

    await sendleService.generateShippingLabel(smallOrder);
    await sendleService.generateShippingLabel(largeOrder);

    expect(mockPost).toHaveBeenCalledTimes(2);
    expect(mockPost.mock.calls[0][1]).toHaveProperty('package_size', 'small');
    expect(mockPost.mock.calls[1][1]).toHaveProperty('package_size', 'large');
  });
});