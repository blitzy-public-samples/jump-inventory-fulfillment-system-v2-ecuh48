import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import Reports from '../../src/frontend/pages/Reports';
import rootReducer from '../../src/frontend/store/reducers';
import { fetchReportData } from '../../src/frontend/store/actions/reportActions';

// Mock the useDispatch hook
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

// Create a mock store
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

describe('Reports Page Component', () => {
  test('renders without crashing', () => {
    renderWithReduxAndRouter(<Reports />, {});
    expect(screen.getByTestId('reports-page')).toBeInTheDocument();
  });

  test('displays report type selection', () => {
    renderWithReduxAndRouter(<Reports />, {});
    expect(screen.getByLabelText(/report type/i)).toBeInTheDocument();
  });

  test('displays date range selection', () => {
    renderWithReduxAndRouter(<Reports />, {});
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
  });

  test('handles report type change', () => {
    renderWithReduxAndRouter(<Reports />, {});
    const reportTypeSelect = screen.getByLabelText(/report type/i);
    fireEvent.change(reportTypeSelect, { target: { value: 'inventory' } });
    expect(reportTypeSelect).toHaveValue('inventory');
  });

  test('handles date range change', () => {
    renderWithReduxAndRouter(<Reports />, {});
    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);
    fireEvent.change(startDateInput, { target: { value: '2023-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2023-12-31' } });
    expect(startDateInput).toHaveValue('2023-01-01');
    expect(endDateInput).toHaveValue('2023-12-31');
  });

  test('fetches report data on generate report', async () => {
    const mockDispatch = jest.fn();
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);

    renderWithReduxAndRouter(<Reports />, {});
    
    // Select report type and date range
    fireEvent.change(screen.getByLabelText(/report type/i), { target: { value: 'sales' } });
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2023-01-01' } });
    fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: '2023-12-31' } });

    // Click generate report button
    fireEvent.click(screen.getByText(/generate report/i));

    // Assert that fetchReportData action is dispatched with correct parameters
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        fetchReportData({
          reportType: 'sales',
          startDate: '2023-01-01',
          endDate: '2023-12-31',
        })
      );
    });
  });

  test('displays loading state while fetching report', () => {
    const initialState = {
      reports: {
        loading: true,
        error: null,
        data: null,
      },
    };
    renderWithReduxAndRouter(<Reports />, initialState);
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  test('displays error state', () => {
    const initialState = {
      reports: {
        loading: false,
        error: 'Failed to fetch report data',
        data: null,
      },
    };
    renderWithReduxAndRouter(<Reports />, initialState);
    expect(screen.getByText('Failed to fetch report data')).toBeInTheDocument();
  });

  test('displays report data', () => {
    const initialState = {
      reports: {
        loading: false,
        error: null,
        data: {
          type: 'sales',
          data: [
            { date: '2023-01-01', value: 1000 },
            { date: '2023-01-02', value: 1500 },
          ],
        },
      },
    };
    renderWithReduxAndRouter(<Reports />, initialState);
    expect(screen.getByTestId('report-visualization')).toBeInTheDocument();
    expect(screen.getByText('Sales Report')).toBeInTheDocument();
  });

  test('handles different report types', () => {
    const reportTypes = ['sales', 'inventory', 'fulfillment'];
    
    reportTypes.forEach((reportType) => {
      const initialState = {
        reports: {
          loading: false,
          error: null,
          data: {
            type: reportType,
            data: [
              { date: '2023-01-01', value: 1000 },
              { date: '2023-01-02', value: 1500 },
            ],
          },
        },
      };
      
      const { unmount } = renderWithReduxAndRouter(<Reports />, initialState);
      expect(screen.getByTestId('report-visualization')).toBeInTheDocument();
      expect(screen.getByText(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`)).toBeInTheDocument();
      
      unmount();
    });
  });
});