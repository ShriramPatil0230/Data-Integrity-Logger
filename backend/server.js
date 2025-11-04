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

// Minimal env validation
const requiredEnv = ['JWT_SECRET'];
const missing = requiredEnv.filter((k) => !process.env[k]);
if (missing.length) {
  // eslint-disable-next-line no-console
  console.warn(`Missing required env vars: ${missing.join(', ')}`);
}

const app = express();

// Configure CORS first to allow frontend connections
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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
  if (!dbConnected) return res.status(503).json({ status: 'not_ready', dbConnected: false });
  return res.status(200).json({ status: 'ready', dbConnected: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/anchor', anchorRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

async function boot() {
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
    
    // Only start HTTP server after DB is connected and indexes are synced
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('❌ MongoDB connection failed at startup:', err.message);
    // Fail fast: exit in both prod and dev if DB can't connect
    // This ensures the server never starts without a DB connection
    process.exit(1);
  }
}

boot();

