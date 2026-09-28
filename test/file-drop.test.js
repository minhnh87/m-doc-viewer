import { describe, test, expect, beforeAll, beforeEach, vi } from 'vitest';

vi.mock('../public/modules/api.js', () => ({ apiFetch: vi.fn() }));
vi.mock('../public/modules/navigation.js', () => ({ navigateToFile: vi.fn() }));
vi.mock('../public/modules/file-tree.js', () => ({
  loadFileTree: vi.fn(),
  saveTreeState: vi.fn(() => ({ scrollTop: 0, expandedIds: [] })),
  restoreTreeState: vi.fn(),
  revealActiveFile: vi.fn(),
}));

let apiFetch;
let navigateToFile;
let loadFileTree;
let saveTreeState;
let restoreTreeState;
let revealActiveFile;
let sanitizeFileName;
let candidateName;
let isBinaryContent;
let importFiles;
let handleDrop;

beforeAll(async () => {
  globalThis.window = { APP_CONFIG: { DROP_TARGET_DIR: '3_READING' } };
  globalThis.alert = vi.fn();
  ({ apiFetch } = await import('../public/modules/api.js'));
  ({ navigateToFile } = await import('../public/modules/navigation.js'));
  ({
    loadFileTree, saveTreeState, restoreTreeState, revealActiveFile,
  } = await import('../public/modules/file-tree.js'));
  ({
    sanitizeFileName, candidateName, isBinaryContent, importFiles, handleDrop,
  } = await import('../public/modules/file-drop.js'));
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

function fakeFile(name, content) {
  return { name, text: async () => content };
}

function unreadableFile(name) {
  return { name, text: async () => { throw new Error('NotReadableError'); } };
}

function conflictError() {
  const error = new Error('A file with this name already exists');
  error.status = 409;
  return error;
}

// apiFetch mock: 409 for paths in `existing`, success otherwise.
function withExistingFiles(existing) {
  apiFetch.mockImplementation(async (url, options) => {
    const { path } = JSON.parse(options.body);
    if (existing.includes(path)) throw conflictError();
    return { path };
  });
}

function createdPaths() {
  return apiFetch.mock.calls.map(([, options]) => JSON.parse(options.body).path);
}

describe('sanitizeFileName', () => {
  test.each([
    ['notes.md', 'notes.md'],
    ['  spaced name.md  ', 'spaced name.md'],
    ['a/b\\c:d*?.md', 'abcd.md'],
    ['tab\tnul\u0000.md', 'tabnul.md'],
    ['Ghi chú tiếng Việt.md', 'Ghi chú tiếng Việt.md'],
    ['..', ''],
    ['///', ''],
  ])('%j -> %j', (input, expected) => {
    expect(sanitizeFileName(input)).toBe(expected);
  });
});

describe('candidateName', () => {
  test.each([
    ['notes.md', 0, 'notes.md'],
    ['notes.md', 1, 'notes-1.md'],
    ['notes.md', 12, 'notes-12.md'],
    ['archive.tar.gz', 2, 'archive.tar-2.gz'],
    ['README', 1, 'README-1'],
    ['.env', 1, '.env-1'],
  ])('%s attempt %i -> %s', (name, attempt, expected) => {
    expect(candidateName(name, attempt)).toBe(expected);
  });
});

describe('isBinaryContent', () => {
  test('plain text is not binary', () => {
    expect(isBinaryContent('# Title\n\nxin chào')).toBe(false);
  });

  test('content with a NUL byte is binary', () => {
    expect(isBinaryContent('PNG\u0000\u0001')).toBe(true);
  });
});

describe('importFiles', () => {
  test('creates the file under the drop dir via the create endpoint', async () => {
    withExistingFiles([]);

    const result = await importFiles([fakeFile('notes.md', '# Hi')]);

    expect(apiFetch).toHaveBeenCalledWith('/api/file/create', {
      method: 'POST',
      body: JSON.stringify({ path: '3_READING/notes.md', content: '# Hi' }),
    });
    expect(result).toEqual({ imported: ['3_READING/notes.md'], skipped: [] });
  });

  test('auto-renames with -1, -2 ... when the name is taken', async () => {
    withExistingFiles(['3_READING/notes.md', '3_READING/notes-1.md']);

    const result = await importFiles([fakeFile('notes.md', 'x')]);

    expect(createdPaths()).toEqual([
      '3_READING/notes.md', '3_READING/notes-1.md', '3_READING/notes-2.md',
    ]);
    expect(result.imported).toEqual(['3_READING/notes-2.md']);
  });

  test('skips binary files without calling the API', async () => {
    const result = await importFiles([fakeFile('photo.png', 'PNG\u0000data')]);

    expect(apiFetch).not.toHaveBeenCalled();
    expect(result.imported).toEqual([]);
    expect(result.skipped).toEqual([{ name: 'photo.png', reason: 'không phải file text' }]);
  });

  test('skips files whose name is empty after sanitizing', async () => {
    const result = await importFiles([fakeFile('///', 'x')]);

    expect(apiFetch).not.toHaveBeenCalled();
    expect(result.skipped).toEqual([{ name: '///', reason: 'tên file không hợp lệ' }]);
  });

  test('skips unreadable entries such as dropped folders', async () => {
    const result = await importFiles([unreadableFile('some-folder')]);

    expect(apiFetch).not.toHaveBeenCalled();
    expect(result.skipped).toEqual([{ name: 'some-folder', reason: 'không đọc được file' }]);
  });

  test('records a non-conflict API error and continues with the next file', async () => {
    apiFetch
      .mockRejectedValueOnce(new Error('Writes are disabled'))
      .mockResolvedValueOnce({});

    const result = await importFiles([fakeFile('a.md', 'a'), fakeFile('b.md', 'b')]);

    expect(result.imported).toEqual(['3_READING/b.md']);
    expect(result.skipped).toEqual([{ name: 'a.md', reason: 'Writes are disabled' }]);
  });

  test('gives up after too many name conflicts', async () => {
    apiFetch.mockRejectedValue(conflictError());

    const result = await importFiles([fakeFile('notes.md', 'x')]);

    expect(result.imported).toEqual([]);
    expect(result.skipped[0].name).toBe('notes.md');
    expect(apiFetch).toHaveBeenCalledTimes(100);
  });
});

describe('handleDrop', () => {
  test('refreshes the tree and opens the first imported file', async () => {
    withExistingFiles([]);

    await handleDrop([fakeFile('a.md', 'a'), fakeFile('b.md', 'b')]);

    expect(loadFileTree).toHaveBeenCalledTimes(1);
    expect(navigateToFile).toHaveBeenCalledWith('3_READING/a.md', false);
    expect(alert).not.toHaveBeenCalled();
  });

  test('opens the file before rebuilding the tree so its folder renders expanded', async () => {
    withExistingFiles([]);

    await handleDrop([fakeFile('a.md', 'a')]);

    const order = (fn) => fn.mock.invocationCallOrder[0];
    expect(order(saveTreeState)).toBeLessThan(order(navigateToFile));
    expect(order(navigateToFile)).toBeLessThan(order(loadFileTree));
    expect(order(loadFileTree)).toBeLessThan(order(restoreTreeState));
    expect(order(restoreTreeState)).toBeLessThan(order(revealActiveFile));
  });

  test('keeps previously expanded folders after the tree rebuild', async () => {
    withExistingFiles([]);
    const savedState = { scrollTop: 40, expandedIds: ['1_FAVOURITE'] };
    saveTreeState.mockReturnValueOnce(savedState);

    await handleDrop([fakeFile('a.md', 'a')]);

    expect(restoreTreeState).toHaveBeenCalledWith(savedState);
  });

  test('alerts about skipped files and does not navigate when nothing was imported', async () => {
    await handleDrop([fakeFile('photo.png', '\u0000')]);

    expect(loadFileTree).not.toHaveBeenCalled();
    expect(navigateToFile).not.toHaveBeenCalled();
    expect(alert).toHaveBeenCalledWith(expect.stringContaining('photo.png'));
  });

  test('does nothing for an empty drop', async () => {
    await handleDrop([]);

    expect(apiFetch).not.toHaveBeenCalled();
    expect(navigateToFile).not.toHaveBeenCalled();
    expect(alert).not.toHaveBeenCalled();
  });
});
