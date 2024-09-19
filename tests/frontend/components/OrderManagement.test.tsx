import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import OrderManagement from '../../src/frontend/components/OrderManagement';
import rootReducer from '../../src/frontend/store/reducers';
import { fetchOrders, updateOrderStatus } from '../../src/frontend/store/actions/orderActions';

// Mock react-redux hooks
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

// Mock react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const mockStore = configureStore({ reducer: rootReducer });

// Helper function to render a component with Redux store
const renderWithRedux = (
  component: React.ReactElement,
  initialState: object = {}
) => {
  const store = configureStore({ reducer: rootReducer, preloadedState: initialState });
  const rendered = render(
    <Provider store={store}>
      {component}
    </Provider>
  );
  return { ...rendered, store };
};

describe('OrderManagement Component', () => {
  test('renders without crashing', () => {
    const { getByTestId } = renderWithRedux(<OrderManagement />);
    expect(getByTestId('order-management')).toBeInTheDocument();
  });

  test('displays order list', () => {
    const initialState = {
      orders: {
        items: [
          { id: '1', customerName: 'John Doe', status: 'Pending' },
          { id: '2', customerName: 'Jane Smith', status: 'Shipped' },
        ],
        loading: false,
        error: null,
      },
    };
    const { getByText } = renderWithRedux(<OrderManagement />, initialState);
    expect(getByText('John Doe')).toBeInTheDocument();
    expect(getByText('Jane Smith')).toBeInTheDocument();
  });

  test('handles search functionality', async () => {
    const initialState = {
      orders: {
        items: [
          { id: '1', customerName: 'John Doe', status: 'Pending' },
          { id: '2', customerName: 'Jane Smith', status: 'Shipped' },
        ],
        loading: false,
        error: null,
      },
    };
    const { getByPlaceholderText, queryByText } = renderWithRedux(<OrderManagement />, initialState);
    const searchInput = getByPlaceholderText('Search orders...');
    fireEvent.change(searchInput, { target: { value: 'John' } });
    await waitFor(() => {
      expect(queryByText('John Doe')).toBeInTheDocument();
      expect(queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  test('handles order status update', async () => {
    const mockDispatch = jest.fn();
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);

    const initialState = {
      orders: {
        items: [
          { id: '1', customerName: 'John Doe', status: 'Pending' },
        ],
        loading: false,
        error: null,
      },
    };
    const { getByText } = renderWithRedux(<OrderManagement />, initialState);
    const updateButton = getByText('Update Status');
    fireEvent.click(updateButton);
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(updateOrderStatus('1', 'Processing'));
    });
  });

  test('handles view order details', () => {
    const mockNavigate = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    const initialState = {
      orders: {
        items: [
          { id: '1', customerName: 'John Doe', status: 'Pending' },
        ],
        loading: false,
        error: null,
      },
    };
    const { getByText } = renderWithRedux(<OrderManagement />, initialState);
    const viewDetailsButton = getByText('View Details');
    fireEvent.click(viewDetailsButton);
    expect(mockNavigate).toHaveBeenCalledWith('/order/1');
  });

  test('fetches orders on component mount', () => {
    const mockDispatch = jest.fn();
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);

    renderWithRedux(<OrderManagement />);
    expect(mockDispatch).toHaveBeenCalledWith(fetchOrders());
  });

  test('displays loading state', () => {
    const initialState = {
      orders: {
        items: [],
        loading: true,
        error: null,
      },
    };
    const { getByTestId } = renderWithRedux(<OrderManagement />, initialState);
    expect(getByTestId('loading-indicator')).toBeInTheDocument();
  });

  test('displays error state', () => {
    const initialState = {
      orders: {
        items: [],
        loading: false,
        error: 'Failed to fetch orders',
      },
    };
    const { getByText } = renderWithRedux(<OrderManagement />, initialState);
    expect(getByText('Failed to fetch orders')).toBeInTheDocument();
  });
});