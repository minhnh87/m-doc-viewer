import path from 'node:path';
import { config } from '../config/index.js';
import { EXCLUDED_DIRS } from '../config/constants.js';
import { ForbiddenError } from './errors.js';

const PROJECT_ROOT = config.projectRoot;

/**
 * Check if a relative path is within project and not in an excluded dir.
 * @param {string} relPath
 * @returns {boolean}
 */
export function isPathSafe(relPath) {
  const fullPath = path.resolve(PROJECT_ROOT, relPath);
  if (!fullPath.startsWith(PROJECT_ROOT + path.sep)) return false;

  const rel = path.relative(PROJECT_ROOT, fullPath);
  if (rel === '') return false;

  const firstDir = rel.split(path.sep)[0];
  if (EXCLUDED_DIRS.includes(firstDir)) return false;
  return true;
}

/**
 * Resolve to absolute path. External paths used as-is; local joined with project root.
 * @param {string} filePath
 * @param {boolean} isExternal
 * @returns {{ fullPath: string, relativePath: string }}
 */
export function resolveFilePath(filePath, isExternal) {
  if (isExternal) {
    return { fullPath: filePath, relativePath: filePath };
  }
  const fullPath = path.join(PROJECT_ROOT, filePath);
  if (!fullPath.startsWith(PROJECT_ROOT)) {
    throw new ForbiddenError('Access denied');
  }
  return { fullPath, relativePath: filePath };
}

export { PROJECT_ROOT };
