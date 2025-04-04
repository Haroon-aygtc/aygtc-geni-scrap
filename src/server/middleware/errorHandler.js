/**
 * Error Handler Middleware
 *
 * This middleware handles errors that occur during request processing.
 * It formats error responses and logs errors for debugging.
 */

const errorHandler = (err, req, res, next) => {
  // Log the error
  console.error("API Error:", err);

  // Default error status and message
  let statusCode = 500;
  let message = "Internal Server Error";
  let details = null;

  // Handle specific error types
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
    details = err.details || err.message;
  } else if (err.name === "UnauthorizedError") {
    statusCode = 401;
    message = "Unauthorized";
  } else if (err.name === "ForbiddenError") {
    statusCode = 403;
    message = "Forbidden";
  } else if (err.name === "NotFoundError") {
    statusCode = 404;
    message = "Not Found";
  } else if (err.statusCode) {
    // If the error has a statusCode property, use it
    statusCode = err.statusCode;
    message = err.message || message;
  } else if (err.message) {
    // Use the error message if available
    message = err.message;
  }

  // Send error response
  res.status(statusCode).json({
    error: {
      message,
      details: details || undefined,
      // Include stack trace in development mode
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    },
  });
};

export default errorHandler;
