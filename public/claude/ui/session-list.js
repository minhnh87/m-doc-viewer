/**
 * Session list with lazy per-row metadata. Rows show the session id up front;
 * title / message-count / token totals are filled in only when a row scrolls
 * into view (IntersectionObserver), so a 40-session project doesn't parse every
 * file up front.
 */

import { el, clear } from './dom.js';
import { relativeTime } from '../lib/relative-time.js';
import { formatTokens } from './format.js';

/**
 * @param {HTMLElement} container
 * @param {{
 *   onOpen: (session: object) => void,
 *   loadSummary: (session: object) => Promise<{ summary: object }>,
 *   onToggleMark: (sessionId: string) => void,
 * }} handlers
 */
export function createSessionList(container, { onOpen, loadSummary, onToggleMark }) {
  let activeId = null;
  let observer = null;

  /** Disconnect any live observer so detached rows can be GC'd on re-render/error. */
  function teardown() {
    if (observer) { observer.disconnect(); observer = null; }
  }

  function showLoading() {
    teardown();
    clear(container);
    container.appendChild(el('div', { className: 'session-loading', textContent: 'Loading sessions…' }));
  }

  function showEmpty(message) {
    teardown();
    clear(container);
    container.appendChild(el('div', { className: 'session-empty', textContent: message }));
  }

  /**
   * @param {object[]} sessions
   * @param {Set<string>} [marked]  ids rendered with the marked styling
   */
  function render(sessions, marked = new Set()) {
    teardown();
    clear(container);
    if (!sessions.length) {
      showEmpty('No sessions in this project.');
      return;
    }

    const hasIO = typeof IntersectionObserver !== 'undefined';
    if (hasIO) {
      observer = new IntersectionObserver(onIntersect, { root: container, rootMargin: '150px' });
    }

    for (const session of sessions) {
      const titleEl = el('div', { className: 'session-item-title', textContent: session.id });
      const metaEl = el('div', { className: 'session-item-meta' }, [
        el('span', { className: 'when', textContent: session.mtime ? relativeTime(session.mtime) : '' }),
      ]);
      const row = el('button', {
        className: 'session-item',
        type: 'button',
        role: 'option',
        'aria-selected': 'false',
        dataset: { id: session.id },
        onClick: () => onOpen(session),
      }, [titleEl, metaEl]);
      row._session = session;
      row._titleEl = titleEl;
      row._metaEl = metaEl;
      row._loaded = false;
      // The row itself is a <button>, so the mark toggle sits beside it in a
      // wrapper rather than nested inside it (nested buttons are invalid HTML).
      const isMarked = marked.has(session.id);
      const wrap = el('div', {
        className: isMarked ? 'session-row marked' : 'session-row',
        dataset: { id: session.id },
      }, [row, markButton(session.id, isMarked)]);
      container.appendChild(wrap);
      if (observer) observer.observe(row);
      else fillRow(row); // no IO support → eager fill
    }
    if (activeId) setActive(activeId);
  }

  function markButton(sessionId, isMarked) {
    return el('button', {
      className: 'session-mark-btn',
      type: 'button',
      title: isMarked ? 'Unmark this session' : 'Mark this session as important',
      'aria-label': isMarked ? 'Unmark this session' : 'Mark this session as important',
      'aria-pressed': isMarked ? 'true' : 'false',
      textContent: '⚑',
      onClick: () => onToggleMark(sessionId),
    });
  }

  /** Flip one row's marked state without re-rendering (keeps lazy summaries). */
  function setMarked(sessionId, isMarked) {
    const wrap = container.querySelector(`.session-row[data-id="${CSS.escape(sessionId)}"]`);
    if (!wrap) return;
    wrap.classList.toggle('marked', isMarked);
    const btn = wrap.querySelector('.session-mark-btn');
    if (!btn) return;
    const label = isMarked ? 'Unmark this session' : 'Mark this session as important';
    btn.setAttribute('aria-pressed', isMarked ? 'true' : 'false');
    btn.setAttribute('aria-label', label);
    btn.title = label;
  }

  function onIntersect(entries) {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      fillRow(entry.target);
    }
  }

  async function fillRow(row) {
    if (row._loaded) return;
    let summary;
    try {
      ({ summary } = await loadSummary(row._session));
    } catch {
      // Leave the id as the title; do NOT latch `_loaded`, so a later re-render
      // (e.g. re-selecting the project) retries. Re-observing here would tight-loop
      // on a still-visible row, so we simply let the natural re-render path retry.
      return;
    }
    row._loaded = true;
    if (summary.title && summary.title !== 'Untitled session') {
      row._titleEl.textContent = summary.title;
    }
    row._metaEl.appendChild(el('span', { className: 'dim', textContent: `${summary.messageCount} msg` }));
    const toks = (summary.tokens?.input || 0) + (summary.tokens?.output || 0);
    if (toks) {
      row._metaEl.appendChild(el('span', { className: 'dim', textContent: `${formatTokens(toks)} tok` }));
    }
  }

  function setActive(id) {
    activeId = id;
    container.querySelectorAll('.session-item').forEach((row) => {
      const on = row.dataset.id === id;
      row.classList.toggle('active', on);
      row.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }

  /** Scroll the active row into view (used by j/k session navigation). */
  function scrollActiveIntoView(id) {
    const row = container.querySelector(`.session-item[data-id="${CSS.escape(id)}"]`);
    if (row) row.scrollIntoView({ block: 'nearest' });
  }

  return { render, showLoading, showEmpty, setActive, setMarked, scrollActiveIntoView };
}
