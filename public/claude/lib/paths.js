/**
 * Pure slug/path display helpers (ported from m-claude's `lib/paths.ts`).
 *
 * The filesystem-security helpers (`slugToProjectPath`, `sessionFilePath`,
 * `assertInsideClaudeProjects`, `InvalidPathError`) are intentionally NOT ported:
 * they guarded server-side `node:fs` access. In this static app all file reads
 * go through m-local-api, which owns path resolution and is bound to 127.0.0.1.
 * Only the two pure display transforms are needed on the client.
 */

/**
 * Convert a stored slug like `-Users-minh-www-git-foo` into a display string
 * like `/Users/minh/www/git/foo`. Strips a single leading `-` and replaces the
 * rest with `/`.
 * @param {string} slug
 * @returns {string}
 */
export function slugToDisplayPath(slug) {
  const stripped = slug.startsWith('-') ? slug.slice(1) : slug;
  return '/' + stripped.replace(/-/g, '/');
}

/**
 * Shorten a display path to its last two segments prefixed with `.../`.
 * Paths with two or fewer segments are returned unchanged.
 * @param {string} displayPath
 * @returns {string}
 */
export function shortDisplayPath(displayPath) {
  const segments = displayPath.split('/').filter(Boolean);
  if (segments.length <= 2) return displayPath;
  const [parent, current] = segments.slice(-2);
  return `.../${parent}/${current}`;
}
