import path from 'node:path';
import { config } from '../config/index.js';
import { getFileType } from '../config/constants.js';
import {
  NotFoundError, BadRequestError, ConflictError, PayloadTooLargeError,
} from '../lib/errors.js';
import { resolveInputPath } from '../lib/paths.js';
import {
  pathExists, getStat, readFile, readFileRange, writeFile,
} from '../repositories/file-system.repo.js';

/** Per-request slice cap (8 MiB). Clients loop offsets to read more. */
export const MAX_RANGE_BYTES = 8 * 1024 * 1024;

/**
 * Resolve an input path and assert it points at an existing regular file,
 * throwing the standard typed errors (404 missing, 400 directory/not-a-file).
 *
 * @param {string} inputPath
 * @returns {Promise<{ resolved: string, stat: import('node:fs').Stats }>}
 */
async function resolveExistingFile(inputPath) {
  const resolved = resolveInputPath(inputPath);
  if (!(await pathExists(resolved))) throw new NotFoundError('File not found');
  const stat = await getStat(resolved);
  if (stat.isDirectory()) throw new BadRequestError('Path is a directory');
  if (!stat.isFile()) throw new BadRequestError('Path is not a file');
  return { resolved, stat };
}

/**
 * Read a file's raw content. No rendering — the API is format-agnostic.
 *
 * @param {{ path: string, encoding?: 'utf-8'|'base64' }} input
 * @returns {Promise<object>}
 */
export async function readContent({ path: inputPath, encoding }) {
  const { resolved, stat } = await resolveExistingFile(inputPath);
  if (stat.size > config.maxFileBytes) {
    throw new PayloadTooLargeError(
      `File too large: ${stat.size} bytes (max ${config.maxFileBytes})`,
    );
  }

  const enc = encoding === 'base64' ? 'base64' : 'utf-8';
  const content = await readFile(resolved, enc);
  const ext = path.extname(resolved).toLowerCase();

  return {
    path: resolved,
    name: path.basename(resolved),
    ext,
    type: getFileType(ext),
    content,
    encoding: enc,
    size: stat.size,
    mtime: stat.mtime,
  };
}

/**
 * Overwrite an existing file's content. Never creates a file — editing is
 * strictly an update of something the client already loaded.
 *
 * Optimistic locking: when `baseMtime` is provided (the mtime the client got
 * from `readContent`, serialised as an ISO string), the write is rejected with
 * 409 if the file changed on disk since — so a browser edit can't silently
 * clobber changes made by another tool. Omitting `baseMtime` forces the write.
 *
 * @param {{ path: string, content: string, baseMtime?: string }} input
 * @returns {Promise<{ path: string, name: string, size: number, mtime: Date }>}
 */
export async function writeContent({ path: inputPath, content, baseMtime }) {
  const { resolved, stat } = await resolveExistingFile(inputPath);

  if (baseMtime !== undefined && baseMtime !== null) {
    const base = new Date(baseMtime).getTime();
    if (!Number.isFinite(base)) {
      throw new BadRequestError('baseMtime is not a valid date');
    }
    if (base !== stat.mtime.getTime()) {
      throw new ConflictError('File changed on disk since it was loaded');
    }
  }

  const bytes = Buffer.byteLength(content, 'utf-8');
  if (bytes > config.maxFileBytes) {
    throw new PayloadTooLargeError(
      `Content too large: ${bytes} bytes (max ${config.maxFileBytes})`,
    );
  }

  await writeFile(resolved, content);
  const newStat = await getStat(resolved);

  return {
    path: resolved,
    name: path.basename(resolved),
    size: newStat.size,
    mtime: newStat.mtime,
  };
}

/**
 * Read a byte-range slice of a file as base64. Unlike `readContent`, this is
 * NOT gated by `MAX_FILE_BYTES` — it exists precisely to stream files larger
 * than the whole-file cap. Each call returns at most `MAX_RANGE_BYTES`; the
 * client loops `offset` → `size` to read the whole file.
 *
 * @param {{ path: string, offset?: number, length?: number }} input
 * @returns {Promise<{ path: string, size: number, offset: number, length: number, content: string, eof: boolean, mtime: Date }>}
 */
export async function readContentRange({ path: inputPath, offset, length }) {
  const { resolved, stat } = await resolveExistingFile(inputPath);

  const size = stat.size;
  const start = clampInt(offset, 0, 0, size);
  const requested = clampInt(length, MAX_RANGE_BYTES, 0, MAX_RANGE_BYTES);

  // Offset at/after EOF → empty slice, eof=true (never negative reads).
  if (start >= size) {
    return {
      path: resolved, size, offset: start, length: 0, content: '', eof: true, mtime: stat.mtime,
    };
  }

  const count = Math.min(requested, size - start);
  const bytes = await readFileRange(resolved, start, count);

  return {
    path: resolved,
    size,
    offset: start,
    length: bytes.length,
    content: bytes.toString('base64'),
    eof: start + bytes.length >= size,
    mtime: stat.mtime,
  };
}

/** Parse a loosely-typed numeric param, clamp to `[min, max]`, fall back on NaN. */
function clampInt(value, fallback, min, max) {
  const n = Number(value);
  const base = Number.isFinite(n) ? Math.floor(n) : fallback;
  return Math.max(min, Math.min(max, base));
}
