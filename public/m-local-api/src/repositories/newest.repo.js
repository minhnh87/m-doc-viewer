import path from 'node:path';
import { listDirEntries, getStat } from './file-system.repo.js';
import { extAllowed } from '../config/constants.js';

/**
 * List files under `dir` sorted by mtime (newest first).
 *
 * @param {string} dir
 * @param {{ extensions?: string[]|null, recursive?: boolean }} [options]
 * @returns {Promise<{ name: string, path: string, mtime: Date, size: number }[]>}
 */
export async function listFilesByMtime(dir, { extensions = null, recursive = false } = {}) {
  const results = [];

  async function walk(d) {
    let entries;
    try {
      entries = await listDirEntries(d);
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) {
        if (recursive) await walk(full);
        continue;
      }
      if (!entry.isFile()) continue;
      const ext = path.extname(entry.name).toLowerCase();
      if (!extAllowed(ext, extensions)) continue;
      const stat = await getStat(full);
      results.push({ name: entry.name, path: full, mtime: stat.mtime, size: stat.size });
    }
  }

  await walk(dir);
  results.sort((a, b) => b.mtime - a.mtime);
  return results;
}
