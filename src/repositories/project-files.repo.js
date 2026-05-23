import path from 'node:path';
import { listDirEntries } from './file-system.repo.js';
import { EXCLUDED_DIRS, ALLOWED_HIDDEN_DIRS, SUPPORTED_EXTENSIONS, getFileType } from '../config/constants.js';

/**
 * Recursively scan a directory for supported files.
 *
 * @param {string} dirPath
 * @param {{ basePath?: string, isExternal?: boolean }} [options]
 * @returns {Promise<import('../domain/file-entry.js').FileEntry[]>}
 */
export async function scanFiles(dirPath, options = {}) {
  const basePath = options.basePath || dirPath;
  const isExternal = options.isExternal || false;
  const out = [];

  let entries;
  try {
    entries = await listDirEntries(dirPath);
  } catch (err) {
    console.error(`Error scanning directory ${dirPath}:`, err);
    return out;
  }

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.relative(basePath, fullPath);

    if (entry.isDirectory()) {
      if (entry.name.startsWith('.') && !ALLOWED_HIDDEN_DIRS.includes(entry.name)) continue;
      if (!isExternal && EXCLUDED_DIRS.includes(entry.name)) continue;
      const sub = await scanFiles(fullPath, { basePath, isExternal });
      out.push(...sub);
      continue;
    }

    if (!entry.isFile()) continue;

    const ext = path.extname(entry.name).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.includes(ext)) continue;

    const fileEntry = {
      name: entry.name,
      path: isExternal ? fullPath : relativePath,
      folder: isExternal
        ? (relativePath === entry.name ? '.' : path.dirname(relativePath))
        : path.dirname(relativePath),
      fullPath,
      type: getFileType(ext),
    };
    if (isExternal) fileEntry.isExternal = true;
    out.push(fileEntry);
  }

  return out;
}

/**
 * Recursively list folder paths (excluding hidden + excluded dirs).
 *
 * @param {string} dirPath
 * @param {string} [basePath]
 * @returns {Promise<string[]>}
 */
export async function getAllFolders(dirPath, basePath = dirPath) {
  const out = [];
  let entries;
  try {
    entries = await listDirEntries(dirPath);
  } catch (err) {
    console.error(`Error scanning folders ${dirPath}:`, err);
    return out;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.') && !ALLOWED_HIDDEN_DIRS.includes(entry.name)) continue;
    if (EXCLUDED_DIRS.includes(entry.name)) continue;
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.relative(basePath, fullPath);
    out.push(relativePath);
    out.push(...(await getAllFolders(fullPath, basePath)));
  }
  return out;
}
