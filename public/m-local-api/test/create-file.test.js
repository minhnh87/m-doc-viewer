import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createFile } from '../src/services/content.service.js';
import { ConflictError } from '../src/lib/errors.js';

let tmpDir;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'm-local-api-create-'));
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

test('createFile writes a new file and returns path, name, size, mtime', async () => {
  const target = path.join(tmpDir, 'new.md');

  const result = await createFile({ path: target, content: '# Hi\n' });

  assert.equal(result.path, target);
  assert.equal(result.name, 'new.md');
  assert.equal(result.size, Buffer.byteLength('# Hi\n'));
  assert.ok(result.mtime instanceof Date);
  assert.equal(await fs.readFile(target, 'utf-8'), '# Hi\n');
});

test('createFile allows empty content', async () => {
  const target = path.join(tmpDir, 'empty.md');

  await createFile({ path: target, content: '' });

  assert.equal(await fs.readFile(target, 'utf-8'), '');
});

test('createFile throws ConflictError and keeps the existing file untouched', async () => {
  const target = path.join(tmpDir, 'exists.md');
  await fs.writeFile(target, 'original', 'utf-8');

  await assert.rejects(createFile({ path: target, content: 'clobber' }), ConflictError);
  assert.equal(await fs.readFile(target, 'utf-8'), 'original');
});

test('createFile creates missing parent directories', async () => {
  const target = path.join(tmpDir, 'a', 'b', 'deep.md');

  await createFile({ path: target, content: 'x' });

  assert.equal(await fs.readFile(target, 'utf-8'), 'x');
});

test('createFile rejects a path that is an existing directory', async () => {
  await assert.rejects(createFile({ path: tmpDir, content: 'x' }), ConflictError);
});
