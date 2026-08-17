/**
 * Streaming JSONL parser for Claude Code session files (ported from m-claude's
 * `lib/parser.ts`).
 *
 * The ONLY structural change from the original is the byte source: instead of a
 * `node:fs` `createReadStream`, the line reader consumes an injected async
 * iterable of already-decoded string chunks (produced by `claude-api.js`'s
 * range-read stream). The `MAX_LINE_BYTES` guard is preserved — `Buffer.byteLength`
 * is replaced with the pure `utf8ByteLength` helper so it runs in the browser.
 *
 * Malformed lines (invalid JSON, schema failure, oversized) are captured as
 * `ParseError` entries and the parse continues. A source-level error (e.g. a
 * failed network read) is caught and surfaced as a synthetic `ParseError` so
 * partial results are still returned.
 */

import {
  AssistantEventSchema,
  AttachmentEventSchema,
  UserEventSchema,
} from './schema.js';
import { createAggregator } from './aggregate.js';

/** Maximum single-line size the parser will accept (4 MiB). Larger lines are reported as ParseError. */
export const MAX_LINE_BYTES = 4 * 1024 * 1024;

/**
 * Exact UTF-8 byte length of a JS string, without allocating a Buffer/encoder.
 * @param {string} str
 * @returns {number}
 */
export function utf8ByteLength(str) {
  let bytes = 0;
  for (let i = 0; i < str.length; i += 1) {
    const code = str.charCodeAt(i);
    if (code < 0x80) {
      bytes += 1;
    } else if (code < 0x800) {
      bytes += 2;
    } else if (code >= 0xd800 && code <= 0xdbff) {
      // High surrogate: 4 bytes only if followed by a low surrogate (valid pair);
      // a lone surrogate encodes as U+FFFD (3 bytes), matching TextEncoder.
      const next = str.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) { bytes += 4; i += 1; } else bytes += 3;
    } else {
      bytes += 3;
    }
  }
  return bytes;
}

/**
 * Wrap a whole string as an async chunk source (optionally split into fixed-size
 * character chunks). Used by tests and by any caller that already has the full
 * text in memory.
 * @param {string} str
 * @param {number} [chunkSize]
 */
export async function* stringToChunks(str, chunkSize = str.length || 1) {
  for (let i = 0; i < str.length; i += chunkSize) {
    yield str.slice(i, i + chunkSize);
  }
}

/**
 * Full parse: returns every message plus aggregated metadata.
 * @param {AsyncIterable<string>} chunkSource
 */
export async function parseSession(chunkSource) {
  const { messages, parseErrors, aggregator } = await runParse(chunkSource, {
    collectMessages: true,
  });
  return { messages, parseErrors, snapshot: aggregator.snapshot() };
}

/**
 * Lightweight parse used by the session list — skips building the Message[].
 * @param {AsyncIterable<string>} chunkSource
 * @param {string} id
 */
export async function parseSessionSummary(chunkSource, id) {
  const { parseErrors, aggregator } = await runParse(chunkSource, { collectMessages: false });
  const snap = aggregator.snapshot();
  const summary = {
    id,
    title: snap.title,
    firstTimestamp: snap.firstTimestamp ?? '',
    lastTimestamp: snap.lastTimestamp ?? '',
    messageCount: snap.messageCount,
    models: snap.models,
    tokens: snap.tokens,
  };
  return { summary, parseErrors };
}

/**
 * Build a `SessionMeta` from an aggregate snapshot. The original derived
 * `startedAt`/`lastActivityAt` from `stat().birthtime`/`mtime`; `birthtime` is
 * unavailable over HTTP, so we fall back to the snapshot timestamps first and
 * only then to the file's mtime (passed in ISO form by the data layer).
 *
 * @param {string} id
 * @param {string} slug
 * @param {import('./aggregate.js').AggregateSnapshot} snap
 * @param {string|null} [fallbackMtimeIso]
 */
export function sessionMetaFromSnapshot(id, slug, snap, fallbackMtimeIso = null) {
  const fallback = fallbackMtimeIso ?? snap.firstTimestamp ?? '';
  const startedAt = snap.firstTimestamp ?? fallback;
  const lastActivityAt = snap.lastTimestamp ?? fallback;
  const duration = Math.max(
    0,
    new Date(lastActivityAt).getTime() - new Date(startedAt).getTime(),
  );
  return {
    id,
    slug,
    startedAt,
    lastActivityAt,
    duration: Number.isFinite(duration) ? duration : 0,
    cwd: snap.cwd,
    gitBranch: snap.gitBranch,
    version: snap.version,
    models: snap.models,
    tokens: snap.tokens,
    toolsUsed: snap.toolsUsed,
    filesTouched: snap.filesTouched,
  };
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

async function runParse(chunkSource, opts) {
  const aggregator = createAggregator();
  const messages = [];
  const parseErrors = [];
  /** Maps tool_use_id → the index of the emitted tool-use Message so we can backfill `resultKey`. */
  const toolUseIndex = new Map();

  try {
    for await (const { lineNum, line, oversized } of readLines(chunkSource)) {
      if (oversized) {
        parseErrors.push({ line: lineNum, error: `line exceeds ${MAX_LINE_BYTES} bytes` });
        continue;
      }
      if (line.length === 0) continue;
      processLine(line, lineNum, opts, aggregator, messages, parseErrors, toolUseIndex);
    }
  } catch (err) {
    parseErrors.push({ line: 0, error: `stream error: ${errorMessage(err)}` });
  }

  return { messages, parseErrors, aggregator };
}

function processLine(rawLine, lineNum, opts, aggregator, messages, parseErrors, toolUseIndex) {
  let parsed;
  try {
    parsed = JSON.parse(rawLine);
  } catch (err) {
    parseErrors.push({ line: lineNum, error: errorMessage(err) });
    return;
  }

  if (!parsed || typeof parsed !== 'object' || !('type' in parsed)) {
    parseErrors.push({ line: lineNum, error: 'event is missing a type field' });
    return;
  }

  const type = parsed.type;

  if (type === 'user') {
    const result = UserEventSchema.safeParse(parsed);
    if (!result.success) {
      parseErrors.push({ line: lineNum, error: zodMessage(result.error) });
      return;
    }
    aggregator.addUserEvent(result.data);
    if (opts.collectMessages) {
      pushUserMessages(messages, result.data, toolUseIndex);
    }
  } else if (type === 'assistant') {
    const result = AssistantEventSchema.safeParse(parsed);
    if (!result.success) {
      parseErrors.push({ line: lineNum, error: zodMessage(result.error) });
      return;
    }
    aggregator.addAssistantEvent(result.data);
    if (opts.collectMessages) {
      pushAssistantMessages(messages, result.data, toolUseIndex);
    }
  } else if (type === 'attachment') {
    const result = AttachmentEventSchema.safeParse(parsed);
    if (!result.success) {
      parseErrors.push({ line: lineNum, error: zodMessage(result.error) });
      return;
    }
    aggregator.recordTimestamp(result.data.timestamp);
    aggregator.bumpMessageCount();
    if (opts.collectMessages) {
      messages.push(buildAttachmentMessage(result.data));
    }
  } else {
    // Unknown/non-visible event types (system, permission-mode, file-history-snapshot,
    // queue-operation, progress, last-prompt, …). Record timestamp only.
    if ('timestamp' in parsed && typeof parsed.timestamp === 'string') {
      aggregator.recordTimestamp(parsed.timestamp);
    }
  }
}

/**
 * Custom line reader that enforces `MAX_LINE_BYTES` on the partial buffer — a
 * malformed stream with no newline cannot grow beyond the cap. When an oversized
 * line is detected, we drain its remaining bytes and emit it as a single
 * `oversized: true` record. Consumes already-decoded string chunks.
 *
 * @param {AsyncIterable<string>} chunkSource
 */
async function* readLines(chunkSource) {
  let buffer = '';
  let bufferBytes = 0;
  let lineNum = 0;
  let skipUntilNewline = false;

  for await (const text of chunkSource) {
    if (!text) continue;
    let offset = 0;

    while (offset < text.length) {
      const nl = text.indexOf('\n', offset);

      if (skipUntilNewline) {
        if (nl === -1) {
          offset = text.length;
          break;
        }
        offset = nl + 1;
        skipUntilNewline = false;
        continue;
      }

      if (nl === -1) {
        const remainder = text.slice(offset);
        const remainderBytes = utf8ByteLength(remainder);
        if (bufferBytes + remainderBytes > MAX_LINE_BYTES) {
          lineNum += 1;
          yield { lineNum, line: '', oversized: true };
          buffer = '';
          bufferBytes = 0;
          skipUntilNewline = true;
        } else {
          buffer += remainder;
          bufferBytes += remainderBytes;
        }
        break;
      }

      const segment = text.slice(offset, nl);
      const segmentBytes = utf8ByteLength(segment);
      lineNum += 1;
      if (bufferBytes + segmentBytes > MAX_LINE_BYTES) {
        yield { lineNum, line: '', oversized: true };
      } else {
        const line = buffer + segment;
        const cleanLine = line.endsWith('\r') ? line.slice(0, -1) : line;
        yield { lineNum, line: cleanLine, oversized: false };
      }
      buffer = '';
      bufferBytes = 0;
      offset = nl + 1;
    }
  }

  if (!skipUntilNewline && buffer.length > 0) {
    lineNum += 1;
    const cleanLine = buffer.endsWith('\r') ? buffer.slice(0, -1) : buffer;
    yield { lineNum, line: cleanLine, oversized: false };
  }
}

function pushUserMessages(messages, event, toolUseIndex) {
  const uuid = event.uuid ?? synthesizeFallbackId();
  const parentUuid = event.parentUuid ?? null;
  const timestamp = event.timestamp ?? '';
  const isMeta = event.isMeta === true;
  const content = event.message.content;

  if (typeof content === 'string') {
    messages.push({
      type: 'user', uuid, key: `${uuid}:0`, parentUuid, timestamp, text: content, isMeta,
    });
    return;
  }

  let emitted = 0;
  content.forEach((block, index) => {
    if (block.type === 'text' && 'text' in block && typeof block.text === 'string') {
      messages.push({
        type: 'user', uuid, key: `${uuid}:${index}`, parentUuid, timestamp, text: block.text, isMeta,
      });
      emitted += 1;
    } else if (block.type === 'tool_result') {
      const msg = buildToolResultMessage(uuid, parentUuid, timestamp, index, block);
      messages.push(msg);
      backfillResultKey(messages, toolUseIndex, block.tool_use_id, msg.key);
      emitted += 1;
    }
  });

  // Ensure even a content-less user event still produces a node so the stream is coherent.
  if (emitted === 0) {
    messages.push({
      type: 'user', uuid, key: `${uuid}:0`, parentUuid, timestamp, text: '', isMeta,
    });
  }
}

function pushAssistantMessages(messages, event, toolUseIndex) {
  const uuid = event.uuid ?? synthesizeFallbackId();
  const parentUuid = event.parentUuid ?? null;
  const timestamp = event.timestamp ?? '';
  const model = event.message.model;

  event.message.content.forEach((block, index) => {
    const key = `${uuid}:${index}`;
    if (block.type === 'text' && 'text' in block && typeof block.text === 'string') {
      messages.push({
        type: 'assistant-text', uuid, key, parentUuid, timestamp, model, text: block.text,
      });
    } else if (block.type === 'thinking' && 'thinking' in block && typeof block.thinking === 'string') {
      messages.push({
        type: 'thinking', uuid, key, parentUuid, timestamp, model, text: block.thinking,
      });
    } else if (block.type === 'tool_use') {
      const msgIndex = messages.length;
      messages.push({
        type: 'tool-use',
        uuid,
        key,
        parentUuid,
        timestamp,
        model,
        toolUseId: block.id,
        name: block.name,
        input: block.input,
        resultKey: null,
      });
      toolUseIndex.set(block.id, msgIndex);
    } else if (block.type === 'tool_result') {
      const msg = buildToolResultMessage(uuid, parentUuid, timestamp, index, block);
      messages.push(msg);
      backfillResultKey(messages, toolUseIndex, block.tool_use_id, msg.key);
    }
    // image / unknown blocks are skipped — they aren't part of the visible stream.
  });
}

function buildToolResultMessage(uuid, parentUuid, timestamp, index, block) {
  return {
    type: 'tool-result',
    uuid,
    key: `${uuid}:${index}`,
    parentUuid,
    timestamp,
    toolUseId: block.tool_use_id,
    content: flattenToolResultContent(block.content),
    isError: block.is_error === true,
  };
}

function buildAttachmentMessage(event) {
  const uuid = event.uuid ?? synthesizeFallbackId();
  const raw = event.attachment;
  let attachmentPath;
  if (raw && typeof raw === 'object' && 'path' in raw) {
    const value = raw.path;
    if (typeof value === 'string') attachmentPath = value;
  }
  return {
    type: 'attachment',
    uuid,
    key: `${uuid}:0`,
    parentUuid: event.parentUuid ?? null,
    timestamp: event.timestamp ?? '',
    path: attachmentPath,
    raw,
  };
}

function backfillResultKey(messages, toolUseIndex, toolUseId, resultKey) {
  const idx = toolUseIndex.get(toolUseId);
  if (idx === undefined) return;
  const target = messages[idx];
  if (target && target.type === 'tool-use') {
    target.resultKey = resultKey;
  }
}

function flattenToolResultContent(content) {
  if (content === undefined || content === null) return '';
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (!part || typeof part !== 'object') return '';
        if (part.type === 'text' && typeof part.text === 'string') return part.text;
        return '';
      })
      .filter(Boolean)
      .join('\n');
  }
  return '';
}

function errorMessage(err) {
  if (err instanceof Error) return err.message;
  return String(err);
}

function zodMessage(err) {
  const first = err.issues?.[0];
  if (!first) return 'schema validation failed';
  const path = first.path.map((segment) => String(segment)).join('.') || '<root>';
  return `${path}: ${first.message}`;
}

let idCounter = 0;
function synthesizeFallbackId() {
  idCounter += 1;
  return `auto-${idCounter.toString(36)}`;
}
