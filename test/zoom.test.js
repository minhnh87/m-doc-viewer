import { describe, test, expect, beforeAll, vi } from 'vitest';

let keydownHandler;
const setProperty = vi.fn();

beforeAll(async () => {
  globalThis.window = { location: { search: '' } };
  globalThis.localStorage = { getItem: () => null, setItem: () => {} };
  globalThis.document = {
    documentElement: { style: { setProperty } },
    getElementById: () => null,
    addEventListener: (type, fn) => {
      if (type === 'keydown') keydownHandler = fn;
    },
  };
  const { initZoom } = await import('../public/modules/zoom.js');
  initZoom();
});

function press(key, mods = {}) {
  const event = { key, target: { tagName: 'BODY' }, preventDefault: vi.fn(), ...mods };
  setProperty.mockClear();
  keydownHandler(event);
  return event;
}

describe('zoom keyboard shortcuts', () => {
  test.each(['=', '+', '-', '_', '0'])('leaves Cmd+%s to the browser for full-page zoom', (key) => {
    const event = press(key, { metaKey: true });

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(setProperty).not.toHaveBeenCalled();
  });

  test.each(['=', '-', '0'])('leaves Ctrl+%s to the browser for full-page zoom', (key) => {
    const event = press(key, { ctrlKey: true });

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(setProperty).not.toHaveBeenCalled();
  });

  test('ignores Cmd+z so the browser keeps undo', () => {
    const event = press('z', { metaKey: true });

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(setProperty).not.toHaveBeenCalled();
  });

  test.each([
    ['z', '1.1'],
    ['Z', '1'],
  ])('plain %s still zooms the content to %s', (key, expected) => {
    const event = press(key);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(setProperty).toHaveBeenCalledWith('--content-zoom', Number(expected));
  });
});
