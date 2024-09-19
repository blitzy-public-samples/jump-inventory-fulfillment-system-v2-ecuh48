import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import theme from './theme';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Orders from './pages/Orders';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import { RootState } from './store/types';
import { checkAuthStatus } from './store/actions/authActions';

const App: React.FC = () => {
  // Use useSelector to get authentication status from Redux store
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  
  // Use useDispatch to get dispatch function
  const dispatch = useDispatch();

  // Use useEffect to check authentication status on component mount
  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  return (
    // Render ThemeProvider with custom theme
    <ThemeProvider theme={theme}>
      {/* Render CssBaseline for consistent base styles */}
      <CssBaseline />
      {/* Render Router component for routing */}
      <Router>
        <div className="app">
          {/* Render Header component */}
          <Header />
          <div className="main-content">
            {/* Render Sidebar component if user is authenticated */}
            {isAuthenticated && <Sidebar />}
            <div className="page-content">
              {/* Render Switch component for route handling */}
              <Switch>
                {/* Define routes for different pages using PrivateRoute and Route components */}
                <Route exact path="/" component={Home} />
                <Route path="/login" component={Login} />
                <PrivateRoute path="/orders" component={Orders} />
                <PrivateRoute path="/inventory" component={Inventory} />
                <PrivateRoute path="/reports" component={Reports} />
                <PrivateRoute path="/settings" component={Settings} />
              </Switch>
            </div>
          </div>
          {/* Render Footer component */}
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;