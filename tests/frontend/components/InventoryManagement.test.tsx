import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import InventoryManagement from '../../src/frontend/components/InventoryManagement';
import { rootReducer } from '../../src/frontend/store/reducers';
import { fetchInventory, updateInventoryItem, addInventoryItem } from '../../src/frontend/store/actions/inventoryActions';

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
  const store = configureStore({ reducer: rootReducer, preloadedState: initialState });
  const rendered = render(
    <Provider store={store}>
      {component}
    </Provider>
  );
  return { ...rendered, store };
};

describe('InventoryManagement Component', () => {
  test('renders without crashing', () => {
    const { getByTestId } = renderWithRedux(<InventoryManagement />);
    expect(getByTestId('inventory-management')).toBeInTheDocument();
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
    const { getByText } = renderWithRedux(<InventoryManagement />, initialState);
    expect(getByText('Item 1')).toBeInTheDocument();
    expect(getByText('Item 2')).toBeInTheDocument();
  });

  test('handles search functionality', async () => {
    const initialState = {
      inventory: {
        items: [
          { id: 1, name: 'Apple', quantity: 10 },
          { id: 2, name: 'Banana', quantity: 20 },
        ],
        loading: false,
        error: null,
      },
    };
    const { getByPlaceholderText, queryByText } = renderWithRedux(<InventoryManagement />, initialState);
    const searchInput = getByPlaceholderText('Search inventory');
    fireEvent.change(searchInput, { target: { value: 'Apple' } });
    await waitFor(() => {
      expect(queryByText('Apple')).toBeInTheDocument();
      expect(queryByText('Banana')).not.toBeInTheDocument();
    });
  });

  test('handles inventory item update', async () => {
    const mockDispatch = jest.fn();
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);

    const initialState = {
      inventory: {
        items: [{ id: 1, name: 'Item 1', quantity: 10 }],
        loading: false,
        error: null,
      },
    };
    const { getByText, getByLabelText } = renderWithRedux(<InventoryManagement />, initialState);
    fireEvent.click(getByText('Update Quantity'));
    const quantityInput = getByLabelText('New Quantity');
    fireEvent.change(quantityInput, { target: { value: '15' } });
    fireEvent.click(getByText('Confirm'));
    
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(updateInventoryItem({ id: 1, quantity: 15 }));
    });
  });

  test('handles add new inventory item', async () => {
    const mockDispatch = jest.fn();
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);

    const { getByText, getByLabelText } = renderWithRedux(<InventoryManagement />);
    fireEvent.click(getByText('Add Item'));
    fireEvent.change(getByLabelText('Item Name'), { target: { value: 'New Item' } });
    fireEvent.change(getByLabelText('Quantity'), { target: { value: '5' } });
    fireEvent.click(getByText('Submit'));
    
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(addInventoryItem({ name: 'New Item', quantity: 5 }));
    });
  });

  test('fetches inventory on component mount', () => {
    const mockDispatch = jest.fn();
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);

    renderWithRedux(<InventoryManagement />);
    expect(mockDispatch).toHaveBeenCalledWith(fetchInventory());
  });

  test('displays loading state', () => {
    const initialState = {
      inventory: {
        items: [],
        loading: true,
        error: null,
      },
    };
    const { getByTestId } = renderWithRedux(<InventoryManagement />, initialState);
    expect(getByTestId('loading-indicator')).toBeInTheDocument();
  });

  test('displays error state', () => {
    const initialState = {
      inventory: {
        items: [],
        loading: false,
        error: 'Failed to fetch inventory',
      },
    };
    const { getByText } = renderWithRedux(<InventoryManagement />, initialState);
    expect(getByText('Failed to fetch inventory')).toBeInTheDocument();
  });

  test('handles pagination', async () => {
    const initialState = {
      inventory: {
        items: Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}`, quantity: 10 })),
        loading: false,
        error: null,
        currentPage: 1,
        itemsPerPage: 10,
      },
    };
    const { getByText, queryByText } = renderWithRedux(<InventoryManagement />, initialState);
    expect(getByText('Item 1')).toBeInTheDocument();
    expect(queryByText('Item 11')).not.toBeInTheDocument();

    fireEvent.click(getByText('Next'));
    await waitFor(() => {
      expect(queryByText('Item 1')).not.toBeInTheDocument();
      expect(getByText('Item 11')).toBeInTheDocument();
    });
  });
});