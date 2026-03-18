/**
 * Global Error Handler Middleware
 * Catches all errors from route handlers and controllers
 * IMPORTANT: Must be the last middleware in app.js
 *
 * Signature: (err, req, res, next) - The 4 parameters are REQUIRED
 * Express recognizes this as an error handler because of the 4 parameters
 */

const errorHandler = (err, req, res, next) => {
  // Log error details in development
  if (process.env.NODE_ENV !== "production") {
    console.error("[ERR] Error:", {
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode,
    });
  }

  // Default error status code
  const statusCode = err.statusCode || err.status || 500;
  
  // Determine error message
  let message = err.message || "Internal server error";
  
  // Customize message for production
  if (process.env.NODE_ENV === "production" && statusCode === 500) {
    message = "An internal error occurred";
  }

  // Handle specific error types
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: true,
      message: err.message || "Validation error",
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      error: true,
      message: "Invalid ID format",
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      error: true,
      message: "Invalid token",
    });
  }

  // Default error response
  return res.status(statusCode).json({
    success: false,
    error: true,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

module.exports = { errorHandler };