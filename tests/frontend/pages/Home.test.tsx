import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import Home from '../../src/frontend/pages/Home';
import { rootReducer } from '../../src/frontend/store/reducers';
import { fetchDashboardData } from '../../src/frontend/store/actions/dashboardActions';

// Mock the react-redux hooks
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

// Create a mock store
const mockStore = configureStore({ reducer: rootReducer });

// Helper function to render a component with Redux store and Router
const renderWithReduxAndRouter = (
  component: React.ReactElement,
  initialState: object = {}
) => {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: initialState,
  });

  return {
    ...render(
      <Provider store={store}>
        <MemoryRouter>{component}</MemoryRouter>
      </Provider>
    ),
    store,
  };
};

describe('Home Page Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    renderWithReduxAndRouter(<Home />);
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  test('displays welcome message with user name', () => {
    const initialState = {
      user: { name: 'John Doe' },
    };
    renderWithReduxAndRouter(<Home />, initialState);
    expect(screen.getByText(/Welcome, John Doe/i)).toBeInTheDocument();
  });

  test('fetches dashboard data on mount', () => {
    const mockDispatch = jest.fn();
    (require('react-redux').useDispatch as jest.Mock).mockReturnValue(mockDispatch);

    renderWithReduxAndRouter(<Home />);
    expect(mockDispatch).toHaveBeenCalledWith(fetchDashboardData());
  });

  test('displays OrderSummary component', () => {
    renderWithReduxAndRouter(<Home />);
    expect(screen.getByTestId('order-summary')).toBeInTheDocument();
  });

  test('displays InventorySummary component', () => {
    renderWithReduxAndRouter(<Home />);
    expect(screen.getByTestId('inventory-summary')).toBeInTheDocument();
  });

  test('displays RecentActivity component', () => {
    renderWithReduxAndRouter(<Home />);
    expect(screen.getByTestId('recent-activity')).toBeInTheDocument();
  });

  test('displays QuickActions component', () => {
    renderWithReduxAndRouter(<Home />);
    expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
  });

  test('handles loading state', () => {
    const initialState = {
      dashboard: { loading: true },
    };
    renderWithReduxAndRouter(<Home />, initialState);
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  test('handles error state', () => {
    const initialState = {
      dashboard: { error: 'An error occurred' },
    };
    renderWithReduxAndRouter(<Home />, initialState);
    expect(screen.getByText('An error occurred')).toBeInTheDocument();
  });
});