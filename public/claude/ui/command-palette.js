/**
 * ⌘K / Ctrl-K command palette. Commands are supplied lazily by the caller
 * (`getCommands`) so it always reflects the current project list + outline.
 * Each command is `{ kind, label, run }`. Filterable; Arrow/Enter/Escape nav,
 * Tab trapped within the dialog, focus restored to the opener on close.
 */

import { el, clear } from './dom.js';

/**
 * @param {{ overlay: HTMLElement, input: HTMLInputElement, results: HTMLElement }} nodes
 * @param {{ getCommands: () => {kind:string,label:string,run:()=>void}[] }} cfg
 */
export function createPalette({ overlay, input, results }, { getCommands }) {
  let filtered = [];
  let activeIndex = 0;
  let restoreFocusTo = null;

  function isOpen() { return !overlay.hasAttribute('hidden'); }

  function open() {
    restoreFocusTo = document.activeElement;
    input.value = '';
    render('');
    overlay.removeAttribute('hidden');
    document.body.style.overflow = 'hidden'; // lock background scroll
    input.focus();
    document.addEventListener('keydown', onKeydown, true);
  }

  function close() {
    if (!isOpen()) return;
    overlay.setAttribute('hidden', '');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKeydown, true);
    if (restoreFocusTo && typeof restoreFocusTo.focus === 'function') restoreFocusTo.focus();
    restoreFocusTo = null;
  }

  function toggle() { isOpen() ? close() : open(); }

  function render(query) {
    const all = getCommands();
    const q = query.trim().toLowerCase();
    filtered = q
      ? all.filter((it) => it.label.toLowerCase().includes(q) || it.kind.toLowerCase().includes(q))
      : all;
    activeIndex = 0;
    clear(results);
    if (!filtered.length) {
      input.removeAttribute('aria-activedescendant');
      results.appendChild(el('li', { className: 'palette-empty', textContent: 'No matches' }));
      return;
    }
    filtered.forEach((it, i) => {
      results.appendChild(el('li', {
        id: `palette-opt-${i}`,
        className: `palette-item${i === 0 ? ' active' : ''}`,
        role: 'option',
        'aria-selected': i === 0 ? 'true' : 'false',
        onMousedown: (e) => { e.preventDefault(); run(it); },
      }, [
        el('span', { className: 'kind', textContent: it.kind }),
        el('span', { className: 'label', textContent: it.label }),
      ]));
    });
    input.setAttribute('aria-activedescendant', 'palette-opt-0');
  }

  function setActive(i) {
    const rows = results.querySelectorAll('.palette-item');
    if (!rows.length) return;
    activeIndex = (i + rows.length) % rows.length;
    rows.forEach((row, idx) => {
      const on = idx === activeIndex;
      row.classList.toggle('active', on);
      row.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    input.setAttribute('aria-activedescendant', `palette-opt-${activeIndex}`);
    rows[activeIndex].scrollIntoView({ block: 'nearest' });
  }

  function run(item) {
    close();
    if (item && typeof item.run === 'function') item.run();
  }

  function onKeydown(e) {
    if (!isOpen()) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive(activeIndex + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(activeIndex - 1); }
    else if (e.key === 'Enter') { e.preventDefault(); run(filtered[activeIndex]); }
    else if (e.key === 'Tab') { e.preventDefault(); input.focus(); } // trap focus in the dialog
  }

  input.addEventListener('input', () => render(input.value));
  overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) close(); });

  return { open, close, toggle, isOpen };
}
