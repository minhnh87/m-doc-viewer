import { describe, test, expect, beforeEach, vi } from 'vitest';

function fakeElement() {
  const classes = new Set();
  const listeners = {};
  return {
    classList: {
      add: (c) => classes.add(c),
      contains: (c) => classes.has(c),
      toggle: (c) => (classes.has(c) ? (classes.delete(c), false) : (classes.add(c), true)),
    },
    addEventListener: (type, fn) => { listeners[type] = fn; },
    click: () => listeners.click?.(),
  };
}

let body;
let collapseButton;
let store;

async function loadModule() {
  vi.resetModules();
  return import('../public/claude/lib/right-panel-toggle.js');
}

beforeEach(() => {
  body = fakeElement();
  collapseButton = fakeElement();
  store = new Map();

  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
  };
  globalThis.document = {
    body,
    getElementById: (id) => (id === 'collapse-right-panel' ? collapseButton : null),
  };
});

describe('toggleRightPanel', () => {
  test('collapses the right panel and remembers it', async () => {
    const { toggleRightPanel } = await loadModule();

    toggleRightPanel();

    expect(body.classList.contains('right-panel-collapsed')).toBe(true);
    expect(store.get('claudeRightPanelCollapsed')).toBe('true');
  });

  test('expands it again on the second toggle', async () => {
    const { toggleRightPanel } = await loadModule();

    toggleRightPanel();
    toggleRightPanel();

    expect(body.classList.contains('right-panel-collapsed')).toBe(false);
    expect(store.get('claudeRightPanelCollapsed')).toBe('false');
  });
});

describe('initRightPanelToggle', () => {
  test('restores the collapsed state from a previous visit', async () => {
    store.set('claudeRightPanelCollapsed', 'true');
    const { initRightPanelToggle } = await loadModule();

    initRightPanelToggle();

    expect(body.classList.contains('right-panel-collapsed')).toBe(true);
  });

  test('stays expanded when nothing was stored', async () => {
    const { initRightPanelToggle } = await loadModule();

    initRightPanelToggle();

    expect(body.classList.contains('right-panel-collapsed')).toBe(false);
  });

  test('wires the collapse button to toggle the panel', async () => {
    const { initRightPanelToggle } = await loadModule();
    initRightPanelToggle();

    collapseButton.click();

    expect(body.classList.contains('right-panel-collapsed')).toBe(true);
  });
});
