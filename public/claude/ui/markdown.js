/**
 * Markdown + syntax highlighting for assistant/user text blocks.
 *
 * Markdown is rendered with `marked` (loaded via CDN, same trust model the
 * markdown viewer already uses for `.md` files). Code fences are highlighted
 * with `highlight.js` (CDN), with the fence language normalized through the
 * ported `hljsLang` map. Tool input/result text is NEVER routed here — it goes
 * through `<pre>.textContent` in the message stream to avoid HTML injection.
 */

import { hljsLang } from '../lib/highlight-lang.js';
import { escapeHtml } from './dom.js';

/** Render markdown text into a container element, then highlight its code. */
export function renderMarkdownInto(container, text) {
  const md = text || '';
  if (window.marked && typeof window.marked.parse === 'function') {
    container.innerHTML = window.marked.parse(md);
  } else {
    container.innerHTML = `<p>${escapeHtml(md).replace(/\n/g, '<br>')}</p>`;
  }
  highlightWithin(container);
}

/** Highlight every `pre code` block within a container using highlight.js. */
export function highlightWithin(container) {
  const hljs = window.hljs;
  if (!hljs) return;
  container.querySelectorAll('pre code').forEach((block) => {
    const langClass = Array.from(block.classList).find((c) => c.startsWith('language-'));
    const lang = langClass ? langClass.slice('language-'.length) : null;
    const hl = hljsLang(lang);
    try {
      if (hl && hljs.getLanguage(hl)) {
        // highlight.js escapes internally; input is the raw textContent.
        block.innerHTML = hljs.highlight(block.textContent, { language: hl }).value;
      }
      block.classList.add('hljs');
    } catch {
      /* leave the block as plain text on any highlighter error */
    }
  });
}
