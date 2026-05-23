import path from 'node:path';
import { PROJECT_ROOT } from '../lib/paths.js';
import {
  BadRequestError, ForbiddenError, NotFoundError,
} from '../lib/errors.js';
import { SUPPORTED_EXTENSIONS, getFileType } from '../config/constants.js';
import {
  pathExists, getStat, listDirEntries, readFileUtf8,
} from '../repositories/file-system.repo.js';
import { scanFiles } from '../repositories/project-files.repo.js';

const MAX_MATCHES_PER_FILE = 5;
const CONTEXT_RADIUS = 50;

/**
 * Find query matches inside a single file (case-insensitive).
 *
 * @param {string} fullPath
 * @param {string} fileName
 * @param {string} query
 * @param {boolean} isExternal
 * @param {string} reportedPath - path the API should return for this file
 * @returns {Promise<import('../domain/search.js').SearchResult|null>}
 */
async function searchInFile(fullPath, fileName, query, isExternal, reportedPath) {
  let content;
  try {
    content = await readFileUtf8(fullPath);
  } catch (err) {
    console.error(`Error reading file ${fullPath}:`, err);
    return null;
  }

  const searchLower = query.toLowerCase();
  const lines = content.split('\n');
  const matches = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const matchIndex = line.toLowerCase().indexOf(searchLower);
    if (matchIndex === -1) continue;

    const contextStart = Math.max(0, matchIndex - CONTEXT_RADIUS);
    const contextEnd = Math.min(line.length, matchIndex + query.length + CONTEXT_RADIUS);
    let context = line.substring(contextStart, contextEnd);
    if (contextStart > 0) context = '...' + context;
    if (contextEnd < line.length) context = context + '...';

    matches.push({
      line: i + 1,
      content: context,
      matchStart: contextStart > 0 ? matchIndex - contextStart + 3 : matchIndex,
    });
    if (matches.length >= MAX_MATCHES_PER_FILE) break;
  }

  if (matches.length === 0) return null;

  const ext = path.extname(fileName).toLowerCase();
  return {
    file: {
      name: fileName,
      path: reportedPath,
      fullPath,
      type: getFileType(ext),
      isExternal,
    },
    matches,
  };
}

/**
 * @param {{
 *   query: string,
 *   folder?: string,
 *   scope?: 'folder'|'all',
 *   isExternal?: boolean,
 *   externalFolders?: string[],
 * }} input
 */
export async function search({
  query,
  folder,
  scope = 'folder',
  isExternal = false,
  externalFolders = [],
}) {
  if (!query) throw new BadRequestError('Query is required');
  if (scope === 'folder' && folder === undefined) {
    throw new BadRequestError('Folder is required');
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

  if (scope === 'all') {
    const projectFiles = await scanFiles(PROJECT_ROOT);
    for (const file of projectFiles) {
      collect(await searchInFile(file.fullPath, file.name, query, false, file.path));
    }
    for (const extFolder of externalFolders) {
      if (!(await pathExists(extFolder))) continue;
      const stat = await getStat(extFolder);
      if (!stat.isDirectory()) continue;
      const extFiles = await scanFiles(extFolder, { isExternal: true });
      for (const file of extFiles) {
        collect(await searchInFile(file.fullPath, file.name, query, true, file.fullPath));
      }
    }
    return { results, totalMatches, totalFiles };
  }

  let searchDir;
  if (isExternal) {
    searchDir = folder;
  } else {
    searchDir = folder ? path.join(PROJECT_ROOT, folder) : PROJECT_ROOT;
    if (!searchDir.startsWith(PROJECT_ROOT)) {
      throw new ForbiddenError('Access denied');
    }
  }

  if (!(await pathExists(searchDir))) throw new NotFoundError('Folder not found');
  const stat = await getStat(searchDir);
  if (!stat.isDirectory()) throw new BadRequestError('Path is not a directory');

  const entries = await listDirEntries(searchDir);
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.includes(ext)) continue;
    const fullPath = path.join(searchDir, entry.name);
    const rel = folder ? path.join(folder, entry.name) : entry.name;
    collect(await searchInFile(fullPath, entry.name, query, isExternal, isExternal ? fullPath : rel));
  }

  return { results, totalMatches, totalFiles };
}
