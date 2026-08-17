// Generic defaults for the local file API. Nothing here is app-specific.

export const FILE_TYPES = {
  MARKDOWN: 'markdown',
  DRAWIO: 'drawio',
  MERMAID: 'mermaid',
  TEXT: 'text',
};

// Directories skipped by default while scanning (overridable per-request / via env).
export const DEFAULT_EXCLUDE_DIRS = ['node_modules', '.git'];

// Extensions surfaced by default (overridable per-request / via env; '*' = all).
export const DEFAULT_EXTENSIONS = ['.md', '.drawio', '.mermaid', '.mmd'];

// Recursion guard for scans (breaks symlink loops when no explicit depth given).
export const DEFAULT_SCAN_DEPTH = 50;

/**
 * Whether an extension passes an extensions filter.
 * `extensions === null` (or falsy) means "accept every file".
 *
 * @param {string} ext - lowercased extension, e.g. ".md"
 * @param {string[]|null} extensions
 * @returns {boolean}
 */
export function extAllowed(ext, extensions) {
  if (!extensions) return true;
  return extensions.includes(ext);
}

/**
 * Map a file extension to a coarse type. Unknown extensions fall back to "text"
 * (behavior change vs the old markdown-reader, which defaulted to "markdown").
 *
 * @param {string} ext - e.g. ".md"
 * @returns {string}
 */
export function getFileType(ext) {
  const lower = String(ext).toLowerCase();
  if (lower === '.md' || lower === '.markdown') return FILE_TYPES.MARKDOWN;
  if (lower === '.drawio') return FILE_TYPES.DRAWIO;
  if (lower === '.mermaid' || lower === '.mmd') return FILE_TYPES.MERMAID;
  return FILE_TYPES.TEXT;
}
