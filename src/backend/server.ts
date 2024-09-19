import http from 'http';
import app from './app';
import logger from './utils/logger';
import connectToDatabase from './utils/database';
import ServerConfig from './config/server';

// Create HTTP server
const server = http.createServer(app);

/**
 * Normalize a port into a number, string, or false.
 * @param {string | number} val - The port value to normalize
 * @returns {number | string | boolean} - Normalized port value
 */
function normalizePort(val: string | number): number | string | boolean {
  // Parse the input as an integer
  const port = parseInt(val as string, 10);

  // If the parsed value is NaN, return the original value
  if (isNaN(port)) {
    return val;
  }

  // If the parsed value is greater than or equal to 0, return the parsed value
  if (port >= 0) {
    return port;
  }

  // Otherwise, return false
  return false;
}

/**
 * Event listener for HTTP server 'error' event.
 * @param {Error} error - The error object
 */
function onError(error: NodeJS.ErrnoException): void {
  // If the error is not a 'listen' error, throw it
  if (error.syscall !== 'listen') {
    throw error;
  }

  // Log an error message based on the error code
  switch (error.code) {
    case 'EACCES':
      logger.error('Port requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error('Port is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server 'listening' event.
 */
function onListening(): void {
  // Get the server address
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr?.port}`;

  // Log a message indicating the server is listening, including the address and port
  logger.info(`Server is listening on ${bind}`);
}

/**
 * Start the server and connect to the database.
 */
async function startServer(): Promise<void> {
  try {
    // Connect to the database
    await connectToDatabase();

    // Normalize the port
    const port = normalizePort(ServerConfig.port);

    // Set the port on the app
    app.set('port', port);

    // Set up error and listening event handlers
    server.on('error', onError);
    server.on('listening', onListening);

    // Start listening on the specified port
    server.listen(port);

    logger.info(`Server started on port ${port}`);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();