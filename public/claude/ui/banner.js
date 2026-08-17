/**
 * Inline banner region — the app's only surface for errors/warnings/parse
 * notices. Deliberately replaces `alert()` (per CLAUDE.md error-handling rule):
 * every failure is shown inline, with a retry control where the spec calls for it.
 */

import { el, clear } from './dom.js';

/**
 * @param {HTMLElement} container
 */
export function createBanners(container) {
  function add(kind, message, { actionLabel, onAction, dismissible } = {}) {
    const children = [el('span', { className: 'banner-msg', textContent: message })];
    if (actionLabel && onAction) {
      children.push(el('button', {
        className: 'banner-action',
        type: 'button',
        textContent: actionLabel,
        onClick: onAction,
      }));
    }
    const node = el('div', { className: `banner banner-${kind}` }, children);
    if (dismissible) {
      node.appendChild(el('button', {
        className: 'banner-action',
        type: 'button',
        'aria-label': 'Dismiss',
        textContent: '✕',
        onClick: () => node.remove(),
      }));
    }
    container.appendChild(node);
  }

  return {
    clear() { clear(container); },

    /** Error banner, optionally with a retry button. */
    error(message, onRetry) {
      add('error', message, onRetry ? { actionLabel: 'Retry', onAction: onRetry } : {});
    },

    /** Non-fatal warning banner. */
    warn(message, opts) {
      add('warn', message, opts);
    },

    /** Info/neutral banner. */
    info(message, opts) {
      add('info', message, opts);
    },

    /** Convenience: parse-error summary while the parsed messages still render. */
    parseErrors(count) {
      if (count > 0) {
        add('warn', `${count} line${count === 1 ? '' : 's'} could not be parsed and were skipped.`);
      }
    },
  };
}
