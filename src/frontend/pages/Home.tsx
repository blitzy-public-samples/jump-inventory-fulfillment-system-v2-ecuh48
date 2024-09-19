import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Grid, Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import OrderSummary from '../components/OrderSummary';
import InventorySummary from '../components/InventorySummary';
import RecentActivity from '../components/RecentActivity';
import QuickActions from '../components/QuickActions';
import { fetchDashboardData } from '../store/actions/dashboardActions';
import { RootState } from '../store/types';

// Define styles for home page components
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  paper: {
    padding: theme.spacing(2),
    height: '100%',
  },
  title: {
    marginBottom: theme.spacing(2),
  },
}));

const Home: React.FC = () => {
  // Initialize styles using useStyles hook
  const classes = useStyles();

  // Initialize dispatch function using useDispatch hook
  const dispatch = useDispatch();

  // Get user information and dashboard data from Redux store using useSelector
  const { user, dashboardData } = useSelector((state: RootState) => ({
    user: state.auth.user,
    dashboardData: state.dashboard,
  }));

  // Use useEffect to dispatch fetchDashboardData action on component mount
  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  return (
    <div className={classes.root}>
      {/* Render Grid container for dashboard layout */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          {/* Render welcome message with user's name */}
          <Typography variant="h4" className={classes.title}>
            Welcome, {user?.name}
          </Typography>
        </Grid>
        
        {/* Render OrderSummary component in a Grid item, passing relevant props */}
        <Grid item xs={12} md={6}>
          <Paper className={classes.paper}>
            <OrderSummary orderData={dashboardData.orderSummary} />
          </Paper>
        </Grid>
        
        {/* Render InventorySummary component in a Grid item, passing relevant props */}
        <Grid item xs={12} md={6}>
          <Paper className={classes.paper}>
            <InventorySummary inventoryData={dashboardData.inventorySummary} />
          </Paper>
        </Grid>
        
        {/* Render RecentActivity component in a Grid item, passing relevant props */}
        <Grid item xs={12} md={8}>
          <Paper className={classes.paper}>
            <RecentActivity activities={dashboardData.recentActivities} />
          </Paper>
        </Grid>
        
        {/* Render QuickActions component in a Grid item, passing relevant props */}
        <Grid item xs={12} md={4}>
          <Paper className={classes.paper}>
            <QuickActions />
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Home;