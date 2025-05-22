// Centralized Error Handling Middleware

const errorHandler = (err, req, res, next) => {
  console.error('-------------------- ERROR LOG START --------------------');
  console.error(`Timestamp: ${new Date().toISOString()}`);
  console.error(`Route: ${req.method} ${req.originalUrl}`);
  if (req.body && Object.keys(req.body).length > 0) {
    // Avoid logging sensitive data like passwords directly
    const { password, ...bodyToLog } = req.body;
    if (password) bodyToLog.password = '[REDACTED]';
    console.error(`Body: ${JSON.stringify(bodyToLog)}`);
  }
  if (req.params && Object.keys(req.params).length > 0) {
    console.error(`Params: ${JSON.stringify(req.params)}`);
  }
  if (req.query && Object.keys(req.query).length > 0) {
    console.error(`Query: ${JSON.stringify(req.query)}`);
  }

  // Log the error object itself
  console.error(err); // This will log the error message and stack trace

  console.error('-------------------- ERROR LOG END ----------------------');

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // If the request accepts HTML and it's a 401 error, redirect to login
  if (statusCode === 401 && req.accepts('html')) {
    // Store the original URL in session or query param to redirect back after login (optional)
    // req.session.returnTo = req.originalUrl; 
    return res.redirect('/login.html');
  }

  // For 500 errors in production, don't send the stack trace to the client for JSON responses
  if (process.env.NODE_ENV === 'production' && statusCode === 500 && !req.accepts('html')) {
    return res.status(statusCode).json({
      message: 'An unexpected error occurred on the server.',
    });
  }

  // For all other errors or non-HTML requests, send JSON response
  return res.status(statusCode).json({
    message,
    // Only include stack trace in development for debugging
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    ...(err.errors && { errors: err.errors }), // For validation errors from express-validator
  });
};

module.exports = errorHandler;
