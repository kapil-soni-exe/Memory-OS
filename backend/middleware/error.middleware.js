/**
 * Global Error Handling Middleware
 * Catch-all for any errors thrown in controllers or services.
 * Returns a clean JSON response instead of a technical stack trace.
 */
const errorMiddleware = (err, req, res, next) => {
  console.error('[Error Handler]', err.stack);

  // Default to 500 Internal Server Error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    // Include stack trace only in development
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

export default errorMiddleware;
