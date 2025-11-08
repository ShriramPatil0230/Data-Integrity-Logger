export function notFoundHandler(req, res, _next) {
  // eslint-disable-next-line no-console
  console.warn(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
}

export function errorHandler(err, req, res, _next) {
  // eslint-disable-next-line no-console
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req?.path,
    method: req?.method
  });
  
  // Don't expose internal error details in production
  const isProduction = process.env.NODE_ENV === 'production';
  const status = err.status || err.statusCode || 500;
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Validation error',
      errors: isProduction ? undefined : err.errors 
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({ 
      message: 'Invalid request data format' 
    });
  }
  
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    // Handle MongoDB connection errors
    if (err.message && err.message.includes('connection')) {
      return res.status(503).json({ 
        message: 'Database connection error. Please try again later.' 
      });
    }
    return res.status(400).json({ 
      message: 'Database error' 
    });
  }
  
  if (err.name === 'MongooseError') {
    return res.status(503).json({ 
      message: 'Database error. Please try again later.' 
    });
  }
  
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      message: 'Invalid or expired token' 
    });
  }
  
  // Handle HMAC secret errors
  if (err.message && err.message.includes('HMAC secret')) {
    return res.status(500).json({ 
      message: 'Server configuration error. Please contact support.' 
    });
  }
  
  // Generic error response
  const message = isProduction && status === 500 
    ? 'An internal server error occurred. Please try again later.'
    : (err.message || 'Internal Server Error');
    
  res.status(status).json({ message });
}


