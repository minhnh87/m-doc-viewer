/**
 * Thin transport layer for the Claude viewer over m-local-api. Wraps the shared
 * HTTP core (`modules/http-core.js`) with status-aware error handling (`ApiError`)
 * and a streaming byte-range reader for large session files.
 */

import {
  apiBase, apiPrefix, authHeaders, buildQuery,
} from '../modules/http-core.js';
import { ApiError } from './lib/api-error.js';

/** Per-request range chunk size (1 MiB). Tunable; the server caps each slice at 8 MiB. */
export const RANGE_CHUNK_BYTES = 1024 * 1024;

/**
 * GET a JSON endpoint, throwing `ApiError(status, message)` on failure and
 * `ApiError(0, …)` when the API can't be reached at all.
 * @param {string} subPath
 * @param {Record<string, any>} [params]
 */
async function getJson(subPath, params = {}) {
  const url = apiBase() + apiPrefix() + subPath + buildQuery(params);
  let response;
  try {
    response = await fetch(url, { headers: authHeaders() });
  } catch (err) {
    throw new ApiError(0, `Cannot reach API at ${apiBase() || '(unset API_BASE_URL)'} — ${err.message}`);
  }
  const text = await response.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = null; }
  }
  if (!response.ok) {
    throw new ApiError(response.status, (data && data.error) || `Request failed (${response.status})`);
  }
  return data;
}

/** Scan one directory. `depth=0` returns only immediate children. */
export function tree(root, { ext, depth = 0 } = {}) {
  return getJson('/tree', { root, ext, depth });
}

/** Path metadata (non-throwing for "missing" — returns `{ exists:false, … }`). */
export function stat(path) {
  return getJson('/stat', { path });
}

/** Newest file by mtime under `dir` (throws `ApiError(404)` when none/no dir). */
export function newest(dir, { ext } = {}) {
  return getJson('/newest', { dir, ext });
}

/** Read a single byte-range slice. */
export function contentRange(path, offset, length) {
  return getJson('/content-range', { path, offset, length });
}

/** Decode a base64 string to a byte array (browser `atob`; node ≥18 has it too). */
function base64ToBytes(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * Stream a file's text by looping `content-range` from offset 0 to EOF, decoding
 * each base64 slice with a streaming UTF-8 decoder so multi-byte sequences that
 * straddle a slice boundary aren't corrupted. Yields decoded string chunks — the
 * parser's line reader splits them into complete JSONL lines.
 *
 * @param {string} path
 * @param {{ chunkSize?: number, onProgress?: (loaded:number, total:number)=>void }} [opts]
 * @returns {AsyncGenerator<string>}
 */
export async function* streamFileChunks(path, { chunkSize = RANGE_CHUNK_BYTES, onProgress } = {}) {
  const decoder = new TextDecoder('utf-8');
  let offset = 0;
  let size = 0;

  for (;;) {
    const slice = await contentRange(path, offset, chunkSize);
    size = slice.size;
    if (slice.length > 0) {
      const text = decoder.decode(base64ToBytes(slice.content), { stream: true });
      if (text) yield text;
      offset += slice.length;
    }
    if (onProgress) onProgress(Math.min(offset, size), size);
    if (slice.eof) break;
    if (slice.length === 0) break; // safeguard: no forward progress
  }

  const tail = decoder.decode(); // flush any trailing partial code point
  if (tail) yield tail;
}
