import { pathExists, getStat } from '../repositories/file-system.repo.js';
import { scanFiles } from '../repositories/project-files.repo.js';

/**
 * Scan a list of absolute folder paths for supported files, grouped per base path.
 *
 * @param {{ paths: string[] }} input
 * @returns {Promise<Record<string, Record<string, import('../domain/file-entry.js').FileEntry[]>>>}
 */
export async function scanExternalFolders({ paths }) {
  const result = {};
  for (const folderPath of paths) {
    try {
      if (!(await pathExists(folderPath))) continue;
      const stat = await getStat(folderPath);
      if (!stat.isDirectory()) continue;

      const files = await scanFiles(folderPath, { isExternal: true });
      const grouped = {};
      for (const file of files) {
        if (!grouped[file.folder]) grouped[file.folder] = [];
        grouped[file.folder].push(file);
      }
      result[folderPath] = grouped;
    } catch (err) {
      console.error(`Error scanning external folder ${folderPath}:`, err);
    }
  }
  return result;
}
