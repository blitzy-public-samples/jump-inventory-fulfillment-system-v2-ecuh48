import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import Settings from '../../src/frontend/pages/Settings';
import { rootReducer } from '../../src/frontend/store/reducers';
import { updateUserSettings, fetchUserSettings } from '../../src/frontend/store/actions/settingsActions';

// Mock react-redux hooks
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

describe('Settings Page Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    renderWithReduxAndRouter(<Settings />);
    expect(screen.getByTestId('settings-page')).toBeInTheDocument();
  });

  test('fetches user settings on mount', () => {
    const mockDispatch = jest.fn();
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);

    renderWithReduxAndRouter(<Settings />);

    expect(mockDispatch).toHaveBeenCalledWith(fetchUserSettings());
  });

  test('displays user settings form', () => {
    const initialState = {
      settings: {
        data: {
          email: 'test@example.com',
          theme: 'light',
          notifications: { email: true, push: false },
        },
      },
    };

    renderWithReduxAndRouter(<Settings />, initialState);

    expect(screen.getByLabelText('Email')).toHaveValue('test@example.com');
    expect(screen.getByLabelText('Theme')).toHaveValue('light');
    expect(screen.getByLabelText('Email Notifications')).toBeChecked();
    expect(screen.getByLabelText('Push Notifications')).not.toBeChecked();
  });

  test('handles input changes', () => {
    renderWithReduxAndRouter(<Settings />);

    const emailInput = screen.getByLabelText('Email');
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });

    expect(emailInput).toHaveValue('new@example.com');
  });

  test('handles form submission', async () => {
    const mockDispatch = jest.fn();
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);

    renderWithReduxAndRouter(<Settings />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'new@example.com' } });
    fireEvent.click(screen.getByLabelText('Dark'));
    fireEvent.click(screen.getByLabelText('Push Notifications'));

    fireEvent.submit(screen.getByTestId('settings-form'));

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        updateUserSettings({
          email: 'new@example.com',
          theme: 'dark',
          notifications: { email: false, push: true },
        })
      );
    });
  });

  test('displays loading state while saving settings', () => {
    const initialState = {
      settings: {
        loading: true,
      },
    };

    renderWithReduxAndRouter(<Settings />, initialState);

    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  test('displays error state', () => {
    const initialState = {
      settings: {
        error: 'Failed to save settings',
      },
    };

    renderWithReduxAndRouter(<Settings />, initialState);

    expect(screen.getByText('Failed to save settings')).toBeInTheDocument();
  });

  test('displays success message after saving settings', () => {
    const initialState = {
      settings: {
        successMessage: 'Settings saved successfully',
      },
    };

    renderWithReduxAndRouter(<Settings />, initialState);

    expect(screen.getByText('Settings saved successfully')).toBeInTheDocument();
  });

  test('handles theme preference change', () => {
    renderWithReduxAndRouter(<Settings />);

    const darkThemeRadio = screen.getByLabelText('Dark');
    fireEvent.click(darkThemeRadio);

    expect(darkThemeRadio).toBeChecked();
  });

  test('handles notification settings change', () => {
    renderWithReduxAndRouter(<Settings />);

    const emailNotificationsCheckbox = screen.getByLabelText('Email Notifications');
    const pushNotificationsCheckbox = screen.getByLabelText('Push Notifications');

    fireEvent.click(emailNotificationsCheckbox);
    fireEvent.click(pushNotificationsCheckbox);

    expect(emailNotificationsCheckbox).not.toBeChecked();
    expect(pushNotificationsCheckbox).toBeChecked();
  });
});