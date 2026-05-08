import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import './config/database.js'; // Initialize database connection
import './config/redis.js'; // Initialize Redis connection
import { globalLimiter } from './middleware/rateLimitMiddleware.js';
import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';
import analyticsRoutes from './routes/analytics.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ===== Middleware =====
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global rate limiting
if (NODE_ENV !== 'test') {
  app.use(globalLimiter);
}

// ===== Health Check =====
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

// ===== API Routes =====
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);

// ===== 404 Handler =====
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method,
  });
});

// ===== Error Handler =====
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║   Personal Finance Tracker Backend                        ║
║   Server started successfully!                            ║
╚════════════════════════════════════════════════════════════╝

🌐 API Server: http://localhost:${PORT}
📝 Health Check: http://localhost:${PORT}/health
🔧 Environment: ${NODE_ENV}
🆔 Node Version: ${process.version}

✅ Ready to accept requests
  `);
});

export default app;
