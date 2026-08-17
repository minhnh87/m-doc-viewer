/**
 * @typedef {Object} SearchMatch
 * @property {number} line - 1-based line number
 * @property {string} content - Context string around the match
 * @property {number} matchStart - Index of the match within `content`
 */

/**
 * @typedef {Object} SearchResultFile
 * @property {string} name
 * @property {string} path - Absolute filesystem path
 * @property {string} ext
 * @property {'markdown'|'drawio'|'mermaid'|'text'} type
 */

/**
 * @typedef {Object} SearchResult
 * @property {SearchResultFile} file
 * @property {SearchMatch[]} matches
 */

/**
 * @typedef {Object} SearchResponse
 * @property {SearchResult[]} results
 * @property {number} totalMatches
 * @property {number} totalFiles
 */

export {};
