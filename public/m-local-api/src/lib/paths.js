import path from 'node:path';
import os from 'node:os';

/**
 * Expand a leading `~` to the current user's home directory.
 * Only `~` and `~/...` are supported (not `~otheruser`).
 *
 * @param {string} p
 * @returns {string}
 */
export function expandTilde(p) {
  if (p === '~') return os.homedir();
  if (p.startsWith('~/')) return path.join(os.homedir(), p.slice(2));
  return p;
}

/**
 * Turn any user-supplied path into a normalized absolute path.
 * There is no allowlist — the server binds 127.0.0.1 as the only guard rail.
 *
 * @param {string} p
 * @returns {string}
 */
export function resolveInputPath(p) {
  return path.resolve(expandTilde(p));
}
