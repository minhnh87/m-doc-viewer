/**
 * Right-pane metadata panel + prompt outline.
 * Metadata is aggregated by the parser's snapshot; the outline lists the user
 * prompts and scrolls the stream to the selected message.
 */

import { el, clear } from './dom.js';
import { formatTokens } from './format.js';
import { formatDuration, relativeTime } from '../lib/relative-time.js';

/** Render the metadata panel from a `SessionMeta` + summary counts. */
export function renderMetadata(container, session, extra = {}) {
  clear(container);
  if (!session) return;

  const tokens = session.tokens || { input: 0, output: 0, cacheCreation: 0, cacheRead: 0 };
  const totalTokens = tokens.input + tokens.output + tokens.cacheCreation + tokens.cacheRead;

  // Overview
  container.appendChild(section('Session', [
    metaRow('Started', session.startedAt ? relativeTime(session.startedAt) : '—'),
    metaRow('Last activity', session.lastActivityAt ? relativeTime(session.lastActivityAt) : '—'),
    metaRow('Duration', formatDuration(session.duration || 0)),
    extra.messageCount != null ? metaRow('Messages', String(extra.messageCount)) : null,
  ]));

  // Tokens
  container.appendChild(section('Tokens', [
    metaRow('Input', formatTokens(tokens.input)),
    metaRow('Output', formatTokens(tokens.output)),
    metaRow('Cache create', formatTokens(tokens.cacheCreation)),
    metaRow('Cache read', formatTokens(tokens.cacheRead)),
    metaRow('Total', formatTokens(totalTokens)),
  ]));

  // Models
  if (session.models && session.models.length) {
    container.appendChild(section('Models', [chips(session.models)]));
  }

  // Tools used
  const toolEntries = Object.entries(session.toolsUsed || {}).sort((a, b) => b[1] - a[1]);
  if (toolEntries.length) {
    container.appendChild(section('Tools used', [
      chips(toolEntries.map(([name, count]) => `${name} ×${count}`)),
    ]));
  }

  // Files touched
  if (session.filesTouched && session.filesTouched.length) {
    const list = el('ul', { className: 'meta-files' });
    for (const f of session.filesTouched) {
      const acts = Object.entries(f.actions || {}).map(([a, n]) => `${a}×${n}`).join(' ');
      list.appendChild(el('li', { title: f.path }, [
        el('span', { textContent: shortFile(f.path) }),
        acts ? el('span', { className: 'acts', textContent: ` ${acts}` }) : null,
      ]));
    }
    container.appendChild(section(`Files (${session.filesTouched.length})`, [list]));
  }

  // Context
  const ctx = [
    session.cwd ? metaRow('cwd', session.cwd) : null,
    session.gitBranch ? metaRow('git', session.gitBranch) : null,
    session.version ? metaRow('version', session.version) : null,
  ].filter(Boolean);
  if (ctx.length) container.appendChild(section('Context', ctx));
}

/** Render the prompt outline; clicking an item jumps the stream to that message. */
export function renderOutline(container, userPrompts, { onJump }) {
  clear(container);
  container.appendChild(el('div', { className: 'outline-title', textContent: `Prompts (${userPrompts.length})` }));
  if (!userPrompts.length) {
    container.appendChild(el('div', { className: 'session-empty', textContent: 'No user prompts.' }));
    return;
  }
  for (const prompt of userPrompts) {
    container.appendChild(el('button', {
      className: 'outline-item',
      type: 'button',
      title: prompt.text,
      textContent: prompt.text,
      onClick: () => onJump(prompt.uuid),
    }));
  }
}

// ---- helpers --------------------------------------------------------------

function section(title, children) {
  return el('div', { className: 'meta-section' }, [
    el('h3', { textContent: title }),
    ...[].concat(children).filter(Boolean),
  ]);
}

function metaRow(k, v) {
  return el('div', { className: 'meta-row' }, [
    el('span', { className: 'k', textContent: k }),
    el('span', { className: 'v', textContent: v }),
  ]);
}

function chips(items) {
  return el('div', { className: 'meta-chips' }, items.map((t) => el('span', { className: 'meta-chip', textContent: t })));
}

function shortFile(path) {
  const parts = String(path).split('/');
  return parts.length <= 3 ? path : `.../${parts.slice(-2).join('/')}`;
}
