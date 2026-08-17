import { NotFoundError, BadRequestError } from '../lib/errors.js';
import { resolveInputPath } from '../lib/paths.js';
import { pathExists, getStat } from '../repositories/file-system.repo.js';
import { scanFiles, getAllFolders } from '../repositories/scan.repo.js';

/**
 * Scan a single root, returning flat files + all folder paths (empty ones too).
 *
 * @param {string} rawRoot - User-supplied path (absolute or `~`-prefixed).
 * @param {object} scanOptions - { extensions, excludeDirs, includeHidden, depth? }
 * @returns {Promise<{ root: string, files: object[], folders: string[] }>}
 */
export async function getTree(rawRoot, scanOptions = {}) {
  const resolved = resolveInputPath(rawRoot);
  if (!(await pathExists(resolved))) throw new NotFoundError('Root not found');
  const stat = await getStat(resolved);
  if (!stat.isDirectory()) throw new BadRequestError('Root is not a directory');

  const files = await scanFiles(resolved, { ...scanOptions, basePath: resolved });
  const folders = await getAllFolders(resolved, { ...scanOptions, basePath: resolved });
  return { root: rawRoot, files, folders };
}

/**
 * Scan many roots. Roots that don't exist / aren't directories / error out are
 * skipped (not surfaced as failures). `root` is echoed back verbatim so callers
 * can key results by exactly what they sent.
 *
 * @param {string[]} rawRoots
 * @param {object} scanOptions
 * @returns {Promise<{ roots: { root: string, files: object[], folders: string[] }[] }>}
 */
export async function scanTrees(rawRoots, scanOptions = {}) {
  const roots = [];
  for (const rawRoot of rawRoots) {
    try {
      const resolved = resolveInputPath(rawRoot);
      if (!(await pathExists(resolved))) continue;
      const stat = await getStat(resolved);
      if (!stat.isDirectory()) continue;

      const files = await scanFiles(resolved, { ...scanOptions, basePath: resolved });
      const folders = await getAllFolders(resolved, { ...scanOptions, basePath: resolved });
      roots.push({ root: rawRoot, files, folders });
    } catch (err) {
      console.error(`scanTrees: skipping ${rawRoot}: ${err.message}`);
    }
  }
  return { roots };
}
