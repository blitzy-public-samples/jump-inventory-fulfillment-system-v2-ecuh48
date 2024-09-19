import request from 'supertest';
import app from '../../src/backend/app';
import InventoryItem from '../../src/backend/models/InventoryItem';
import ShopifyService from '../../src/backend/services/ShopifyService';

// Mock InventoryItem model methods
jest.mock('../../src/backend/models/InventoryItem', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

// Mock ShopifyService methods
jest.mock('../../src/backend/services/ShopifyService', () => ({
  syncInventoryItem: jest.fn(),
  deleteInventoryItem: jest.fn(),
}));

describe('Inventory Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/inventory - should return all inventory items', async () => {
    // Mock InventoryItem.find to return sample inventory data
    const sampleInventory = [{ id: '1', name: 'Item 1' }, { id: '2', name: 'Item 2' }];
    (InventoryItem.find as jest.Mock).mockResolvedValue(sampleInventory);

    // Send GET request to /api/inventory
    const response = await request(app).get('/api/inventory');

    // Assert that the response status is 200
    expect(response.status).toBe(200);

    // Assert that the response body contains the sample inventory data
    expect(response.body).toEqual(sampleInventory);
  });

  test('GET /api/inventory/:id - should return a specific inventory item', async () => {
    // Create a sample inventory item ID
    const sampleId = '123';

    // Mock InventoryItem.findById to return a sample inventory item
    const sampleItem = { id: sampleId, name: 'Sample Item' };
    (InventoryItem.findById as jest.Mock).mockResolvedValue(sampleItem);

    // Send GET request to /api/inventory/:id with the sample ID
    const response = await request(app).get(`/api/inventory/${sampleId}`);

    // Assert that the response status is 200
    expect(response.status).toBe(200);

    // Assert that the response body contains the sample inventory item data
    expect(response.body).toEqual(sampleItem);
  });

  test('GET /api/inventory/:id - should return 404 if inventory item not found', async () => {
    // Create a non-existent inventory item ID
    const nonExistentId = '456';

    // Mock InventoryItem.findById to return null
    (InventoryItem.findById as jest.Mock).mockResolvedValue(null);

    // Send GET request to /api/inventory/:id with the non-existent ID
    const response = await request(app).get(`/api/inventory/${nonExistentId}`);

    // Assert that the response status is 404
    expect(response.status).toBe(404);
  });

  test('POST /api/inventory - should create a new inventory item', async () => {
    // Create sample inventory item data
    const sampleItemData = { name: 'New Item', quantity: 10 };

    // Mock InventoryItem.create to return the sample inventory item
    const createdItem = { id: '789', ...sampleItemData };
    (InventoryItem.create as jest.Mock).mockResolvedValue(createdItem);

    // Mock ShopifyService.syncInventoryItem to resolve successfully
    (ShopifyService.syncInventoryItem as jest.Mock).mockResolvedValue(undefined);

    // Send POST request to /api/inventory with the sample inventory item data
    const response = await request(app).post('/api/inventory').send(sampleItemData);

    // Assert that the response status is 201
    expect(response.status).toBe(201);

    // Assert that the response body contains the created inventory item data
    expect(response.body).toEqual(createdItem);

    // Assert that ShopifyService.syncInventoryItem was called with the created item
    expect(ShopifyService.syncInventoryItem).toHaveBeenCalledWith(createdItem);
  });

  test('PATCH /api/inventory/:id - should update an inventory item', async () => {
    // Create a sample inventory item ID
    const sampleId = '123';

    // Create update data for the inventory item
    const updateData = { name: 'Updated Item', quantity: 20 };

    // Mock InventoryItem.findByIdAndUpdate to return the updated inventory item
    const updatedItem = { id: sampleId, ...updateData };
    (InventoryItem.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedItem);

    // Mock ShopifyService.syncInventoryItem to resolve successfully
    (ShopifyService.syncInventoryItem as jest.Mock).mockResolvedValue(undefined);

    // Send PATCH request to /api/inventory/:id with the update data
    const response = await request(app).patch(`/api/inventory/${sampleId}`).send(updateData);

    // Assert that the response status is 200
    expect(response.status).toBe(200);

    // Assert that the response body contains the updated inventory item data
    expect(response.body).toEqual(updatedItem);

    // Assert that ShopifyService.syncInventoryItem was called with the updated item
    expect(ShopifyService.syncInventoryItem).toHaveBeenCalledWith(updatedItem);
  });

  test('DELETE /api/inventory/:id - should delete an inventory item', async () => {
    // Create a sample inventory item ID
    const sampleId = '123';

    // Mock InventoryItem.findByIdAndDelete to return the deleted inventory item
    const deletedItem = { id: sampleId, name: 'Deleted Item' };
    (InventoryItem.findByIdAndDelete as jest.Mock).mockResolvedValue(deletedItem);

    // Mock ShopifyService.deleteInventoryItem to resolve successfully
    (ShopifyService.deleteInventoryItem as jest.Mock).mockResolvedValue(undefined);

    // Send DELETE request to /api/inventory/:id
    const response = await request(app).delete(`/api/inventory/${sampleId}`);

    // Assert that the response status is 200
    expect(response.status).toBe(200);

    // Assert that the response body contains a success message
    expect(response.body).toEqual({ message: 'Inventory item deleted successfully' });

    // Assert that ShopifyService.deleteInventoryItem was called with the deleted item ID
    expect(ShopifyService.deleteInventoryItem).toHaveBeenCalledWith(sampleId);
  });

  test('POST /api/inventory/:id/adjust - should adjust inventory quantity', async () => {
    // Create a sample inventory item ID
    const sampleId = '123';

    // Create a quantity adjustment value
    const adjustmentValue = 5;

    // Mock InventoryItem.findById to return a sample inventory item
    const originalItem = { id: sampleId, name: 'Sample Item', quantity: 10 };
    (InventoryItem.findById as jest.Mock).mockResolvedValue(originalItem);

    // Mock InventoryItem.findByIdAndUpdate to return the updated inventory item
    const updatedItem = { ...originalItem, quantity: originalItem.quantity + adjustmentValue };
    (InventoryItem.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedItem);

    // Mock ShopifyService.syncInventoryItem to resolve successfully
    (ShopifyService.syncInventoryItem as jest.Mock).mockResolvedValue(undefined);

    // Send POST request to /api/inventory/:id/adjust with the quantity adjustment
    const response = await request(app).post(`/api/inventory/${sampleId}/adjust`).send({ adjustment: adjustmentValue });

    // Assert that the response status is 200
    expect(response.status).toBe(200);

    // Assert that the response body contains the updated inventory item data
    expect(response.body).toEqual(updatedItem);

    // Assert that the quantity has been correctly adjusted
    expect(updatedItem.quantity).toBe(originalItem.quantity + adjustmentValue);

    // Assert that ShopifyService.syncInventoryItem was called with the updated item
    expect(ShopifyService.syncInventoryItem).toHaveBeenCalledWith(updatedItem);
  });
});