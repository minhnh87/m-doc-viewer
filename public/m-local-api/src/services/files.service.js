import path from 'node:path';
import {
  BadRequestError, NotFoundError, ConflictError,
} from '../lib/errors.js';
import { resolveInputPath } from '../lib/paths.js';
import { sanitizeFsName } from '../lib/sanitize.js';
import {
  pathExists, getStat, deleteFile, renameEntry,
} from '../repositories/file-system.repo.js';

/**
 * Delete a file. Generic path-based — no extension/allowlist restrictions.
 *
 * @param {{ path: string }} input
 */
export async function removeFile({ path: inputPath }) {
  const resolved = resolveInputPath(inputPath);
  if (!(await pathExists(resolved))) throw new NotFoundError('File not found');
  const stat = await getStat(resolved);
  if (!stat.isFile()) throw new BadRequestError('Path is not a file');

  await deleteFile(resolved);
  return { success: true, message: 'File deleted successfully', path: resolved };
}

/**
 * Move `from` to `to`, `mv`-style:
 *  - if `to` is an existing directory, the item is moved *into* it
 *  - otherwise `to` is treated as the full destination path
 *
 * @param {{ from: string, to: string }} input
 */
export async function moveFile({ from, to }) {
  const fromResolved = resolveInputPath(from);
  if (!(await pathExists(fromResolved))) throw new NotFoundError('Source not found');

  let dest = resolveInputPath(to);
  if (await pathExists(dest)) {
    const destStat = await getStat(dest);
    if (destStat.isDirectory()) {
      dest = path.join(dest, path.basename(fromResolved));
    }
  }

  if (await pathExists(dest)) {
    throw new ConflictError('A file with this name already exists in the destination');
  }

  await renameEntry(fromResolved, dest);
  return { success: true, message: 'Moved successfully', from: fromResolved, to: dest };
}

/**
 * Rename a file or folder in place (parent directory unchanged).
 *
 * @param {{ path: string, newName: string }} input
 */
export async function renameItem({ path: inputPath, newName }) {
  const resolved = resolveInputPath(inputPath);
  const sanitized = sanitizeFsName(newName);
  if (!sanitized) throw new BadRequestError('Invalid new name');

  const dest = path.join(path.dirname(resolved), sanitized);

  if (!(await pathExists(resolved))) throw new NotFoundError('File or folder not found');
  if (await pathExists(dest)) {
    throw new ConflictError('A file or folder with this name already exists');
  }

  await renameEntry(resolved, dest);
  return { success: true, message: 'Renamed successfully', oldPath: resolved, newPath: dest };
}
