import { Router } from 'express';
import { config } from '../../config/index.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { validate } from '../middleware/validate.js';
import { required, isString, isArray } from '../../lib/validation.js';
import {
  parseCsv, parseExtParam, parseBool, parseIntOr,
} from '../../lib/params.js';
import { getTree, scanTrees } from '../../services/tree.service.js';

export const treeRouter = Router();

/** Merge request-supplied scan params with config defaults. */
function buildScanOptions(src) {
  const extParam = parseExtParam(src.ext);
  const extensions = extParam === undefined ? config.extensions : extParam;
  const excludeDirs = parseCsv(src.exclude) || config.excludeDirs;
  const includeHidden = src.includeHidden !== undefined
    ? parseBool(src.includeHidden)
    : config.includeHidden;

  const opts = { extensions, excludeDirs, includeHidden };
  if (src.depth !== undefined) {
    const depth = parseIntOr(src.depth, undefined);
    if (depth !== undefined) opts.depth = depth;
  }
  return opts;
}

treeRouter.get(
  '/tree',
  validate('query', { root: [required(), isString()] }),
  asyncHandler(async (req, res) => {
    res.json(await getTree(req.query.root, buildScanOptions(req.query)));
  }),
);

treeRouter.post(
  '/trees',
  validate('body', { roots: [required(), isArray()] }),
  asyncHandler(async (req, res) => {
    res.json(await scanTrees(req.body.roots, buildScanOptions(req.body)));
  }),
);
