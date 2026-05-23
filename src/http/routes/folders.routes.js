import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { validate } from '../middleware/validate.js';
import { required, isString } from '../../lib/validation.js';
import {
  createFolder,
  deleteFolder,
  validateExternalFolder,
} from '../../services/folders.service.js';

export const foldersRouter = Router();

foldersRouter.post(
  '/folder',
  validate('body', { name: [required(), isString()] }),
  asyncHandler(async (req, res) => {
    const data = await createFolder({ name: req.body.name });
    res.json(data);
  }),
);

foldersRouter.delete(
  '/folder',
  validate('query', { path: [required(), isString()] }),
  asyncHandler(async (req, res) => {
    const data = await deleteFolder({ folderPath: req.query.path });
    res.json(data);
  }),
);

foldersRouter.post(
  '/validate-folder',
  validate('body', { path: [required(), isString()] }),
  asyncHandler(async (req, res) => {
    const data = await validateExternalFolder({ folderPath: req.body.path });
    res.json(data);
  }),
);
