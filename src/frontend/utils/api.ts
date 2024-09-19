import axios from 'axios';
import { Order } from '../types/Order';
import { InventoryItem } from '../types/InventoryItem';
import { OrderStatus } from '../types/OrderStatus';

// Define the base URL for API requests
const API_BASE_URL = 'http://api.example.com'; // Replace with actual API base URL

// Create an axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to fetch all orders from the server
export const getOrders = async (): Promise<Order[]> => {
  try {
    // Make GET request to '/orders' endpoint
    const response = await axiosInstance.get('/orders');
    // Return response data
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Function to fetch details of a specific order
export const getOrderDetails = async (orderId: string): Promise<Order> => {
  try {
    // Make GET request to '/orders/{orderId}' endpoint
    const response = await axiosInstance.get(`/orders/${orderId}`);
    // Return response data
    return response.data;
  } catch (error) {
    console.error(`Error fetching order details for order ${orderId}:`, error);
    throw error;
  }
};

// Function to update the status of an order
export const updateOrderStatus = async (orderId: string, newStatus: OrderStatus): Promise<Order> => {
  try {
    // Make PATCH request to '/orders/{orderId}' endpoint with newStatus in request body
    const response = await axiosInstance.patch(`/orders/${orderId}`, { status: newStatus });
    // Return response data
    return response.data;
  } catch (error) {
    console.error(`Error updating status for order ${orderId}:`, error);
    throw error;
  }
};

// Function to create a new order
export const createOrder = async (orderData: Order): Promise<Order> => {
  try {
    // Make POST request to '/orders' endpoint with orderData in request body
    const response = await axiosInstance.post('/orders', orderData);
    // Return response data
    return response.data;
  } catch (error) {
    console.error('Error creating new order:', error);
    throw error;
  }
};

// Function to fetch all inventory items from the server
export const getInventory = async (): Promise<InventoryItem[]> => {
  try {
    // Make GET request to '/inventory' endpoint
    const response = await axiosInstance.get('/inventory');
    // Return response data
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory:', error);
    throw error;
  }
};

// Function to update an inventory item
export const updateInventoryItem = async (itemId: string, updateData: Partial<InventoryItem>): Promise<InventoryItem> => {
  try {
    // Make PATCH request to '/inventory/{itemId}' endpoint with updateData in request body
    const response = await axiosInstance.patch(`/inventory/${itemId}`, updateData);
    // Return response data
    return response.data;
  } catch (error) {
    console.error(`Error updating inventory item ${itemId}:`, error);
    throw error;
  }
};

// Function to add a new inventory item
export const addInventoryItem = async (newItem: InventoryItem): Promise<InventoryItem> => {
  try {
    // Make POST request to '/inventory' endpoint with newItem in request body
    const response = await axiosInstance.post('/inventory', newItem);
    // Return response data
    return response.data;
  } catch (error) {
    console.error('Error adding new inventory item:', error);
    throw error;
  }
};