import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import authRoutes from './routes/authRoutes';
import orderRoutes from './routes/orderRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import reportRoutes from './routes/reportRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import connectToDatabase from './utils/database';
import logger from './utils/logger';

const app = express();

function initializeMiddleware(): void {
  // Use cors middleware
  app.use(cors());
  
  // Use helmet middleware for security headers
  app.use(helmet());
  
  // Use morgan middleware for logging HTTP requests
  app.use(morgan('combined'));
  
  // Use express.json middleware for parsing JSON bodies
  app.use(express.json());
  
  // Use express.urlencoded middleware for parsing URL-encoded bodies
  app.use(express.urlencoded({ extended: true }));
  
  // Use compression middleware
  app.use(compression());
}

function initializeRoutes(): void {
  // Use authRoutes for '/api/auth' path
  app.use('/api/auth', authRoutes);
  
  // Use orderRoutes for '/api/orders' path
  app.use('/api/orders', orderRoutes);
  
  // Use inventoryRoutes for '/api/inventory' path
  app.use('/api/inventory', inventoryRoutes);
  
  // Use reportRoutes for '/api/reports' path
  app.use('/api/reports', reportRoutes);
}

function initializeErrorHandling(): void {
  // Use notFoundHandler middleware
  app.use(notFoundHandler);
  
  // Use errorHandler middleware
  app.use(errorHandler);
}

async function startServer(): Promise<void> {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Start listening on the specified port
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      // Log server start message
      logger.info(`Server started on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Initialize middleware
initializeMiddleware();

// Initialize routes
initializeRoutes();

// Initialize error handling
initializeErrorHandling();

// Start the server
startServer();

export default app;