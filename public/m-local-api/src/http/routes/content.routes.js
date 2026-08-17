import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { validate } from '../middleware/validate.js';
import { requireWrites } from '../middleware/require-writes.js';
import { required, isString, oneOf } from '../../lib/validation.js';
import { readContent, readContentRange, writeContent } from '../../services/content.service.js';

export const contentRouter = Router();

// `required()` rejects '' but clearing a file is a legal edit — only demand
// that the field is present and a string.
const defined = () => (v) => (v !== undefined && v !== null) || 'is required';

contentRouter.get(
  '/content',
  validate('query', {
    path: [required(), isString()],
    encoding: [oneOf(['utf-8', 'base64'])],
  }),
  asyncHandler(async (req, res) => {
    res.json(await readContent({ path: req.query.path, encoding: req.query.encoding }));
  }),
);

// Overwrite an existing file (no create). Optional `baseMtime` enables
// optimistic locking — 409 when the file changed on disk since it was read.
contentRouter.put(
  '/content',
  requireWrites,
  validate('body', {
    path: [required(), isString()],
    content: [defined(), isString()],
    baseMtime: [isString()],
  }),
  asyncHandler(async (req, res) => {
    res.json(await writeContent({
      path: req.body.path,
      content: req.body.content,
      baseMtime: req.body.baseMtime,
    }));
  }),
);

// Byte-range slice reader. Not subject to the whole-file `/content` size cap —
// used to stream files larger than MAX_FILE_BYTES (e.g. big session JSONL).
contentRouter.get(
  '/content-range',
  validate('query', {
    path: [required(), isString()],
    offset: [isString()],
    length: [isString()],
  }),
  asyncHandler(async (req, res) => {
    res.json(await readContentRange({
      path: req.query.path,
      offset: req.query.offset,
      length: req.query.length,
    }));
  }),
);
