import { inventoryReducer } from '../../src/frontend/store/reducers/inventoryReducer';
import { InventoryActionTypes } from '../../src/frontend/store/actions/inventoryActionTypes';
import { InventoryState } from '../../src/frontend/types/InventoryState';
import { InventoryItem } from '../../src/frontend/types/InventoryItem';

describe('Inventory Reducer', () => {
  // Test: should return the initial state
  it('should return the initial state', () => {
    const initialState: InventoryState = {
      items: [],
      loading: false,
      error: null,
    };
    expect(inventoryReducer(undefined, {} as any)).toEqual(initialState);
  });

  // Test: should handle FETCH_INVENTORY_REQUEST
  it('should handle FETCH_INVENTORY_REQUEST', () => {
    const initialState: InventoryState = {
      items: [],
      loading: false,
      error: null,
    };
    const action = { type: InventoryActionTypes.FETCH_INVENTORY_REQUEST };
    const expectedState: InventoryState = {
      ...initialState,
      loading: true,
      error: null,
    };
    expect(inventoryReducer(initialState, action)).toEqual(expectedState);
  });

  // Test: should handle FETCH_INVENTORY_SUCCESS
  it('should handle FETCH_INVENTORY_SUCCESS', () => {
    const initialState: InventoryState = {
      items: [],
      loading: true,
      error: null,
    };
    const sampleData: InventoryItem[] = [
      { id: '1', name: 'Item 1', quantity: 10, price: 9.99 },
      { id: '2', name: 'Item 2', quantity: 5, price: 19.99 },
    ];
    const action = {
      type: InventoryActionTypes.FETCH_INVENTORY_SUCCESS,
      payload: sampleData,
    };
    const expectedState: InventoryState = {
      items: sampleData,
      loading: false,
      error: null,
    };
    expect(inventoryReducer(initialState, action)).toEqual(expectedState);
  });

  // Test: should handle FETCH_INVENTORY_FAILURE
  it('should handle FETCH_INVENTORY_FAILURE', () => {
    const initialState: InventoryState = {
      items: [],
      loading: true,
      error: null,
    };
    const errorMessage = 'Failed to fetch inventory';
    const action = {
      type: InventoryActionTypes.FETCH_INVENTORY_FAILURE,
      payload: errorMessage,
    };
    const expectedState: InventoryState = {
      items: [],
      loading: false,
      error: errorMessage,
    };
    expect(inventoryReducer(initialState, action)).toEqual(expectedState);
  });

  // Test: should handle UPDATE_INVENTORY_ITEM_REQUEST
  it('should handle UPDATE_INVENTORY_ITEM_REQUEST', () => {
    const initialState: InventoryState = {
      items: [],
      loading: false,
      error: null,
    };
    const action = { type: InventoryActionTypes.UPDATE_INVENTORY_ITEM_REQUEST };
    const expectedState: InventoryState = {
      ...initialState,
      loading: true,
      error: null,
    };
    expect(inventoryReducer(initialState, action)).toEqual(expectedState);
  });

  // Test: should handle UPDATE_INVENTORY_ITEM_SUCCESS
  it('should handle UPDATE_INVENTORY_ITEM_SUCCESS', () => {
    const initialState: InventoryState = {
      items: [
        { id: '1', name: 'Item 1', quantity: 10, price: 9.99 },
        { id: '2', name: 'Item 2', quantity: 5, price: 19.99 },
      ],
      loading: true,
      error: null,
    };
    const updatedItem: InventoryItem = { id: '2', name: 'Updated Item 2', quantity: 8, price: 24.99 };
    const action = {
      type: InventoryActionTypes.UPDATE_INVENTORY_ITEM_SUCCESS,
      payload: updatedItem,
    };
    const expectedState: InventoryState = {
      items: [
        { id: '1', name: 'Item 1', quantity: 10, price: 9.99 },
        updatedItem,
      ],
      loading: false,
      error: null,
    };
    expect(inventoryReducer(initialState, action)).toEqual(expectedState);
  });

  // Test: should handle UPDATE_INVENTORY_ITEM_FAILURE
  it('should handle UPDATE_INVENTORY_ITEM_FAILURE', () => {
    const initialState: InventoryState = {
      items: [],
      loading: true,
      error: null,
    };
    const errorMessage = 'Failed to update inventory item';
    const action = {
      type: InventoryActionTypes.UPDATE_INVENTORY_ITEM_FAILURE,
      payload: errorMessage,
    };
    const expectedState: InventoryState = {
      items: [],
      loading: false,
      error: errorMessage,
    };
    expect(inventoryReducer(initialState, action)).toEqual(expectedState);
  });

  // Test: should handle ADD_INVENTORY_ITEM_REQUEST
  it('should handle ADD_INVENTORY_ITEM_REQUEST', () => {
    const initialState: InventoryState = {
      items: [],
      loading: false,
      error: null,
    };
    const action = { type: InventoryActionTypes.ADD_INVENTORY_ITEM_REQUEST };
    const expectedState: InventoryState = {
      ...initialState,
      loading: true,
      error: null,
    };
    expect(inventoryReducer(initialState, action)).toEqual(expectedState);
  });

  // Test: should handle ADD_INVENTORY_ITEM_SUCCESS
  it('should handle ADD_INVENTORY_ITEM_SUCCESS', () => {
    const initialState: InventoryState = {
      items: [
        { id: '1', name: 'Item 1', quantity: 10, price: 9.99 },
      ],
      loading: true,
      error: null,
    };
    const newItem: InventoryItem = { id: '2', name: 'New Item', quantity: 5, price: 14.99 };
    const action = {
      type: InventoryActionTypes.ADD_INVENTORY_ITEM_SUCCESS,
      payload: newItem,
    };
    const expectedState: InventoryState = {
      items: [
        { id: '1', name: 'Item 1', quantity: 10, price: 9.99 },
        newItem,
      ],
      loading: false,
      error: null,
    };
    expect(inventoryReducer(initialState, action)).toEqual(expectedState);
  });

  // Test: should handle ADD_INVENTORY_ITEM_FAILURE
  it('should handle ADD_INVENTORY_ITEM_FAILURE', () => {
    const initialState: InventoryState = {
      items: [],
      loading: true,
      error: null,
    };
    const errorMessage = 'Failed to add inventory item';
    const action = {
      type: InventoryActionTypes.ADD_INVENTORY_ITEM_FAILURE,
      payload: errorMessage,
    };
    const expectedState: InventoryState = {
      items: [],
      loading: false,
      error: errorMessage,
    };
    expect(inventoryReducer(initialState, action)).toEqual(expectedState);
  });
});