import express from 'express';
import cors from 'cors';
import { requestLogger } from './middleware/logger.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import listingsRouter from './routes/listings.js';
import authRouter from './routes/auth.js';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/listings', listingsRouter);
  app.use('/auth', authRouter);

  app.use(notFoundHandler);
  app.use(errorHandler); // must be LAST — Express finds error handlers by position
  return app;
}