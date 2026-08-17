import { Router } from 'express';
import { config } from '../../config/index.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { validate } from '../middleware/validate.js';
import { required, isString } from '../../lib/validation.js';
import {
  parseCsv, parseExtParam, parseBool, parseJsonArray, parseIntOr,
} from '../../lib/params.js';
import { search } from '../../services/search.service.js';

export const searchRouter = Router();

searchRouter.get(
  '/search',
  validate('query', {
    query: [required(), isString()],
    roots: [required(), isString()],
  }),
  asyncHandler(async (req, res) => {
    const extParam = parseExtParam(req.query.ext);
    const extensions = extParam === undefined ? config.extensions : extParam;
    const excludeDirs = parseCsv(req.query.exclude) || config.excludeDirs;
    const includeHidden = req.query.includeHidden !== undefined
      ? parseBool(req.query.includeHidden)
      : config.includeHidden;

    const data = await search({
      query: req.query.query,
      roots: parseJsonArray(req.query.roots),
      recursive: parseBool(req.query.recursive),
      extensions,
      excludeDirs,
      includeHidden,
      maxMatches: parseIntOr(req.query.maxMatches, 5),
      context: parseIntOr(req.query.context, 50),
    });
    res.json(data);
  }),
);
