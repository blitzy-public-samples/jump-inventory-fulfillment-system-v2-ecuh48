import { Shopify } from '@shopify/shopify-api';
import { Order } from '../models/Order';
import { InventoryItem } from '../models/InventoryItem';
import { ShopifyConfig } from '../config/shopify';

// Global Shopify instance
let shopify: Shopify;

/**
 * Initialize Shopify API client
 */
export const initializeShopify = (): void => {
  // Initialize Shopify API client with configuration from ShopifyConfig
  shopify = new Shopify({
    shopName: ShopifyConfig.shopName,
    apiKey: ShopifyConfig.apiKey,
    apiSecret: ShopifyConfig.apiSecret,
    scopes: ShopifyConfig.scopes,
    hostName: ShopifyConfig.hostName
  });
};

/**
 * Fetch orders from Shopify
 * @returns Promise<Order[]> Array of Order objects
 */
export const fetchOrders = async (): Promise<Order[]> => {
  try {
    // Make API call to Shopify to fetch orders
    const response = await shopify.order.list();

    // Transform Shopify order data to match Order model
    const orders: Order[] = response.data.map((shopifyOrder: any) => ({
      id: shopifyOrder.id,
      customerName: `${shopifyOrder.customer.first_name} ${shopifyOrder.customer.last_name}`,
      orderDate: new Date(shopifyOrder.created_at),
      status: shopifyOrder.fulfillment_status || 'unfulfilled',
      items: shopifyOrder.line_items.map((item: any) => ({
        productId: item.product_id,
        quantity: item.quantity
      }))
    }));

    // Return array of Order objects
    return orders;
  } catch (error) {
    console.error('Error fetching orders from Shopify:', error);
    throw error;
  }
};

/**
 * Sync order status with Shopify
 * @param order Order object to sync
 */
export const syncOrder = async (order: Order): Promise<void> => {
  try {
    // Make API call to Shopify to update order status
    await shopify.order.update(order.id, {
      fulfillment_status: order.status
    });
  } catch (error) {
    console.error('Error syncing order status with Shopify:', error);
    throw error;
  }
};

/**
 * Sync inventory levels with Shopify
 * @param item InventoryItem object to sync
 */
export const syncInventory = async (item: InventoryItem): Promise<void> => {
  try {
    // Make API call to Shopify to update inventory levels
    await shopify.inventoryLevel.set({
      inventory_item_id: item.id,
      location_id: ShopifyConfig.locationId,
      available: item.quantity
    });
  } catch (error) {
    console.error('Error syncing inventory levels with Shopify:', error);
    throw error;
  }
};

/**
 * Create a webhook for Shopify events
 * @param topic Webhook topic
 * @param address Webhook address
 */
export const createWebhook = async (topic: string, address: string): Promise<void> => {
  try {
    // Make API call to Shopify to create a webhook
    await shopify.webhook.create({
      topic: topic,
      address: address,
      format: 'json'
    });
  } catch (error) {
    console.error('Error creating Shopify webhook:', error);
    throw error;
  }
};