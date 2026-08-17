import {
  BadRequestError, NotFoundError, ConflictError,
} from '../lib/errors.js';
import { resolveInputPath } from '../lib/paths.js';
import {
  pathExists, getStat, createDir, removeDir,
} from '../repositories/file-system.repo.js';

/**
 * Create a folder (mkdir -p). 409 if it already exists.
 * @param {{ path: string }} input
 */
export async function createFolder({ path: inputPath }) {
  const resolved = resolveInputPath(inputPath);
  if (await pathExists(resolved)) throw new ConflictError('Folder already exists');

  await createDir(resolved);
  return { success: true, message: 'Folder created successfully', path: resolved };
}

/**
 * Delete a folder recursively.
 * @param {{ path: string }} input
 */
export async function deleteFolder({ path: inputPath }) {
  const resolved = resolveInputPath(inputPath);
  if (!(await pathExists(resolved))) throw new NotFoundError('Folder not found');
  const stat = await getStat(resolved);
  if (!stat.isDirectory()) throw new BadRequestError('Path is not a folder');

  await removeDir(resolved);
  return { success: true, message: 'Folder deleted successfully', path: resolved };
}

/**
 * Non-throwing folder check. Always returns 200 with a `valid` flag.
 * @param {{ path: string }} input
 * @returns {Promise<{ valid: boolean, error?: string }>}
 */
export async function validateFolder({ path: inputPath }) {
  const resolved = resolveInputPath(inputPath);
  if (!(await pathExists(resolved))) {
    return { valid: false, error: 'Path does not exist' };
  }
  try {
    const stat = await getStat(resolved);
    if (!stat.isDirectory()) {
      return { valid: false, error: 'Path is not a directory' };
    }
    return { valid: true };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}
