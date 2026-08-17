// SPA navigation — navigate between files without full page reload

import { getState, updateState } from './state.js';
import { loadContent } from './content-loader.js';
import { confirmAndCloseEditor } from './editor.js';

/**
 * Navigate to a file without full page reload.
 * Updates state, URL, content area, and active file highlight.
 * @param {string} filePath - The file path to navigate to
 * @param {boolean} isExternal - Whether the file is external
 * @param {object} [options] - Options
 * @param {boolean} [options.pushState=true] - Whether to push a new history entry (false for popstate handling)
 * @param {{ line: number, query: string }} [options.scrollTo] - Scroll to this search match after the content renders
 */
export function navigateToFile(filePath, isExternal = false, { pushState = true, scrollTo = null } = {}) {
  if (!filePath) return;

  // Editing? Confirm discarding unsaved changes before leaving the file.
  if (!confirmAndCloseEditor()) return;

  // Update shared state
  updateState({ currentFilePath: filePath, isExternalFile: isExternal });

  // Update URL without reload, preserving folder filter (`f`) if present
  const { folderFilter } = getState();
  const params = new URLSearchParams();
  params.set('path', filePath);
  if (isExternal) params.set('external', 'true');
  if (folderFilter) params.set('f', folderFilter);
  const newUrl = `index.html?${params.toString()}`;
  if (pushState) {
    history.pushState({ path: filePath, external: isExternal }, '', newUrl);
  }

  // Update active file highlight in the file tree (without rebuilding it)
  updateActiveHighlight(filePath, isExternal);

  // Reload only the content area
  loadContent(scrollTo);
}

/**
 * Update the .active class on file tree items to reflect the current file.
 */
function updateActiveHighlight(filePath, isExternal) {
  const fileTree = document.getElementById('file-tree');
  if (!fileTree) return;

  // Remove .active from all tree-file elements
  const allFiles = fileTree.querySelectorAll('.tree-file.active');
  allFiles.forEach(el => el.classList.remove('active'));

  // Find and activate the matching file element
  const allTreeFiles = fileTree.querySelectorAll('.tree-file');
  for (const el of allTreeFiles) {
    const elPath = el.dataset.path;
    const elExternal = el.dataset.external === 'true';
    if (elPath === filePath && elExternal === isExternal) {
      el.classList.add('active');
      break;
    }
  }
}

