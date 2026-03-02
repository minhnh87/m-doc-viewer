// Dialog modules: Confirm, Input, Move, AddFolder dialogs

import { WARNING_ICON, CLOSE_ICON } from './icons.js';
import { addExternalFolder } from './storage.js';
import { getState } from './state.js';

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
    const response = await fetch(`${endpoint}?path=${encodeURIComponent(path)}${externalParam}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete');
    }

    hideConfirmDialog();

    // Dynamically import to avoid circular dependency
    const { loadFileTree } = await import('./file-tree.js');
    loadFileTree();

    const state = getState();
    if (type === 'file' && path === state.currentFilePath) {
      window.location.href = '/';
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
      const response = await fetch('/api/folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: value })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
    } else if (inputTarget.action === 'rename') {
      const response = await fetch('/api/rename', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldPath: inputTarget.path,
          newName: value,
          type: inputTarget.type
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      const state = getState();
      if (inputTarget.type === 'file' && inputTarget.path === state.currentFilePath) {
        const newPath = inputTarget.path.replace(/[^/]+$/, value);
        window.location.href = `index.html?path=${encodeURIComponent(newPath)}`;
        return;
      }
    }

    hideInputDialog();
    const { loadFileTree } = await import('./file-tree.js');
    loadFileTree();
  } catch (error) {
    console.error('Action error:', error);
    alert('Loi: ' + error.message);
  }
}

// ========================================
// MOVE DIALOG
// ========================================
let moveTarget = null;

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
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) hideMoveDialog();
  });
}

export async function showMoveDialog(path, name) {
  moveTarget = { path, name };
  document.getElementById('move-item-name').textContent = `"${name}"`;

  const currentFolder = path.includes('/') ? path.substring(0, path.lastIndexOf('/')) : '';

  try {
    const response = await fetch('/api/files');
    const files = await response.json();
    const cachedFolders = Object.keys(files).filter(f => f !== 'Root').sort();

    let html = '';

    if (currentFolder !== '') {
      html += `<div class="folder-option" data-folder="">
        <svg class="tree-icon folder-icon" viewBox="0 0 16 16" width="16" height="16">
          <path d="M1.75 1A1.75 1.75 0 000 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0016 13.25v-8.5A1.75 1.75 0 0014.25 3H7.5a.25.25 0 01-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75z"></path>
        </svg>
        <span>Root</span>
      </div>`;
    }

    for (const folder of cachedFolders) {
      if (folder !== currentFolder) {
        html += `<div class="folder-option" data-folder="${folder}">
          <svg class="tree-icon folder-icon" viewBox="0 0 16 16" width="16" height="16">
            <path d="M1.75 1A1.75 1.75 0 000 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0016 13.25v-8.5A1.75 1.75 0 0014.25 3H7.5a.25.25 0 01-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75z"></path>
          </svg>
          <span>${folder}</span>
        </div>`;
      }
    }

    if (!html) {
      html = '<p class="no-folders">Khong co thu muc khac de di chuyen</p>';
    }

    document.getElementById('folder-list').innerHTML = html;

    document.querySelectorAll('.folder-option').forEach(opt => {
      opt.addEventListener('click', () => executeMove(opt.dataset.folder));
    });

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
    const response = await fetch('/api/file/move', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: fromPath,
        to: toFolder
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    hideMoveDialog();
    const { loadFileTree } = await import('./file-tree.js');
    loadFileTree();

    const state = getState();
    if (fromPath === state.currentFilePath) {
      const newPath = toFolder ? `${toFolder}/${fileName}` : fileName;
      window.location.href = `index.html?path=${encodeURIComponent(newPath)}`;
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
    const response = await fetch('/api/validate-folder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: folderPath })
    });

    const data = await response.json();

    if (!data.valid) {
      alert('Loi: ' + (data.error || 'Folder khong hop le'));
      return;
    }

    addExternalFolder(folderPath);
    hideAddFolderDialog();
    const { loadFileTree } = await import('./file-tree.js');
    loadFileTree();
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
