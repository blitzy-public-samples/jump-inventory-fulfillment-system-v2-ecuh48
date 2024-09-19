import { orderReducer } from '../../src/frontend/store/reducers/orderReducer';
import { OrderActionTypes } from '../../src/frontend/store/actions/orderActionTypes';
import { OrderState } from '../../src/frontend/types/OrderState';
import { Order } from '../../src/frontend/types/Order';
import { OrderStatus } from '../../src/frontend/types/OrderStatus';

describe('Order Reducer', () => {
  // Initial state for testing
  const initialState: OrderState = {
    orders: [],
    selectedOrder: null,
    loading: false,
    error: null,
  };

  it('should return the initial state', () => {
    expect(orderReducer(undefined, {} as any)).toEqual(initialState);
  });

  it('should handle FETCH_ORDERS_REQUEST', () => {
    const action = { type: OrderActionTypes.FETCH_ORDERS_REQUEST };
    const newState = orderReducer(initialState, action);
    expect(newState.loading).toBe(true);
    expect(newState.error).toBeNull();
  });

  it('should handle FETCH_ORDERS_SUCCESS', () => {
    const initialStateWithLoading = { ...initialState, loading: true };
    const sampleOrders: Order[] = [
      { id: '1', customerId: 'C1', status: OrderStatus.PENDING, items: [] },
      { id: '2', customerId: 'C2', status: OrderStatus.PROCESSING, items: [] },
    ];
    const action = { type: OrderActionTypes.FETCH_ORDERS_SUCCESS, payload: sampleOrders };
    const newState = orderReducer(initialStateWithLoading, action);
    expect(newState.loading).toBe(false);
    expect(newState.error).toBeNull();
    expect(newState.orders).toEqual(sampleOrders);
  });

  it('should handle FETCH_ORDERS_FAILURE', () => {
    const initialStateWithLoading = { ...initialState, loading: true };
    const errorMessage = 'Failed to fetch orders';
    const action = { type: OrderActionTypes.FETCH_ORDERS_FAILURE, payload: errorMessage };
    const newState = orderReducer(initialStateWithLoading, action);
    expect(newState.loading).toBe(false);
    expect(newState.error).toBe(errorMessage);
  });

  it('should handle FETCH_ORDER_DETAILS_REQUEST', () => {
    const action = { type: OrderActionTypes.FETCH_ORDER_DETAILS_REQUEST };
    const newState = orderReducer(initialState, action);
    expect(newState.loading).toBe(true);
    expect(newState.error).toBeNull();
  });

  it('should handle FETCH_ORDER_DETAILS_SUCCESS', () => {
    const initialStateWithLoading = { ...initialState, loading: true };
    const sampleOrderDetail: Order = { id: '1', customerId: 'C1', status: OrderStatus.PENDING, items: [] };
    const action = { type: OrderActionTypes.FETCH_ORDER_DETAILS_SUCCESS, payload: sampleOrderDetail };
    const newState = orderReducer(initialStateWithLoading, action);
    expect(newState.loading).toBe(false);
    expect(newState.error).toBeNull();
    expect(newState.selectedOrder).toEqual(sampleOrderDetail);
  });

  it('should handle FETCH_ORDER_DETAILS_FAILURE', () => {
    const initialStateWithLoading = { ...initialState, loading: true };
    const errorMessage = 'Failed to fetch order details';
    const action = { type: OrderActionTypes.FETCH_ORDER_DETAILS_FAILURE, payload: errorMessage };
    const newState = orderReducer(initialStateWithLoading, action);
    expect(newState.loading).toBe(false);
    expect(newState.error).toBe(errorMessage);
  });

  it('should handle UPDATE_ORDER_STATUS_REQUEST', () => {
    const action = { type: OrderActionTypes.UPDATE_ORDER_STATUS_REQUEST };
    const newState = orderReducer(initialState, action);
    expect(newState.loading).toBe(true);
    expect(newState.error).toBeNull();
  });

  it('should handle UPDATE_ORDER_STATUS_SUCCESS', () => {
    const existingOrders: Order[] = [
      { id: '1', customerId: 'C1', status: OrderStatus.PENDING, items: [] },
      { id: '2', customerId: 'C2', status: OrderStatus.PROCESSING, items: [] },
    ];
    const initialStateWithOrders = { ...initialState, orders: existingOrders };
    const updatedOrder: Order = { id: '1', customerId: 'C1', status: OrderStatus.COMPLETED, items: [] };
    const action = { type: OrderActionTypes.UPDATE_ORDER_STATUS_SUCCESS, payload: updatedOrder };
    const newState = orderReducer(initialStateWithOrders, action);
    expect(newState.loading).toBe(false);
    expect(newState.error).toBeNull();
    expect(newState.orders).toEqual([updatedOrder, existingOrders[1]]);
  });

  it('should handle UPDATE_ORDER_STATUS_FAILURE', () => {
    const initialStateWithLoading = { ...initialState, loading: true };
    const errorMessage = 'Failed to update order status';
    const action = { type: OrderActionTypes.UPDATE_ORDER_STATUS_FAILURE, payload: errorMessage };
    const newState = orderReducer(initialStateWithLoading, action);
    expect(newState.loading).toBe(false);
    expect(newState.error).toBe(errorMessage);
  });

  it('should handle CREATE_ORDER_REQUEST', () => {
    const action = { type: OrderActionTypes.CREATE_ORDER_REQUEST };
    const newState = orderReducer(initialState, action);
    expect(newState.loading).toBe(true);
    expect(newState.error).toBeNull();
  });

  it('should handle CREATE_ORDER_SUCCESS', () => {
    const existingOrders: Order[] = [
      { id: '1', customerId: 'C1', status: OrderStatus.PENDING, items: [] },
    ];
    const initialStateWithOrders = { ...initialState, orders: existingOrders };
    const newOrder: Order = { id: '2', customerId: 'C2', status: OrderStatus.PENDING, items: [] };
    const action = { type: OrderActionTypes.CREATE_ORDER_SUCCESS, payload: newOrder };
    const newState = orderReducer(initialStateWithOrders, action);
    expect(newState.loading).toBe(false);
    expect(newState.error).toBeNull();
    expect(newState.orders).toEqual([...existingOrders, newOrder]);
  });

  it('should handle CREATE_ORDER_FAILURE', () => {
    const initialStateWithLoading = { ...initialState, loading: true };
    const errorMessage = 'Failed to create order';
    const action = { type: OrderActionTypes.CREATE_ORDER_FAILURE, payload: errorMessage };
    const newState = orderReducer(initialStateWithLoading, action);
    expect(newState.loading).toBe(false);
    expect(newState.error).toBe(errorMessage);
  });
});