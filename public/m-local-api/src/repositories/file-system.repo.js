import fs from 'node:fs/promises';

/** @param {string} p */
export async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

/** @param {string} p */
export async function getStat(p) {
  return fs.stat(p);
}

/** @param {string} p @param {'utf-8'|'base64'} [encoding] */
export async function readFile(p, encoding = 'utf-8') {
  return fs.readFile(p, encoding);
}

/**
 * Read up to `length` bytes from `p` starting at byte `offset`.
 * Returns the raw Buffer actually read (shorter than `length` at EOF).
 *
 * @param {string} p
 * @param {number} offset
 * @param {number} length
 * @returns {Promise<Buffer>}
 */
export async function readFileRange(p, offset, length) {
  const handle = await fs.open(p, 'r');
  try {
    const buffer = Buffer.alloc(length);
    const { bytesRead } = await handle.read(buffer, 0, length, offset);
    return bytesRead === length ? buffer : buffer.subarray(0, bytesRead);
  } finally {
    await handle.close();
  }
}

/** @param {string} p */
export async function readFileUtf8(p) {
  return fs.readFile(p, 'utf-8');
}

/** @param {string} p @param {string} content */
export async function writeFile(p, content) {
  return fs.writeFile(p, content, 'utf-8');
}

/** @param {string} p */
export async function deleteFile(p) {
  return fs.unlink(p);
}

/** @param {string} p */
export async function removeDir(p) {
  return fs.rm(p, { recursive: true });
}

/** @param {string} p */
export async function createDir(p) {
  return fs.mkdir(p, { recursive: true });
}

/** @param {string} from @param {string} to */
export async function renameEntry(from, to) {
  return fs.rename(from, to);
}

/** @param {string} p */
export async function listDirEntries(p) {
  return fs.readdir(p, { withFileTypes: true });
}
