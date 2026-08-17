import path from 'node:path';
import { BadRequestError } from '../lib/errors.js';
import { resolveInputPath } from '../lib/paths.js';
import { getFileType, extAllowed } from '../config/constants.js';
import {
  pathExists, getStat, listDirEntries, readFileUtf8,
} from '../repositories/file-system.repo.js';
import { scanFiles } from '../repositories/scan.repo.js';

const DEFAULT_MAX_MATCHES = 5;
const DEFAULT_CONTEXT = 50;

/**
 * Find case-insensitive matches inside a single file.
 * The match/context/matchStart math is copied verbatim from the original
 * markdown-reader so highlight offsets stay byte-for-byte identical.
 */
async function searchInFile(fullPath, fileName, query, maxMatches, context) {
  let content;
  try {
    content = await readFileUtf8(fullPath);
  } catch (err) {
    console.error(`search: cannot read ${fullPath}: ${err.message}`);
    return null;
  }

  const searchLower = query.toLowerCase();
  const lines = content.split('\n');
  const matches = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const matchIndex = line.toLowerCase().indexOf(searchLower);
    if (matchIndex === -1) continue;

    const contextStart = Math.max(0, matchIndex - context);
    const contextEnd = Math.min(line.length, matchIndex + query.length + context);
    let ctx = line.substring(contextStart, contextEnd);
    if (contextStart > 0) ctx = `...${ctx}`;
    if (contextEnd < line.length) ctx = `${ctx}...`;

    matches.push({
      line: i + 1,
      content: ctx,
      matchStart: contextStart > 0 ? matchIndex - contextStart + 3 : matchIndex,
    });
    if (matches.length >= maxMatches) break;
  }

  if (matches.length === 0) return null;

  const ext = path.extname(fileName).toLowerCase();
  return {
    file: {
      name: fileName, path: fullPath, ext, type: getFileType(ext),
    },
    matches,
  };
}

/**
 * Search text across one or more roots.
 * - `recursive: true`  → deep scan (respects extensions/excludeDirs/includeHidden)
 * - `recursive: false` → direct children only (depth 0), matching the old
 *   folder-scope `listDirEntries` behavior.
 *
 * @param {{
 *   query: string,
 *   roots: string[],
 *   recursive?: boolean,
 *   extensions?: string[]|null,
 *   excludeDirs?: string[],
 *   includeHidden?: boolean,
 *   maxMatches?: number,
 *   context?: number,
 * }} input
 */
export async function search({
  query,
  roots,
  recursive = false,
  extensions = null,
  excludeDirs = [],
  includeHidden = false,
  maxMatches = DEFAULT_MAX_MATCHES,
  context = DEFAULT_CONTEXT,
}) {
  if (!query) throw new BadRequestError('Query is required');
  if (!Array.isArray(roots) || roots.length === 0) {
    throw new BadRequestError('roots is required');
  }

  const results = [];
  let totalMatches = 0;
  let totalFiles = 0;

  const collect = (result) => {
    if (!result) return;
    results.push(result);
    totalMatches += result.matches.length;
    totalFiles++;
  };

  for (const rawRoot of roots) {
    const resolved = resolveInputPath(rawRoot);
    if (!(await pathExists(resolved))) continue;
    const stat = await getStat(resolved);
    if (!stat.isDirectory()) continue;

    if (recursive) {
      const files = await scanFiles(resolved, {
        extensions, excludeDirs, includeHidden, basePath: resolved,
      });
      for (const file of files) {
        collect(await searchInFile(file.path, file.name, query, maxMatches, context));
      }
    } else {
      const entries = await listDirEntries(resolved);
      for (const entry of entries) {
        if (!entry.isFile()) continue;
        const ext = path.extname(entry.name).toLowerCase();
        if (!extAllowed(ext, extensions)) continue;
        const full = path.join(resolved, entry.name);
        collect(await searchInFile(full, entry.name, query, maxMatches, context));
      }
    }
  }

  return { results, totalMatches, totalFiles };
}
