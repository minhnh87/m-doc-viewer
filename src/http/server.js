import express from 'express';
import { config } from '../config/index.js';
import { filesRouter } from './routes/files.routes.js';
import { foldersRouter } from './routes/folders.routes.js';
import { searchRouter } from './routes/search.routes.js';
import { externalRouter } from './routes/external.routes.js';
import { plansRouter } from './routes/plans.routes.js';
import { errorHandler } from './middleware/error-handler.js';

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(express.static(config.staticDir));

  app.use('/api', filesRouter);
  app.use('/api', foldersRouter);
  app.use('/api', searchRouter);
  app.use('/api', externalRouter);
  app.use('/api', plansRouter);

  app.use(errorHandler);
  return app;
}
