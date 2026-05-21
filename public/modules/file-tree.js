// File tree loading and rendering

import { getFileIcon, TRASH_ICON, PENCIL_ICON, MOVE_ICON, CLOSE_ICON, FOLDER_ICON, CHEVRON_ICON } from './icons.js';
import { getExternalFolders, removeExternalFolder } from './storage.js';
import { showConfirmDialog, showInputDialog, showMoveDialog } from './dialogs.js';
import { getState } from './state.js';
import { apiFetch } from './api.js';
import { navigateToFile } from './navigation.js';

export { getFileIcon };

// Files shown at the top of the tree in folder-filter (?f=) mode.
// These are project-root markdown files used for quick access.
const LAST_TALK_FILES = [
  { name: 'last_talk.md', path: 'last_talk.md', type: 'markdown' },
  { name: 'last_talk_1.md', path: 'last_talk_1.md', type: 'markdown' },
  { name: 'last_talk_2.md', path: 'last_talk_2.md', type: 'markdown' }
];

// --- Render helpers ---

function renderExternalFileItem(file, isActive) {
  return `
    <div class="tree-file ${isActive ? 'active' : ''}" data-path="${file.path}" data-external="true">
      <a href="#" class="tree-file-link" title="${file.name}" data-nav-path="${file.path}" data-nav-external="true">
        ${getFileIcon(file.name)}
        <span class="tree-file-name">${file.name}</span>
      </a>
      <button class="action-btn delete-btn external-delete-btn" data-delete-type="file" data-delete-path="${file.path}" data-delete-name="${file.name}" data-delete-external="true" title="Xoa file">${TRASH_ICON}</button>
    </div>
  `;
}

function renderFileItem(file, isActive) {
  return `
    <div class="tree-file ${isActive ? 'active' : ''}" data-path="${file.path}">
      <a href="#" class="tree-file-link" title="${file.name}" data-nav-path="${file.path}" data-nav-external="false">
        ${getFileIcon(file.name)}
        <span class="tree-file-name">${file.name}</span>
      </a>
      ${renderActionButtons(file)}
    </div>
  `;
}

function renderActionButtons(file) {
  return `
    <button class="action-btn rename-btn" data-rename-type="file" data-rename-path="${file.path}" data-rename-name="${file.name}" title="Doi ten">${PENCIL_ICON}</button>
    <button class="action-btn move-btn" data-move-path="${file.path}" data-move-name="${file.name}" title="Di chuyen">${MOVE_ICON}</button>
    <button class="action-btn delete-btn" data-delete-type="file" data-delete-path="${file.path}" data-delete-name="${file.name}" title="Xoa file">${TRASH_ICON}</button>
  `;
}

function renderFolderHeader(folderId, folderName, { folderPath, extraClass = '', titleAttr = '', actions = '' } = {}) {
  return `
    <div class="tree-folder-header ${extraClass}" data-folder="${folderId}"${folderPath !== undefined ? ` data-folder-path="${folderPath}"` : ''}>
      ${FOLDER_ICON}
      ${CHEVRON_ICON}
      <span class="tree-folder-name"${titleAttr ? ` title="${titleAttr}"` : ''}>${folderName}</span>
      ${actions}
    </div>
  `;
}

function renderExternalSubfolder(subfolder, subfolderFiles, folderPath, currentFilePath, isExternalFile) {
  const subFolderId = `ext-subfolder-${folderPath.replace(/[^a-z0-9]/gi, '-')}-${subfolder.replace(/[^a-z0-9]/gi, '-')}`;
  const isSubfolderExpanded = subfolderFiles.some(f => f.path === currentFilePath && isExternalFile);

  subfolderFiles.sort((a, b) => a.name.localeCompare(b.name));
  const filesHtml = subfolderFiles.map(file => {
    const isActive = file.path === currentFilePath && isExternalFile;
    return renderExternalFileItem(file, isActive);
  }).join('');

  return `
    <div class="tree-folder external-subfolder ${isSubfolderExpanded ? 'expanded' : ''}">
      ${renderFolderHeader(subFolderId, subfolder)}
      <div class="tree-folder-content" id="${subFolderId}">
        ${filesHtml}
      </div>
    </div>
  `;
}

function renderExternalFolderGroup(folderPath, groupedFiles, currentFilePath, isExternalFile) {
  const folderName = folderPath.split('/').pop() || folderPath;
  const folderId = `ext-folder-${folderPath.replace(/[^a-z0-9]/gi, '-')}`;

  const allFiles = Object.values(groupedFiles).flat();
  const isExpanded = allFiles.some(f => f.path === currentFilePath && isExternalFile);

  const sortedSubfolders = Object.keys(groupedFiles).sort((a, b) => {
    if (a === '.') return -1;
    if (b === '.') return 1;
    return a.localeCompare(b);
  });

  let contentHtml = '';
  for (const subfolder of sortedSubfolders) {
    const subfolderFiles = groupedFiles[subfolder];

    if (subfolder === '.') {
      subfolderFiles.sort((a, b) => a.name.localeCompare(b.name));
      contentHtml += subfolderFiles.map(file => {
        const isActive = file.path === currentFilePath && isExternalFile;
        return renderExternalFileItem(file, isActive);
      }).join('');
    } else {
      contentHtml += renderExternalSubfolder(subfolder, subfolderFiles, folderPath, currentFilePath, isExternalFile);
    }
  }

  const removeBtn = `<button class="action-btn remove-external-btn" data-external-path="${folderPath}" title="Xoa khoi danh sach">${CLOSE_ICON}</button>`;

  return `
    <div class="tree-folder external-folder ${isExpanded ? 'expanded' : ''}">
      ${renderFolderHeader(folderId, folderName, { folderPath, extraClass: 'external-folder-header', titleAttr: folderPath, actions: removeBtn })}
      <div class="tree-folder-content" id="${folderId}">
        ${contentHtml}
      </div>
    </div>
  `;
}

function renderLastTalkSection(files, currentFilePath, isExternalFile) {
  const folderId = 'folder-last-talk';
  const isExpanded = files.some(f => f.path === currentFilePath && !isExternalFile);

  const filesHtml = files.map(file => {
    const isActive = file.path === currentFilePath && !isExternalFile;
    return renderFileItem(file, isActive);
  }).join('');

  return `
    <div class="tree-folder ${isExpanded ? 'expanded' : ''}">
      ${renderFolderHeader(folderId, 'Last Talk', { folderPath: '' })}
      <div class="tree-folder-content" id="${folderId}">
        ${filesHtml}
      </div>
    </div>
  `;
}

function renderFolderGroup(folder, folderFiles, currentFilePath, isExternalFile) {
  const folderId = `folder-${folder.replace(/[^a-z0-9]/gi, '-')}`;
  const isExpanded = folderFiles.some(f => f.path === currentFilePath);

  const folderActions = folder !== 'Root' ? `
    <button class="action-btn rename-btn" data-rename-type="folder" data-rename-path="${folder}" data-rename-name="${folder}" title="Doi ten">${PENCIL_ICON}</button>
    <button class="action-btn delete-btn" data-delete-type="folder" data-delete-path="${folder}" data-delete-name="${folder}" title="Xoa thu muc">${TRASH_ICON}</button>
  ` : '';

  folderFiles.sort((a, b) => a.name.localeCompare(b.name));
  const filesHtml = folderFiles.map(file => {
    const isActive = file.path === currentFilePath && !isExternalFile;
    return renderFileItem(file, isActive);
  }).join('');

  return `
    <div class="tree-folder ${isExpanded ? 'expanded' : ''}">
      ${renderFolderHeader(folderId, folder, { folderPath: folder === 'Root' ? '' : folder, actions: folderActions })}
      <div class="tree-folder-content" id="${folderId}">
        ${filesHtml}
      </div>
    </div>
  `;
}

// --- Tree state persistence ---

export function saveTreeState() {
  const fileTree = document.getElementById('file-tree');
  if (!fileTree) return null;

  const expandedIds = [];
  fileTree.querySelectorAll('.tree-folder.expanded').forEach(folder => {
    const header = folder.querySelector('.tree-folder-header');
    if (header && header.dataset.folder) {
      expandedIds.push(header.dataset.folder);
    }
  });

  return { scrollTop: fileTree.scrollTop, expandedIds };
}

export function restoreTreeState(state) {
  if (!state) return;
  const fileTree = document.getElementById('file-tree');
  if (!fileTree) return;

  for (const id of state.expandedIds) {
    const header = fileTree.querySelector(`.tree-folder-header[data-folder="${id}"]`);
    if (header && header.parentElement) {
      header.parentElement.classList.add('expanded');
    }
  }

  fileTree.scrollTop = state.scrollTop;
}

// --- Event handler wiring ---

function attachTreeEventHandlers(fileTreeNav) {
  fileTreeNav.addEventListener('click', (e) => {
    const link = e.target.closest('.tree-file-link');
    if (!link) return;
    e.preventDefault();
    const path = link.dataset.navPath;
    const isExternal = link.dataset.navExternal === 'true';
    if (path) {
      navigateToFile(path, isExternal);
    }
  });

  fileTreeNav.querySelectorAll('.tree-folder-header').forEach(header => {
    header.addEventListener('click', (e) => {
      if (e.target.closest('.action-btn')) return;
      header.parentElement.classList.toggle('expanded');
    });
  });

  fileTreeNav.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const type = btn.dataset.deleteType;
      const path = btn.dataset.deletePath;
      const name = btn.dataset.deleteName;
      const isExternal = btn.dataset.deleteExternal === 'true';
      showConfirmDialog(type, path, name, isExternal);
    });
  });

  fileTreeNav.querySelectorAll('.rename-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const type = btn.dataset.renameType;
      const path = btn.dataset.renamePath;
      const name = btn.dataset.renameName;
      showInputDialog('rename', { type, path, name });
    });
  });

  fileTreeNav.querySelectorAll('.move-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const path = btn.dataset.movePath;
      const name = btn.dataset.moveName;
      showMoveDialog(path, name);
    });
  });

  fileTreeNav.querySelectorAll('.remove-external-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const path = btn.dataset.externalPath;
      removeExternalFolder(path);
      loadFileTree();
    });
  });
}

// --- Main function ---

export async function loadFileTree() {
  const state = getState();
  const currentFilePath = state.currentFilePath;
  const isExternalFile = state.isExternalFile;
  const folderFilter = state.folderFilter;

  if (folderFilter) {
    return loadFilteredFileTree(folderFilter, currentFilePath, isExternalFile);
  }

  try {
    const files = await apiFetch('/api/files');

    const externalFolders = getExternalFolders();
    let externalFiles = {};

    if (externalFolders.length > 0) {
      try {
        const extResponse = await apiFetch('/api/external-files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paths: externalFolders })
        });
        externalFiles = extResponse;
      } catch (e) {
        console.error('Error loading external files:', e);
      }
    }

    const fileTreeNav = document.getElementById('file-tree');
    const loadingTree = fileTreeNav.querySelector('.loading-tree');

    if (loadingTree) {
      loadingTree.remove();
    }

    const externalHtml = Object.keys(externalFiles).sort()
      .map(folderPath => renderExternalFolderGroup(folderPath, externalFiles[folderPath], currentFilePath, isExternalFile))
      .join('');

    const projectHtml = Object.keys(files).sort()
      .map(folder => renderFolderGroup(folder, files[folder], currentFilePath, isExternalFile))
      .join('');

    fileTreeNav.innerHTML = externalHtml + projectHtml;

    attachTreeEventHandlers(fileTreeNav);
  } catch (error) {
    console.error('Error loading file tree:', error);
  }
}

async function loadFilteredFileTree(folderPath, currentFilePath, isExternalFile) {
  try {
    const extResponse = await apiFetch('/api/external-files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths: [folderPath] })
    });

    const folderFiles = extResponse[folderPath] || {};

    const fileTreeNav = document.getElementById('file-tree');
    const loadingTree = fileTreeNav.querySelector('.loading-tree');
    if (loadingTree) loadingTree.remove();

    const lastTalkHtml = renderLastTalkSection(LAST_TALK_FILES, currentFilePath, isExternalFile);
    const folderHtml = renderExternalFolderGroup(folderPath, folderFiles, currentFilePath, isExternalFile);

    fileTreeNav.innerHTML = lastTalkHtml + folderHtml;

    attachTreeEventHandlers(fileTreeNav);
  } catch (error) {
    console.error('Error loading filtered file tree:', error);
  }
}
