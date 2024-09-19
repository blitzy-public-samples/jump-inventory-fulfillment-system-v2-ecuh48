import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { OrderStatus } from '../types/OrderStatus';
import { InventoryItem } from '../models/InventoryItem';
import { ShopifyService } from '../services/ShopifyService';
import { SendleService } from '../services/SendleService';

// Retrieve all orders or filter by status
export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract status filter from query parameters if present
    const statusFilter = req.query.status as OrderStatus | undefined;

    // Query database for orders, applying status filter if provided
    const query = statusFilter ? { status: statusFilter } : {};
    const orders = await Order.find(query);

    // Return orders in response
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
};

// Retrieve a specific order by ID
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract order ID from request parameters
    const orderId = req.params.id;

    // Query database for order by ID
    const order = await Order.findById(orderId);

    // If order not found, return 404 Not Found
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Return order in response
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve order' });
  }
};

// Create a new order
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract order data from request body
    const orderData = req.body;

    // Validate order data
    if (!orderData || !orderData.items || orderData.items.length === 0) {
      res.status(400).json({ error: 'Invalid order data' });
      return;
    }

    // Create new order in database
    const newOrder = new Order(orderData);
    await newOrder.save();

    // Sync order with Shopify using ShopifyService
    await ShopifyService.syncOrder(newOrder);

    // Return created order in response
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
};

// Update the status of an order
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract order ID and new status from request
    const orderId = req.params.id;
    const newStatus = req.body.status as OrderStatus;

    // Find order by ID in database
    const order = await Order.findById(orderId);

    // If order not found, return 404 Not Found
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Update order status
    order.status = newStatus;
    await order.save();

    // Sync updated status with Shopify using ShopifyService
    await ShopifyService.syncOrderStatus(order);

    // Return updated order in response
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

// Process order fulfillment
export const fulfillOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract order ID from request
    const orderId = req.params.id;

    // Find order by ID in database
    const order = await Order.findById(orderId);

    // If order not found, return 404 Not Found
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Check inventory availability for order items
    for (const item of order.items) {
      const inventoryItem = await InventoryItem.findOne({ sku: item.sku });
      if (!inventoryItem || inventoryItem.quantity < item.quantity) {
        res.status(400).json({ error: 'Insufficient inventory for item: ' + item.sku });
        return;
      }
    }

    // Update inventory quantities
    for (const item of order.items) {
      await InventoryItem.updateOne(
        { sku: item.sku },
        { $inc: { quantity: -item.quantity } }
      );
    }

    // Generate shipping label using SendleService
    const shippingLabel = await SendleService.generateShippingLabel(order);

    // Update order status to fulfilled
    order.status = OrderStatus.Fulfilled;
    order.shippingLabel = shippingLabel;
    await order.save();

    // Sync fulfillment with Shopify using ShopifyService
    await ShopifyService.syncOrderFulfillment(order);

    // Return fulfilled order with shipping information in response
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fulfill order' });
  }
};