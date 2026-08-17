import express from 'express';
import cors from 'cors';
import { config } from '../config/index.js';
import { requireApiKey } from './middleware/require-api-key.js';
import { metaRouter } from './routes/meta.routes.js';
import { treeRouter } from './routes/tree.routes.js';
import { contentRouter } from './routes/content.routes.js';
import { searchRouter } from './routes/search.routes.js';
import { newestRouter } from './routes/newest.routes.js';
import { foldersRouter } from './routes/folders.routes.js';
import { filesRouter } from './routes/files.routes.js';
import { errorHandler } from './middleware/error-handler.js';

export function createApp() {
  const app = express();

  // `*` allows the `null` origin sent by pages opened over file:// (no credentials).
  // `X-API-Key` must be allowed so the browser doesn't strip it on preflight.
  app.use(cors({
    origin: '*',
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,X-API-Key',
  }));
  // Body limit must cover PUT /content payloads (content up to maxFileBytes
  // plus JSON envelope overhead) — express's 100kb default is far too small.
  app.use(express.json({ limit: config.maxFileBytes + 1024 * 1024 }));

  // Auth gate for the whole (obfuscated) API surface. /health stays open.
  app.use(config.apiPrefix, requireApiKey);

  app.use(config.apiPrefix, metaRouter);
  app.use(config.apiPrefix, treeRouter);
  app.use(config.apiPrefix, contentRouter);
  app.use(config.apiPrefix, searchRouter);
  app.use(config.apiPrefix, newestRouter);
  app.use(config.apiPrefix, foldersRouter);
  app.use(config.apiPrefix, filesRouter);

  app.use(errorHandler);
  return app;
}
