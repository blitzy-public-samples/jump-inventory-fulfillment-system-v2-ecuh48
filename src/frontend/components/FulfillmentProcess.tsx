import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Stepper, Step, StepLabel, Button, Typography, Paper, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { fetchOrderDetails, updateOrderStatus } from '../store/actions/orderActions';
import { updateInventoryItem } from '../store/actions/inventoryActions';
import { generateShippingLabel } from '../store/actions/shippingActions';
import { Order } from '../types/Order';
import { OrderStatus } from '../types/OrderStatus';
import { InventoryItem } from '../types/InventoryItem';

// Define styles for the component
const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    padding: theme.spacing(3),
  },
  stepper: {
    marginBottom: theme.spacing(3),
  },
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(1),
  },
  formField: {
    marginBottom: theme.spacing(2),
  },
}));

const FulfillmentProcess: React.FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();

  const [activeStep, setActiveStep] = useState(0);
  const [order, setOrder] = useState<Order | null>(null);
  const [scannedItems, setScannedItems] = useState<string[]>([]);

  // Fetch order details on component mount
  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderDetails(orderId));
    }
  }, [dispatch, orderId]);

  // Get order details from Redux store
  const orderDetails = useSelector((state: any) => state.orders.currentOrder);

  // Update local state when order details are fetched
  useEffect(() => {
    if (orderDetails) {
      setOrder(orderDetails);
    }
  }, [orderDetails]);

  const handleNextStep = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handlePreviousStep = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleScanItem = (barcode: string) => {
    if (order && order.items) {
      const itemToScan = order.items.find((item) => item.barcode === barcode);
      if (itemToScan && !scannedItems.includes(barcode)) {
        setScannedItems([...scannedItems, barcode]);
        dispatch(updateInventoryItem(itemToScan.id, { quantity: itemToScan.quantity - 1 }));
        
        if (scannedItems.length + 1 === order.items.length) {
          handleNextStep();
        }
      }
    }
  };

  const handleGenerateShippingLabel = async () => {
    if (order) {
      try {
        const shippingLabel = await dispatch(generateShippingLabel(order));
        setOrder({ ...order, shippingLabel });
        handleNextStep();
      } catch (error) {
        console.error('Error generating shipping label:', error);
      }
    }
  };

  const handleCompleteFulfillment = async () => {
    if (order) {
      try {
        await dispatch(updateOrderStatus(order.id, OrderStatus.Fulfilled));
        navigate('/orders');
        // TODO: Display success message for completed fulfillment
      } catch (error) {
        console.error('Error completing fulfillment:', error);
      }
    }
  };

  const steps = ['Verify Order', 'Pick Items', 'Pack Order', 'Generate Shipping Label', 'Complete Fulfillment'];

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Paper className={classes.paper}>
            <Typography variant="h6">Verify Order Details</Typography>
            {order && (
              <>
                <Typography>Order ID: {order.id}</Typography>
                <Typography>Customer: {order.customerName}</Typography>
                <Typography>Items:</Typography>
                <ul>
                  {order.items.map((item) => (
                    <li key={item.id}>{item.name} - Quantity: {item.quantity}</li>
                  ))}
                </ul>
              </>
            )}
          </Paper>
        );
      case 1:
        return (
          <Paper className={classes.paper}>
            <Typography variant="h6">Pick Items</Typography>
            <TextField
              className={classes.formField}
              label="Scan Barcode"
              variant="outlined"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleScanItem((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
            {order && (
              <ul>
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.name} - {scannedItems.includes(item.barcode) ? 'Scanned' : 'Not Scanned'}
                  </li>
                ))}
              </ul>
            )}
          </Paper>
        );
      case 2:
        return (
          <Paper className={classes.paper}>
            <Typography variant="h6">Pack Order</Typography>
            <Typography>Please pack the order securely.</Typography>
            {/* Add any additional instructions or checklist for packing */}
          </Paper>
        );
      case 3:
        return (
          <Paper className={classes.paper}>
            <Typography variant="h6">Generate Shipping Label</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGenerateShippingLabel}
            >
              Generate Label
            </Button>
            {order && order.shippingLabel && (
              <Typography>Shipping Label Generated: {order.shippingLabel}</Typography>
            )}
          </Paper>
        );
      case 4:
        return (
          <Paper className={classes.paper}>
            <Typography variant="h6">Complete Fulfillment</Typography>
            <Typography>Please review the order and confirm fulfillment.</Typography>
          </Paper>
        );
      default:
        return null;
    }
  };

  return (
    <div className={classes.root}>
      <Stepper activeStep={activeStep} className={classes.stepper}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {renderStepContent(activeStep)}
      <div className={classes.buttons}>
        {activeStep > 0 && (
          <Button onClick={handlePreviousStep} className={classes.button}>
            Back
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleNextStep}
            className={classes.button}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleCompleteFulfillment}
            className={classes.button}
          >
            Complete Fulfillment
          </Button>
        )}
      </div>
    </div>
  );
};

export default FulfillmentProcess;

// Human tasks:
// - Implement success message display for completed fulfillment
// - Add additional instructions or checklist for packing step
// - Enhance error handling and user feedback throughout the process
// - Implement real-time updates for inventory changes
// - Add accessibility features to improve usability