import mongoose from 'mongoose';

export function checkDatabase(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database not connected. Please ensure MongoDB is running.',
      error: 'SERVICE_UNAVAILABLE'
    });
  }
  next();
}

