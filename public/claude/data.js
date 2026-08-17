/**
 * Browser-side data layer for the Claude viewer. Enumerates projects/sessions
 * via m-local-api and loads session JSONL by streaming chunks into the ported
 * parser. Distinguishes "Claude never ran" (projects dir missing) from "ran but
 * no projects yet" for the empty states.
 */

import { cfg } from '../modules/http-core.js';
import {
  tree, stat, newest, streamFileChunks,
} from './claude-api.js';
import { ApiError } from './lib/api-error.js';
import {
  parseSession, parseSessionSummary, sessionMetaFromSnapshot,
} from './lib/parser.js';
import { slugToDisplayPath } from './lib/paths.js';
import { createKeyedCache } from './lib/cache.js';

const summaryCache = createKeyedCache();
const detailCache = createKeyedCache();

function projectsDir() {
  return String(cfg().CLAUDE_PROJECTS_DIR || '~/.claude/projects').replace(/\/+$/, '');
}

function projectDir(slug) {
  return `${projectsDir()}/${slug}`;
}

function sessionPath(slug, id) {
  return `${projectDir(slug)}/${id}.jsonl`;
}

function toIso(mtime) {
  if (!mtime) return null;
  const d = new Date(mtime);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * List Claude projects. Returns `{ setup, projects }` where `setup=false` means
 * the projects directory does not exist (empty "Claude never ran" state).
 * Projects are ordered by last activity descending.
 * @returns {Promise<{ setup: boolean, projects: import('./lib/session-types.js').ProjectSummary[] }>}
 */
export async function listProjects() {
  let result;
  try {
    result = await tree(projectsDir(), { depth: 0 });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return { setup: false, projects: [] };
    throw err;
  }

  const slugs = (result.folders || []).filter((slug) => slug && !slug.startsWith('.'));

  const projects = await Promise.all(slugs.map(async (slug) => {
    let lastActivity = null;
    try {
      const n = await newest(projectDir(slug), { ext: 'jsonl' });
      lastActivity = toIso(n.mtime);
    } catch (err) {
      if (!(err instanceof ApiError && err.status === 404)) throw err;
      // No sessions yet → leave lastActivity null.
    }
    return {
      slug,
      path: slugToDisplayPath(slug),
      lastActivity,
    };
  }));

  projects.sort((a, b) => {
    if (a.lastActivity === b.lastActivity) return 0;
    if (a.lastActivity === null) return 1;
    if (b.lastActivity === null) return -1;
    return a.lastActivity < b.lastActivity ? 1 : -1;
  });

  return { setup: true, projects };
}

/**
 * List a project's sessions (its `.jsonl` files) sorted by mtime, newest first.
 * Per-session title/tokens are loaded lazily via `loadSessionSummary`.
 * @param {string} slug
 * @returns {Promise<{ id: string, path: string, mtime: string|null, mtimeMs: number, size: number }[]>}
 */
export async function listSessions(slug) {
  let result;
  try {
    result = await tree(projectDir(slug), { ext: 'jsonl', depth: 0 });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return [];
    throw err;
  }

  const files = (result.files || []).filter((f) => f.name && !f.name.startsWith('.'));

  const sessions = await Promise.all(files.map(async (f) => {
    const meta = await stat(f.path);
    return {
      id: f.name.replace(/\.jsonl$/i, ''),
      path: f.path,
      mtime: toIso(meta.mtime),
      mtimeMs: meta.mtime ? new Date(meta.mtime).getTime() : 0,
      size: meta.size || 0,
    };
  }));

  sessions.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return sessions;
}

/**
 * Lazily parse a session's summary (title, message count, tokens, timestamps).
 * Cached by `${slug}:${id}:${mtimeMs}` so a rewrite invalidates just that entry.
 * @param {string} slug
 * @param {string} id
 * @param {number} mtimeMs
 */
export function loadSessionSummary(slug, id, mtimeMs) {
  const key = `${slug}:${id}:${mtimeMs}`;
  return summaryCache.getOrSet(key, async () => {
    const { summary, parseErrors } = await parseSessionSummary(streamFileChunks(sessionPath(slug, id)), id);
    return { summary, parseErrors };
  });
}

/**
 * Load a full session by streaming its JSONL through the parser. Returns the
 * aggregated meta, the message stream, parse errors, and the raw snapshot.
 * Throws `ApiError(404)` when the session file no longer exists.
 *
 * @param {string} slug
 * @param {string} id
 * @param {{ onProgress?: (loaded:number, total:number)=>void, force?: boolean }} [opts]
 */
export async function loadSession(slug, id, { onProgress, force = false } = {}) {
  const path = sessionPath(slug, id);
  const meta = await stat(path);
  if (!meta.exists) throw new ApiError(404, 'Session not found');
  if (!meta.isFile) throw new ApiError(400, 'Session path is not a file');

  const mtimeMs = meta.mtime ? new Date(meta.mtime).getTime() : 0;
  const key = `${slug}:${id}:${mtimeMs}`;
  if (force) detailCache.invalidatePrefix(`${slug}:${id}:`);

  const cached = detailCache.get(key);
  if (cached) {
    if (onProgress) onProgress(meta.size || 0, meta.size || 0);
    return cached;
  }

  const { messages, parseErrors, snapshot } = await parseSession(
    streamFileChunks(path, { onProgress }),
  );
  const session = sessionMetaFromSnapshot(id, slug, snapshot, toIso(meta.mtime));
  const detail = {
    session, messages, parseErrors, snapshot, size: meta.size || 0,
  };
  detailCache.set(key, detail);
  return detail;
}
