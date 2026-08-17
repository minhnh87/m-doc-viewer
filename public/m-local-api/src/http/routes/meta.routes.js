import { Router } from 'express';
import { config } from '../../config/index.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { validate } from '../middleware/validate.js';
import { required, isString } from '../../lib/validation.js';
import { resolveInputPath } from '../../lib/paths.js';
import { pathExists, getStat } from '../../repositories/file-system.repo.js';

export const metaRouter = Router();

metaRouter.get('/health', (_req, res) => {
  res.json({ ok: true, name: config.name, version: config.version });
});

metaRouter.get(
  '/stat',
  validate('query', { path: [required(), isString()] }),
  asyncHandler(async (req, res) => {
    const resolved = resolveInputPath(req.query.path);
    if (!(await pathExists(resolved))) {
      return res.json({ exists: false, isFile: false, isDirectory: false, size: 0, mtime: null });
    }
    const stat = await getStat(resolved);
    res.json({
      exists: true,
      isFile: stat.isFile(),
      isDirectory: stat.isDirectory(),
      size: stat.size,
      mtime: stat.mtime,
    });
  }),
);
