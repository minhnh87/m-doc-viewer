import { describe, test, expect, beforeAll, beforeEach, vi } from 'vitest';

vi.mock('../public/modules/api.js', () => ({ apiFetch: vi.fn() }));
vi.mock('../public/modules/navigation.js', () => ({ navigateToFile: vi.fn() }));
vi.mock('../public/modules/state.js', () => ({ getState: vi.fn() }));

let apiFetch;
let navigateToFile;
let getState;
let nextLastTalkPaths;
let openNextLastTalk;

const SESSIONS = '/work/notes/.clsessions';

beforeAll(async () => {
  globalThis.window = { APP_CONFIG: { SESSIONS_DIR_NAME: '.clsessions' } };
  globalThis.alert = vi.fn();
  ({ apiFetch } = await import('../public/modules/api.js'));
  ({ navigateToFile } = await import('../public/modules/navigation.js'));
  ({ getState } = await import('../public/modules/state.js'));
  ({ nextLastTalkPaths, openNextLastTalk } = await import('../public/modules/last-talk.js'));
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

// apiFetch mock: resolves for paths in `existing`, rejects (404) otherwise.
function withExistingFiles(existing) {
  apiFetch.mockImplementation(async (url) => {
    const path = new URL(url, 'http://local').searchParams.get('path');
    if (existing.includes(path)) return { content: '' };
    throw new Error('Not found');
  });
}

function probedPaths() {
  return apiFetch.mock.calls.map(([url]) => new URL(url, 'http://local').searchParams.get('path'));
}

describe('nextLastTalkPaths', () => {
  test.each([
    ['last_talk.md', ['last_talk_1.md', 'last_talk_2.md', 'last_talk.md']],
    ['last_talk_1.md', ['last_talk_2.md', 'last_talk.md', 'last_talk_1.md']],
    ['last_talk_2.md', ['last_talk.md', 'last_talk_1.md', 'last_talk_2.md']],
  ])('after %s tries the following files, wrapping around', (current, expected) => {
    expect(nextLastTalkPaths('', current)).toEqual(expected);
  });

  test('starts at last_talk.md when the current file is not a last_talk file', () => {
    expect(nextLastTalkPaths('', 'notes/todo.md'))
      .toEqual(['last_talk.md', 'last_talk_1.md', 'last_talk_2.md']);
  });

  test('starts at last_talk.md when the current file is a last_talk in another dir', () => {
    expect(nextLastTalkPaths(SESSIONS, '/other/.clsessions/last_talk.md'))
      .toEqual([`${SESSIONS}/last_talk.md`, `${SESSIONS}/last_talk_1.md`, `${SESSIONS}/last_talk_2.md`]);
  });

  test('prefixes paths with the given dir', () => {
    expect(nextLastTalkPaths(SESSIONS, `${SESSIONS}/last_talk_1.md`))
      .toEqual([`${SESSIONS}/last_talk_2.md`, `${SESSIONS}/last_talk.md`, `${SESSIONS}/last_talk_1.md`]);
  });

  test('handles a null current path', () => {
    expect(nextLastTalkPaths('', null))
      .toEqual(['last_talk.md', 'last_talk_1.md', 'last_talk_2.md']);
  });
});

describe('openNextLastTalk without folder filter (project root)', () => {
  test('opens the next file as a project file', async () => {
    getState.mockReturnValue({ folderFilter: null, currentFilePath: 'last_talk.md' });
    withExistingFiles(['last_talk.md', 'last_talk_1.md', 'last_talk_2.md']);

    await openNextLastTalk();

    expect(apiFetch.mock.calls[0][0]).toContain('external=false');
    expect(navigateToFile).toHaveBeenCalledWith('last_talk_1.md', false);
  });

  test('wraps from last_talk_2.md back to last_talk.md', async () => {
    getState.mockReturnValue({ folderFilter: null, currentFilePath: 'last_talk_2.md' });
    withExistingFiles(['last_talk.md', 'last_talk_1.md', 'last_talk_2.md']);

    await openNextLastTalk();

    expect(navigateToFile).toHaveBeenCalledWith('last_talk.md', false);
  });

  test('skips missing files', async () => {
    getState.mockReturnValue({ folderFilter: null, currentFilePath: 'last_talk.md' });
    withExistingFiles(['last_talk.md', 'last_talk_2.md']);

    await openNextLastTalk();

    expect(probedPaths()).toEqual(['last_talk_1.md', 'last_talk_2.md']);
    expect(navigateToFile).toHaveBeenCalledWith('last_talk_2.md', false);
  });

  test('reopens last_talk.md when it is the only file', async () => {
    getState.mockReturnValue({ folderFilter: null, currentFilePath: 'last_talk.md' });
    withExistingFiles(['last_talk.md']);

    await openNextLastTalk();

    expect(navigateToFile).toHaveBeenCalledWith('last_talk.md', false);
  });

  test('alerts when no last_talk file exists', async () => {
    getState.mockReturnValue({ folderFilter: null, currentFilePath: null });
    withExistingFiles([]);

    await openNextLastTalk();

    expect(navigateToFile).not.toHaveBeenCalled();
    expect(alert).toHaveBeenCalledTimes(1);
  });
});

describe('openNextLastTalk with folder filter', () => {
  test('cycles inside {folder}/.clsessions as external files', async () => {
    getState.mockReturnValue({ folderFilter: '/work/notes/', currentFilePath: `${SESSIONS}/last_talk.md` });
    withExistingFiles([`${SESSIONS}/last_talk.md`, `${SESSIONS}/last_talk_1.md`]);

    await openNextLastTalk();

    expect(apiFetch.mock.calls[0][0]).toContain('external=true');
    expect(navigateToFile).toHaveBeenCalledWith(`${SESSIONS}/last_talk_1.md`, true);
  });

  test('opens last_talk.md first when viewing another file', async () => {
    getState.mockReturnValue({ folderFilter: '/work/notes', currentFilePath: 'README.md' });
    withExistingFiles([`${SESSIONS}/last_talk.md`]);

    await openNextLastTalk();

    expect(navigateToFile).toHaveBeenCalledWith(`${SESSIONS}/last_talk.md`, true);
  });
});
