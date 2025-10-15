import express from 'express';
import cors from 'cors';
import multer from 'multer';
import 'express-async-errors';
import { config } from './config';
import { httpLogger } from './middleware/logger.middleware';
import { errorHandler, notFound } from './middleware/error.middleware';

// Import routes
import authRoutes from './routes/auth.routes';
import invoicesRoutes from './routes/invoices.routes';
import ratesRoutes from './routes/rates.routes';
import decisionsRoutes from './routes/decisions.routes';
import chatRoutes from './routes/chat.routes';
import settingsRoutes from './routes/settings.routes';
import analyticsRoutes from './routes/analytics.routes';

const app = express();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Middleware
app.use(httpLogger);
app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/invoices', upload.single('file'), invoicesRoutes);
app.use('/api/rates', ratesRoutes);
app.use('/api/decisions', decisionsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/settings', settingsRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

export default app;
