import path from 'node:path';
import { listDirEntries } from './file-system.repo.js';
import { getFileType, extAllowed, DEFAULT_SCAN_DEPTH } from '../config/constants.js';

/**
 * Recursively scan a directory, emitting one entry per matching file.
 * Every field is derived from arguments — nothing app-specific here.
 *
 * @param {string} root
 * @param {{
 *   extensions?: string[]|null,
 *   excludeDirs?: string[],
 *   includeHidden?: boolean,
 *   depth?: number,
 *   basePath?: string,
 * }} [options]
 * @returns {Promise<import('../domain/file-entry.js').FileEntry[]>}
 */
export async function scanFiles(root, options = {}) {
  const {
    extensions = null,
    excludeDirs = [],
    includeHidden = false,
    depth = DEFAULT_SCAN_DEPTH,
    basePath = root,
  } = options;

  const out = [];

  async function walk(dir, remainingDepth) {
    let entries;
    try {
      entries = await listDirEntries(dir);
    } catch (err) {
      // EACCES / transient fs errors: skip this subtree, keep scanning the rest.
      console.error(`scanFiles: cannot read ${dir}: ${err.message}`);
      return;
    }

    for (const entry of entries) {
      const full = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (excludeDirs.includes(entry.name)) continue;
        if (!includeHidden && entry.name.startsWith('.')) continue;
        if (remainingDepth <= 0) continue;
        await walk(full, remainingDepth - 1);
        continue;
      }

      if (!entry.isFile()) continue;

      const ext = path.extname(entry.name).toLowerCase();
      if (!extAllowed(ext, extensions)) continue;

      const relPath = path.relative(basePath, full);
      const parent = path.dirname(relPath);
      out.push({
        name: entry.name,
        path: full,
        relPath,
        folder: parent === '' ? '.' : parent,
        ext,
        type: getFileType(ext),
      });
    }
  }

  await walk(root, depth);
  return out;
}

/**
 * Recursively list folder paths relative to `basePath`, including empty folders.
 *
 * @param {string} root
 * @param {{
 *   excludeDirs?: string[],
 *   includeHidden?: boolean,
 *   depth?: number,
 *   basePath?: string,
 * }} [options]
 * @returns {Promise<string[]>}
 */
export async function getAllFolders(root, options = {}) {
  const {
    excludeDirs = [],
    includeHidden = false,
    depth = DEFAULT_SCAN_DEPTH,
    basePath = root,
  } = options;

  const out = [];

  async function walk(dir, remainingDepth) {
    let entries;
    try {
      entries = await listDirEntries(dir);
    } catch (err) {
      console.error(`getAllFolders: cannot read ${dir}: ${err.message}`);
      return;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (excludeDirs.includes(entry.name)) continue;
      if (!includeHidden && entry.name.startsWith('.')) continue;

      const full = path.join(dir, entry.name);
      out.push(path.relative(basePath, full));
      if (remainingDepth > 0) await walk(full, remainingDepth - 1);
    }
  }

  await walk(root, depth);
  return out;
}
