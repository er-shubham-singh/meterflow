import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { DEFAULT_CONFIG } from './config/constants.js';
import { connectMongoDB, dbConnectionState } from './config/db.js';
import { seedInitialData } from './data/seed.js';
import { requestLogger } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import eventRoutes from './routes/eventRoutes.js';
import meterRoutes from './routes/meterRoutes.js';
import pricingRoutes from './routes/pricingRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import simulatorRoutes from './routes/simulatorRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import apiKeyRoutes from './routes/apiKeyRoutes.js';
import providerRoutes from './routes/providerRoutes.js';
import gatewayRoutes from './routes/gatewayRoutes.js';
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import { meteringEngine } from './services/meteringEngine.js';

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || DEFAULT_CONFIG.PORT;

// Middleware configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-idempotency-key']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

// Mount API v1 Routes
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/meters', meterRoutes);
app.use('/api/v1/pricing-plans', pricingRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/billing', billingRoutes);
app.use('/api/v1/simulator', simulatorRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/api-keys', apiKeyRoutes);
app.use('/api/v1/providers', providerRoutes);
app.use('/api/v1/gateway', gatewayRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/employees', employeeRoutes);

// System Health & Diagnostics Endpoint
app.get('/api/v1/health', (req, res) => {
  const telemetry = meteringEngine.getTelemetry();
  res.status(200).json({
    status: 'ONLINE',
    service: 'Usage-Based Pricing & Metering Engine',
    version: '1.0.0',
    database: {
      driver: 'Mongoose (NoSQL MongoDB)',
      connected: dbConnectionState.isConnected,
      mongoUriConfigured: dbConnectionState.mongoUri.replace(/:([^:@]{4})[^:@]*@/, ':****@')
    },
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor((Date.now() - telemetry.startTime) / 1000),
    totalEventsIngested: telemetry.totalIngested,
    eventsPerSecond: telemetry.eventsPerSecond,
    memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
  });
});

// Error handling middleware
app.use(errorHandler);

/**
 * Server Bootstrap
 * Connects to MongoDB, seeds initial database fixtures, and launches listener.
 */
async function startServer() {
  // 1. Connect to MongoDB via Mongoose
  await connectMongoDB();

  // 2. Seed initial fixtures into MongoDB Collections
  await seedInitialData();

  // 3. Trigger initial demonstration events
  const { simulatorService } = await import('./services/simulatorService.js');
  await simulatorService.triggerBurst(50, 'mixed');

  // 4. Start HTTP Server
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Usage-Based Pricing & Metering Engine Backend`);
    console.log(`🍃 Database: MongoDB (NoSQL) via Mongoose`);
    console.log(`⚡ Mode: ES Module ("type": "module") | Pattern: MVC`);
    console.log(`📡 Listening on: http://localhost:${PORT}`);
    console.log(`📊 Health Endpoint: http://localhost:${PORT}/api/v1/health`);
    console.log(`⚙️  Replace MONGO_URI in: backend/.env`);
    console.log(`=======================================================`);
  });
}

startServer();

export default app;
