import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import store from './store';
import './styles/global.css';

// Function to render the React application
const render = () => {
  // Create a React element with Provider component from react-redux
  // Pass the Redux store to the Provider component
  // Wrap the App component with BrowserRouter for routing
  const app = (
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  );

  // Use ReactDOM.render to mount the application to the DOM
  // Target the root element in the HTML
  ReactDOM.render(app, document.getElementById('root'));
};

// Call the render function to start the application
render();