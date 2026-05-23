// File tree loading and rendering

import { getFileIcon, TRASH_ICON, PENCIL_ICON, MOVE_ICON, CLOSE_ICON, FOLDER_ICON, CHEVRON_ICON } from './icons.js';
import {
  getActiveWorkspaceFolders,
  getActiveWorkspaceId,
  removeFolderFromWorkspace,
} from './workspaces.js';
import { getFilterFolders, removeFilterFolder } from './filter-folders.js';
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

// Indentation step per nesting level inside an external folder (px).
// At any depth, files and subfolder headers share the same left padding so
// their leading icons line up visually like siblings in a tree.
const NEST_INDENT = 16;
const BASE_FILE_PAD = 44;
const BASE_SUBFOLDER_PAD = 44;

// --- Render helpers ---

function renderExternalFileItem(file, isActive, depth = 0) {
  const padLeft = BASE_FILE_PAD + depth * NEST_INDENT;
  const linkStyle = depth > 0 ? ` style="padding-left: ${padLeft}px"` : '';
  return `
    <div class="tree-file ${isActive ? 'active' : ''}" data-path="${file.path}" data-external="true">
      <a href="#" class="tree-file-link" title="${file.name}" data-nav-path="${file.path}" data-nav-external="true"${linkStyle}>
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

function renderFolderHeader(folderId, folderName, { folderPath, extraClass = '', titleAttr = '', actions = '', headerStyle = '' } = {}) {
  const styleAttr = headerStyle ? ` style="${headerStyle}"` : '';
  return `
    <div class="tree-folder-header ${extraClass}" data-folder="${folderId}"${folderPath !== undefined ? ` data-folder-path="${folderPath}"` : ''}${styleAttr}>
      ${FOLDER_ICON}
      ${CHEVRON_ICON}
      <span class="tree-folder-name"${titleAttr ? ` title="${titleAttr}"` : ''}>${folderName}</span>
      ${actions}
    </div>
  `;
}

// Build a nested tree from the flat { "subfolder/path": [files] } map returned by the API.
// Result shape: { files: [], children: { name: { files, children } } }
function buildSubfolderTree(groupedFiles) {
  const root = { files: [], children: {} };

  for (const folderKey of Object.keys(groupedFiles)) {
    const files = groupedFiles[folderKey] || [];
    if (folderKey === '.') {
      root.files = root.files.concat(files);
      continue;
    }
    const parts = folderKey.split('/').filter(Boolean);
    let node = root;
    for (const part of parts) {
      if (!node.children[part]) {
        node.children[part] = { files: [], children: {} };
      }
      node = node.children[part];
    }
    node.files = node.files.concat(files);
  }

  return root;
}

function treeContainsActiveFile(node, matches) {
  if (node.files.some(matches)) return true;
  for (const child of Object.values(node.children)) {
    if (treeContainsActiveFile(child, matches)) return true;
  }
  return false;
}

function makeExternalMatcher(currentFilePath, isExternalFile) {
  if (!isExternalFile || !currentFilePath) return () => false;
  return f => f.path === currentFilePath;
}

function makeProjectMatcher(currentFilePath, isExternalFile) {
  if (isExternalFile || !currentFilePath) return () => false;
  return f => f.path === currentFilePath;
}

function renderNestedExternalSubfolder(name, subPath, subtree, externalRootPath, currentFilePath, isExternalFile, depth) {
  const rootSlug = externalRootPath.replace(/[^a-z0-9]/gi, '-');
  const subSlug = subPath.replace(/[^a-z0-9]/gi, '-');
  const subFolderId = `ext-subfolder-${rootSlug}-${subSlug}`;
  const isExpanded = treeContainsActiveFile(subtree, makeExternalMatcher(currentFilePath, isExternalFile));
  const headerPad = BASE_SUBFOLDER_PAD + depth * NEST_INDENT;
  const contentHtml = renderExternalTreeContent(subtree, externalRootPath, subPath, currentFilePath, isExternalFile, depth + 1);

  return `
    <div class="tree-folder external-subfolder ${isExpanded ? 'expanded' : ''}">
      ${renderFolderHeader(subFolderId, name, {
        titleAttr: subPath,
        headerStyle: `padding-left: ${headerPad}px`,
      })}
      <div class="tree-folder-content" id="${subFolderId}">
        ${contentHtml}
      </div>
    </div>
  `;
}

function renderExternalTreeContent(node, externalRootPath, parentSubPath, currentFilePath, isExternalFile, depth) {
  const sortedFiles = [...node.files].sort((a, b) => a.name.localeCompare(b.name));
  const filesHtml = sortedFiles.map(file => {
    const isActive = file.path === currentFilePath && isExternalFile;
    return renderExternalFileItem(file, isActive, depth);
  }).join('');

  const sortedChildren = Object.keys(node.children).sort((a, b) => a.localeCompare(b));
  const subfoldersHtml = sortedChildren.map(name => {
    const subPath = parentSubPath ? `${parentSubPath}/${name}` : name;
    return renderNestedExternalSubfolder(name, subPath, node.children[name], externalRootPath, currentFilePath, isExternalFile, depth);
  }).join('');

  return filesHtml + subfoldersHtml;
}

function renderExternalFolderGroup(folderPath, groupedFiles, currentFilePath, isExternalFile) {
  const folderName = folderPath.split('/').pop() || folderPath;
  const folderId = `ext-folder-${folderPath.replace(/[^a-z0-9]/gi, '-')}`;

  const tree = buildSubfolderTree(groupedFiles);
  const isExpanded = treeContainsActiveFile(tree, makeExternalMatcher(currentFilePath, isExternalFile));
  const contentHtml = renderExternalTreeContent(tree, folderPath, '', currentFilePath, isExternalFile, 0);

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

function renderProjectFileItem(file, isActive, depth = 0) {
  const padLeft = BASE_FILE_PAD + depth * NEST_INDENT;
  const linkStyle = depth > 0 ? ` style="padding-left: ${padLeft}px"` : '';
  return `
    <div class="tree-file ${isActive ? 'active' : ''}" data-path="${file.path}">
      <a href="#" class="tree-file-link" title="${file.name}" data-nav-path="${file.path}" data-nav-external="false"${linkStyle}>
        ${getFileIcon(file.name)}
        <span class="tree-file-name">${file.name}</span>
      </a>
      ${renderActionButtons(file)}
    </div>
  `;
}

function renderProjectFolderActions(name, fullSubPath) {
  return `
    <button class="action-btn rename-btn" data-rename-type="folder" data-rename-path="${fullSubPath}" data-rename-name="${name}" title="Doi ten">${PENCIL_ICON}</button>
    <button class="action-btn delete-btn" data-delete-type="folder" data-delete-path="${fullSubPath}" data-delete-name="${name}" title="Xoa thu muc">${TRASH_ICON}</button>
  `;
}

function renderProjectTreeContent(node, parentSubPath, currentFilePath, isExternalFile, depth) {
  const sortedFiles = [...node.files].sort((a, b) => a.name.localeCompare(b.name));
  const filesHtml = sortedFiles.map(file => {
    const isActive = file.path === currentFilePath && !isExternalFile;
    return renderProjectFileItem(file, isActive, depth);
  }).join('');

  const sortedChildren = Object.keys(node.children).sort((a, b) => a.localeCompare(b));
  const subfoldersHtml = sortedChildren.map(name => {
    const subPath = parentSubPath ? `${parentSubPath}/${name}` : name;
    return renderNestedProjectSubfolder(name, subPath, node.children[name], currentFilePath, isExternalFile, depth);
  }).join('');

  return filesHtml + subfoldersHtml;
}

function renderNestedProjectSubfolder(name, subPath, subtree, currentFilePath, isExternalFile, depth) {
  const folderId = `folder-${subPath.replace(/[^a-z0-9]/gi, '-')}`;
  const isExpanded = treeContainsActiveFile(subtree, makeProjectMatcher(currentFilePath, isExternalFile));
  const headerPad = BASE_SUBFOLDER_PAD + depth * NEST_INDENT;
  const contentHtml = renderProjectTreeContent(subtree, subPath, currentFilePath, isExternalFile, depth + 1);

  return `
    <div class="tree-folder ${isExpanded ? 'expanded' : ''}">
      ${renderFolderHeader(folderId, name, {
        folderPath: subPath,
        titleAttr: subPath,
        actions: renderProjectFolderActions(name, subPath),
        headerStyle: `padding-left: ${headerPad}px`,
      })}
      <div class="tree-folder-content" id="${folderId}">
        ${contentHtml}
      </div>
    </div>
  `;
}

function renderProjectFolderGroup(name, fullSubPath, node, currentFilePath, isExternalFile) {
  const folderId = `folder-${fullSubPath.replace(/[^a-z0-9]/gi, '-')}`;
  const isExpanded = treeContainsActiveFile(node, makeProjectMatcher(currentFilePath, isExternalFile));
  const contentHtml = renderProjectTreeContent(node, fullSubPath, currentFilePath, isExternalFile, 0);

  return `
    <div class="tree-folder ${isExpanded ? 'expanded' : ''}">
      ${renderFolderHeader(folderId, name, {
        folderPath: fullSubPath,
        titleAttr: fullSubPath,
        actions: renderProjectFolderActions(name, fullSubPath),
      })}
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
      const filterKey = getState().folderFilter;
      if (filterKey) {
        // Removing the filter folder itself is a no-op — it's still pinned by ?f=.
        if (path === filterKey) return;
        removeFilterFolder(filterKey, path);
      } else {
        removeFolderFromWorkspace(getActiveWorkspaceId(), path);
      }
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

    const externalFolders = getActiveWorkspaceFolders();
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

    const hasRoot = Object.prototype.hasOwnProperty.call(files, 'Root');
    const { Root: rootFiles = [], ...nestedFolders } = files;

    const rootHtml = hasRoot
      ? renderFolderGroup('Root', rootFiles, currentFilePath, isExternalFile)
      : '';

    const projectTree = buildSubfolderTree(nestedFolders);
    const projectHtml = Object.keys(projectTree.children).sort((a, b) => a.localeCompare(b))
      .map(name => renderProjectFolderGroup(name, name, projectTree.children[name], currentFilePath, isExternalFile))
      .join('');

    fileTreeNav.innerHTML = externalHtml + rootHtml + projectHtml;

    attachTreeEventHandlers(fileTreeNav);
  } catch (error) {
    console.error('Error loading file tree:', error);
  }
}

async function loadFilteredFileTree(folderPath, currentFilePath, isExternalFile) {
  try {
    const extraFolders = getFilterFolders(folderPath).filter(p => p !== folderPath);
    const requestedPaths = [folderPath, ...extraFolders];

    const extResponse = await apiFetch('/api/external-files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths: requestedPaths })
    });

    const fileTreeNav = document.getElementById('file-tree');
    const loadingTree = fileTreeNav.querySelector('.loading-tree');
    if (loadingTree) loadingTree.remove();

    const lastTalkHtml = renderLastTalkSection(LAST_TALK_FILES, currentFilePath, isExternalFile);
    const filterFolderHtml = renderExternalFolderGroup(
      folderPath,
      extResponse[folderPath] || {},
      currentFilePath,
      isExternalFile,
    );
    const extraFoldersHtml = extraFolders
      .map(p => renderExternalFolderGroup(p, extResponse[p] || {}, currentFilePath, isExternalFile))
      .join('');

    fileTreeNav.innerHTML = lastTalkHtml + filterFolderHtml + extraFoldersHtml;

    attachTreeEventHandlers(fileTreeNav);
  } catch (error) {
    console.error('Error loading filtered file tree:', error);
  }
}
