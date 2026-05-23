import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { validate } from '../middleware/validate.js';
import { required, isString, oneOf } from '../../lib/validation.js';
import { search } from '../../services/search.service.js';

export const searchRouter = Router();

function parseExternalFolders(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error parsing external folders:', err);
    return [];
  }
}

searchRouter.get(
  '/search',
  validate('query', {
    query: [required(), isString()],
    scope: [oneOf(['folder', 'all'])],
  }),
  asyncHandler(async (req, res) => {
    const data = await search({
      query: req.query.query,
      folder: req.query.folder,
      scope: req.query.scope || 'folder',
      isExternal: req.query.external === 'true',
      externalFolders: parseExternalFolders(req.query.externalFolders),
    });
    res.json(data);
  }),
);
