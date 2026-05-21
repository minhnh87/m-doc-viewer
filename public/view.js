// Main entry point - ES6 Module version

import { getState } from './modules/state.js';
import { initDialogs, showInputDialog, showAddFolderDialog } from './modules/dialogs.js';
import { loadFileTree } from './modules/file-tree.js';
import { loadContent } from './modules/content-loader.js';
import { setupKeyboardNavigation, setupHotkeys } from './modules/keyboard.js';
import { exportToStaticHTML } from './modules/export.js';
import { setupSearchListeners, restoreSearchState } from './modules/search.js';
import { apiFetch } from './modules/api.js';
import { navigateToFile } from './modules/navigation.js';
import { initResize } from './modules/resize.js';
import { initZoom } from './modules/zoom.js';

// Initialize state check
const state = getState();
if (!state.currentFilePath) {
  document.getElementById('loading').innerHTML = 'No file specified.';
}

// Initialize all dialogs
initDialogs();

// Initialize sidebar resize handles
initResize();

// Initialize content zoom
initZoom();

// Toggle sidebars on mobile
const toggleFileTreeButton = document.getElementById('toggle-file-tree');
const toggleOutlineButton = document.getElementById('toggle-outline');
const closeFileTreeButton = document.getElementById('close-file-tree');
const closeOutlineButton = document.getElementById('close-outline');
const fileTreeSidebar = document.querySelector('.file-tree-sidebar');
const outlineSidebar = document.querySelector('.outline-sidebar');

toggleFileTreeButton.addEventListener('click', () => {
  fileTreeSidebar.classList.toggle('open');
  outlineSidebar.classList.remove('open');
});

toggleOutlineButton.addEventListener('click', () => {
  outlineSidebar.classList.toggle('open');
  fileTreeSidebar.classList.remove('open');
});

closeFileTreeButton.addEventListener('click', () => {
  fileTreeSidebar.classList.remove('open');
});

closeOutlineButton.addEventListener('click', () => {
  outlineSidebar.classList.remove('open');
});

// Create folder button handler
document.getElementById('create-folder-btn').addEventListener('click', () => {
  showInputDialog('create-folder');
});

// Add external folder button handler
document.getElementById('add-external-folder-btn').addEventListener('click', () => {
  showAddFolderDialog();
});

// Quick button: Last Talk
document.getElementById('quick-last-talk-btn').addEventListener('click', () => {
  navigateToFile('last_talk.md', false);
});

// Quick button: Latest Plan
document.getElementById('quick-latest-plan-btn').addEventListener('click', async () => {
  try {
    const data = await apiFetch('/api/latest-plan');
    navigateToFile(data.path, true);
  } catch (error) {
    console.error('Error getting latest plan:', error);
    alert('Loi: ' + error.message);
  }
});

// Export button handler
document.getElementById('export-html-btn').addEventListener('click', exportToStaticHTML);

// Load content and setup keyboard navigation
loadContent();
setupKeyboardNavigation();

// Setup search listeners
setupSearchListeners();

// Setup hotkeys (F, L, P)
const searchPanel = document.getElementById('search-panel');
const searchInput = document.getElementById('search-input');
setupHotkeys(searchPanel, searchInput);

// Try to restore search state, or load file tree if no search was active
const hasRestoredSearch = restoreSearchState();
if (!hasRestoredSearch) {
  loadFileTree();
}

// Handle browser back/forward navigation
window.addEventListener('popstate', () => {
  const params = new URLSearchParams(window.location.search);
  const path = params.get('path');
  const external = params.get('external') === 'true';
  if (path) {
    navigateToFile(path, external, { pushState: false });
  }
});
