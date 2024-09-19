import { Request, Response } from 'express';
import { InventoryItem } from '../models/InventoryItem';
import { ShopifyService } from '../services/ShopifyService';

// Retrieve all inventory items or filter by criteria
export const getInventoryItems = async (req: Request, res: Response): Promise<void> => {
    try {
        // Extract filter criteria from query parameters if present
        const filters = req.query;

        // Query database for inventory items, applying filters if provided
        const inventoryItems = await InventoryItem.find(filters);

        // Return inventory items in response
        res.status(200).json(inventoryItems);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving inventory items', error });
    }
};

// Retrieve a specific inventory item by ID
export const getInventoryItemById = async (req: Request, res: Response): Promise<void> => {
    try {
        // Extract inventory item ID from request parameters
        const { id } = req.params;

        // Query database for inventory item by ID
        const inventoryItem = await InventoryItem.findById(id);

        // If item not found, return 404 Not Found
        if (!inventoryItem) {
            res.status(404).json({ message: 'Inventory item not found' });
            return;
        }

        // Return inventory item in response
        res.status(200).json(inventoryItem);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving inventory item', error });
    }
};

// Create a new inventory item
export const createInventoryItem = async (req: Request, res: Response): Promise<void> => {
    try {
        // Extract inventory item data from request body
        const itemData = req.body;

        // Validate inventory item data
        // TODO: Implement validation logic

        // Create new inventory item in database
        const newItem = new InventoryItem(itemData);
        await newItem.save();

        // Sync inventory item with Shopify using ShopifyService
        await ShopifyService.syncInventoryItem(newItem);

        // Return created inventory item in response
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ message: 'Error creating inventory item', error });
    }
};

// Update an existing inventory item
export const updateInventoryItem = async (req: Request, res: Response): Promise<void> => {
    try {
        // Extract inventory item ID and update data from request
        const { id } = req.params;
        const updateData = req.body;

        // Find inventory item by ID in database
        const inventoryItem = await InventoryItem.findById(id);

        // If item not found, return 404 Not Found
        if (!inventoryItem) {
            res.status(404).json({ message: 'Inventory item not found' });
            return;
        }

        // Update inventory item with new data
        Object.assign(inventoryItem, updateData);
        await inventoryItem.save();

        // Sync updated inventory item with Shopify using ShopifyService
        await ShopifyService.syncInventoryItem(inventoryItem);

        // Return updated inventory item in response
        res.status(200).json(inventoryItem);
    } catch (error) {
        res.status(500).json({ message: 'Error updating inventory item', error });
    }
};

// Delete an inventory item
export const deleteInventoryItem = async (req: Request, res: Response): Promise<void> => {
    try {
        // Extract inventory item ID from request parameters
        const { id } = req.params;

        // Find inventory item by ID in database
        const inventoryItem = await InventoryItem.findById(id);

        // If item not found, return 404 Not Found
        if (!inventoryItem) {
            res.status(404).json({ message: 'Inventory item not found' });
            return;
        }

        // Delete inventory item from database
        await InventoryItem.findByIdAndDelete(id);

        // Sync deletion with Shopify using ShopifyService
        await ShopifyService.deleteInventoryItem(id);

        // Return success message in response
        res.status(200).json({ message: 'Inventory item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting inventory item', error });
    }
};

// Adjust the quantity of an inventory item
export const adjustInventoryQuantity = async (req: Request, res: Response): Promise<void> => {
    try {
        // Extract inventory item ID and quantity adjustment from request
        const { id } = req.params;
        const { adjustment } = req.body;

        // Find inventory item by ID in database
        const inventoryItem = await InventoryItem.findById(id);

        // If item not found, return 404 Not Found
        if (!inventoryItem) {
            res.status(404).json({ message: 'Inventory item not found' });
            return;
        }

        // Adjust inventory item quantity
        inventoryItem.quantity += adjustment;
        await inventoryItem.save();

        // Sync quantity adjustment with Shopify using ShopifyService
        await ShopifyService.updateInventoryQuantity(id, inventoryItem.quantity);

        // Return updated inventory item in response
        res.status(200).json(inventoryItem);
    } catch (error) {
        res.status(500).json({ message: 'Error adjusting inventory quantity', error });
    }
};