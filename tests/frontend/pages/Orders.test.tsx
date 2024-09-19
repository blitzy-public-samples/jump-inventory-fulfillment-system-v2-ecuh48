import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import Orders from '../../src/frontend/pages/Orders';
import rootReducer from '../../src/frontend/store/reducers';
import { fetchOrders, updateOrderStatus } from '../../src/frontend/store/actions/orderActions';

// Mock react-redux's useDispatch hook
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

// Mock react-router-dom's useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const mockStore = configureStore({ reducer: rootReducer });

// Helper function to render a component with Redux store and Router
const renderWithReduxAndRouter = (
  component: React.ReactElement,
  initialState: object
) => {
  const store = configureStore({ reducer: rootReducer, preloadedState: initialState });
  const rendered = render(
    <Provider store={store}>
      <MemoryRouter>{component}</MemoryRouter>
    </Provider>
  );
  return { ...rendered, store };
};

describe('Orders Page Component', () => {
  test('renders without crashing', () => {
    const { container } = renderWithReduxAndRouter(<Orders />, {});
    expect(container).toBeInTheDocument();
  });

  test('fetches orders on mount', async () => {
    const mockFetchOrders = jest.fn();
    jest.spyOn(require('../../src/frontend/store/actions/orderActions'), 'fetchOrders').mockImplementation(mockFetchOrders);

    renderWithReduxAndRouter(<Orders />, {});

    await waitFor(() => {
      expect(mockFetchOrders).toHaveBeenCalled();
    });
  });

  test('displays order list', () => {
    const initialState = {
      orders: {
        items: [
          { id: 1, customerName: 'John Doe', status: 'Pending' },
          { id: 2, customerName: 'Jane Smith', status: 'Shipped' },
        ],
        loading: false,
        error: null,
      },
    };

    renderWithReduxAndRouter(<Orders />, initialState);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  test('handles search functionality', () => {
    const initialState = {
      orders: {
        items: [
          { id: 1, customerName: 'John Doe', status: 'Pending' },
          { id: 2, customerName: 'Jane Smith', status: 'Shipped' },
        ],
        loading: false,
        error: null,
      },
    };

    renderWithReduxAndRouter(<Orders />, initialState);

    const searchInput = screen.getByPlaceholderText('Search orders...');
    fireEvent.change(searchInput, { target: { value: 'John' } });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  test('handles order status update', () => {
    const initialState = {
      orders: {
        items: [
          { id: 1, customerName: 'John Doe', status: 'Pending' },
        ],
        loading: false,
        error: null,
      },
    };

    const mockDispatch = jest.fn();
    (require('react-redux') as any).useDispatch.mockReturnValue(mockDispatch);

    renderWithReduxAndRouter(<Orders />, initialState);

    const updateButton = screen.getByText('Update Status');
    fireEvent.click(updateButton);

    expect(mockDispatch).toHaveBeenCalledWith(updateOrderStatus(1, 'Processing'));
  });

  test('navigates to order details', () => {
    const initialState = {
      orders: {
        items: [
          { id: 1, customerName: 'John Doe', status: 'Pending' },
        ],
        loading: false,
        error: null,
      },
    };

    const mockNavigate = jest.fn();
    (require('react-router-dom') as any).useNavigate.mockReturnValue(mockNavigate);

    renderWithReduxAndRouter(<Orders />, initialState);

    const viewDetailsButton = screen.getByText('View Details');
    fireEvent.click(viewDetailsButton);

    expect(mockNavigate).toHaveBeenCalledWith('/orders/1');
  });

  test('handles loading state', () => {
    const initialState = {
      orders: {
        items: [],
        loading: true,
        error: null,
      },
    };

    renderWithReduxAndRouter(<Orders />, initialState);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('handles error state', () => {
    const initialState = {
      orders: {
        items: [],
        loading: false,
        error: 'Failed to fetch orders',
      },
    };

    renderWithReduxAndRouter(<Orders />, initialState);

    expect(screen.getByText('Failed to fetch orders')).toBeInTheDocument();
  });

  test('handles pagination', async () => {
    const initialState = {
      orders: {
        items: Array.from({ length: 20 }, (_, i) => ({
          id: i + 1,
          customerName: `Customer ${i + 1}`,
          status: 'Pending',
        })),
        loading: false,
        error: null,
        totalPages: 2,
        currentPage: 1,
      },
    };

    renderWithReduxAndRouter(<Orders />, initialState);

    expect(screen.getByText('Customer 1')).toBeInTheDocument();
    expect(screen.queryByText('Customer 20')).not.toBeInTheDocument();

    const nextPageButton = screen.getByText('Next');
    fireEvent.click(nextPageButton);

    await waitFor(() => {
      expect(screen.queryByText('Customer 1')).not.toBeInTheDocument();
      expect(screen.getByText('Customer 20')).toBeInTheDocument();
    });
  });
});