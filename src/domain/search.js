/**
 * @typedef {Object} SearchMatch
 * @property {number} line - 1-based line number
 * @property {string} content - Context string around match
 * @property {number} matchStart - Index of match within content
 */

/**
 * @typedef {Object} SearchResult
 * @property {import('./file-entry.js').FileEntry} file
 * @property {SearchMatch[]} matches
 */

/**
 * @typedef {Object} SearchResponse
 * @property {SearchResult[]} results
 * @property {number} totalMatches
 * @property {number} totalFiles
 */

export {};
