// Import necessary dependencies from Redux and Redux DevTools Extension
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

// Import reducers for different slices of the application state
import authReducer from './reducers/authReducer';
import orderReducer from './reducers/orderReducer';
import inventoryReducer from './reducers/inventoryReducer';
import reportReducer from './reducers/reportReducer';
import settingsReducer from './reducers/settingsReducer';

// Combine all reducers into a single root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  order: orderReducer,
  inventory: inventoryReducer,
  report: reportReducer,
  settings: settingsReducer,
});

// Define the RootState type for use in components and other parts of the application
export type RootState = ReturnType<typeof rootReducer>;

// Configure and create the Redux store
export function configureStore() {
  // Step 1: Create middleware array with thunk
  const middleware = [thunk];

  // Step 2: Use composeWithDevTools to enable Redux DevTools
  const composeEnhancers = composeWithDevTools({});

  // Step 3: Create and return the Redux store using createStore
  const store = createStore(
    rootReducer,
    composeEnhancers(applyMiddleware(...middleware))
  );

  return store;
}

// Create the store
const store = configureStore();

export default store;