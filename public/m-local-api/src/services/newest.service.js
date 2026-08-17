import { NotFoundError } from '../lib/errors.js';
import { resolveInputPath } from '../lib/paths.js';
import { pathExists } from '../repositories/file-system.repo.js';
import { listFilesByMtime } from '../repositories/newest.repo.js';

/**
 * Return the newest file (by mtime) under `dir`.
 * Replaces the old latest-plan / latest-session endpoints.
 *
 * @param {{ dir: string, extensions?: string[]|null, recursive?: boolean }} input
 * @returns {Promise<{ path: string, name: string, mtime: Date, size: number }>}
 */
export async function getNewest({ dir, extensions = null, recursive = false }) {
  const resolved = resolveInputPath(dir);
  if (!(await pathExists(resolved))) throw new NotFoundError('Directory not found');

  const files = await listFilesByMtime(resolved, { extensions, recursive });
  if (files.length === 0) throw new NotFoundError('No files found');

  const newest = files[0];
  return {
    path: newest.path, name: newest.name, mtime: newest.mtime, size: newest.size,
  };
}
