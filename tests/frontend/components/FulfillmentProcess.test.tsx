import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { FulfillmentProcess } from '../../src/frontend/components/FulfillmentProcess';
import { rootReducer } from '../../src/frontend/store/reducers';
import { fetchOrderDetails, updateOrderStatus } from '../../src/frontend/store/actions/orderActions';
import { updateInventoryItem } from '../../src/frontend/store/actions/inventoryActions';
import { generateShippingLabel } from '../../src/frontend/store/actions/shippingActions';

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

// Helper function to render a component with Redux store and Router
const renderWithReduxAndRouter = (
  component: React.ReactElement,
  initialState: object,
  initialRoute: string
) => {
  const store = configureStore({ reducer: rootReducer, preloadedState: initialState });
  const rendered = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="*" element={component} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
  return { ...rendered, store };
};

describe('FulfillmentProcess Component', () => {
  test('renders without crashing', () => {
    const { getByTestId } = renderWithReduxAndRouter(<FulfillmentProcess />, {}, '/fulfillment/1');
    expect(getByTestId('fulfillment-process')).toBeInTheDocument();
  });

  test('fetches order details on mount', async () => {
    const mockFetchOrderDetails = jest.fn();
    jest.spyOn(require('../../src/frontend/store/actions/orderActions'), 'fetchOrderDetails').mockImplementation(mockFetchOrderDetails);

    renderWithReduxAndRouter(<FulfillmentProcess />, {}, '/fulfillment/1');

    await waitFor(() => {
      expect(mockFetchOrderDetails).toHaveBeenCalledWith('1');
    });
  });

  test('displays order details correctly', () => {
    const initialState = {
      order: {
        currentOrder: {
          id: '1',
          items: [{ id: 'item1', name: 'Test Item', quantity: 2 }],
        },
      },
    };

    const { getByText } = renderWithReduxAndRouter(<FulfillmentProcess />, initialState, '/fulfillment/1');

    expect(getByText('Order #1')).toBeInTheDocument();
    expect(getByText('Test Item')).toBeInTheDocument();
    expect(getByText('Quantity: 2')).toBeInTheDocument();
  });

  test('handles item scanning', async () => {
    const mockUpdateInventoryItem = jest.fn();
    jest.spyOn(require('../../src/frontend/store/actions/inventoryActions'), 'updateInventoryItem').mockImplementation(mockUpdateInventoryItem);

    const { getByLabelText, getByText } = renderWithReduxAndRouter(<FulfillmentProcess />, {}, '/fulfillment/1');

    fireEvent.change(getByLabelText('Scan Item'), { target: { value: 'item1' } });
    fireEvent.click(getByText('Scan'));

    await waitFor(() => {
      expect(getByText('item1')).toBeInTheDocument();
      expect(mockUpdateInventoryItem).toHaveBeenCalledWith('item1', -1);
    });
  });

  test('generates shipping label', async () => {
    const mockGenerateShippingLabel = jest.fn().mockResolvedValue({ labelUrl: 'http://example.com/label' });
    jest.spyOn(require('../../src/frontend/store/actions/shippingActions'), 'generateShippingLabel').mockImplementation(mockGenerateShippingLabel);

    const { getByText } = renderWithReduxAndRouter(<FulfillmentProcess />, {}, '/fulfillment/1');

    fireEvent.click(getByText('Generate Shipping Label'));

    await waitFor(() => {
      expect(mockGenerateShippingLabel).toHaveBeenCalled();
      expect(getByText('Shipping Label')).toBeInTheDocument();
    });
  });

  test('completes fulfillment process', async () => {
    const mockUpdateOrderStatus = jest.fn();
    const mockNavigate = jest.fn();
    jest.spyOn(require('../../src/frontend/store/actions/orderActions'), 'updateOrderStatus').mockImplementation(mockUpdateOrderStatus);
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => mockNavigate);

    const { getByText } = renderWithReduxAndRouter(<FulfillmentProcess />, {}, '/fulfillment/1');

    fireEvent.click(getByText('Complete Fulfillment'));

    await waitFor(() => {
      expect(mockUpdateOrderStatus).toHaveBeenCalledWith('1', 'fulfilled');
      expect(mockNavigate).toHaveBeenCalledWith('/orders');
    });
  });

  test('handles errors during fulfillment', () => {
    const initialState = {
      order: {
        error: 'Failed to fetch order details',
      },
    };

    const { getByText } = renderWithReduxAndRouter(<FulfillmentProcess />, initialState, '/fulfillment/1');

    expect(getByText('Failed to fetch order details')).toBeInTheDocument();
    expect(getByText('Retry')).toBeInTheDocument();
  });

  test('prevents completing fulfillment with missing items', () => {
    const initialState = {
      order: {
        currentOrder: {
          id: '1',
          items: [{ id: 'item1', name: 'Test Item', quantity: 2 }],
        },
      },
      fulfillment: {
        scannedItems: ['item1'],
      },
    };

    const { getByText } = renderWithReduxAndRouter(<FulfillmentProcess />, initialState, '/fulfillment/1');

    expect(getByText('Complete Fulfillment')).toBeDisabled();
  });
});