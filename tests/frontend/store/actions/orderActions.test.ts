import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { fetchOrders, fetchOrderDetails, updateOrderStatus, createOrder } from '../../src/frontend/store/actions/orderActions';
import * as api from '../../src/frontend/utils/api';
import { OrderStatus } from '../../src/frontend/types/OrderStatus';

const mockStore = configureMockStore([thunk]);

// Mock API functions
jest.mock('../../src/frontend/utils/api', () => ({
  getOrders: jest.fn(),
  getOrderDetails: jest.fn(),
  updateOrderStatus: jest.fn(),
  createOrder: jest.fn(),
}));

describe('Order Actions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('fetchOrders', async () => {
    // Mock api.getOrders to return sample order data
    const sampleOrders = [{ id: 1, status: OrderStatus.PENDING }];
    (api.getOrders as jest.Mock).mockResolvedValue(sampleOrders);

    // Create a mock store
    const store = mockStore({});

    // Dispatch fetchOrders action
    await store.dispatch(fetchOrders() as any);

    // Assert that the correct actions were dispatched
    const actions = store.getActions();
    expect(actions[0].type).toBe('FETCH_ORDERS_REQUEST');
    expect(actions[1].type).toBe('FETCH_ORDERS_SUCCESS');

    // Assert that the payload contains the correct order data
    expect(actions[1].payload).toEqual(sampleOrders);
  });

  test('fetchOrders error handling', async () => {
    // Mock api.getOrders to throw an error
    const error = new Error('Failed to fetch orders');
    (api.getOrders as jest.Mock).mockRejectedValue(error);

    // Create a mock store
    const store = mockStore({});

    // Dispatch fetchOrders action
    await store.dispatch(fetchOrders() as any);

    // Assert that the correct actions were dispatched
    const actions = store.getActions();
    expect(actions[0].type).toBe('FETCH_ORDERS_REQUEST');
    expect(actions[1].type).toBe('FETCH_ORDERS_FAILURE');

    // Assert that the error payload is correct
    expect(actions[1].payload).toEqual(error.message);
  });

  test('fetchOrderDetails', async () => {
    // Mock api.getOrderDetails to return sample order details
    const orderId = 1;
    const sampleOrderDetails = { id: orderId, status: OrderStatus.PROCESSING, items: [] };
    (api.getOrderDetails as jest.Mock).mockResolvedValue(sampleOrderDetails);

    // Create a mock store
    const store = mockStore({});

    // Dispatch fetchOrderDetails action with an order ID
    await store.dispatch(fetchOrderDetails(orderId) as any);

    // Assert that the correct actions were dispatched
    const actions = store.getActions();
    expect(actions[0].type).toBe('FETCH_ORDER_DETAILS_REQUEST');
    expect(actions[1].type).toBe('FETCH_ORDER_DETAILS_SUCCESS');

    // Assert that the payload contains the correct order details
    expect(actions[1].payload).toEqual(sampleOrderDetails);
  });

  test('fetchOrderDetails error handling', async () => {
    // Mock api.getOrderDetails to throw an error
    const orderId = 1;
    const error = new Error('Failed to fetch order details');
    (api.getOrderDetails as jest.Mock).mockRejectedValue(error);

    // Create a mock store
    const store = mockStore({});

    // Dispatch fetchOrderDetails action with an order ID
    await store.dispatch(fetchOrderDetails(orderId) as any);

    // Assert that the correct actions were dispatched
    const actions = store.getActions();
    expect(actions[0].type).toBe('FETCH_ORDER_DETAILS_REQUEST');
    expect(actions[1].type).toBe('FETCH_ORDER_DETAILS_FAILURE');

    // Assert that the error payload is correct
    expect(actions[1].payload).toEqual(error.message);
  });

  test('updateOrderStatus', async () => {
    // Mock api.updateOrderStatus to return updated order data
    const orderId = 1;
    const newStatus = OrderStatus.SHIPPED;
    const updatedOrder = { id: orderId, status: newStatus };
    (api.updateOrderStatus as jest.Mock).mockResolvedValue(updatedOrder);

    // Create a mock store
    const store = mockStore({});

    // Dispatch updateOrderStatus action with an order ID and new status
    await store.dispatch(updateOrderStatus(orderId, newStatus) as any);

    // Assert that the correct actions were dispatched
    const actions = store.getActions();
    expect(actions[0].type).toBe('UPDATE_ORDER_STATUS_REQUEST');
    expect(actions[1].type).toBe('UPDATE_ORDER_STATUS_SUCCESS');

    // Assert that the payload contains the correct updated order data
    expect(actions[1].payload).toEqual(updatedOrder);
  });

  test('updateOrderStatus error handling', async () => {
    // Mock api.updateOrderStatus to throw an error
    const orderId = 1;
    const newStatus = OrderStatus.SHIPPED;
    const error = new Error('Failed to update order status');
    (api.updateOrderStatus as jest.Mock).mockRejectedValue(error);

    // Create a mock store
    const store = mockStore({});

    // Dispatch updateOrderStatus action with an order ID and new status
    await store.dispatch(updateOrderStatus(orderId, newStatus) as any);

    // Assert that the correct actions were dispatched
    const actions = store.getActions();
    expect(actions[0].type).toBe('UPDATE_ORDER_STATUS_REQUEST');
    expect(actions[1].type).toBe('UPDATE_ORDER_STATUS_FAILURE');

    // Assert that the error payload is correct
    expect(actions[1].payload).toEqual(error.message);
  });

  test('createOrder', async () => {
    // Mock api.createOrder to return new order data
    const newOrderData = { items: [{ productId: 1, quantity: 2 }] };
    const createdOrder = { id: 1, ...newOrderData, status: OrderStatus.PENDING };
    (api.createOrder as jest.Mock).mockResolvedValue(createdOrder);

    // Create a mock store
    const store = mockStore({});

    // Dispatch createOrder action with order data
    await store.dispatch(createOrder(newOrderData) as any);

    // Assert that the correct actions were dispatched
    const actions = store.getActions();
    expect(actions[0].type).toBe('CREATE_ORDER_REQUEST');
    expect(actions[1].type).toBe('CREATE_ORDER_SUCCESS');

    // Assert that the payload contains the correct new order data
    expect(actions[1].payload).toEqual(createdOrder);
  });

  test('createOrder error handling', async () => {
    // Mock api.createOrder to throw an error
    const newOrderData = { items: [{ productId: 1, quantity: 2 }] };
    const error = new Error('Failed to create order');
    (api.createOrder as jest.Mock).mockRejectedValue(error);

    // Create a mock store
    const store = mockStore({});

    // Dispatch createOrder action with order data
    await store.dispatch(createOrder(newOrderData) as any);

    // Assert that the correct actions were dispatched
    const actions = store.getActions();
    expect(actions[0].type).toBe('CREATE_ORDER_REQUEST');
    expect(actions[1].type).toBe('CREATE_ORDER_FAILURE');

    // Assert that the error payload is correct
    expect(actions[1].payload).toEqual(error.message);
  });
});