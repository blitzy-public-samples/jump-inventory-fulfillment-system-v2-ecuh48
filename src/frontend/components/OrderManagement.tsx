import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Typography
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { fetchOrders, updateOrderStatus } from '../store/actions/orderActions';
import { OrderStatus } from '../types/OrderStatus';
import { Order } from '../types/Order';

// Define styles for order management components
const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  table: {
    minWidth: 650,
  },
  searchField: {
    marginBottom: theme.spacing(2),
  },
  actionButton: {
    marginRight: theme.spacing(1),
  },
}));

const OrderManagement: React.FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Set up state for orders and search query
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch orders data from the Redux store
  const ordersData = useSelector((state: any) => state.orders.orders);

  // Fetch orders data on component mount
  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  // Update local state when ordersData changes
  useEffect(() => {
    setOrders(ordersData);
  }, [ordersData]);

  // Handler for filtering orders based on search query
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filteredOrders = ordersData.filter((order: Order) =>
      order.id.toLowerCase().includes(query.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(query.toLowerCase())
    );
    setOrders(filteredOrders);
  };

  // Handler for updating order status
  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    dispatch(updateOrderStatus(orderId, newStatus));
    // Update local state to reflect the new status
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  // Handler for navigating to order details page
  const handleViewDetails = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom>
        Order Management
      </Typography>

      {/* Search field for order filtering */}
      <TextField
        className={classes.searchField}
        label="Search Orders"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {/* Table with order data */}
      <TableContainer component={Paper}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                <TableCell>{order.customer.name}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>
                  <Button
                    className={classes.actionButton}
                    variant="contained"
                    color="primary"
                    onClick={() => handleStatusUpdate(order.id, OrderStatus.Processing)}
                    disabled={order.status !== OrderStatus.Pending}
                  >
                    Process
                  </Button>
                  <Button
                    className={classes.actionButton}
                    variant="contained"
                    color="secondary"
                    onClick={() => handleStatusUpdate(order.id, OrderStatus.Shipped)}
                    disabled={order.status !== OrderStatus.Processing}
                  >
                    Ship
                  </Button>
                  <Button
                    className={classes.actionButton}
                    variant="outlined"
                    onClick={() => handleViewDetails(order.id)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default OrderManagement;