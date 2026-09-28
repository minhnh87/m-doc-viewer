import { describe, test, expect, beforeAll, beforeEach, vi } from 'vitest';

vi.mock('../public/modules/api.js', () => ({ apiFetch: vi.fn(() => new Promise(() => {})) }));
vi.mock('../public/modules/navigation.js', () => ({ navigateToFile: vi.fn() }));
vi.mock('../public/modules/state.js', () => ({ getState: () => ({ folderFilter: 'notes' }) }));
vi.mock('../public/modules/editor.js', () => ({ enterEditMode: vi.fn() }));
vi.mock('../public/modules/search.js', () => ({ showSearchResults: vi.fn() }));
vi.mock('../public/modules/outline-toggle.js', () => ({ toggleOutlinePanel: vi.fn() }));
vi.mock('../public/modules/last-talk.js', () => ({ openNextLastTalk: vi.fn() }));

const keydownHandlers = [];
let outlineLinks = [];
let toggleOutlinePanel;
let apiFetch;
let navigateToFile;
let enterEditMode;
let showSearchResults;
let openNextLastTalk;
const toggleLeftPanel = vi.fn();

beforeAll(async () => {
  globalThis.document = {
    addEventListener: (type, fn) => {
      if (type === 'keydown') keydownHandlers.push(fn);
    },
    querySelectorAll: () => outlineLinks,
    getElementById: () => ({ scrollIntoView: vi.fn() }),
  };
  ({ toggleOutlinePanel } = await import('../public/modules/outline-toggle.js'));
  ({ apiFetch } = await import('../public/modules/api.js'));
  ({ navigateToFile } = await import('../public/modules/navigation.js'));
  ({ enterEditMode } = await import('../public/modules/editor.js'));
  ({ showSearchResults } = await import('../public/modules/search.js'));
  ({ openNextLastTalk } = await import('../public/modules/last-talk.js'));
  const { setupHotkeys, setupKeyboardNavigation } = await import('../public/modules/keyboard.js');
  setupKeyboardNavigation();
  setupHotkeys({ style: {} }, { focus: vi.fn() }, toggleLeftPanel);
});

beforeEach(() => {
  vi.clearAllMocks();
  outlineLinks = [];
});

function press(key, { tagName = 'BODY', ...mods } = {}) {
  const event = { key, target: { tagName }, preventDefault: vi.fn(), ...mods };
  keydownHandlers.forEach((handler) => handler(event));
  return event;
}

function expectNoAppAction() {
  expect(toggleOutlinePanel).not.toHaveBeenCalled();
  expect(toggleLeftPanel).not.toHaveBeenCalled();
  expect(apiFetch).not.toHaveBeenCalled();
  expect(navigateToFile).not.toHaveBeenCalled();
  expect(enterEditMode).not.toHaveBeenCalled();
  expect(showSearchResults).not.toHaveBeenCalled();
  expect(openNextLastTalk).not.toHaveBeenCalled();
}

describe('O hotkey', () => {
  test.each(['o', 'O'])('%s toggles the outline panel', (key) => {
    const event = press(key);

    expect(toggleOutlinePanel).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  test('is ignored while typing in an input', () => {
    press('o', { tagName: 'INPUT' });

    expect(toggleOutlinePanel).not.toHaveBeenCalled();
  });
});

describe('plain letter hotkeys still work', () => {
  test.each([
    ['f', () => showSearchResults],
    ['a', () => toggleLeftPanel],
    ['e', () => enterEditMode],
    ['l', () => openNextLastTalk],
  ])('%s triggers its app action', (key, getAction) => {
    const event = press(key);

    expect(getAction()).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalled();
  });
});

describe('removed hotkeys (P latest plan, S latest session)', () => {
  test.each(['p', 'P', 's', 'S'])('%s does nothing in the app', (key) => {
    const event = press(key);

    expect(event.preventDefault).not.toHaveBeenCalled();
    expectNoAppAction();
  });
});

describe('Cmd/Ctrl combos are left to the browser', () => {
  const keys = ['f', 'F', 'a', 'A', 'e', 'E', 'l', 'L', 'p', 'P', 's', 'S', 'o', 'O'];
  const cases = keys.flatMap((key) => [
    [`Cmd+${key}`, key, { metaKey: true }],
    [`Ctrl+${key}`, key, { ctrlKey: true }],
  ]);

  test.each(cases)('%s does nothing in the app', (_label, key, mods) => {
    const event = press(key, mods);

    expect(event.preventDefault).not.toHaveBeenCalled();
    expectNoAppAction();
  });
});

function fakeOutlineLink(id) {
  const classes = new Set();
  return {
    classList: {
      add: (c) => classes.add(c),
      remove: (c) => classes.delete(c),
      contains: (c) => classes.has(c),
    },
    getAttribute: () => `#${id}`,
    scrollIntoView: vi.fn(),
  };
}

describe('J/K outline navigation', () => {
  beforeEach(() => {
    outlineLinks = [fakeOutlineLink('intro'), fakeOutlineLink('usage')];
  });

  test.each(['j', 'k'])('plain %s moves the active outline item', (key) => {
    const event = press(key);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(outlineLinks[0].classList.contains('active')).toBe(true);
  });

  test.each([
    ['Cmd+j', 'j', { metaKey: true }],
    ['Cmd+k', 'k', { metaKey: true }],
    ['Ctrl+j', 'j', { ctrlKey: true }],
    ['Ctrl+K', 'K', { ctrlKey: true }],
  ])('%s is left to the browser', (_label, key, mods) => {
    const event = press(key, mods);

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(outlineLinks.some((link) => link.classList.contains('active'))).toBe(false);
  });
});
