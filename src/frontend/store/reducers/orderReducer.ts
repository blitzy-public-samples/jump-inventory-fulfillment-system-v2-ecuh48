import { Order } from '../../types/Order';
import { OrderActionTypes } from '../actions/orderActionTypes';

// Define the initial state for the order reducer
const initialState: OrderState = {
  orders: [],
  loading: false,
  error: null,
  selectedOrder: null,
};

// Define the OrderState interface
interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  selectedOrder: Order | null;
}

// Define the order reducer function
const orderReducer = (state: OrderState = initialState, action: OrderActionTypes): OrderState => {
  switch (action.type) {
    case 'FETCH_ORDERS_REQUEST':
      // Set loading to true and clear any previous errors
      return { ...state, loading: true, error: null };

    case 'FETCH_ORDERS_SUCCESS':
      // Update orders array and set loading to false
      return { ...state, loading: false, orders: action.payload };

    case 'FETCH_ORDERS_FAILURE':
      // Set error message and set loading to false
      return { ...state, loading: false, error: action.payload };

    case 'FETCH_ORDER_DETAILS_REQUEST':
      // Set loading to true and clear any previous errors
      return { ...state, loading: true, error: null };

    case 'FETCH_ORDER_DETAILS_SUCCESS':
      // Update selectedOrder and set loading to false
      return { ...state, loading: false, selectedOrder: action.payload };

    case 'FETCH_ORDER_DETAILS_FAILURE':
      // Set error message and set loading to false
      return { ...state, loading: false, error: action.payload };

    case 'UPDATE_ORDER_STATUS_REQUEST':
      // Set loading to true and clear any previous errors
      return { ...state, loading: true, error: null };

    case 'UPDATE_ORDER_STATUS_SUCCESS':
      // Update order in orders array and selectedOrder if applicable
      const updatedOrders = state.orders.map(order =>
        order.id === action.payload.id ? action.payload : order
      );
      const updatedSelectedOrder = state.selectedOrder && state.selectedOrder.id === action.payload.id
        ? action.payload
        : state.selectedOrder;
      return {
        ...state,
        loading: false,
        orders: updatedOrders,
        selectedOrder: updatedSelectedOrder,
      };

    case 'UPDATE_ORDER_STATUS_FAILURE':
      // Set error message and set loading to false
      return { ...state, loading: false, error: action.payload };

    case 'CREATE_ORDER_REQUEST':
      // Set loading to true and clear any previous errors
      return { ...state, loading: true, error: null };

    case 'CREATE_ORDER_SUCCESS':
      // Add new order to orders array and set loading to false
      return {
        ...state,
        loading: false,
        orders: [...state.orders, action.payload],
      };

    case 'CREATE_ORDER_FAILURE':
      // Set error message and set loading to false
      return { ...state, loading: false, error: action.payload };

    default:
      // Return default state for unknown actions
      return state;
  }
};

export default orderReducer;