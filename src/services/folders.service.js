import path from 'node:path';
import { PROJECT_ROOT, isPathSafe } from '../lib/paths.js';
import {
  BadRequestError, ForbiddenError, NotFoundError, ConflictError,
} from '../lib/errors.js';
import { sanitizeFsName } from '../lib/sanitize.js';
import {
  pathExists, getStat, createDir, removeDir,
} from '../repositories/file-system.repo.js';

/**
 * @param {{ name: string }} input
 */
export async function createFolder({ name }) {
  const sanitized = sanitizeFsName(name);
  if (!sanitized) throw new BadRequestError('Invalid folder name');
  if (!isPathSafe(sanitized)) {
    throw new ForbiddenError('Access denied: Cannot create this folder');
  }

  const fullPath = path.join(PROJECT_ROOT, sanitized);
  if (await pathExists(fullPath)) {
    throw new ConflictError('Folder already exists');
  }

  await createDir(fullPath);
  return { success: true, message: 'Folder created successfully', path: sanitized };
}

/**
 * @param {{ folderPath: string }} input
 */
export async function deleteFolder({ folderPath }) {
  if (!isPathSafe(folderPath)) {
    throw new ForbiddenError('Access denied: Cannot delete this folder');
  }

  const fullPath = path.join(PROJECT_ROOT, folderPath);
  if (!(await pathExists(fullPath))) throw new NotFoundError('Folder not found');
  const stat = await getStat(fullPath);
  if (!stat.isDirectory()) throw new BadRequestError('Path is not a folder');

  await removeDir(fullPath);
  return { success: true, message: 'Folder deleted successfully', path: folderPath };
}

/**
 * Check whether an external (absolute) path is a real directory.
 *
 * Returns a body shape the UI expects to read on a 200 response:
 *   { valid: true }
 *   { valid: false, error: '...' }
 *
 * @param {{ folderPath: string }} input
 */
export async function validateExternalFolder({ folderPath }) {
  if (!(await pathExists(folderPath))) {
    return { valid: false, error: 'Path does not exist' };
  }
  try {
    const stat = await getStat(folderPath);
    if (!stat.isDirectory()) {
      return { valid: false, error: 'Path is not a directory' };
    }
    return { valid: true };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}
