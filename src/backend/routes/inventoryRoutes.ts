import express from 'express';
import * as inventoryController from '../controllers/inventoryController';
import { validateInventoryCreate, validateInventoryUpdate } from '../middleware/validation';
import authenticate from '../middleware/authenticate';
import authorize from '../middleware/authorize';
import { UserRole } from '../types/UserRole';

const router = express.Router();

// Route to get all inventory items
router.get(
  '/',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE_STAFF]),
  inventoryController.getInventoryItems
);

// Route to get a specific inventory item by ID
router.get(
  '/:id',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE_STAFF]),
  inventoryController.getInventoryItemById
);

// Route to create a new inventory item
router.post(
  '/',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  validateInventoryCreate,
  inventoryController.createInventoryItem
);

// Route to update an inventory item
router.patch(
  '/:id',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE_STAFF]),
  validateInventoryUpdate,
  inventoryController.updateInventoryItem
);

// Route to delete an inventory item
router.delete(
  '/:id',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  inventoryController.deleteInventoryItem
);

// Route to adjust inventory quantity
router.post(
  '/:id/adjust',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.WAREHOUSE_STAFF]),
  inventoryController.adjustInventoryQuantity
);

export default router;