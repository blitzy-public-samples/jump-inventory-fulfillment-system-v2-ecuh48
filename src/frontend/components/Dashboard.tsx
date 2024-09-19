import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Grid, Paper, Typography, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import OrderSummary from './OrderSummary';
import InventorySummary from './InventorySummary';
import RecentActivity from './RecentActivity';
import { fetchOrderSummary } from '../store/actions/orderActions';
import { fetchInventorySummary } from '../store/actions/inventoryActions';
import { fetchRecentActivity } from '../store/actions/activityActions';

// Define styles for the dashboard components
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  actionButton: {
    margin: theme.spacing(1),
  },
}));

const Dashboard: React.FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchOrderSummary());
    dispatch(fetchInventorySummary());
    dispatch(fetchRecentActivity());
  }, [dispatch]);

  // Get data from Redux store
  const orderSummary = useSelector((state: any) => state.order.summary);
  const inventorySummary = useSelector((state: any) => state.inventory.summary);
  const recentActivity = useSelector((state: any) => state.activity.recent);

  // Handler for starting the fulfillment process
  const handleStartFulfillment = () => {
    navigate('/fulfillment');
  };

  // Handler for adding inventory
  const handleAddInventory = () => {
    navigate('/inventory/add');
  };

  // Handler for generating reports
  const handleGenerateReport = () => {
    navigate('/reports');
  };

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" className={classes.title}>
            Dashboard
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper className={classes.paper}>
            <OrderSummary data={orderSummary} />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper className={classes.paper}>
            <InventorySummary data={inventorySummary} />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <RecentActivity data={recentActivity} />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Button
              variant="contained"
              color="primary"
              className={classes.actionButton}
              onClick={handleStartFulfillment}
            >
              Start Fulfillment
            </Button>
            <Button
              variant="contained"
              color="secondary"
              className={classes.actionButton}
              onClick={handleAddInventory}
            >
              Add Inventory
            </Button>
            <Button
              variant="contained"
              className={classes.actionButton}
              onClick={handleGenerateReport}
            >
              Generate Report
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;