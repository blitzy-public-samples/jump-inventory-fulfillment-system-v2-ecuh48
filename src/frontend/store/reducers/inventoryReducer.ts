import { InventoryItem } from '../../types/InventoryItem';
import { InventoryActionTypes } from '../actions/inventoryActionTypes';

// Define the shape of the inventory state
interface InventoryState {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
}

// Initial state for the inventory reducer
const initialState: InventoryState = {
  items: [],
  loading: false,
  error: null,
};

// Reducer function for handling inventory-related actions
const inventoryReducer = (
  state: InventoryState = initialState,
  action: InventoryActionTypes
): InventoryState => {
  switch (action.type) {
    case 'FETCH_INVENTORY_REQUEST':
      // Set loading to true and clear any previous errors
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'FETCH_INVENTORY_SUCCESS':
      // Update items array with fetched data and set loading to false
      return {
        ...state,
        items: action.payload,
        loading: false,
      };
    case 'FETCH_INVENTORY_FAILURE':
      // Set error message and set loading to false
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'UPDATE_INVENTORY_ITEM_REQUEST':
      // Set loading to true and clear any previous errors
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'UPDATE_INVENTORY_ITEM_SUCCESS':
      // Update specific item in items array and set loading to false
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item
        ),
        loading: false,
      };
    case 'UPDATE_INVENTORY_ITEM_FAILURE':
      // Set error message and set loading to false
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'ADD_INVENTORY_ITEM_REQUEST':
      // Set loading to true and clear any previous errors
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'ADD_INVENTORY_ITEM_SUCCESS':
      // Add new item to items array and set loading to false
      return {
        ...state,
        items: [...state.items, action.payload],
        loading: false,
      };
    case 'ADD_INVENTORY_ITEM_FAILURE':
      // Set error message and set loading to false
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      // Return default state for unknown actions
      return state;
  }
};

export default inventoryReducer;