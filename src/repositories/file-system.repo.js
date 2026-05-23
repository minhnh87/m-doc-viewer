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

/** @param {string} p */
export async function readFileUtf8(p) {
  return fs.readFile(p, 'utf-8');
}

/**
 * @param {string} p
 * @param {string} content
 */
export async function writeFileUtf8(p, content) {
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

/**
 * @param {string} from
 * @param {string} to
 */
export async function renameEntry(from, to) {
  return fs.rename(from, to);
}

/** @param {string} p */
export async function listDirEntries(p) {
  return fs.readdir(p, { withFileTypes: true });
}
