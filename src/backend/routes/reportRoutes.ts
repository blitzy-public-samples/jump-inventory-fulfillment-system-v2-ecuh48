import express from 'express';
import * as reportController from '../controllers/reportController';
import authenticate from '../middleware/authenticate';
import authorize from '../middleware/authorize';
import { UserRole } from '../types/UserRole';

// Create a new router instance
const router = express.Router();

// Route to generate a report based on specified parameters
router.get(
  '/generate',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  reportController.generateReport
);

// Route to get a sales report
router.get(
  '/sales',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  reportController.getSalesReport
);

// Route to get an inventory report
router.get(
  '/inventory',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  reportController.getInventoryReport
);

// Route to get a fulfillment report
router.get(
  '/fulfillment',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  reportController.getFulfillmentReport
);

// Export the router for use in the main application
export default router;