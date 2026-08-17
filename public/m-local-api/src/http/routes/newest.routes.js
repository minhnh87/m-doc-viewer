import { Router } from 'express';
import { config } from '../../config/index.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { validate } from '../middleware/validate.js';
import { required, isString } from '../../lib/validation.js';
import { parseExtParam, parseBool } from '../../lib/params.js';
import { getNewest } from '../../services/newest.service.js';

export const newestRouter = Router();

newestRouter.get(
  '/newest',
  validate('query', { dir: [required(), isString()] }),
  asyncHandler(async (req, res) => {
    const extParam = parseExtParam(req.query.ext);
    const extensions = extParam === undefined ? config.extensions : extParam;
    res.json(await getNewest({
      dir: req.query.dir,
      extensions,
      recursive: parseBool(req.query.recursive),
    }));
  }),
);
