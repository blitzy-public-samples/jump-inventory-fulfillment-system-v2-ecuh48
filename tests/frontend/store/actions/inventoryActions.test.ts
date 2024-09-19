import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { fetchInventory, updateInventoryItem, addInventoryItem } from '../../src/frontend/store/actions/inventoryActions';
import * as api from '../../src/frontend/utils/api';
import { InventoryItem } from '../../src/frontend/types/InventoryItem';

// Configure mock store with thunk middleware
const mockStore = configureMockStore([thunk]);

// Mock API functions
jest.mock('../../src/frontend/utils/api', () => ({
  getInventory: jest.fn(),
  updateInventoryItem: jest.fn(),
  addInventoryItem: jest.fn(),
}));

describe('Inventory Actions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('fetchInventory', async () => {
    // Mock api.getInventory to return sample inventory data
    const mockInventoryData: InventoryItem[] = [
      { id: '1', name: 'Item 1', quantity: 10 },
      { id: '2', name: 'Item 2', quantity: 20 },
    ];
    (api.getInventory as jest.Mock).mockResolvedValue(mockInventoryData);

    // Create a mock store
    const store = mockStore({});

    // Dispatch fetchInventory action
    await store.dispatch(fetchInventory() as any);

    // Assert that the correct actions were dispatched
    const actions = store.getActions();
    expect(actions[0]).toEqual({ type: 'FETCH_INVENTORY_REQUEST' });
    expect(actions[1]).toEqual({
      type: 'FETCH_INVENTORY_SUCCESS',
      payload: mockInventoryData,
    });

    // Assert that the payload contains the correct inventory data
    expect(actions[1].payload).toEqual(mockInventoryData);
  });

  test('fetchInventory error handling', async () => {
    // Mock api.getInventory to throw an error
    const mockError = new Error('Failed to fetch inventory');
    (api.getInventory as jest.Mock).mockRejectedValue(mockError);

    // Create a mock store
    const store = mockStore({});

    // Dispatch fetchInventory action
    await store.dispatch(fetchInventory() as any);

    // Assert that the correct actions were dispatched
    const actions = store.getActions();
    expect(actions[0]).toEqual({ type: 'FETCH_INVENTORY_REQUEST' });
    expect(actions[1]).toEqual({
      type: 'FETCH_INVENTORY_FAILURE',
      payload: mockError.message,
    });

    // Assert that the error payload is correct
    expect(actions[1].payload).toBe('Failed to fetch inventory');
  });

  test('updateInventoryItem', async () => {
    // Mock api.updateInventoryItem to return updated item data
    const mockUpdatedItem: InventoryItem = { id: '1', name: 'Updated Item', quantity: 15 };
    (api.updateInventoryItem as jest.Mock).mockResolvedValue(mockUpdatedItem);

    // Create a mock store
    const store = mockStore({});

    // Dispatch updateInventoryItem action with item ID and update data
    await store.dispatch(updateInventoryItem('1', { name: 'Updated Item', quantity: 15 }) as any);

    // Assert that the correct actions were dispatched
    const actions = store.getActions();
    expect(actions[0]).toEqual({ type: 'UPDATE_INVENTORY_ITEM_REQUEST' });
    expect(actions[1]).toEqual({
      type: 'UPDATE_INVENTORY_ITEM_SUCCESS',
      payload: mockUpdatedItem,
    });

    // Assert that the payload contains the correct updated item data
    expect(actions[1].payload).toEqual(mockUpdatedItem);
  });

  test('updateInventoryItem error handling', async () => {
    // Mock api.updateInventoryItem to throw an error
    const mockError = new Error('Failed to update inventory item');
    (api.updateInventoryItem as jest.Mock).mockRejectedValue(mockError);

    // Create a mock store
    const store = mockStore({});

    // Dispatch updateInventoryItem action with item ID and update data
    await store.dispatch(updateInventoryItem('1', { name: 'Updated Item', quantity: 15 }) as any);

    // Assert that the correct actions were dispatched
    const actions = store.getActions();
    expect(actions[0]).toEqual({ type: 'UPDATE_INVENTORY_ITEM_REQUEST' });
    expect(actions[1]).toEqual({
      type: 'UPDATE_INVENTORY_ITEM_FAILURE',
      payload: mockError.message,
    });

    // Assert that the error payload is correct
    expect(actions[1].payload).toBe('Failed to update inventory item');
  });

  test('addInventoryItem', async () => {
    // Mock api.addInventoryItem to return new item data
    const mockNewItem: InventoryItem = { id: '3', name: 'New Item', quantity: 5 };
    (api.addInventoryItem as jest.Mock).mockResolvedValue(mockNewItem);

    // Create a mock store
    const store = mockStore({});

    // Dispatch addInventoryItem action with new item data
    await store.dispatch(addInventoryItem({ name: 'New Item', quantity: 5 }) as any);

    // Assert that the correct actions were dispatched
    const actions = store.getActions();
    expect(actions[0]).toEqual({ type: 'ADD_INVENTORY_ITEM_REQUEST' });
    expect(actions[1]).toEqual({
      type: 'ADD_INVENTORY_ITEM_SUCCESS',
      payload: mockNewItem,
    });

    // Assert that the payload contains the correct new item data
    expect(actions[1].payload).toEqual(mockNewItem);
  });

  test('addInventoryItem error handling', async () => {
    // Mock api.addInventoryItem to throw an error
    const mockError = new Error('Failed to add inventory item');
    (api.addInventoryItem as jest.Mock).mockRejectedValue(mockError);

    // Create a mock store
    const store = mockStore({});

    // Dispatch addInventoryItem action with new item data
    await store.dispatch(addInventoryItem({ name: 'New Item', quantity: 5 }) as any);

    // Assert that the correct actions were dispatched
    const actions = store.getActions();
    expect(actions[0]).toEqual({ type: 'ADD_INVENTORY_ITEM_REQUEST' });
    expect(actions[1]).toEqual({
      type: 'ADD_INVENTORY_ITEM_FAILURE',
      payload: mockError.message,
    });

    // Assert that the error payload is correct
    expect(actions[1].payload).toBe('Failed to add inventory item');
  });
});