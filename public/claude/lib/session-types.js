/**
 * Domain types for the Claude conversation viewer (ported from m-claude's
 * `types/session.ts`). TypeScript interfaces become JSDoc `@typedef`s; the one
 * runtime value — `FILE_TOOL_ACTIONS` — is exported as a plain object.
 *
 * These describe the NORMALIZED shape the parser emits to the UI, not the raw
 * JSONL event shape (see `schema.js` for the raw-event zod schemas).
 */

/**
 * @typedef {Object} Tokens
 * @property {number} input
 * @property {number} output
 * @property {number} cacheCreation
 * @property {number} cacheRead
 */

/** @typedef {"read"|"write"|"edit"} ToolAction */

/**
 * @typedef {Object} FileTouched
 * @property {string} path
 * @property {Partial<Record<ToolAction, number>>} actions
 */

/** @typedef {Record<string, number>} ToolCounts */

/**
 * @typedef {Object} ProjectSummary
 * @property {string} slug
 * @property {string} path Human-readable display path derived from the slug.
 * @property {string|null} lastActivity ISO 8601 timestamp of the newest session's
 *   mtime, or null when the project has no sessions yet.
 * @property {number} [sessionCount] Optional; populated lazily by the UI when known.
 */

/**
 * @typedef {Object} SessionSummary
 * @property {string} id
 * @property {string} title
 * @property {string} firstTimestamp
 * @property {string} lastTimestamp
 * @property {number} messageCount
 * @property {string[]} models
 * @property {Tokens} tokens
 */

/**
 * @typedef {Object} SessionMeta
 * @property {string} id
 * @property {string} slug
 * @property {string} startedAt
 * @property {string} lastActivityAt
 * @property {number} duration ms between startedAt and lastActivityAt.
 * @property {string|null} cwd
 * @property {string|null} gitBranch
 * @property {string|null} version
 * @property {string[]} models
 * @property {Tokens} tokens
 * @property {ToolCounts} toolsUsed
 * @property {FileTouched[]} filesTouched
 */

/**
 * @typedef {Object} ParseError
 * @property {number} line
 * @property {string} error
 */

/**
 * A normalized, displayable message. `type` is one of:
 * "user" | "assistant-text" | "thinking" | "tool-use" | "tool-result" | "attachment".
 * Shared fields: uuid, key (`${uuid}:${index}`), parentUuid, timestamp, model?.
 *
 * @typedef {Object} Message
 * @property {string} type
 * @property {string} uuid
 * @property {string} key
 * @property {string|null} parentUuid
 * @property {string} timestamp
 * @property {string} [model]
 * @property {string} [text]        user / assistant-text / thinking
 * @property {boolean} [isMeta]     user
 * @property {string} [toolUseId]   tool-use / tool-result
 * @property {string} [name]        tool-use
 * @property {unknown} [input]      tool-use
 * @property {string|null} [resultKey] tool-use → its paired tool-result key
 * @property {string} [content]     tool-result
 * @property {boolean} [isError]    tool-result
 * @property {string} [path]        attachment
 * @property {unknown} [raw]        attachment
 */

/**
 * The tool-name → file-action mapping used by `aggregate.js`.
 * @type {Record<string, ToolAction>}
 */
export const FILE_TOOL_ACTIONS = {
  Read: 'read',
  Write: 'write',
  Edit: 'edit',
  MultiEdit: 'edit',
  NotebookEdit: 'edit',
};
