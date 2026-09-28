import { describe, test, expect, beforeEach, vi } from 'vitest';

function fakeElement() {
  const classes = new Set();
  const listeners = {};
  return {
    classList: {
      add: (c) => classes.add(c),
      remove: (c) => classes.delete(c),
      contains: (c) => classes.has(c),
      toggle: (c) => (classes.has(c) ? (classes.delete(c), false) : (classes.add(c), true)),
    },
    addEventListener: (type, fn) => { listeners[type] = fn; },
    click: () => listeners.click?.(),
  };
}

let body;
let outlineSidebar;
let fileTreeSidebar;
let collapseButton;
let store;

async function loadModule() {
  vi.resetModules();
  return import('../public/modules/outline-toggle.js');
}

beforeEach(() => {
  body = fakeElement();
  outlineSidebar = fakeElement();
  fileTreeSidebar = fakeElement();
  collapseButton = fakeElement();
  store = new Map();

  globalThis.window = { innerWidth: 1440 };
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
  };
  globalThis.document = {
    body,
    getElementById: (id) => (id === 'collapse-outline' ? collapseButton : null),
    querySelector: (sel) => ({
      '.outline-sidebar': outlineSidebar,
      '.file-tree-sidebar': fileTreeSidebar,
    })[sel] ?? null,
  };
});

describe('toggleOutlinePanel on desktop', () => {
  test('collapses the outline and remembers it', async () => {
    const { toggleOutlinePanel } = await loadModule();

    toggleOutlinePanel();

    expect(body.classList.contains('outline-collapsed')).toBe(true);
    expect(store.get('outlineCollapsed')).toBe('true');
  });

  test('expands it again on the second toggle', async () => {
    const { toggleOutlinePanel } = await loadModule();

    toggleOutlinePanel();
    toggleOutlinePanel();

    expect(body.classList.contains('outline-collapsed')).toBe(false);
    expect(store.get('outlineCollapsed')).toBe('false');
  });
});

describe('toggleOutlinePanel on narrow screens (overlay mode)', () => {
  test('opens the outline overlay and closes the file tree overlay', async () => {
    window.innerWidth = 1024;
    fileTreeSidebar.classList.add('open');
    const { toggleOutlinePanel } = await loadModule();

    toggleOutlinePanel();

    expect(outlineSidebar.classList.contains('open')).toBe(true);
    expect(fileTreeSidebar.classList.contains('open')).toBe(false);
    expect(body.classList.contains('outline-collapsed')).toBe(false);
    expect(store.has('outlineCollapsed')).toBe(false);
  });
});

describe('initOutlineToggle', () => {
  test('restores the collapsed state saved earlier', async () => {
    store.set('outlineCollapsed', 'true');
    const { initOutlineToggle } = await loadModule();

    initOutlineToggle();

    expect(body.classList.contains('outline-collapsed')).toBe(true);
  });

  test('keeps the outline expanded when nothing is saved', async () => {
    const { initOutlineToggle } = await loadModule();

    initOutlineToggle();

    expect(body.classList.contains('outline-collapsed')).toBe(false);
  });

  test('wires the header button to toggle the outline', async () => {
    const { initOutlineToggle } = await loadModule();
    initOutlineToggle();

    collapseButton.click();

    expect(body.classList.contains('outline-collapsed')).toBe(true);
  });
});
