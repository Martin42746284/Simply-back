import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/auth';
import messagingRoutes from './routes/messaging';
import mediaRoutes from './routes/media';
import paymentsRoutes from './routes/payments';
import usersRoutes from './routes/users';

const app = express();

// Security & Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', messagingRoutes);
app.use('/api', mediaRoutes);
app.use('/api', paymentsRoutes);
app.use('/api', usersRoutes);

// Error handler
app.use(errorHandler);

export default app;
