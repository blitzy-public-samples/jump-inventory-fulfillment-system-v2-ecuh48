import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import Inventory from '../../src/frontend/pages/Inventory';
import { rootReducer } from '../../src/frontend/store/reducers';
import { fetchInventory, updateInventoryItem, addInventoryItem } from '../../src/frontend/store/actions/inventoryActions';

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

// Helper function to render component with Redux and Router
const renderWithReduxAndRouter = (
  component: React.ReactElement,
  initialState: object = {}
) => {
  const store = configureStore({ reducer: rootReducer, preloadedState: initialState });
  return {
    ...render(
      <Provider store={store}>
        <MemoryRouter>{component}</MemoryRouter>
      </Provider>
    ),
    store,
  };
};

describe('Inventory Page Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    renderWithReduxAndRouter(<Inventory />);
    expect(screen.getByTestId('inventory-page')).toBeInTheDocument();
  });

  test('fetches inventory on mount', async () => {
    const mockFetchInventory = jest.fn();
    jest.spyOn(require('../../src/frontend/store/actions/inventoryActions'), 'fetchInventory').mockImplementation(mockFetchInventory);

    renderWithReduxAndRouter(<Inventory />);

    await waitFor(() => {
      expect(mockFetchInventory).toHaveBeenCalledTimes(1);
    });
  });

  test('displays inventory list', () => {
    const initialState = {
      inventory: {
        items: [
          { id: 1, name: 'Item 1', quantity: 10 },
          { id: 2, name: 'Item 2', quantity: 20 },
        ],
        loading: false,
        error: null,
      },
    };

    renderWithReduxAndRouter(<Inventory />, initialState);

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  test('handles search functionality', () => {
    const initialState = {
      inventory: {
        items: [
          { id: 1, name: 'Apple', quantity: 10 },
          { id: 2, name: 'Banana', quantity: 20 },
          { id: 3, name: 'Orange', quantity: 15 },
        ],
        loading: false,
        error: null,
      },
    };

    renderWithReduxAndRouter(<Inventory />, initialState);

    const searchInput = screen.getByPlaceholderText('Search inventory');
    fireEvent.change(searchInput, { target: { value: 'ban' } });

    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    expect(screen.queryByText('Orange')).not.toBeInTheDocument();
  });

  test('handles inventory item update', async () => {
    const initialState = {
      inventory: {
        items: [{ id: 1, name: 'Item 1', quantity: 10 }],
        loading: false,
        error: null,
      },
    };

    const { store } = renderWithReduxAndRouter(<Inventory />, initialState);

    const updateButton = screen.getByText('Update Quantity');
    fireEvent.click(updateButton);

    const quantityInput = screen.getByLabelText('New Quantity');
    fireEvent.change(quantityInput, { target: { value: '15' } });

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      const actions = store.getActions();
      expect(actions).toContainEqual(updateInventoryItem({ id: 1, quantity: 15 }));
    });
  });

  test('handles adding new inventory item', async () => {
    const { store } = renderWithReduxAndRouter(<Inventory />);

    const addButton = screen.getByText('Add Item');
    fireEvent.click(addButton);

    const nameInput = screen.getByLabelText('Item Name');
    const quantityInput = screen.getByLabelText('Quantity');
    fireEvent.change(nameInput, { target: { value: 'New Item' } });
    fireEvent.change(quantityInput, { target: { value: '5' } });

    const submitButton = screen.getByText('Add');
    fireEvent.click(submitButton);

    await waitFor(() => {
      const actions = store.getActions();
      expect(actions).toContainEqual(addInventoryItem({ name: 'New Item', quantity: 5 }));
    });
  });

  test('handles loading state', () => {
    const initialState = {
      inventory: {
        items: [],
        loading: true,
        error: null,
      },
    };

    renderWithReduxAndRouter(<Inventory />, initialState);

    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  test('handles error state', () => {
    const initialState = {
      inventory: {
        items: [],
        loading: false,
        error: 'Failed to fetch inventory',
      },
    };

    renderWithReduxAndRouter(<Inventory />, initialState);

    expect(screen.getByText('Failed to fetch inventory')).toBeInTheDocument();
  });

  test('handles pagination', async () => {
    const initialState = {
      inventory: {
        items: Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}`, quantity: 10 })),
        loading: false,
        error: null,
        totalPages: 3,
        currentPage: 1,
      },
    };

    renderWithReduxAndRouter(<Inventory />, initialState);

    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.queryByText('Item 11')).not.toBeInTheDocument();

    const nextPageButton = screen.getByText('Next');
    fireEvent.click(nextPageButton);

    await waitFor(() => {
      expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
      expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
      expect(screen.getByText('Item 11')).toBeInTheDocument();
    });
  });
});