import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { validate } from '../middleware/validate.js';
import { requireWrites } from '../middleware/require-writes.js';
import { required, isString } from '../../lib/validation.js';
import {
  removeFile, moveFile, renameItem,
} from '../../services/files.service.js';

export const filesRouter = Router();

filesRouter.delete(
  '/file',
  requireWrites,
  validate('query', { path: [required(), isString()] }),
  asyncHandler(async (req, res) => {
    res.json(await removeFile({ path: req.query.path }));
  }),
);

filesRouter.put(
  '/file/move',
  requireWrites,
  validate('body', { from: [required(), isString()], to: [required(), isString()] }),
  asyncHandler(async (req, res) => {
    res.json(await moveFile({ from: req.body.from, to: req.body.to }));
  }),
);

filesRouter.put(
  '/rename',
  requireWrites,
  validate('body', { path: [required(), isString()], newName: [required(), isString()] }),
  asyncHandler(async (req, res) => {
    res.json(await renameItem({ path: req.body.path, newName: req.body.newName }));
  }),
);
