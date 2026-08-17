/**
 * @typedef {Object} FileEntry
 * @property {string} name - File name
 * @property {string} path - Absolute filesystem path
 * @property {string} relPath - Path relative to the scanned root
 * @property {string} folder - Parent folder (relative to root) or '.' for the root itself
 * @property {string} ext - Lowercased extension (e.g. ".md")
 * @property {'markdown'|'drawio'|'mermaid'|'text'} type - Coarse file type
 */

export {};
