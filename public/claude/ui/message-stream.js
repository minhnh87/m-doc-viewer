/**
 * Message-stream renderer. Renders the parsed session as an ordered stream:
 * - user / assistant text  → markdown (marked + highlight.js)
 * - thinking / tool_use / tool_result → collapsible cards, collapsed by default
 * - tool_use is paired with its tool_result (via the parser's resultKey); the
 *   paired result is rendered with its call, not as a duplicate standalone card
 * - non-visible events (attachment, …) are hidden unless `showHidden`
 *
 * Tool input/result text is inserted via `<pre>.textContent` (escaped) — never
 * innerHTML — so session data can't inject markup. Returns the user prompts so
 * the caller can build the outline.
 */

import { el, clear } from './dom.js';
import { renderMarkdownInto } from './markdown.js';
import { toolIconSvg } from '../lib/tool-icons.js';
import { formatClock } from './format.js';

const CHEVRON = '<svg class="card-chevron" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M6 4l4 4-4 4z"/></svg>';

/**
 * @param {HTMLElement} container
 * @param {object[]} messages
 * @param {{ showHidden?: boolean }} [opts]
 * @returns {{ userPrompts: {uuid: string, text: string}[] }}
 */
export function renderMessages(container, messages, { showHidden = false } = {}) {
  clear(container);

  const resultByKey = new Map();
  const pairedResultKeys = new Set();
  for (const m of messages) {
    if (m.type === 'tool-result') resultByKey.set(m.key, m);
  }
  for (const m of messages) {
    if (m.type === 'tool-use' && m.resultKey) pairedResultKeys.add(m.resultKey);
  }

  const usedIds = new Set();
  const userPrompts = [];
  const frag = document.createDocumentFragment();

  for (const m of messages) {
    if (m.type === 'attachment' && !showHidden) continue;
    // A paired tool_result is rendered next to its tool_use, not standalone.
    if (m.type === 'tool-result' && pairedResultKeys.has(m.key)) continue;

    let node = null;
    switch (m.type) {
      case 'user':
        node = renderTextMessage(m, 'User', 'msg-user');
        if (!m.isMeta && m.text && m.text.trim()) userPrompts.push({ uuid: m.uuid, text: m.text.trim() });
        break;
      case 'assistant-text':
        node = renderTextMessage(m, 'Assistant', 'msg-assistant');
        break;
      case 'thinking':
        node = renderThinking(m);
        break;
      case 'tool-use':
        node = renderToolUse(m, m.resultKey ? resultByKey.get(m.resultKey) : null);
        break;
      case 'tool-result':
        node = buildToolResultCard(m); // unpaired result
        break;
      case 'attachment':
        node = renderAttachment(m);
        break;
      default:
        node = null;
    }
    if (!node) continue;
    if (m.uuid && !usedIds.has(m.uuid)) { node.id = m.uuid; usedIds.add(m.uuid); }
    node.dataset.key = m.key;
    frag.appendChild(node);
  }

  if (!frag.childNodes.length) {
    container.appendChild(el('div', {
      className: 'stream-placeholder',
      textContent: 'No visible messages. Toggle "Show hidden" to reveal attachments and system events.',
    }));
  } else {
    container.appendChild(frag);
  }
  return { userPrompts };
}

// ---- renderers ------------------------------------------------------------

function renderTextMessage(m, roleLabel, roleClass) {
  const header = el('div', { className: 'msg-header' }, [
    el('span', { className: 'msg-role', textContent: roleLabel }),
    m.model ? el('span', { className: 'msg-model', textContent: m.model }) : null,
    m.isMeta ? el('span', { className: 'msg-meta-tag', textContent: 'meta' }) : null,
    el('span', { className: 'msg-time', textContent: formatClock(m.timestamp) }),
  ]);
  const body = el('div', { className: 'msg-body markdown-body' });
  renderMarkdownInto(body, m.text || '');
  return el('div', { className: `msg ${roleClass}` }, [header, body]);
}

function renderThinking(m) {
  return collapsibleCard({
    extraClass: 'card-thinking',
    name: 'Thinking',
    sub: formatClock(m.timestamp),
    buildDetail: (detail) => {
      const body = el('div', { className: 'markdown-body' });
      renderMarkdownInto(body, m.text || '');
      detail.appendChild(body);
    },
  });
}

function renderToolUse(m, pairedResult) {
  const card = buildToolUseCard(m);
  if (!pairedResult) return card;
  const wrap = el('div', { className: 'tool-pair' }, [card, buildToolResultCard(pairedResult)]);
  return wrap;
}

function buildToolUseCard(m) {
  return collapsibleCard({
    iconSvg: toolIconSvg(m.name),
    name: m.name || 'Tool',
    sub: summarizeInput(m.input),
    buildDetail: (detail) => {
      detail.appendChild(preText(prettyInput(m.input)));
    },
  });
}

function buildToolResultCard(m) {
  const status = el('span', {
    className: `tool-result-status ${m.isError ? 'err' : 'ok'}`,
    textContent: m.isError ? 'error' : 'result',
  });
  return collapsibleCard({
    extraClass: m.isError ? 'card-tool-error' : '',
    name: 'Result',
    subNode: status,
    buildDetail: (detail) => {
      detail.appendChild(preText(m.content || '(empty result)'));
    },
  });
}

function renderAttachment(m) {
  return collapsibleCard({
    extraClass: 'card-attachment',
    name: 'Attachment',
    sub: m.path || '',
    buildDetail: (detail) => {
      detail.appendChild(preText(prettyInput(m.raw)));
    },
  });
}

// ---- collapsible primitive ------------------------------------------------

/**
 * @param {{ iconSvg?: string, name: string, sub?: string, subNode?: Node,
 *   extraClass?: string, buildDetail: (detail: HTMLElement) => void }} cfg
 */
function collapsibleCard(cfg) {
  const detail = el('div', { className: 'card-detail', hidden: true });
  cfg.buildDetail(detail);

  const summaryChildren = [];
  if (cfg.iconSvg) summaryChildren.push(svgIcon(cfg.iconSvg));
  summaryChildren.push(el('span', { className: 'card-name', textContent: cfg.name }));
  if (cfg.subNode) summaryChildren.push(cfg.subNode);
  else if (cfg.sub) summaryChildren.push(el('span', { className: 'card-sub', textContent: cfg.sub }));
  summaryChildren.push(chevron());

  const summary = el('button', {
    className: 'card-summary',
    type: 'button',
    'aria-expanded': 'false',
    onClick: (e) => toggleCard(e.currentTarget, detail),
  }, summaryChildren);

  return el('div', { className: `card ${cfg.extraClass || ''}`.trim() }, [summary, detail]);
}

function toggleCard(summary, detail) {
  const open = summary.getAttribute('aria-expanded') === 'true';
  summary.setAttribute('aria-expanded', String(!open));
  detail.hidden = open;
}

// ---- small builders -------------------------------------------------------

function chevron() {
  const wrap = el('span');
  wrap.innerHTML = CHEVRON;
  return wrap.firstElementChild;
}

function svgIcon(svgString) {
  const wrap = el('span');
  wrap.innerHTML = svgString;
  return wrap.firstElementChild || wrap;
}

/** A <pre> whose content is set via textContent (escaped, no HTML injection). */
function preText(text) {
  const pre = document.createElement('pre');
  pre.textContent = text;
  return pre;
}

function summarizeInput(input) {
  if (input && typeof input === 'object') {
    for (const key of ['file_path', 'command', 'pattern', 'path', 'url', 'query', 'prompt']) {
      if (typeof input[key] === 'string') return truncate(input[key], 120);
    }
  }
  if (typeof input === 'string') return truncate(input, 120);
  return '';
}

function prettyInput(value) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function truncate(str, max) {
  const s = String(str).replace(/\s+/g, ' ').trim();
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}
