/**
 * AsyncHandler Wrapper for Express Controllers
 * Wraps async controller functions to catch errors automatically
 * and pass them to the error handler middleware
 *
 * Usage:
 * router.post('/bill', asyncHandler(createBill));
 * or
 * module.exports = asyncHandler(async (req, res) => { ... });
 */

const asyncHandler = (fn) => {
  // Validate that fn is actually a function
  if (typeof fn !== 'function') {
    throw new TypeError(`AsyncHandler expects a function, received: ${typeof fn}`);
  }
  
  return (req, res, next) => {
    // Validate that next is a function
    if (typeof next !== 'function') {
      console.error("[ERR] ERROR: next is not a function in asyncHandler");
      console.error("Function being wrapped:", fn.name || 'anonymous');
      console.error("next parameter:", next);
      // Create a fallback error handler
      return res.status(500).json({
        success: false,
        message: "Internal server error - middleware chain is broken"
      });
    }
    
    try {
      // Execute the function and handle promise
      Promise.resolve(fn(req, res, next))
        .catch((err) => {
          if (typeof next === 'function') {
            next(err);
          } else {
            console.error("[ERR] ERROR: Cannot call next() - it's not a function");
            res.status(500).json({
              success: false,
              message: "Internal server error",
              error: process.env.NODE_ENV !== 'production' ? err.message : undefined
            });
          }
        });
    } catch (err) {
      // Catch synchronous errors
      if (typeof next === 'function') {
        next(err);
      } else {
        console.error("[ERR] SYNC ERROR in asyncHandler:", err.message);
        res.status(500).json({
          success: false,
          message: "Internal server error"
        });
      }
    }
  };
};

module.exports = asyncHandler;
