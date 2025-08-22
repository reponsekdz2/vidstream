/**
 * Centralized error handling middleware.
 * Catches errors from routes and sends a standardized JSON response.
 * @param {Error} err - The error object.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 */
export const errorHandler = (err, req, res, next) => {
  // Log the error for debugging purposes. In a production environment,
  // you would use a more sophisticated logger like Winston or Pino.
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred.';

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message,
    // Provide the stack trace only in development for security reasons.
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};
