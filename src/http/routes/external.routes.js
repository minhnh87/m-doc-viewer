import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { validate } from '../middleware/validate.js';
import { required, isArray } from '../../lib/validation.js';
import { scanExternalFolders } from '../../services/external-folders.service.js';

export const externalRouter = Router();

externalRouter.post(
  '/external-files',
  validate('body', { paths: [required(), isArray()] }),
  asyncHandler(async (req, res) => {
    const data = await scanExternalFolders({ paths: req.body.paths });
    res.json(data);
  }),
);
