import express from 'express';
import * as orderController from '../controllers/orderController';
import { validateOrderCreate, validateOrderUpdate } from '../middleware/validation';
import authenticate from '../middleware/authenticate';
import authorize from '../middleware/authorize';
import { UserRole } from '../types/UserRole';

const router = express.Router();

// Route to get all orders
router.get(
  '/',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  orderController.getOrders
);

// Route to get a specific order by ID
router.get(
  '/:id',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE_STAFF]),
  orderController.getOrderById
);

// Route to create a new order
router.post(
  '/',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  validateOrderCreate,
  orderController.createOrder
);

// Route to update order status
router.patch(
  '/:id',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE_STAFF]),
  validateOrderUpdate,
  orderController.updateOrderStatus
);

// Route to fulfill an order
router.post(
  '/:id/fulfill',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.WAREHOUSE_STAFF]),
  orderController.fulfillOrder
);

export default router;