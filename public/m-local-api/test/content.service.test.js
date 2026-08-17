import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { writeContent, readContent } from '../src/services/content.service.js';
import {
  NotFoundError, BadRequestError, ConflictError,
} from '../src/lib/errors.js';

let tmpDir;
let filePath;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'm-local-api-test-'));
  filePath = path.join(tmpDir, 'note.md');
  await fs.writeFile(filePath, '# Original\n', 'utf-8');
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

test('writeContent overwrites an existing file and returns new size + mtime', async () => {
  const result = await writeContent({ path: filePath, content: '# Updated\n\nBody.\n' });

  assert.equal(result.path, filePath);
  assert.equal(result.name, 'note.md');
  assert.equal(result.size, Buffer.byteLength('# Updated\n\nBody.\n'));
  assert.ok(result.mtime instanceof Date);
  assert.equal(await fs.readFile(filePath, 'utf-8'), '# Updated\n\nBody.\n');
});

test('writeContent allows clearing a file with empty content', async () => {
  const result = await writeContent({ path: filePath, content: '' });

  assert.equal(result.size, 0);
  assert.equal(await fs.readFile(filePath, 'utf-8'), '');
});

test('writeContent rejects a missing file (no implicit create)', async () => {
  await assert.rejects(
    writeContent({ path: path.join(tmpDir, 'missing.md'), content: 'x' }),
    NotFoundError,
  );
});

test('writeContent rejects a directory path', async () => {
  await assert.rejects(
    writeContent({ path: tmpDir, content: 'x' }),
    BadRequestError,
  );
});

test('writeContent succeeds when baseMtime matches the on-disk mtime', async () => {
  // Simulate the client round-trip: mtime arrives as the ISO string
  // produced by res.json() serialising the Date from GET /content.
  const { mtime } = await readContent({ path: filePath });
  const baseMtime = mtime.toISOString();

  const result = await writeContent({ path: filePath, content: 'updated', baseMtime });

  assert.equal(await fs.readFile(filePath, 'utf-8'), 'updated');
  assert.ok(result.mtime instanceof Date);
});

test('writeContent throws ConflictError when the file changed since baseMtime', async () => {
  const { mtime } = await readContent({ path: filePath });
  const staleBase = new Date(mtime.getTime() - 5000).toISOString();

  await assert.rejects(
    writeContent({ path: filePath, content: 'clobber', baseMtime: staleBase }),
    ConflictError,
  );
  assert.equal(await fs.readFile(filePath, 'utf-8'), '# Original\n');
});

test('writeContent throws BadRequestError on an unparsable baseMtime', async () => {
  await assert.rejects(
    writeContent({ path: filePath, content: 'x', baseMtime: 'not-a-date' }),
    BadRequestError,
  );
});

test('writeContent skips the conflict check when baseMtime is omitted (force save)', async () => {
  await writeContent({ path: filePath, content: 'forced' });
  assert.equal(await fs.readFile(filePath, 'utf-8'), 'forced');
});
