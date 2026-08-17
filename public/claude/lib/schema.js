/**
 * zod schemas for raw JSONL event shapes (ported 1:1 from m-claude's
 * `lib/schema.ts`; only the compile-time `z.infer` type exports are dropped).
 *
 * The CLI can add new fields at any time, so we use `z.looseObject` (zod v4's
 * replacement for `.passthrough()`) throughout. Unknown top-level event types
 * become `UnknownEventSchema` and are filtered by the parser without error.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Content blocks (inside message.content arrays).
// ---------------------------------------------------------------------------

export const TextBlockSchema = z.looseObject({
  type: z.literal('text'),
  text: z.string(),
});

export const ThinkingBlockSchema = z.looseObject({
  type: z.literal('thinking'),
  thinking: z.string(),
  signature: z.string().optional(),
});

export const ToolUseBlockSchema = z.looseObject({
  type: z.literal('tool_use'),
  id: z.string(),
  name: z.string(),
  input: z.unknown(),
});

const ToolResultContent = z.union([
  z.string(),
  z.array(z.looseObject({ type: z.string(), text: z.string().optional() })),
]);

export const ToolResultBlockSchema = z.looseObject({
  type: z.literal('tool_result'),
  tool_use_id: z.string(),
  content: ToolResultContent.optional(),
  is_error: z.boolean().optional(),
});

export const ImageBlockSchema = z.looseObject({
  type: z.literal('image'),
});

export const UnknownBlockSchema = z.looseObject({ type: z.string() });

export const ContentBlockSchema = z.union([
  TextBlockSchema,
  ThinkingBlockSchema,
  ToolUseBlockSchema,
  ToolResultBlockSchema,
  ImageBlockSchema,
  UnknownBlockSchema,
]);

// ---------------------------------------------------------------------------
// Usage / tokens on assistant events.
// ---------------------------------------------------------------------------

export const UsageSchema = z.looseObject({
  input_tokens: z.number().optional(),
  output_tokens: z.number().optional(),
  cache_creation_input_tokens: z.number().optional(),
  cache_read_input_tokens: z.number().optional(),
});

// ---------------------------------------------------------------------------
// Top-level events.
// ---------------------------------------------------------------------------

const EventBase = {
  uuid: z.string().optional(),
  parentUuid: z.string().nullable().optional(),
  timestamp: z.string().optional(),
  sessionId: z.string().optional(),
  cwd: z.string().optional(),
  gitBranch: z.string().optional(),
  version: z.string().optional(),
  isSidechain: z.boolean().optional(),
};

export const UserEventSchema = z.looseObject({
  type: z.literal('user'),
  ...EventBase,
  message: z.looseObject({
    role: z.literal('user').optional(),
    content: z.union([z.string(), z.array(ContentBlockSchema)]),
  }),
  isMeta: z.boolean().optional(),
});

export const AssistantEventSchema = z.looseObject({
  type: z.literal('assistant'),
  ...EventBase,
  message: z.looseObject({
    role: z.literal('assistant').optional(),
    model: z.string().optional(),
    content: z.array(ContentBlockSchema),
    usage: UsageSchema.optional(),
  }),
});

export const AttachmentEventSchema = z.looseObject({
  type: z.literal('attachment'),
  ...EventBase,
  attachment: z.unknown().optional(),
});

/** Catches every non-visible event type: permission-mode, system, file-history-snapshot, queue-operation, progress, last-prompt, and any future type. */
export const UnknownEventSchema = z.looseObject({
  type: z.string(),
});

export const EventSchema = z.union([
  UserEventSchema,
  AssistantEventSchema,
  AttachmentEventSchema,
  UnknownEventSchema,
]);
