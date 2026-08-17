// Dialog modules: Confirm, Input, Move, AddFolder dialogs

import { WARNING_ICON, CLOSE_ICON, FOLDER_ICON, CHEVRON_ICON } from './icons.js';
import { addFolderToWorkspace, getActiveWorkspaceId } from './workspaces.js';
import { addFilterFolder } from './filter-folders.js';
import { getState } from './state.js';
import { apiFetch } from './api.js';
import { loadFileTree, saveTreeState, restoreTreeState } from './file-tree.js';
import { navigateToFile } from './navigation.js';

// ========================================
// CONFIRM DIALOG (Delete)
// ========================================
let deleteTarget = null;

function handleConfirmDialogKeydown(e) {
  if (e.key === 'Escape') {
    e.preventDefault();
    hideConfirmDialog();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    executeDelete();
  }
}

export function createConfirmDialog() {
  const dialog = document.createElement('div');
  dialog.className = 'confirm-overlay';
  dialog.id = 'confirm-dialog';
  dialog.innerHTML = `
    <div class="confirm-dialog">
      <div class="confirm-header">
        ${WARNING_ICON}
        <h3>Xac nhan xoa</h3>
      </div>
      <div class="confirm-body">
        <p>Ban co chac muon xoa <span class="item-name" id="delete-item-name"></span>?</p>
      </div>
      <div class="confirm-actions">
        <button class="confirm-btn confirm-btn-cancel" id="cancel-delete">Huy</button>
        <button class="confirm-btn confirm-btn-delete" id="confirm-delete">Xoa</button>
      </div>
    </div>
  `;
  document.body.appendChild(dialog);

  document.getElementById('cancel-delete').addEventListener('click', hideConfirmDialog);
  document.getElementById('confirm-delete').addEventListener('click', executeDelete);
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) hideConfirmDialog();
  });
}

export function showConfirmDialog(type, path, name, isExternal = false) {
  deleteTarget = { type, path, name, isExternal };
  const typeLabel = type === 'folder' ? 'thu muc' : 'file';
  document.getElementById('delete-item-name').textContent = `${typeLabel} "${name}"`;
  document.getElementById('confirm-dialog').classList.add('show');
  document.addEventListener('keydown', handleConfirmDialogKeydown);
}

export function hideConfirmDialog() {
  document.getElementById('confirm-dialog').classList.remove('show');
  deleteTarget = null;
  document.removeEventListener('keydown', handleConfirmDialogKeydown);
}

export async function executeDelete() {
  if (!deleteTarget) return;

  const { type, path, isExternal } = deleteTarget;
  const endpoint = type === 'folder' ? '/api/folder' : '/api/file';
  const externalParam = isExternal ? '&external=true' : '';

  try {
    const data = await apiFetch(`${endpoint}?path=${encodeURIComponent(path)}${externalParam}`, {
      method: 'DELETE'
    });

    hideConfirmDialog();

    const treeState = saveTreeState();
    await loadFileTree();
    restoreTreeState(treeState);

    const state = getState();
    if (type === 'file' && path === state.currentFilePath) {
      navigateToFile('/', false);
    }
  } catch (error) {
    console.error('Delete error:', error);
    alert('Loi: ' + error.message);
    hideConfirmDialog();
  }
}

// ========================================
// INPUT DIALOG (Create Folder & Rename)
// ========================================
let inputTarget = null;

export function createInputDialog() {
  const dialog = document.createElement('div');
  dialog.className = 'confirm-overlay';
  dialog.id = 'input-dialog';
  dialog.innerHTML = `
    <div class="confirm-dialog">
      <div class="confirm-header">
        <h3 id="input-dialog-title">Nhap ten</h3>
      </div>
      <div class="confirm-body">
        <input type="text" id="input-dialog-input" class="input-dialog-field" placeholder="Nhap ten..." autocomplete="off">
      </div>
      <div class="confirm-actions">
        <button class="confirm-btn confirm-btn-cancel" id="cancel-input">Huy</button>
        <button class="confirm-btn confirm-btn-ok" id="confirm-input">OK</button>
      </div>
    </div>
  `;
  document.body.appendChild(dialog);

  const inputField = document.getElementById('input-dialog-input');

  document.getElementById('cancel-input').addEventListener('click', hideInputDialog);
  document.getElementById('confirm-input').addEventListener('click', executeInputAction);
  inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') executeInputAction();
    if (e.key === 'Escape') hideInputDialog();
  });
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) hideInputDialog();
  });
}

export function showInputDialog(action, options = {}) {
  inputTarget = { action, ...options };
  const titleEl = document.getElementById('input-dialog-title');
  const inputEl = document.getElementById('input-dialog-input');

  if (action === 'create-folder') {
    titleEl.textContent = 'Tao thu muc moi';
    inputEl.placeholder = 'Nhap ten thu muc...';
    inputEl.value = '';
  } else if (action === 'rename') {
    const typeLabel = options.type === 'folder' ? 'thu muc' : 'file';
    titleEl.textContent = `Doi ten ${typeLabel}`;
    inputEl.placeholder = 'Nhap ten moi...';
    inputEl.value = options.name || '';
  }

  document.getElementById('input-dialog').classList.add('show');
  setTimeout(() => inputEl.focus(), 100);
}

export function hideInputDialog() {
  document.getElementById('input-dialog').classList.remove('show');
  inputTarget = null;
}

export async function executeInputAction() {
  if (!inputTarget) return;

  const inputEl = document.getElementById('input-dialog-input');
  const value = inputEl.value.trim();

  if (!value) {
    alert('Vui long nhap ten');
    return;
  }

  try {
    if (inputTarget.action === 'create-folder') {
      const data = await apiFetch('/api/folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: value })
      });
    } else if (inputTarget.action === 'rename') {
      const data = await apiFetch('/api/rename', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldPath: inputTarget.path,
          newName: value,
          type: inputTarget.type
        })
      });

      const state = getState();
      if (inputTarget.type === 'file' && inputTarget.path === state.currentFilePath) {
        const newPath = inputTarget.path.replace(/[^/]+$/, value);
        hideInputDialog();
        const treeState = saveTreeState();
        await loadFileTree();
        restoreTreeState(treeState);
        navigateToFile(newPath, false);
        return;
      }
    }

    hideInputDialog();
    const treeState = saveTreeState();
    await loadFileTree();
    restoreTreeState(treeState);
  } catch (error) {
    console.error('Action error:', error);
    alert('Loi: ' + error.message);
  }
}

// ========================================
// MOVE DIALOG
// ========================================
let moveTarget = null;

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isHiddenFolder(folderPath) {
  return folderPath.split('/').some(segment => segment.startsWith('.'));
}

function buildMoveFolderTree(folderPaths) {
  const root = { children: {} };
  for (const folderPath of folderPaths) {
    let node = root;
    for (const segment of folderPath.split('/')) {
      if (!node.children[segment]) {
        node.children[segment] = { children: {} };
      }
      node = node.children[segment];
    }
  }
  return root;
}

function renderMoveFolderNode(name, fullPath, node, currentFolder) {
  const childNames = Object.keys(node.children).sort((a, b) => a.localeCompare(b));
  const isCurrent = fullPath === currentFolder;
  const optionClass = isCurrent ? 'folder-option folder-option-disabled' : 'folder-option';

  const toggleHtml = childNames.length > 0
    ? `<span class="folder-toggle" data-toggle>${CHEVRON_ICON}</span>`
    : '<span class="folder-toggle folder-toggle-spacer"></span>';

  const childrenHtml = childNames.length > 0
    ? `<div class="folder-children">${childNames
        .map(child => renderMoveFolderNode(child, `${fullPath}/${child}`, node.children[child], currentFolder))
        .join('')}</div>`
    : '';

  return `<div class="folder-node">
    <div class="${optionClass}" data-folder="${escapeHtml(fullPath)}">
      ${toggleHtml}
      ${FOLDER_ICON}
      <span>${escapeHtml(name)}</span>
    </div>
    ${childrenHtml}
  </div>`;
}

function handleFolderListClick(e) {
  const toggle = e.target.closest('.folder-toggle[data-toggle]');
  if (toggle) {
    toggle.closest('.folder-node').classList.toggle('expanded');
    return;
  }

  const option = e.target.closest('.folder-option');
  if (option && !option.classList.contains('folder-option-disabled')) {
    executeMove(option.dataset.folder);
  }
}

export function createMoveDialog() {
  const dialog = document.createElement('div');
  dialog.className = 'confirm-overlay';
  dialog.id = 'move-dialog';
  dialog.innerHTML = `
    <div class="confirm-dialog move-dialog">
      <div class="confirm-header">
        <h3>Di chuyen file</h3>
      </div>
      <div class="confirm-body">
        <p>Chon thu muc dich cho <span class="item-name" id="move-item-name"></span>:</p>
        <div class="folder-list" id="folder-list"></div>
      </div>
      <div class="confirm-actions">
        <button class="confirm-btn confirm-btn-cancel" id="cancel-move">Huy</button>
      </div>
    </div>
  `;
  document.body.appendChild(dialog);

  document.getElementById('cancel-move').addEventListener('click', hideMoveDialog);
  document.getElementById('folder-list').addEventListener('click', handleFolderListClick);
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) hideMoveDialog();
  });
}

export async function showMoveDialog(path, name) {
  moveTarget = { path, name };
  document.getElementById('move-item-name').textContent = `"${name}"`;

  const currentFolder = path.includes('/') ? path.substring(0, path.lastIndexOf('/')) : '';

  try {
    const files = await apiFetch('/api/files');
    const visibleFolders = Object.keys(files)
      .filter(f => f !== 'Root' && !isHiddenFolder(f));

    const tree = buildMoveFolderTree(visibleFolders);
    const topLevelNames = Object.keys(tree.children).sort((a, b) => a.localeCompare(b));

    let html = '';

    if (currentFolder !== '') {
      html += `<div class="folder-node">
        <div class="folder-option" data-folder="">
          <span class="folder-toggle folder-toggle-spacer"></span>
          ${FOLDER_ICON}
          <span>Root</span>
        </div>
      </div>`;
    }

    html += topLevelNames
      .map(topName => renderMoveFolderNode(topName, topName, tree.children[topName], currentFolder))
      .join('');

    if (!html) {
      html = '<p class="no-folders">Khong co thu muc khac de di chuyen</p>';
    }

    document.getElementById('folder-list').innerHTML = html;
    document.getElementById('move-dialog').classList.add('show');
  } catch (error) {
    console.error('Error loading folders:', error);
    alert('Loi tai danh sach thu muc');
  }
}

export function hideMoveDialog() {
  document.getElementById('move-dialog').classList.remove('show');
  moveTarget = null;
}

export async function executeMove(toFolder) {
  if (!moveTarget) return;

  const { path: fromPath, name: fileName } = moveTarget;

  try {
    const data = await apiFetch('/api/file/move', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: fromPath,
        to: toFolder
      })
    });

    hideMoveDialog();
    const treeState = saveTreeState();
    await loadFileTree();
    restoreTreeState(treeState);

    const state = getState();
    if (fromPath === state.currentFilePath) {
      const newPath = toFolder ? `${toFolder}/${fileName}` : fileName;
      navigateToFile(newPath, false);
    }
  } catch (error) {
    console.error('Move error:', error);
    alert('Loi: ' + error.message);
  }
}

// ========================================
// ADD EXTERNAL FOLDER DIALOG
// ========================================
export function createAddFolderDialog() {
  const dialog = document.createElement('div');
  dialog.className = 'confirm-overlay';
  dialog.id = 'add-folder-dialog';
  dialog.innerHTML = `
    <div class="confirm-dialog">
      <div class="confirm-header">
        <h3>Them folder ngoai</h3>
      </div>
      <div class="confirm-body">
        <input type="text" id="add-folder-input" class="input-dialog-field" placeholder="Nhap duong dan folder (vd: /Users/minh/.claude/plans)" autocomplete="off">
        <p class="add-folder-hint">Folder se duoc luu va hien thi sau khi refresh trang</p>
      </div>
      <div class="confirm-actions">
        <button class="confirm-btn confirm-btn-cancel" id="cancel-add-folder">Huy</button>
        <button class="confirm-btn confirm-btn-ok" id="confirm-add-folder">Them</button>
      </div>
    </div>
  `;
  document.body.appendChild(dialog);

  const inputField = document.getElementById('add-folder-input');

  document.getElementById('cancel-add-folder').addEventListener('click', hideAddFolderDialog);
  document.getElementById('confirm-add-folder').addEventListener('click', executeAddFolder);
  inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') executeAddFolder();
    if (e.key === 'Escape') hideAddFolderDialog();
  });
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) hideAddFolderDialog();
  });
}

export function showAddFolderDialog() {
  const inputEl = document.getElementById('add-folder-input');
  inputEl.value = '';
  document.getElementById('add-folder-dialog').classList.add('show');
  setTimeout(() => inputEl.focus(), 100);
}

export function hideAddFolderDialog() {
  document.getElementById('add-folder-dialog').classList.remove('show');
}

export async function executeAddFolder() {
  const inputEl = document.getElementById('add-folder-input');
  const folderPath = inputEl.value.trim();

  if (!folderPath) {
    alert('Vui long nhap duong dan folder');
    return;
  }

  try {
    const data = await apiFetch('/api/validate-folder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: folderPath })
    });

    if (!data.valid) {
      alert('Loi: ' + (data.error || 'Folder khong hop le'));
      return;
    }

    const filterKey = getState().folderFilter;
    if (filterKey) {
      addFilterFolder(filterKey, folderPath);
    } else {
      addFolderToWorkspace(getActiveWorkspaceId(), folderPath);
    }
    hideAddFolderDialog();
    const treeState = saveTreeState();
    await loadFileTree();
    restoreTreeState(treeState);
  } catch (error) {
    console.error('Error adding folder:', error);
    alert('Loi: ' + error.message);
  }
}

// Initialize all dialogs
export function initDialogs() {
  createConfirmDialog();
  createInputDialog();
  createMoveDialog();
  createAddFolderDialog();
}
