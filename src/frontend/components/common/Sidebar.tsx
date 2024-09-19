import React from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Dashboard, Inventory, LocalShipping, Assessment, Settings } from '@material-ui/icons';
import { RootState } from '../../store/types';
import { UserRole } from '../../types/UserRole';

// Define styles for the Sidebar component
const useStyles = makeStyles((theme) => ({
  drawer: {
    width: 240,
    flexShrink: 0,
  },
  drawerPaper: {
    width: 240,
  },
  toolbar: theme.mixins.toolbar,
  listItem: {
    '&.active': {
      backgroundColor: theme.palette.action.selected,
    },
  },
  icon: {
    color: theme.palette.text.secondary,
  },
}));

// Function to check if a route is accessible based on user role
const isRouteAccessible = (userRole: UserRole, route: string): boolean => {
  const accessRules = {
    [UserRole.ADMIN]: ['/', '/inventory', '/orders', '/reports', '/settings'],
    [UserRole.MANAGER]: ['/', '/inventory', '/orders', '/reports'],
    [UserRole.WORKER]: ['/', '/inventory', '/orders'],
  };

  return accessRules[userRole]?.includes(route) || false;
};

// Sidebar component
const Sidebar: React.FC = () => {
  const classes = useStyles();
  const location = useLocation();
  const userRole = useSelector((state: RootState) => state.auth.userRole);

  // Define navigation items with their respective icons, labels, and paths
  const navItems = [
    { icon: <Dashboard />, label: 'Dashboard', path: '/' },
    { icon: <Inventory />, label: 'Inventory', path: '/inventory' },
    { icon: <LocalShipping />, label: 'Orders', path: '/orders' },
    { icon: <Assessment />, label: 'Reports', path: '/reports' },
    { icon: <Settings />, label: 'Settings', path: '/settings' },
  ];

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter((item) =>
    isRouteAccessible(userRole, item.path)
  );

  return (
    <Drawer
      className={classes.drawer}
      variant="permanent"
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <div className={classes.toolbar} />
      <Divider />
      <List>
        {filteredNavItems.map((item) => (
          <ListItem
            button
            key={item.path}
            component={Link}
            to={item.path}
            className={`${classes.listItem} ${
              location.pathname === item.path ? 'active' : ''
            }`}
          >
            <ListItemIcon className={classes.icon}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;