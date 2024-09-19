import { Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { RootState } from '../types';
import { Order } from '../../types/Order';
import { OrderStatus } from '../../types/OrderStatus';
import { api } from '../../utils/api';

// Action type constants
const FETCH_ORDERS_REQUEST = 'FETCH_ORDERS_REQUEST';
const FETCH_ORDERS_SUCCESS = 'FETCH_ORDERS_SUCCESS';
const FETCH_ORDERS_FAILURE = 'FETCH_ORDERS_FAILURE';
const FETCH_ORDER_DETAILS_REQUEST = 'FETCH_ORDER_DETAILS_REQUEST';
const FETCH_ORDER_DETAILS_SUCCESS = 'FETCH_ORDER_DETAILS_SUCCESS';
const FETCH_ORDER_DETAILS_FAILURE = 'FETCH_ORDER_DETAILS_FAILURE';
const UPDATE_ORDER_STATUS_REQUEST = 'UPDATE_ORDER_STATUS_REQUEST';
const UPDATE_ORDER_STATUS_SUCCESS = 'UPDATE_ORDER_STATUS_SUCCESS';
const UPDATE_ORDER_STATUS_FAILURE = 'UPDATE_ORDER_STATUS_FAILURE';
const CREATE_ORDER_REQUEST = 'CREATE_ORDER_REQUEST';
const CREATE_ORDER_SUCCESS = 'CREATE_ORDER_SUCCESS';
const CREATE_ORDER_FAILURE = 'CREATE_ORDER_FAILURE';

// Thunk action creator to fetch orders from the server
export const fetchOrders = (): ThunkAction<Promise<void>, RootState, unknown, any> => {
  return async (dispatch: Dispatch) => {
    try {
      // Dispatch FETCH_ORDERS_REQUEST action
      dispatch({ type: FETCH_ORDERS_REQUEST });

      // Make API call to fetch orders using api.getOrders()
      const orders = await api.getOrders();

      // If successful, dispatch FETCH_ORDERS_SUCCESS action with fetched orders
      dispatch({
        type: FETCH_ORDERS_SUCCESS,
        payload: orders,
      });
    } catch (error) {
      // If error occurs, dispatch FETCH_ORDERS_FAILURE action with error message
      dispatch({
        type: FETCH_ORDERS_FAILURE,
        payload: error.message,
      });
    }
  };
};

// Thunk action creator to fetch details of a specific order
export const fetchOrderDetails = (
  orderId: string
): ThunkAction<Promise<void>, RootState, unknown, any> => {
  return async (dispatch: Dispatch) => {
    try {
      // Dispatch FETCH_ORDER_DETAILS_REQUEST action
      dispatch({ type: FETCH_ORDER_DETAILS_REQUEST });

      // Make API call to fetch order details using api.getOrderDetails(orderId)
      const orderDetails = await api.getOrderDetails(orderId);

      // If successful, dispatch FETCH_ORDER_DETAILS_SUCCESS action with fetched order details
      dispatch({
        type: FETCH_ORDER_DETAILS_SUCCESS,
        payload: orderDetails,
      });
    } catch (error) {
      // If error occurs, dispatch FETCH_ORDER_DETAILS_FAILURE action with error message
      dispatch({
        type: FETCH_ORDER_DETAILS_FAILURE,
        payload: error.message,
      });
    }
  };
};

// Thunk action creator to update the status of an order
export const updateOrderStatus = (
  orderId: string,
  newStatus: OrderStatus
): ThunkAction<Promise<void>, RootState, unknown, any> => {
  return async (dispatch: Dispatch) => {
    try {
      // Dispatch UPDATE_ORDER_STATUS_REQUEST action
      dispatch({ type: UPDATE_ORDER_STATUS_REQUEST });

      // Make API call to update order status using api.updateOrderStatus(orderId, newStatus)
      const updatedOrder = await api.updateOrderStatus(orderId, newStatus);

      // If successful, dispatch UPDATE_ORDER_STATUS_SUCCESS action with updated order
      dispatch({
        type: UPDATE_ORDER_STATUS_SUCCESS,
        payload: updatedOrder,
      });
    } catch (error) {
      // If error occurs, dispatch UPDATE_ORDER_STATUS_FAILURE action with error message
      dispatch({
        type: UPDATE_ORDER_STATUS_FAILURE,
        payload: error.message,
      });
    }
  };
};

// Thunk action creator to create a new order
export const createOrder = (
  orderData: Order
): ThunkAction<Promise<void>, RootState, unknown, any> => {
  return async (dispatch: Dispatch) => {
    try {
      // Dispatch CREATE_ORDER_REQUEST action
      dispatch({ type: CREATE_ORDER_REQUEST });

      // Make API call to create new order using api.createOrder(orderData)
      const createdOrder = await api.createOrder(orderData);

      // If successful, dispatch CREATE_ORDER_SUCCESS action with created order
      dispatch({
        type: CREATE_ORDER_SUCCESS,
        payload: createdOrder,
      });
    } catch (error) {
      // If error occurs, dispatch CREATE_ORDER_FAILURE action with error message
      dispatch({
        type: CREATE_ORDER_FAILURE,
        payload: error.message,
      });
    }
  };
};