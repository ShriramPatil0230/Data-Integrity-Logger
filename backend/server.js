import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { connectToDatabase } from './config/db.js';
import mongoose from 'mongoose';
import { User } from './models/User.js';
import { Log } from './models/Log.js';
import { Anchoring } from './models/Anchoring.js';
import logRoutes from './routes/logRoutes.js';
import authRoutes from './routes/authRoutes.js';
import anchorRoutes from './routes/anchorRoutes.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { logger } from './middlewares/logger.js';

dotenv.config();

// Environment validation
const requiredEnv = ['JWT_SECRET'];
const missing = requiredEnv.filter((k) => !process.env[k]);
if (missing.length) {
  // eslint-disable-next-line no-console
  console.warn(`⚠️  Missing required env vars: ${missing.join(', ')}`);
}

// Warn about INTEGRITY_SECRET (recommended but has fallback)
if (!process.env.INTEGRITY_SECRET) {
  // eslint-disable-next-line no-console
  console.warn('⚠️  INTEGRITY_SECRET not set. Using JWT_SECRET as fallback (not recommended for production).');
}

const app = express();

// Configure CORS first to allow frontend connections
// CORS_ORIGIN can be a single origin, comma-separated origins, or '*' for all
const corsOrigin = process.env.CORS_ORIGIN || '*';
const corsOptions = {
  origin: corsOrigin === '*' ? '*' : corsOrigin.split(',').map(origin => origin.trim()),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// Configure Helmet with relaxed CSP for development
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API (not serving HTML)
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

const jsonLimit = process.env.MAX_REQUEST_BYTES ? `${process.env.MAX_REQUEST_BYTES}b` : '128kb';
app.use(express.json({ limit: jsonLimit }));
// Use custom logger that masks request bodies in production
app.use(logger);

// Root route - API information
app.get('/', (_req, res) => {
  res.json({
    message: 'Data Integrity Logger API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      logs: {
        list: 'GET /api/logs',
        create: 'POST /api/logs',
        verify: 'POST /api/logs/:id/verify',
        delete: 'DELETE /api/logs/:id'
      }
    },
    documentation: 'This is an API server. Use the frontend application or API client to interact with the endpoints.'
  });
});

app.get('/api/health', (_req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(200).json({ status: 'ok', dbConnected });
});

app.get('/api/ready', (_req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  if (!dbConnected) {
    return res.status(503).json({ 
      status: 'not_ready', 
      dbConnected: false,
      message: 'MongoDB not connected. Ensure MongoDB is running and MONGODB_URI is correct.'
    });
  }
  return res.status(200).json({ status: 'ready', dbConnected: true });
});

// Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/anchor', anchorRoutes);

// Log registered routes in development
if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line no-console
  console.log('✅ Routes registered: /api/auth, /api/logs, /api/anchor');
}

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

async function boot() {
  // Start HTTP server immediately to allow health checks
  // The server will return 503 on /api/ready until DB is connected
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`🚀 Server listening on port ${PORT}`);
    // eslint-disable-next-line no-console
    console.log('⏳ Connecting to MongoDB...');
  });

  // Attempt to connect to database (non-blocking)
  // Server will continue running and return 503 on /api/ready until connected
  try {
    await connectToDatabase();
    // eslint-disable-next-line no-console
    console.log('✅ MongoDB connected successfully');
    // Ensure indexes are in place
    await Promise.all([
      User.syncIndexes(),
      Log.syncIndexes(),
      Anchoring.syncIndexes(),
    ]);
    // eslint-disable-next-line no-console
    console.log('✅ Database indexes synced');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('❌ MongoDB connection failed:', err.message);
    // eslint-disable-next-line no-console
    console.error('⚠️  Server is running but will return 503 on /api/ready until MongoDB is available');
    // eslint-disable-next-line no-console
    console.error('💡 Make sure MongoDB is running: docker run -d --name dil-mongo -p 27017:27017 mongo:7');
    // In production, we might want to exit, but in dev we allow the server to start
    // and retry connection attempts
    if (process.env.NODE_ENV === 'production') {
      // eslint-disable-next-line no-console
      console.error('❌ Exiting in production mode due to DB connection failure');
      process.exit(1);
    }
  }
}

boot();

