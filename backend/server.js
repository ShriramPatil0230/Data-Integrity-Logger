import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectToDatabase } from './config/db.js';
import logRoutes from './routes/logRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

dotenv.config();

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

app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/logs', logRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

// Start server immediately, don't wait for MongoDB
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Server listening on port ${PORT}`);
  
  // Connect to MongoDB in the background (non-blocking)
  connectToDatabase()
    .then(() => {
      // eslint-disable-next-line no-console
      console.log('✅ MongoDB connected successfully');
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.warn('⚠️  MongoDB connection failed:', err.message);
      // eslint-disable-next-line no-console
      console.warn('⚠️  Database operations will fail until MongoDB is available');
    });
});

