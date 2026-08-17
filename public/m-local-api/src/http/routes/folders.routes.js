import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { validate } from '../middleware/validate.js';
import { requireWrites } from '../middleware/require-writes.js';
import { required, isString } from '../../lib/validation.js';
import {
  createFolder, deleteFolder, validateFolder,
} from '../../services/folders.service.js';

export const foldersRouter = Router();

foldersRouter.post(
  '/folder',
  requireWrites,
  validate('body', { path: [required(), isString()] }),
  asyncHandler(async (req, res) => {
    res.json(await createFolder({ path: req.body.path }));
  }),
);

foldersRouter.delete(
  '/folder',
  requireWrites,
  validate('query', { path: [required(), isString()] }),
  asyncHandler(async (req, res) => {
    res.json(await deleteFolder({ path: req.query.path }));
  }),
);

// Read-only probe — no write guard.
foldersRouter.post(
  '/validate-folder',
  validate('body', { path: [required(), isString()] }),
  asyncHandler(async (req, res) => {
    res.json(await validateFolder({ path: req.body.path }));
  }),
);
