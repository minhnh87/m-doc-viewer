import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { validate } from '../middleware/validate.js';
import { required, isString } from '../../lib/validation.js';
import {
  listFilesGrouped,
  readContent,
  removeFile,
  moveFile,
  renameItem,
} from '../../services/files.service.js';

export const filesRouter = Router();

filesRouter.get('/files', asyncHandler(async (_req, res) => {
  const grouped = await listFilesGrouped();
  res.json(grouped);
}));

filesRouter.get(
  '/content',
  validate('query', { path: [required(), isString()] }),
  asyncHandler(async (req, res) => {
    const data = await readContent({
      filePath: req.query.path,
      isExternal: req.query.external === 'true',
    });
    res.json(data);
  }),
);

filesRouter.delete(
  '/file',
  validate('query', { path: [required(), isString()] }),
  asyncHandler(async (req, res) => {
    const data = await removeFile({
      filePath: req.query.path,
      isExternal: req.query.external === 'true',
    });
    res.json(data);
  }),
);

filesRouter.put(
  '/file/move',
  validate('body', { from: [required(), isString()], to: [isString()] }),
  asyncHandler(async (req, res) => {
    const data = await moveFile({ from: req.body.from, to: req.body.to || '' });
    res.json(data);
  }),
);

filesRouter.put(
  '/rename',
  validate('body', {
    oldPath: [required(), isString()],
    newName: [required(), isString()],
    type: [isString()],
  }),
  asyncHandler(async (req, res) => {
    const data = await renameItem({
      oldPath: req.body.oldPath,
      newName: req.body.newName,
    });
    res.json(data);
  }),
);
