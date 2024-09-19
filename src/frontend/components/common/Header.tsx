import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { AccountCircle } from '@material-ui/icons';
import { logout } from '../../store/actions/authActions';
import { RootState } from '../../store/types';

// Define styles for the header component
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  title: {
    flexGrow: 1,
  },
  navButton: {
    marginRight: theme.spacing(2),
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
  },
}));

const Header: React.FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get user information from Redux store
  const user = useSelector((state: RootState) => state.auth.user);

  // Set up state for user menu anchor
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Handler for opening the user menu
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // Handler for closing the user menu
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Handler for logging out the user
  const handleLogout = () => {
    dispatch(logout());
    handleClose();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        {/* Application title */}
        <Typography variant="h6" className={classes.title}>
          Inventory Management
        </Typography>

        {/* Navigation buttons */}
        <Button color="inherit" component={Link} to="/dashboard" className={classes.navButton}>
          Dashboard
        </Button>
        <Button color="inherit" component={Link} to="/orders" className={classes.navButton}>
          Orders
        </Button>
        <Button color="inherit" component={Link} to="/inventory" className={classes.navButton}>
          Inventory
        </Button>

        {/* User information and menu */}
        {user ? (
          <div className={classes.userSection}>
            <Typography variant="body1">{user.name}</Typography>
            <IconButton
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </div>
        ) : (
          // Login button for unauthenticated users
          <Button color="inherit" component={Link} to="/login">
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;