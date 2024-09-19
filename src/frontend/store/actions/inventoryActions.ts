import { Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { RootState } from '../types';
import { InventoryItem } from '../../types/InventoryItem';
import { api } from '../../utils/api';

// Action type constants
const FETCH_INVENTORY_REQUEST = 'FETCH_INVENTORY_REQUEST';
const FETCH_INVENTORY_SUCCESS = 'FETCH_INVENTORY_SUCCESS';
const FETCH_INVENTORY_FAILURE = 'FETCH_INVENTORY_FAILURE';
const UPDATE_INVENTORY_ITEM_REQUEST = 'UPDATE_INVENTORY_ITEM_REQUEST';
const UPDATE_INVENTORY_ITEM_SUCCESS = 'UPDATE_INVENTORY_ITEM_SUCCESS';
const UPDATE_INVENTORY_ITEM_FAILURE = 'UPDATE_INVENTORY_ITEM_FAILURE';
const ADD_INVENTORY_ITEM_REQUEST = 'ADD_INVENTORY_ITEM_REQUEST';
const ADD_INVENTORY_ITEM_SUCCESS = 'ADD_INVENTORY_ITEM_SUCCESS';
const ADD_INVENTORY_ITEM_FAILURE = 'ADD_INVENTORY_ITEM_FAILURE';

// Thunk action creator to fetch inventory items from the server
export const fetchInventory = (): ThunkAction<Promise<void>, RootState, unknown, any> => {
  return async (dispatch: Dispatch) => {
    try {
      // Dispatch FETCH_INVENTORY_REQUEST action
      dispatch({ type: FETCH_INVENTORY_REQUEST });

      // Make API call to fetch inventory items
      const inventoryItems = await api.getInventory();

      // Dispatch FETCH_INVENTORY_SUCCESS action with fetched inventory items
      dispatch({
        type: FETCH_INVENTORY_SUCCESS,
        payload: inventoryItems,
      });
    } catch (error) {
      // Dispatch FETCH_INVENTORY_FAILURE action with error message
      dispatch({
        type: FETCH_INVENTORY_FAILURE,
        payload: error.message,
      });
    }
  };
};

// Thunk action creator to update an inventory item
export const updateInventoryItem = (
  itemId: string,
  updateData: Partial<InventoryItem>
): ThunkAction<Promise<void>, RootState, unknown, any> => {
  return async (dispatch: Dispatch) => {
    try {
      // Dispatch UPDATE_INVENTORY_ITEM_REQUEST action
      dispatch({ type: UPDATE_INVENTORY_ITEM_REQUEST });

      // Make API call to update inventory item
      const updatedItem = await api.updateInventoryItem(itemId, updateData);

      // Dispatch UPDATE_INVENTORY_ITEM_SUCCESS action with updated inventory item
      dispatch({
        type: UPDATE_INVENTORY_ITEM_SUCCESS,
        payload: updatedItem,
      });
    } catch (error) {
      // Dispatch UPDATE_INVENTORY_ITEM_FAILURE action with error message
      dispatch({
        type: UPDATE_INVENTORY_ITEM_FAILURE,
        payload: error.message,
      });
    }
  };
};

// Thunk action creator to add a new inventory item
export const addInventoryItem = (
  newItem: InventoryItem
): ThunkAction<Promise<void>, RootState, unknown, any> => {
  return async (dispatch: Dispatch) => {
    try {
      // Dispatch ADD_INVENTORY_ITEM_REQUEST action
      dispatch({ type: ADD_INVENTORY_ITEM_REQUEST });

      // Make API call to add new inventory item
      const addedItem = await api.addInventoryItem(newItem);

      // Dispatch ADD_INVENTORY_ITEM_SUCCESS action with added inventory item
      dispatch({
        type: ADD_INVENTORY_ITEM_SUCCESS,
        payload: addedItem,
      });
    } catch (error) {
      // Dispatch ADD_INVENTORY_ITEM_FAILURE action with error message
      dispatch({
        type: ADD_INVENTORY_ITEM_FAILURE,
        payload: error.message,
      });
    }
  };
};