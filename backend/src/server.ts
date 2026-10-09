import './config/env.js';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDatabase } from './models/db.js';
import researchRouter from './api/routes/research.routes.js';
import libraryRouter from './api/routes/library.routes.js';
import healthRouter from './api/routes/health.routes.js';
import modelRouter from './api/routes/model.routes.js';
import { modelScheduler } from './services/model_scheduler.js';
import { RecommendationController } from './controllers/recommendation.controller.js';
import { logger } from './utils/logger.js';

const app = express();
const port = parseInt(process.env.PORT || '5000', 10);

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  if (req.path !== '/api/health') {
    logger.info(`${req.method} ${req.path}`);
  }
  next();
});

// API Routes
app.use('/api/research', researchRouter);
app.use('/api/library', libraryRouter);
app.use('/api/health', healthRouter);
app.use('/api/models', modelRouter);

// Direct top-level recommendations endpoint alias
app.post('/api/recommendations', RecommendationController.analyzeAndRecommend);
app.get('/api/recommendations', RecommendationController.listSavedUseCases);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled server error', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred.'
  });
});

// Bootstrap server
async function startServer() {
  await connectDatabase();

  app.listen(port, () => {
    logger.info(`LibraryLens AI Backend running on http://localhost:${port}`);
    logger.info(`Health check available at http://localhost:${port}/api/health`);
    logger.info(`AI Model Intelligence endpoints at http://localhost:${port}/api/models`);

    // Start background scheduled model synchronization
    modelScheduler.start();
  });
}

startServer().catch((err) => {
  logger.error('Failed to start server', err);
});
