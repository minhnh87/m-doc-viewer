import path from 'node:path';
import { config } from '../config/index.js';
import { listDirEntries, getStat, pathExists } from './file-system.repo.js';

/**
 * @returns {Promise<{ name: string, path: string, mtime: Date }[]>}
 */
export async function listPlans() {
  const dir = config.plansDir;
  if (!(await pathExists(dir))) return [];

  const entries = await listDirEntries(dir);
  const results = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith('.md')) continue;
    const fullPath = path.join(dir, entry.name);
    const stat = await getStat(fullPath);
    results.push({ name: entry.name, path: fullPath, mtime: stat.mtime });
  }
  results.sort((a, b) => b.mtime - a.mtime);
  return results;
}
