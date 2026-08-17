/**
 * Marked sessions — the sessions a reader flagged as important, persisted in
 * localStorage (same rationale as `favourites.js`).
 *
 * Storage shape: { [slug: string]: string[] }  (session ids, insertion order)
 * localStorage key: 'claudeMarkedSessions'
 */

const STORAGE_KEY = 'claudeMarkedSessions';

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed;
  } catch {
    return {};
  }
}

function writeAll(map) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* quota / disabled storage — marks are a convenience, not critical */
  }
}

function readListFor(map, slug) {
  const arr = map[slug];
  return Array.isArray(arr) ? arr.filter((id) => typeof id === 'string' && id) : [];
}

/**
 * @param {string} slug  project slug
 * @returns {string[]} marked session ids for that project
 */
export function getMarkedSessions(slug) {
  if (!slug) return [];
  return readListFor(readAll(), slug);
}

/**
 * @param {string} slug
 * @param {string} sessionId
 * @returns {boolean}
 */
export function isSessionMarked(slug, sessionId) {
  if (!slug || !sessionId) return false;
  return getMarkedSessions(slug).includes(sessionId);
}

/**
 * Mark the session if it is unmarked, unmark it otherwise.
 * @param {string} slug
 * @param {string} sessionId
 * @returns {string[]} the project's updated session id list
 */
export function toggleSessionMark(slug, sessionId) {
  if (!slug || !sessionId) return getMarkedSessions(slug);

  const map = readAll();
  const current = readListFor(map, slug);
  const next = current.includes(sessionId)
    ? current.filter((id) => id !== sessionId)
    : [...current, sessionId];

  // Drop the project key entirely once its last mark is gone, so the payload
  // does not grow an empty entry per project ever opened.
  const nextMap = { ...map };
  if (next.length) nextMap[slug] = next;
  else delete nextMap[slug];

  writeAll(nextMap);
  return next;
}
