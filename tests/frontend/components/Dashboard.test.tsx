import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Dashboard from '../../src/frontend/components/Dashboard';
import rootReducer from '../../src/frontend/store/reducers';

// Mock the useDispatch hook
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

// Create a mock store
const mockStore = configureStore({ reducer: rootReducer });

// Helper function to render a component with Redux store
const renderWithRedux = (
  component: React.ReactElement,
  initialState: object = {}
) => {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: initialState,
  });
  return {
    ...render(<Provider store={store}>{component}</Provider>),
    store,
  };
};

describe('Dashboard Component', () => {
  test('renders without crashing', () => {
    renderWithRedux(<Dashboard />);
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });

  test('displays correct user name', () => {
    const initialState = {
      user: { name: 'John Doe' },
    };
    renderWithRedux(<Dashboard />, initialState);
    expect(screen.getByText('Welcome, John Doe')).toBeInTheDocument();
  });

  test('displays order summary', () => {
    const initialState = {
      orders: {
        summary: {
          total: 100,
          pending: 20,
          completed: 80,
        },
      },
    };
    renderWithRedux(<Dashboard />, initialState);
    expect(screen.getByText('Total Orders: 100')).toBeInTheDocument();
    expect(screen.getByText('Pending Orders: 20')).toBeInTheDocument();
    expect(screen.getByText('Completed Orders: 80')).toBeInTheDocument();
  });

  test('displays inventory summary', () => {
    const initialState = {
      inventory: {
        summary: {
          total: 1000,
          lowStock: 50,
        },
      },
    };
    renderWithRedux(<Dashboard />, initialState);
    expect(screen.getByText('Total Items: 1000')).toBeInTheDocument();
    expect(screen.getByText('Low Stock Items: 50')).toBeInTheDocument();
  });

  test('displays recent activity', () => {
    const initialState = {
      activity: {
        recent: [
          { id: 1, description: 'Order #1234 fulfilled' },
          { id: 2, description: 'New inventory added' },
        ],
      },
    };
    renderWithRedux(<Dashboard />, initialState);
    expect(screen.getByText('Order #1234 fulfilled')).toBeInTheDocument();
    expect(screen.getByText('New inventory added')).toBeInTheDocument();
  });

  test('handles start fulfillment action', () => {
    const mockDispatch = jest.fn();
    (require('react-redux') as any).useDispatch.mockReturnValue(mockDispatch);

    renderWithRedux(<Dashboard />);
    fireEvent.click(screen.getByText('Start Fulfillment'));
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'START_FULFILLMENT' });
  });

  test('handles add inventory action', () => {
    const mockDispatch = jest.fn();
    (require('react-redux') as any).useDispatch.mockReturnValue(mockDispatch);

    renderWithRedux(<Dashboard />);
    fireEvent.click(screen.getByText('Add Inventory'));
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'ADD_INVENTORY' });
  });

  test('handles generate report action', () => {
    const mockDispatch = jest.fn();
    (require('react-redux') as any).useDispatch.mockReturnValue(mockDispatch);

    renderWithRedux(<Dashboard />);
    fireEvent.click(screen.getByText('Generate Report'));
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'GENERATE_REPORT' });
  });
});