import axios, { AxiosInstance } from 'axios';
import { Order } from '../models/Order';
import { SendleConfig } from '../config/sendle';

// Global variable for Sendle API client
let sendleApiClient: AxiosInstance;

// Initialize Sendle API client
export const initializeSendleClient = (): void => {
  // Create axios instance with Sendle API base URL
  sendleApiClient = axios.create({
    baseURL: SendleConfig.apiBaseUrl,
  });

  // Set API key in headers from SendleConfig
  sendleApiClient.defaults.headers.common['Authorization'] = `Bearer ${SendleConfig.apiKey}`;
};

// Generate a shipping label for an order using Sendle
export const generateShippingLabel = async (order: Order): Promise<{ trackingNumber: string, labelUrl: string }> => {
  // Prepare order data for Sendle API request
  const sendleOrderData = {
    pickup_address: order.pickupAddress,
    delivery_address: order.deliveryAddress,
    package_size: order.packageSize,
    weight: order.weight,
    description: order.description,
  };

  try {
    // Make API call to Sendle to create a shipping label
    const response = await sendleApiClient.post('/orders', sendleOrderData);

    // Extract tracking number and label URL from response
    const { tracking_number, label_url } = response.data;

    // Return shipping label information
    return {
      trackingNumber: tracking_number,
      labelUrl: label_url,
    };
  } catch (error) {
    console.error('Error generating shipping label:', error);
    throw error;
  }
};

// Get shipping rates from Sendle for a given package and destination
export const getShippingRates = async (packageDetails: object, destination: object): Promise<object[]> => {
  // Prepare request data with package details and destination
  const rateRequestData = {
    package: packageDetails,
    destination: destination,
  };

  try {
    // Make API call to Sendle to get shipping rates
    const response = await sendleApiClient.post('/quote', rateRequestData);

    // Return array of shipping rate options
    return response.data.quotes;
  } catch (error) {
    console.error('Error getting shipping rates:', error);
    throw error;
  }
};

// Track a shipment using Sendle tracking number
export const trackShipment = async (trackingNumber: string): Promise<object> => {
  try {
    // Make API call to Sendle to get tracking information
    const response = await sendleApiClient.get(`/tracking/${trackingNumber}`);

    // Return shipment tracking details
    return response.data;
  } catch (error) {
    console.error('Error tracking shipment:', error);
    throw error;
  }
};