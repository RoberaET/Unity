import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Initialize Sentry (must be first)
import { initSentry } from './config/sentry';
initSentry();

// Import other dependencies
import { requestLogger, addRequestId } from './middleware/requestLogger';
import { apiVersionMiddleware } from './middleware/apiVersion';
import { errorHandler } from './middleware/errorHandler';
import { limiter } from './middleware/rateLimiter';
import redis from './config/redis';
import prisma from './config/database';

// Import routes
import authRoutes from './routes/v1/auth.routes';
import sessionsRoutes from './routes/v1/sessions.routes';
import transactionsRoutes from './routes/v1/transactions.routes';
import exportRoutes from './routes/v1/export.routes';
import auditRoutes from './routes/v1/audit.routes';
import partnerRoutes from './routes/v1/partner.routes';

const app = express();
const PORT = process.env.PORT || 3001;

// --- Security & Observability Middleware ---

// 1. Security Headers
app.use(helmet());

// 2. CORS
app.use(cors({
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:4173'
    ],
    credentials: true,
}));

// 3. Request Logging with Correlation IDs
app.use(requestLogger);

// 4. Body Parsing
app.use(express.json());

// 5. API Versioning
app.use('/api/v1', apiVersionMiddleware);

// 6. Rate Limiting
app.use('/api', limiter);

// --- Routes ---

// Health Check
app.get('/health', async (req, res) => {
    const health = {
        status: 'UP',
        timestamp: new Date(),
        uptime: process.uptime(),
        dependencies: {
            database: 'unknown',
            redis: 'unknown',
        }
    };

    try {
        await prisma.$queryRaw`SELECT 1`;
        health.dependencies.database = 'connected';
    } catch {
        health.dependencies.database = 'disconnected';
    }

    try {
        await redis.ping();
        health.dependencies.redis = 'connected';
    } catch {
        health.dependencies.redis = 'disconnected';
    }

    const allHealthy = Object.values(health.dependencies).every(s => s === 'connected');
    res.status(allHealthy ? 200 : 503).json(health);
});

// API Routes (v1)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/sessions', sessionsRoutes);
app.use('/api/v1/transactions', transactionsRoutes);
app.use('/api/v1/export', exportRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/partners', partnerRoutes);

// DEV ONLY: Bypass routes for local development
if (process.env.NODE_ENV !== 'production') {
    const devRoutes = require('./routes/v1/dev.routes').default;
    app.use('/api/v1/dev', devRoutes);
}

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
    });
});

// --- Global Error Handling ---
app.use(errorHandler);

// --- Start Server ---
const server = app.listen(PORT, () => {
    console.log(`
  🚀 Unity Finance Backend - Production Ready
  
  ✅ Server:          http://localhost:${PORT}
  ✅ Health Check:    http://localhost:${PORT}/health
  ✅ API Version:     v1
  
  🔒 Security Features:
     • Rate Limiting
     • Account Lockout
     • JWT Authentication
     • Audit Logging
  
  📊 Scalability Features:
     • Stateless Design
     • Redis Caching
     • Soft Deletes
     • Feature Flags
  
  📝 Observability:
     • Sentry Error Tracking
     • Request Correlation IDs
     • Slow Query Detection
  `);
});

// Graceful Shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');

    server.close(async () => {
        console.log('HTTP server closed');

        await prisma.$disconnect();
        await redis.quit();

        console.log('Database and Redis connections closed');
        process.exit(0);
    });
});

export default app;
