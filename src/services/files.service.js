import path from 'node:path';
import { marked } from 'marked';
import { getFileType, FILE_TYPES } from '../config/constants.js';
import { PROJECT_ROOT, isPathSafe, resolveFilePath } from '../lib/paths.js';
import {
  BadRequestError, ForbiddenError, NotFoundError, ConflictError,
} from '../lib/errors.js';
import { sanitizeFsName } from '../lib/sanitize.js';
import {
  pathExists, getStat, readFileUtf8, deleteFile, renameEntry,
} from '../repositories/file-system.repo.js';
import { scanFiles, getAllFolders } from '../repositories/project-files.repo.js';

/**
 * List all project files grouped by folder (Root for top-level).
 */
export async function listFilesGrouped() {
  const files = await scanFiles(PROJECT_ROOT);
  const folders = await getAllFolders(PROJECT_ROOT);

  const grouped = {};
  for (const file of files) {
    const key = file.folder === '.' ? 'Root' : file.folder;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(file);
  }
  for (const folder of folders) {
    if (!grouped[folder]) grouped[folder] = [];
  }
  return grouped;
}

/**
 * @param {{ filePath: string, isExternal: boolean }} input
 */
export async function readContent({ filePath, isExternal }) {
  const { fullPath } = resolveFilePath(filePath, isExternal);
  await assertFileExists(fullPath);

  const content = await readFileUtf8(fullPath);
  const ext = path.extname(filePath).toLowerCase();
  const type = getFileType(ext);

  const result = { content, type, path: filePath, isExternal };
  if (type === FILE_TYPES.MARKDOWN) {
    result.html = marked(content);
  }
  return result;
}

/**
 * @param {{ filePath: string, isExternal: boolean }} input
 */
export async function removeFile({ filePath, isExternal }) {
  if (isExternal) {
    if (!filePath.endsWith('.md')) {
      throw new ForbiddenError('Access denied: Can only delete markdown files');
    }
  } else if (!isPathSafe(filePath)) {
    throw new ForbiddenError('Access denied: Cannot delete this file');
  }

  const { fullPath } = resolveFilePath(filePath, isExternal);
  await assertFileExists(fullPath);
  await deleteFile(fullPath);
  return { success: true, message: 'File deleted successfully', path: filePath, isExternal };
}

/**
 * Move a project file into another project folder (or root).
 *
 * @param {{ from: string, to: string }} input
 */
export async function moveFile({ from, to }) {
  if (!isPathSafe(from)) {
    throw new ForbiddenError('Access denied: Cannot move this file');
  }

  const destFolder = to || '';
  if (destFolder && !isPathSafe(destFolder)) {
    throw new ForbiddenError('Access denied: Invalid destination folder');
  }

  const fullFrom = path.join(PROJECT_ROOT, from);
  const fileName = path.basename(from);
  const fullTo = destFolder
    ? path.join(PROJECT_ROOT, destFolder, fileName)
    : path.join(PROJECT_ROOT, fileName);
  const newRelativePath = path.relative(PROJECT_ROOT, fullTo);

  if (!(await pathExists(fullFrom))) throw new NotFoundError('File not found');
  const stats = await getStat(fullFrom);
  if (!stats.isFile()) throw new BadRequestError('Can only move files');
  if (await pathExists(fullTo)) {
    throw new ConflictError('A file with this name already exists in the destination');
  }
  if (destFolder) {
    const destFull = path.join(PROJECT_ROOT, destFolder);
    if (!(await pathExists(destFull))) {
      throw new NotFoundError('Destination folder not found');
    }
  }

  await renameEntry(fullFrom, fullTo);
  return { success: true, message: 'File moved successfully', from, to: newRelativePath };
}

/**
 * Rename a project file or folder in place.
 *
 * @param {{ oldPath: string, newName: string }} input
 */
export async function renameItem({ oldPath, newName }) {
  if (!isPathSafe(oldPath)) {
    throw new ForbiddenError('Access denied: Cannot rename this item');
  }

  const sanitized = sanitizeFsName(newName);
  if (!sanitized) throw new BadRequestError('Invalid new name');

  const fullOld = path.join(PROJECT_ROOT, oldPath);
  const parentDir = path.dirname(fullOld);
  const fullNew = path.join(parentDir, sanitized);
  const newRelativePath = path.relative(PROJECT_ROOT, fullNew);

  if (!isPathSafe(newRelativePath)) {
    throw new ForbiddenError('Access denied: Invalid destination');
  }
  if (!(await pathExists(fullOld))) throw new NotFoundError('File or folder not found');
  if (await pathExists(fullNew)) {
    throw new ConflictError('A file or folder with this name already exists');
  }

  await renameEntry(fullOld, fullNew);
  return { success: true, message: 'Renamed successfully', oldPath, newPath: newRelativePath };
}

async function assertFileExists(fullPath) {
  if (!(await pathExists(fullPath))) throw new NotFoundError('File not found');
  const stat = await getStat(fullPath);
  if (!stat.isFile()) throw new BadRequestError('Path is not a file');
}
