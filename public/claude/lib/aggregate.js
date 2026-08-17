/**
 * Streaming aggregator used by the parser to accumulate session-wide metadata
 * without a second pass. Ported 1:1 from m-claude's `lib/aggregate.ts`.
 */

import { FILE_TOOL_ACTIONS } from './session-types.js';

const TITLE_MIN_LENGTH = 10;
const TITLE_MAX_LENGTH = 60;

// Wrapper messages that are not real user questions (mirrors hooks/save-output.py).
const NON_QUESTION_PREFIXES = [
  '<local-command-caveat>',
  '<local-command-stdout>',
  '<local-command-stderr>',
  '<bash-input>',
  '<bash-stdout>',
  '<bash-stderr>',
  '<system-reminder>',
  '<task-notification>',
];

// Slash commands not worth using as a title — keep looking for the first real question.
const SKIP_COMMANDS = ['/clear', '/context', '/model', '/ui-ux-pro-max'];

const COMMAND_NAME_RE = /<command-name>\s*([^<]+?)\s*<\/command-name>/;

/**
 * @typedef {Object} AggregateSnapshot
 * @property {import('./session-types.js').Tokens} tokens
 * @property {string[]} models
 * @property {import('./session-types.js').ToolCounts} toolsUsed
 * @property {import('./session-types.js').FileTouched[]} filesTouched
 * @property {string|null} firstTimestamp
 * @property {string|null} lastTimestamp
 * @property {number} messageCount
 * @property {string} title
 * @property {string|null} cwd
 * @property {string|null} gitBranch
 * @property {string|null} version
 */

export function createAggregator() {
  const tokens = { input: 0, output: 0, cacheCreation: 0, cacheRead: 0 };
  const modelsSet = new Set();
  const toolsUsed = {};
  const filesIndex = new Map();
  let firstTimestamp = null;
  let lastTimestamp = null;
  let messageCount = 0;
  let title = null;
  let cwd = null;
  let gitBranch = null;
  let version = null;

  function recordTimestamp(timestamp) {
    if (!timestamp) return;
    if (firstTimestamp === null || timestamp < firstTimestamp) firstTimestamp = timestamp;
    if (lastTimestamp === null || timestamp > lastTimestamp) lastTimestamp = timestamp;
  }

  function recordContext(event) {
    if (cwd === null && typeof event.cwd === 'string') cwd = event.cwd;
    if (gitBranch === null && typeof event.gitBranch === 'string') gitBranch = event.gitBranch;
    if (version === null && typeof event.version === 'string') version = event.version;
  }

  function recordToolUse(block) {
    const name = block.name;
    toolsUsed[name] = (toolsUsed[name] ?? 0) + 1;
    const action = FILE_TOOL_ACTIONS[name];
    if (!action) return;
    const filePath = extractFilePath(block.input);
    if (!filePath) return;
    const existing = filesIndex.get(filePath) ?? {};
    existing[action] = (existing[action] ?? 0) + 1;
    filesIndex.set(filePath, existing);
  }

  function tryAdoptTitle(text, isMeta) {
    if (title !== null) return;
    if (isMeta) return;

    const trimmed = text.trim();
    if (NON_QUESTION_PREFIXES.some((prefix) => trimmed.startsWith(prefix))) return;

    // Slash command wrapper: use the command name as title, unless it is a
    // housekeeping command (SKIP_COMMANDS) — then keep looking.
    const commandMatch = COMMAND_NAME_RE.exec(trimmed);
    if (commandMatch) {
      const command = commandMatch[1].trim();
      const isSkipped = SKIP_COMMANDS.some((skip) =>
        command.toLowerCase().startsWith(skip),
      );
      if (!isSkipped) title = command;
      return;
    }

    // Any other tag-wrapped payload is machine output, not a question.
    if (trimmed.startsWith('<')) return;

    if (trimmed.length < TITLE_MIN_LENGTH) return;
    if (trimmed.length > TITLE_MAX_LENGTH) {
      title = trimmed.slice(0, TITLE_MAX_LENGTH - 1) + '…';
    } else {
      title = trimmed;
    }
  }

  return {
    addUserEvent(event) {
      recordTimestamp(event.timestamp);
      recordContext(event);
      messageCount += 1;
      const isMeta = event.isMeta === true;
      const content = event.message.content;
      if (typeof content === 'string') {
        tryAdoptTitle(content, isMeta);
      } else {
        for (const block of content) {
          if (block.type === 'text' && 'text' in block && typeof block.text === 'string') {
            tryAdoptTitle(block.text, isMeta);
          }
        }
      }
    },

    addAssistantEvent(event) {
      recordTimestamp(event.timestamp);
      recordContext(event);
      const model = event.message.model;
      if (typeof model === 'string' && model) modelsSet.add(model);
      const usage = event.message.usage;
      if (usage) {
        tokens.input += usage.input_tokens ?? 0;
        tokens.output += usage.output_tokens ?? 0;
        tokens.cacheCreation += usage.cache_creation_input_tokens ?? 0;
        tokens.cacheRead += usage.cache_read_input_tokens ?? 0;
      }
      for (const block of event.message.content) {
        messageCount += 1;
        if (block.type === 'tool_use') {
          recordToolUse(block);
        }
      }
    },

    bumpMessageCount(n = 1) {
      messageCount += n;
    },

    recordTimestamp,

    snapshot() {
      return {
        tokens: { ...tokens },
        models: Array.from(modelsSet),
        toolsUsed: { ...toolsUsed },
        filesTouched: Array.from(filesIndex.entries()).map(([path, actions]) => ({
          path,
          actions: { ...actions },
        })),
        firstTimestamp,
        lastTimestamp,
        messageCount,
        title: title ?? 'Untitled session',
        cwd,
        gitBranch,
        version,
      };
    },
  };
}

function extractFilePath(input) {
  if (input && typeof input === 'object' && 'file_path' in input) {
    const value = input.file_path;
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return null;
}
