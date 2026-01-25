// Get file path from URL parameters
const urlParams = new URLSearchParams(window.location.search);
let currentFilePath = urlParams.get('path');
let isExternalFile = urlParams.get('external') === 'true';

if (!currentFilePath) {
  document.getElementById('loading').innerHTML = '❌ No file specified.';
}

// ========================================
// EXTERNAL FOLDERS MANAGEMENT
// ========================================
const EXTERNAL_FOLDERS_KEY = 'externalFolders';

function getExternalFolders() {
  try {
    return JSON.parse(localStorage.getItem(EXTERNAL_FOLDERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveExternalFolders(folders) {
  localStorage.setItem(EXTERNAL_FOLDERS_KEY, JSON.stringify(folders));
}

function addExternalFolder(path) {
  const folders = getExternalFolders();
  if (!folders.includes(path)) {
    folders.push(path);
    saveExternalFolders(folders);
  }
}

function removeExternalFolder(path) {
  const folders = getExternalFolders();
  const index = folders.indexOf(path);
  if (index > -1) {
    folders.splice(index, 1);
    saveExternalFolders(folders);
  }
}

// SVG Icons
const TRASH_ICON = `<svg viewBox="0 0 16 16"><path d="M6.5 1.75a.25.25 0 01.25-.25h2.5a.25.25 0 01.25.25V3h-3V1.75zm4.5 0V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675a.75.75 0 10-1.492.15l.66 6.6A1.75 1.75 0 005.405 15h5.19c.9 0 1.652-.681 1.741-1.576l.66-6.6a.75.75 0 00-1.492-.149l-.66 6.6a.25.25 0 01-.249.225h-5.19a.25.25 0 01-.249-.225l-.66-6.6z"></path></svg>`;
const DIAGRAM_ICON = `<svg viewBox="0 0 16 16"><path d="M1.5 3.25c0-.966.784-1.75 1.75-1.75h9.5c.966 0 1.75.784 1.75 1.75v9.5a1.75 1.75 0 01-1.75 1.75h-9.5a1.75 1.75 0 01-1.75-1.75v-9.5zM3.25 3a.25.25 0 00-.25.25v9.5c0 .138.112.25.25.25h9.5a.25.25 0 00.25-.25v-9.5a.25.25 0 00-.25-.25h-9.5zM5 7.75A.75.75 0 015.75 7h4.5a.75.75 0 010 1.5h-4.5A.75.75 0 015 7.75zm.75 2.25a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5zM5 4.75A.75.75 0 015.75 4h4.5a.75.75 0 010 1.5h-4.5A.75.75 0 015 4.75z"></path></svg>`;
const FILE_ICON = `<svg class="tree-icon file-icon" viewBox="0 0 16 16" width="16" height="16"><path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0113.25 16h-9.5A1.75 1.75 0 012 14.25V1.75zm1.75-.25a.25.25 0 00-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 00.25-.25V6h-2.75A1.75 1.75 0 019 4.25V1.5H3.75a.25.25 0 00-.25.25z"></path></svg>`;
const DIAGRAM_FILE_ICON = `<svg class="tree-icon file-icon diagram-icon" viewBox="0 0 16 16" width="16" height="16"><path fill="#FF6D00" d="M1.5 3.25c0-.966.784-1.75 1.75-1.75h9.5c.966 0 1.75.784 1.75 1.75v9.5a1.75 1.75 0 01-1.75 1.75h-9.5a1.75 1.75 0 01-1.75-1.75v-9.5zM3.25 3a.25.25 0 00-.25.25v9.5c0 .138.112.25.25.25h9.5a.25.25 0 00.25-.25v-9.5a.25.25 0 00-.25-.25h-9.5zM5 7.75A.75.75 0 015.75 7h4.5a.75.75 0 010 1.5h-4.5A.75.75 0 015 7.75zm.75 2.25a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5zM5 4.75A.75.75 0 015.75 4h4.5a.75.75 0 010 1.5h-4.5A.75.75 0 015 4.75z"></path></svg>`;
const MERMAID_FILE_ICON = `<svg class="tree-icon file-icon mermaid-icon" viewBox="0 0 16 16" width="16" height="16"><path fill="#FF3670" d="M8 0C3.58 0 0 3.58 0 8c0 4.42 3.58 8 8 8 4.42 0 8-3.58 8-8 0-4.42-3.58-8-8-8zm0 14.5c-3.59 0-6.5-2.91-6.5-6.5S4.41 1.5 8 1.5s6.5 2.91 6.5 6.5-2.91 6.5-6.5 6.5zM5.5 5.5l2.5 2 2.5-2v5l-2.5-2-2.5 2v-5z"></path></svg>`;

// Helper function to get file icon based on file name
function getFileIcon(fileName) {
  if (fileName.endsWith('.drawio')) {
    return DIAGRAM_FILE_ICON;
  }
  if (fileName.endsWith('.mermaid') || fileName.endsWith('.mmd')) {
    return MERMAID_FILE_ICON;
  }
  return FILE_ICON;
}
const WARNING_ICON = `<svg viewBox="0 0 16 16"><path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0114.082 15H1.918a1.75 1.75 0 01-1.543-2.575zM8 5a.75.75 0 00-.75.75v2.5a.75.75 0 001.5 0v-2.5A.75.75 0 008 5zm1 6a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>`;
const PENCIL_ICON = `<svg viewBox="0 0 16 16"><path d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61zm1.414 1.06a.25.25 0 00-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 000-.354l-1.086-1.086zM11.189 6.25L9.75 4.81l-6.286 6.287a.25.25 0 00-.064.108l-.558 1.953 1.953-.558a.249.249 0 00.108-.064l6.286-6.286z"></path></svg>`;
const MOVE_ICON = `<svg viewBox="0 0 16 16"><path d="M8.22 2.97a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.751.751 0 01-1.042-.018.751.751 0 01-.018-1.042l2.97-2.97H3.75a.75.75 0 010-1.5h7.44L8.22 4.03a.75.75 0 010-1.06z"></path></svg>`;
const PLUS_ICON = `<svg viewBox="0 0 16 16"><path d="M7.75 2a.75.75 0 01.75.75V7h4.25a.75.75 0 010 1.5H8.5v4.25a.75.75 0 01-1.5 0V8.5H2.75a.75.75 0 010-1.5H7V2.75A.75.75 0 017.75 2z"></path></svg>`;
const FOLDER_PLUS_ICON = `<svg viewBox="0 0 16 16"><path d="M1.75 1A1.75 1.75 0 000 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0016 13.25v-8.5A1.75 1.75 0 0014.25 3H7.5a.25.25 0 01-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75zm6 7.75v-2.5a.75.75 0 011.5 0v2.5h2.5a.75.75 0 010 1.5h-2.5v2.5a.75.75 0 01-1.5 0v-2.5h-2.5a.75.75 0 010-1.5h2.5z"></path></svg>`;
const CLOSE_ICON = `<svg viewBox="0 0 16 16"><path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"></path></svg>`;

// Delete state
let deleteTarget = null; // { type: 'file' | 'folder', path: string, name: string, isExternal?: boolean }

// Keyboard handler for confirm dialog
function handleConfirmDialogKeydown(e) {
  if (e.key === 'Escape') {
    e.preventDefault();
    hideConfirmDialog();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    executeDelete();
  }
}

// Create confirm dialog HTML
function createConfirmDialog() {
  const dialog = document.createElement('div');
  dialog.className = 'confirm-overlay';
  dialog.id = 'confirm-dialog';
  dialog.innerHTML = `
    <div class="confirm-dialog">
      <div class="confirm-header">
        ${WARNING_ICON}
        <h3>Xác nhận xóa</h3>
      </div>
      <div class="confirm-body">
        <p>Bạn có chắc muốn xóa <span class="item-name" id="delete-item-name"></span>?</p>
      </div>
      <div class="confirm-actions">
        <button class="confirm-btn confirm-btn-cancel" id="cancel-delete">Hủy</button>
        <button class="confirm-btn confirm-btn-delete" id="confirm-delete">Xóa</button>
      </div>
    </div>
  `;
  document.body.appendChild(dialog);

  // Event listeners
  document.getElementById('cancel-delete').addEventListener('click', hideConfirmDialog);
  document.getElementById('confirm-delete').addEventListener('click', executeDelete);
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) hideConfirmDialog();
  });
}

function showConfirmDialog(type, path, name, isExternal = false) {
  deleteTarget = { type, path, name, isExternal };
  const typeLabel = type === 'folder' ? 'thư mục' : 'file';
  document.getElementById('delete-item-name').textContent = `${typeLabel} "${name}"`;
  document.getElementById('confirm-dialog').classList.add('show');
  document.addEventListener('keydown', handleConfirmDialogKeydown);
}

function hideConfirmDialog() {
  document.getElementById('confirm-dialog').classList.remove('show');
  deleteTarget = null;
  document.removeEventListener('keydown', handleConfirmDialogKeydown);
}

async function executeDelete() {
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

    // Success - refresh file tree
    hideConfirmDialog();
    loadFileTree();

    // If deleted current file, redirect to home
    if (type === 'file' && path === currentFilePath) {
      window.location.href = '/';
    }
  } catch (error) {
    console.error('Delete error:', error);
    alert('Lỗi: ' + error.message);
    hideConfirmDialog();
  }
}

// Initialize confirm dialog
createConfirmDialog();

// ========================================
// INPUT DIALOG (for Create Folder & Rename)
// ========================================
let inputTarget = null; // { action: 'create-folder' | 'rename', path?: string, name?: string, type?: string }

function createInputDialog() {
  const dialog = document.createElement('div');
  dialog.className = 'confirm-overlay';
  dialog.id = 'input-dialog';
  dialog.innerHTML = `
    <div class="confirm-dialog">
      <div class="confirm-header">
        <h3 id="input-dialog-title">Nhập tên</h3>
      </div>
      <div class="confirm-body">
        <input type="text" id="input-dialog-input" class="input-dialog-field" placeholder="Nhập tên..." autocomplete="off">
      </div>
      <div class="confirm-actions">
        <button class="confirm-btn confirm-btn-cancel" id="cancel-input">Hủy</button>
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

function showInputDialog(action, options = {}) {
  inputTarget = { action, ...options };
  const titleEl = document.getElementById('input-dialog-title');
  const inputEl = document.getElementById('input-dialog-input');

  if (action === 'create-folder') {
    titleEl.textContent = 'Tạo thư mục mới';
    inputEl.placeholder = 'Nhập tên thư mục...';
    inputEl.value = '';
  } else if (action === 'rename') {
    const typeLabel = options.type === 'folder' ? 'thư mục' : 'file';
    titleEl.textContent = `Đổi tên ${typeLabel}`;
    inputEl.placeholder = 'Nhập tên mới...';
    inputEl.value = options.name || '';
  }

  document.getElementById('input-dialog').classList.add('show');
  setTimeout(() => inputEl.focus(), 100);
}

function hideInputDialog() {
  document.getElementById('input-dialog').classList.remove('show');
  inputTarget = null;
}

async function executeInputAction() {
  if (!inputTarget) return;

  const inputEl = document.getElementById('input-dialog-input');
  const value = inputEl.value.trim();

  if (!value) {
    alert('Vui lòng nhập tên');
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

      // If renamed current file, redirect to new path
      if (inputTarget.type === 'file' && inputTarget.path === currentFilePath) {
        const newPath = inputTarget.path.replace(/[^/]+$/, value);
        window.location.href = `index.html?path=${encodeURIComponent(newPath)}`;
        return;
      }
    }

    hideInputDialog();
    loadFileTree();
  } catch (error) {
    console.error('Action error:', error);
    alert('Lỗi: ' + error.message);
  }
}

createInputDialog();

// ========================================
// MOVE DIALOG (for moving files to folders)
// ========================================
let moveTarget = null; // { path: string, name: string }
let cachedFolders = []; // Cache folders for move dialog

function createMoveDialog() {
  const dialog = document.createElement('div');
  dialog.className = 'confirm-overlay';
  dialog.id = 'move-dialog';
  dialog.innerHTML = `
    <div class="confirm-dialog move-dialog">
      <div class="confirm-header">
        <h3>Di chuyển file</h3>
      </div>
      <div class="confirm-body">
        <p>Chọn thư mục đích cho <span class="item-name" id="move-item-name"></span>:</p>
        <div class="folder-list" id="folder-list"></div>
      </div>
      <div class="confirm-actions">
        <button class="confirm-btn confirm-btn-cancel" id="cancel-move">Hủy</button>
      </div>
    </div>
  `;
  document.body.appendChild(dialog);

  document.getElementById('cancel-move').addEventListener('click', hideMoveDialog);
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) hideMoveDialog();
  });
}

async function showMoveDialog(path, name) {
  moveTarget = { path, name };
  document.getElementById('move-item-name').textContent = `"${name}"`;

  // Get current folder of the file
  const currentFolder = path.includes('/') ? path.substring(0, path.lastIndexOf('/')) : '';

  // Fetch folders
  try {
    const response = await fetch('/api/files');
    const files = await response.json();
    cachedFolders = Object.keys(files).filter(f => f !== 'Root').sort();

    // Build folder list HTML
    let html = '';

    // Root option (only if file is not already in root)
    if (currentFolder !== '') {
      html += `<div class="folder-option" data-folder="">
        <svg class="tree-icon folder-icon" viewBox="0 0 16 16" width="16" height="16">
          <path d="M1.75 1A1.75 1.75 0 000 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0016 13.25v-8.5A1.75 1.75 0 0014.25 3H7.5a.25.25 0 01-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75z"></path>
        </svg>
        <span>Root</span>
      </div>`;
    }

    // Other folders
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
      html = '<p class="no-folders">Không có thư mục khác để di chuyển</p>';
    }

    document.getElementById('folder-list').innerHTML = html;

    // Add click handlers for folder options
    document.querySelectorAll('.folder-option').forEach(opt => {
      opt.addEventListener('click', () => executeMove(opt.dataset.folder));
    });

    document.getElementById('move-dialog').classList.add('show');
  } catch (error) {
    console.error('Error loading folders:', error);
    alert('Lỗi tải danh sách thư mục');
  }
}

function hideMoveDialog() {
  document.getElementById('move-dialog').classList.remove('show');
  moveTarget = null;
}

async function executeMove(toFolder) {
  if (!moveTarget) return;

  // Save values before hiding dialog (which clears moveTarget)
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
    loadFileTree();

    // If moved current file, redirect to new path
    if (fromPath === currentFilePath) {
      const newPath = toFolder ? `${toFolder}/${fileName}` : fileName;
      window.location.href = `index.html?path=${encodeURIComponent(newPath)}`;
    }
  } catch (error) {
    console.error('Move error:', error);
    alert('Lỗi: ' + error.message);
  }
}

createMoveDialog();

// ========================================
// ADD EXTERNAL FOLDER DIALOG
// ========================================
function createAddFolderDialog() {
  const dialog = document.createElement('div');
  dialog.className = 'confirm-overlay';
  dialog.id = 'add-folder-dialog';
  dialog.innerHTML = `
    <div class="confirm-dialog">
      <div class="confirm-header">
        <h3>Thêm folder ngoài</h3>
      </div>
      <div class="confirm-body">
        <input type="text" id="add-folder-input" class="input-dialog-field" placeholder="Nhập đường dẫn folder (vd: /Users/minh/.claude/plans)" autocomplete="off">
        <p class="add-folder-hint">Folder sẽ được lưu và hiển thị sau khi refresh trang</p>
      </div>
      <div class="confirm-actions">
        <button class="confirm-btn confirm-btn-cancel" id="cancel-add-folder">Hủy</button>
        <button class="confirm-btn confirm-btn-ok" id="confirm-add-folder">Thêm</button>
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

function showAddFolderDialog() {
  const inputEl = document.getElementById('add-folder-input');
  inputEl.value = '';
  document.getElementById('add-folder-dialog').classList.add('show');
  setTimeout(() => inputEl.focus(), 100);
}

function hideAddFolderDialog() {
  document.getElementById('add-folder-dialog').classList.remove('show');
}

async function executeAddFolder() {
  const inputEl = document.getElementById('add-folder-input');
  const folderPath = inputEl.value.trim();

  if (!folderPath) {
    alert('Vui lòng nhập đường dẫn folder');
    return;
  }

  try {
    // Validate folder path with server
    const response = await fetch('/api/validate-folder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: folderPath })
    });

    const data = await response.json();

    if (!data.valid) {
      alert('Lỗi: ' + (data.error || 'Folder không hợp lệ'));
      return;
    }

    // Add to localStorage
    addExternalFolder(folderPath);
    hideAddFolderDialog();
    loadFileTree();
  } catch (error) {
    console.error('Error adding folder:', error);
    alert('Lỗi: ' + error.message);
  }
}

createAddFolderDialog();

// Load file tree
async function loadFileTree() {
  try {
    const response = await fetch('/api/files');
    const files = await response.json();

    // Load external folders
    const externalFolders = getExternalFolders();
    let externalFiles = {};

    if (externalFolders.length > 0) {
      try {
        const extResponse = await fetch('/api/external-files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paths: externalFolders })
        });
        externalFiles = await extResponse.json();
      } catch (e) {
        console.error('Error loading external files:', e);
      }
    }

    const fileTreeNav = document.getElementById('file-tree');
    const loadingTree = fileTreeNav.querySelector('.loading-tree');

    if (loadingTree) {
      loadingTree.remove();
    }

    let html = '';

    // Render external folders FIRST
    const sortedExternalFolders = Object.keys(externalFiles).sort();
    for (const folderPath of sortedExternalFolders) {
      const folderFiles = externalFiles[folderPath];
      const folderName = folderPath.split('/').pop() || folderPath;
      const folderId = `ext-folder-${folderPath.replace(/[^a-z0-9]/gi, '-')}`;
      const isExpanded = folderFiles.some(f => f.path === currentFilePath && isExternalFile);

      html += `
        <div class="tree-folder external-folder ${isExpanded ? 'expanded' : ''}">
          <div class="tree-folder-header external-folder-header" data-folder="${folderId}" data-folder-path="${folderPath}">
            <svg class="tree-icon folder-icon" viewBox="0 0 16 16" width="16" height="16">
              <path d="M1.75 1A1.75 1.75 0 000 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0016 13.25v-8.5A1.75 1.75 0 0014.25 3H7.5a.25.25 0 01-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75z"></path>
            </svg>
            <svg class="tree-icon chevron-icon" viewBox="0 0 16 16" width="16" height="16">
              <path d="M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0z"></path>
            </svg>
            <span class="tree-folder-name" title="${folderPath}">${folderName}</span>
            <button class="action-btn remove-external-btn" data-external-path="${folderPath}" title="Xóa khỏi danh sách">${CLOSE_ICON}</button>
          </div>
          <div class="tree-folder-content" id="${folderId}">
      `;

      // Sort files alphabetically
      folderFiles.sort((a, b) => a.name.localeCompare(b.name));

      for (const file of folderFiles) {
        const isActive = file.path === currentFilePath && isExternalFile;
        html += `
          <div class="tree-file ${isActive ? 'active' : ''}" data-path="${file.path}" data-external="true">
            <a href="index.html?path=${encodeURIComponent(file.path)}&external=true" class="tree-file-link">
              ${getFileIcon(file.name)}
              <span class="tree-file-name">${file.name}</span>
            </a>
            <button class="action-btn delete-btn external-delete-btn" data-delete-type="file" data-delete-path="${file.path}" data-delete-name="${file.name}" data-delete-external="true" title="Xóa file">${TRASH_ICON}</button>
          </div>
        `;
      }

      html += `
          </div>
        </div>
      `;
    }

    // Sort project folders alphabetically
    const sortedFolders = Object.keys(files).sort();

    for (const folder of sortedFolders) {
      const folderFiles = files[folder];
      const folderId = `folder-${folder.replace(/[^a-z0-9]/gi, '-')}`;
      const isExpanded = folderFiles.some(f => f.path === currentFilePath);

      html += `
        <div class="tree-folder ${isExpanded ? 'expanded' : ''}">
          <div class="tree-folder-header" data-folder="${folderId}" data-folder-path="${folder === 'Root' ? '' : folder}">
            <svg class="tree-icon folder-icon" viewBox="0 0 16 16" width="16" height="16">
              <path d="M1.75 1A1.75 1.75 0 000 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0016 13.25v-8.5A1.75 1.75 0 0014.25 3H7.5a.25.25 0 01-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75z"></path>
            </svg>
            <svg class="tree-icon chevron-icon" viewBox="0 0 16 16" width="16" height="16">
              <path d="M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0z"></path>
            </svg>
            <span class="tree-folder-name">${folder}</span>
            ${folder !== 'Root' ? `
              <button class="action-btn rename-btn" data-rename-type="folder" data-rename-path="${folder}" data-rename-name="${folder}" title="Đổi tên">${PENCIL_ICON}</button>
              <button class="action-btn delete-btn" data-delete-type="folder" data-delete-path="${folder}" data-delete-name="${folder}" title="Xóa thư mục">${TRASH_ICON}</button>
            ` : ''}
          </div>
          <div class="tree-folder-content" id="${folderId}">
      `;

      // Sort files alphabetically
      folderFiles.sort((a, b) => a.name.localeCompare(b.name));

      for (const file of folderFiles) {
        const isActive = file.path === currentFilePath && !isExternalFile;
        html += `
          <div class="tree-file ${isActive ? 'active' : ''}" data-path="${file.path}">
            <a href="index.html?path=${encodeURIComponent(file.path)}" class="tree-file-link">
              ${getFileIcon(file.name)}
              <span class="tree-file-name">${file.name}</span>
            </a>
            <button class="action-btn rename-btn" data-rename-type="file" data-rename-path="${file.path}" data-rename-name="${file.name}" title="Đổi tên">${PENCIL_ICON}</button>
            <button class="action-btn move-btn" data-move-path="${file.path}" data-move-name="${file.name}" title="Di chuyển">${MOVE_ICON}</button>
            <button class="action-btn delete-btn" data-delete-type="file" data-delete-path="${file.path}" data-delete-name="${file.name}" title="Xóa file">${TRASH_ICON}</button>
          </div>
        `;
      }

      html += `
          </div>
        </div>
      `;
    }

    fileTreeNav.innerHTML = html;

    // Add folder toggle functionality
    const folderHeaders = fileTreeNav.querySelectorAll('.tree-folder-header');
    folderHeaders.forEach(header => {
      header.addEventListener('click', (e) => {
        // Don't toggle if clicking action buttons
        if (e.target.closest('.action-btn')) return;
        const folder = header.parentElement;
        folder.classList.toggle('expanded');
      });
    });

    // Add delete button handlers
    const deleteButtons = fileTreeNav.querySelectorAll('.delete-btn');
    deleteButtons.forEach(btn => {
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

    // Add rename button handlers
    const renameButtons = fileTreeNav.querySelectorAll('.rename-btn');
    renameButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const type = btn.dataset.renameType;
        const path = btn.dataset.renamePath;
        const name = btn.dataset.renameName;
        showInputDialog('rename', { type, path, name });
      });
    });

    // Add move button handlers
    const moveButtons = fileTreeNav.querySelectorAll('.move-btn');
    moveButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const path = btn.dataset.movePath;
        const name = btn.dataset.moveName;
        showMoveDialog(path, name);
      });
    });

    // Add remove external folder button handlers
    const removeExtButtons = fileTreeNav.querySelectorAll('.remove-external-btn');
    removeExtButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const path = btn.dataset.externalPath;
        removeExternalFolder(path);
        loadFileTree();
      });
    });

  } catch (error) {
    console.error('Error loading file tree:', error);
  }
}

// Generate outline from headings
function generateOutline(htmlContent) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;

  const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const outline = [];

  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.substring(1));
    const text = heading.textContent;
    const id = `heading-${index}`;

    // Add ID to heading for navigation
    heading.id = id;

    outline.push({
      level: level,
      text: text,
      id: id
    });
  });

  return { outline, html: tempDiv.innerHTML };
}

// Render outline in sidebar
function renderOutline(outline) {
  const outlineNav = document.getElementById('outline');

  if (outline.length === 0) {
    outlineNav.innerHTML = '<p class="no-outline">No headings found</p>';
    return;
  }

  let html = '<ul class="outline-list">';

  outline.forEach(item => {
    html += `
      <li class="outline-item outline-level-${item.level}">
        <a href="#${item.id}" class="outline-link">${item.text}</a>
      </li>
    `;
  });

  html += '</ul>';
  outlineNav.innerHTML = html;

  // Add click handlers for smooth scrolling
  const links = outlineNav.querySelectorAll('.outline-link');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Update active state
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  });
}

// Load and display markdown file
async function loadMarkdown() {
  try {
    const externalParam = isExternalFile ? '&external=true' : '';
    const response = await fetch(`/api/file?path=${encodeURIComponent(currentFilePath)}${externalParam}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to load file');
    }

    // Update title
    const fileName = currentFilePath.split('/').pop();
    document.getElementById('file-title').textContent = fileName;
    document.title = fileName;

    // Generate outline and update HTML with IDs
    const { outline, html } = generateOutline(data.html);

    // Display markdown content
    const contentDiv = document.getElementById('markdown-content');
    const loadingDiv = document.getElementById('loading');

    loadingDiv.style.display = 'none';
    contentDiv.innerHTML = html;

    // Render outline
    renderOutline(outline);

    // Highlight active section on scroll
    setupScrollSpy(outline);

  } catch (error) {
    console.error('Error loading markdown:', error);
    document.getElementById('loading').innerHTML = `❌ Error: ${error.message}`;
  }
}

// Load and display drawio file
async function loadDrawio() {
  try {
    const externalParam = isExternalFile ? '&external=true' : '';
    const response = await fetch(`/api/drawio?path=${encodeURIComponent(currentFilePath)}${externalParam}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to load drawio file');
    }

    // Update title
    const fileName = currentFilePath.split('/').pop();
    document.getElementById('file-title').textContent = fileName;
    document.title = fileName;

    // Display drawio content
    const contentDiv = document.getElementById('markdown-content');
    const loadingDiv = document.getElementById('loading');

    loadingDiv.style.display = 'none';

    // Create container for drawio diagram
    const diagramContainer = document.createElement('div');
    diagramContainer.className = 'mxgraph';
    diagramContainer.style.maxWidth = '100%';
    diagramContainer.style.border = '1px solid var(--border-primary)';
    diagramContainer.style.borderRadius = '8px';
    diagramContainer.style.overflow = 'hidden';
    diagramContainer.style.background = '#fff';

    // Set diagram data - the XML content needs to be properly encoded
    diagramContainer.setAttribute('data-mxgraph', JSON.stringify({
      highlight: '#0000ff',
      nav: true,
      resize: true,
      toolbar: 'zoom layers lightbox',
      xml: data.content
    }));

    contentDiv.innerHTML = '';
    contentDiv.appendChild(diagramContainer);

    // Render outline (empty for drawio)
    renderOutline([]);

    // Trigger draw.io viewer to process the diagram
    if (window.GraphViewer) {
      GraphViewer.createViewerForElement(diagramContainer);
    } else {
      // Wait for viewer script to load
      const checkViewer = setInterval(() => {
        if (window.GraphViewer) {
          clearInterval(checkViewer);
          GraphViewer.createViewerForElement(diagramContainer);
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => clearInterval(checkViewer), 10000);
    }

  } catch (error) {
    console.error('Error loading drawio:', error);
    document.getElementById('loading').innerHTML = `❌ Error: ${error.message}`;
  }
}

// Load and display mermaid file
async function loadMermaid() {
  try {
    const externalParam = isExternalFile ? '&external=true' : '';
    const response = await fetch(`/api/mermaid?path=${encodeURIComponent(currentFilePath)}${externalParam}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to load mermaid file');
    }

    // Update title
    const fileName = currentFilePath.split('/').pop();
    document.getElementById('file-title').textContent = fileName;
    document.title = fileName;

    // Display mermaid content
    const contentDiv = document.getElementById('markdown-content');
    const loadingDiv = document.getElementById('loading');

    loadingDiv.style.display = 'none';

    // Create container for mermaid diagram
    const diagramContainer = document.createElement('div');
    diagramContainer.className = 'mermaid-container';
    diagramContainer.style.maxWidth = '100%';
    diagramContainer.style.padding = '20px';
    diagramContainer.style.background = '#fff';
    diagramContainer.style.borderRadius = '8px';
    diagramContainer.style.border = '1px solid var(--border-primary)';
    diagramContainer.style.overflow = 'auto';

    // Create mermaid div
    const mermaidDiv = document.createElement('div');
    mermaidDiv.className = 'mermaid';
    mermaidDiv.textContent = data.content;
    diagramContainer.appendChild(mermaidDiv);

    contentDiv.innerHTML = '';
    contentDiv.appendChild(diagramContainer);

    // Render outline (empty for mermaid)
    renderOutline([]);

    // Render the mermaid diagram
    if (window.mermaid) {
      try {
        await mermaid.run({ nodes: [mermaidDiv] });
      } catch (mermaidError) {
        console.error('Mermaid render error:', mermaidError);
        // Show raw content if mermaid fails to render
        mermaidDiv.innerHTML = `<pre style="color: red;">Mermaid syntax error:\n${mermaidError.message}</pre><pre>${data.content}</pre>`;
      }
    }

  } catch (error) {
    console.error('Error loading mermaid:', error);
    document.getElementById('loading').innerHTML = `❌ Error: ${error.message}`;
  }
}

// Detect file type and load appropriate content
function loadContent() {
  if (!currentFilePath) return;

  if (currentFilePath.endsWith('.drawio')) {
    loadDrawio();
  } else if (currentFilePath.endsWith('.mermaid') || currentFilePath.endsWith('.mmd')) {
    loadMermaid();
  } else {
    loadMarkdown();
  }
}

// Setup scroll spy to highlight current section in outline
function setupScrollSpy(outline) {
  const links = document.querySelectorAll('.outline-link');
  const content = document.querySelector('.viewer-content');

  content.addEventListener('scroll', () => {
    let current = '';

    outline.forEach(item => {
      const section = document.getElementById(item.id);
      if (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100) {
          current = item.id;
        }
      }
    });

    links.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

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

// Keyboard navigation for outline (J/K keys)
function setupKeyboardNavigation() {
  document.addEventListener('keydown', (e) => {
    // Ignore if user is typing in an input field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
      return;
    }

    const links = document.querySelectorAll('.outline-link');
    if (links.length === 0) return;

    // Find current active link index
    let currentIndex = -1;
    links.forEach((link, index) => {
      if (link.classList.contains('active')) {
        currentIndex = index;
      }
    });

    let newIndex = -1;

    if (e.key === 'j' || e.key === 'J') {
      // Next item
      e.preventDefault();
      if (currentIndex === -1) {
        newIndex = 0;
      } else {
        newIndex = Math.min(currentIndex + 1, links.length - 1);
      }
    } else if (e.key === 'k' || e.key === 'K') {
      // Previous item
      e.preventDefault();
      if (currentIndex === -1) {
        newIndex = 0;
      } else {
        newIndex = Math.max(currentIndex - 1, 0);
      }
    }

    if (newIndex !== -1 && newIndex !== currentIndex) {
      // Update active state
      links.forEach(l => l.classList.remove('active'));
      links[newIndex].classList.add('active');

      // Scroll to the heading
      const targetId = links[newIndex].getAttribute('href').substring(1);
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // Ensure the outline link is visible in sidebar
      links[newIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
}

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
  window.location.href = 'index.html?path=last_talk.md';
});

// Quick button: Latest Plan
document.getElementById('quick-latest-plan-btn').addEventListener('click', async () => {
  try {
    const response = await fetch('/api/latest-plan');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get latest plan');
    }

    window.location.href = `index.html?path=${encodeURIComponent(data.path)}&external=true`;
  } catch (error) {
    console.error('Error getting latest plan:', error);
    alert('Lỗi: ' + error.message);
  }
});

// Load content and setup keyboard navigation
loadContent();
setupKeyboardNavigation();

// Note: loadFileTree() will be called conditionally after search state is checked
// See end of file for restoreSearchState() logic

// ========================================
// EXPORT TO STATIC HTML
// ========================================

async function exportToStaticHTML() {
  try {
    // 1. Get document title
    const title = document.getElementById('file-title').textContent || 'Exported Document';

    // 2. Get markdown content (already has heading IDs)
    const markdownContent = document.getElementById('markdown-content').innerHTML;

    // 3. Get outline HTML
    const outlineContent = document.getElementById('outline').innerHTML;

    // 4. Fetch CSS
    const cssResponse = await fetch('/styles.css');
    const cssContent = await cssResponse.text();

    // 5. Build static HTML
    const staticHTML = buildStaticHTML(title, markdownContent, outlineContent, cssContent);

    // 6. Create download
    const blob = new Blob([staticHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    // 7. Trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9\u00C0-\u024F]/gi, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // 8. Cleanup
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Export error:', error);
    alert('Failed to export: ' + error.message);
  }
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function buildStaticHTML(title, markdownContent, outlineContent, cssContent) {
  // Layout override CSS for 2-column (no file tree)
  const layoutOverride = `
    /* Override for 2-column layout (no file tree) */
    .file-tree-sidebar,
    .toggle-file-tree,
    .close-sidebar {
      display: none !important;
    }

    .viewer-layout {
      grid-template-columns: 1fr var(--sidebar-width) !important;
    }

    .viewer-header {
      display: flex !important;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      border-bottom: 1px solid var(--border-primary);
      background: var(--bg-primary);
    }

    .header-left, .header-right {
      display: none;
    }

    .header-center {
      flex: 1;
    }

    .file-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    @media (max-width: 1024px) {
      .viewer-layout {
        grid-template-columns: 1fr !important;
      }

      .outline-sidebar {
        position: fixed !important;
        top: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 280px !important;
        transform: translateX(100%) !important;
        transition: transform 0.2s ease !important;
        z-index: 200 !important;
      }

      .outline-sidebar.open {
        transform: translateX(0) !important;
      }

      .toggle-outline {
        display: flex !important;
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        background: var(--accent-primary);
        color: white;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        z-index: 100;
      }

      .outline-header .close-sidebar {
        display: flex !important;
      }
    }

    @media (min-width: 1025px) {
      .toggle-outline,
      .outline-header .close-sidebar {
        display: none !important;
      }
    }
  `;

  // Minimal JS for scroll spy
  const scrollSpyJS = `
    document.addEventListener('DOMContentLoaded', function() {
      const links = document.querySelectorAll('.outline-link');
      const content = document.querySelector('.viewer-content');

      // Smooth scroll on click
      links.forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          const targetId = this.getAttribute('href').substring(1);
          const target = document.getElementById(targetId);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            links.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
          }
        });
      });

      // Scroll spy
      if (content) {
        content.addEventListener('scroll', function() {
          let current = '';
          const headings = document.querySelectorAll('[id^="heading-"]');

          headings.forEach(heading => {
            const rect = heading.getBoundingClientRect();
            if (rect.top <= 100) {
              current = heading.id;
            }
          });

          links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
              link.classList.add('active');
            }
          });
        });
      }

      // Mobile toggle
      const toggleBtn = document.getElementById('toggle-outline');
      const outlineSidebar = document.querySelector('.outline-sidebar');
      const closeBtn = document.getElementById('close-outline');

      if (toggleBtn && outlineSidebar) {
        toggleBtn.addEventListener('click', function() {
          outlineSidebar.classList.add('open');
        });
      }

      if (closeBtn && outlineSidebar) {
        closeBtn.addEventListener('click', function() {
          outlineSidebar.classList.remove('open');
        });
      }

      // Close outline when clicking a link on mobile
      links.forEach(link => {
        link.addEventListener('click', function() {
          if (window.innerWidth <= 1024 && outlineSidebar) {
            outlineSidebar.classList.remove('open');
          }
        });
      });
    });
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(title)}</title>
  <style>
${cssContent}

${layoutOverride}
  </style>
</head>
<body>
  <div class="viewer-container">
    <header class="viewer-header">
      <div class="header-left"></div>
      <div class="header-center">
        <h1 class="file-title">${escapeHTML(title)}</h1>
      </div>
      <div class="header-right"></div>
    </header>

    <div class="viewer-layout">
      <!-- Main Content -->
      <main class="viewer-content">
        <div class="markdown-body">
${markdownContent}
        </div>
      </main>

      <!-- Right Sidebar: Outline -->
      <aside class="outline-sidebar">
        <div class="outline-header">
          <h3>Outline</h3>
          <button id="close-outline" class="close-sidebar">\u2715</button>
        </div>
        <nav id="outline" class="outline">
${outlineContent}
        </nav>
      </aside>
    </div>

    <!-- Mobile Toggle Button -->
    <button id="toggle-outline" class="toggle-outline">
      <span>\u2630</span> Outline
    </button>
  </div>

  <script>
${scrollSpyJS}
  </script>
</body>
</html>`;
}

// Export button handler
document.getElementById('export-html-btn').addEventListener('click', exportToStaticHTML);

// ========================================
// SEARCH FUNCTIONALITY
// ========================================

const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search-btn');
const searchPanel = document.getElementById('search-panel');
const toggleSearchBtn = document.getElementById('toggle-search-btn');
let isSearchMode = false;
let lastSearchData = null; // Store last search results
let lastSearchQuery = null;
let lastSearchScope = null;

// Get current folder from file path
function getCurrentFolder() {
  if (!currentFilePath) return null;

  if (isExternalFile) {
    // For external files, get the directory part
    const lastSlash = currentFilePath.lastIndexOf('/');
    return lastSlash > 0 ? currentFilePath.substring(0, lastSlash) : currentFilePath;
  } else {
    // For project files, get the folder from path
    const lastSlash = currentFilePath.lastIndexOf('/');
    return lastSlash > 0 ? currentFilePath.substring(0, lastSlash) : '';
  }
}

// Get selected search scope
function getSearchScope() {
  const selected = document.querySelector('input[name="search-scope"]:checked');
  return selected ? selected.value : 'folder';
}

// Perform search
async function performSearch(query) {
  if (!query.trim()) {
    clearSearch();
    return;
  }

  const scope = getSearchScope();
  const folder = getCurrentFolder();

  // For folder scope, we need a valid folder
  if (scope === 'folder' && folder === null && !currentFilePath) {
    alert('Vui lòng mở một file trước khi tìm kiếm');
    return;
  }

  try {
    let url;

    if (scope === 'all') {
      // Search in all folders (project + external)
      const externalFolders = getExternalFolders();
      url = `/api/search?query=${encodeURIComponent(query)}&scope=all&externalFolders=${encodeURIComponent(JSON.stringify(externalFolders))}`;
    } else {
      // Search in current folder only
      const externalParam = isExternalFile ? '&external=true' : '';
      const folderParam = folder !== null ? folder : '';
      url = `/api/search?query=${encodeURIComponent(query)}&folder=${encodeURIComponent(folderParam)}${externalParam}&scope=folder`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Search failed');
    }

    // Store search state
    lastSearchData = data;
    lastSearchQuery = query;
    lastSearchScope = scope;

    // Save to sessionStorage for persistence across navigation
    sessionStorage.setItem('searchState', JSON.stringify({
      query: query,
      scope: scope,
      data: data
    }));

    renderSearchResults(data, query, scope);
    isSearchMode = true;
    clearSearchBtn.classList.add('visible');

  } catch (error) {
    console.error('Search error:', error);
    alert('Lỗi tìm kiếm: ' + error.message);
  }
}

// Render search results
function renderSearchResults(data, query, scope = 'folder') {
  const fileTreeNav = document.getElementById('file-tree');
  const folder = getCurrentFolder();
  const folderDisplay = isExternalFile ? folder.split('/').pop() : (folder || 'Root');
  const scopeLabel = scope === 'all' ? 'tất cả' : folderDisplay;

  if (data.results.length === 0) {
    fileTreeNav.innerHTML = `
      <div class="search-results">
        <div class="search-results-header">
          Tìm "${query}" trong ${scopeLabel}
        </div>
        <div class="search-no-results">Không tìm thấy kết quả</div>
      </div>
    `;
    return;
  }

  let html = `
    <div class="search-results">
      <div class="search-results-header">
        Tìm thấy ${data.totalMatches} kết quả trong ${data.totalFiles} file (${scopeLabel})
      </div>
  `;

  for (const result of data.results) {
    const file = result.file;
    const fileIcon = getFileIcon(file.name);
    const externalParam = file.isExternal ? '&external=true' : '';

    // For scope=all, show folder info
    let folderInfo = '';
    if (scope === 'all') {
      if (file.isExternal) {
        // Show last part of external path
        const parts = file.path.split('/');
        parts.pop(); // Remove filename
        const folderName = parts.pop() || 'External';
        folderInfo = `<span class="search-result-folder">${folderName}/</span>`;
      } else {
        // Show project folder
        const fileParts = file.path.split('/');
        if (fileParts.length > 1) {
          fileParts.pop(); // Remove filename
          folderInfo = `<span class="search-result-folder">${fileParts.join('/')}/</span>`;
        } else {
          folderInfo = `<span class="search-result-folder">Root/</span>`;
        }
      }
    }

    html += `
      <div class="search-result-item">
        <div class="search-result-file" data-path="${file.path}" data-external="${file.isExternal}">
          ${fileIcon}
          <span>${folderInfo}${file.name}</span>
        </div>
        <div class="search-result-matches">
    `;

    for (const match of result.matches) {
      // Highlight the search term in the content
      const highlightedContent = highlightMatch(match.content, query);
      html += `
        <a href="index.html?path=${encodeURIComponent(file.path)}${externalParam}" class="search-match-line" data-path="${file.path}" data-external="${file.isExternal}">
          <span class="line-number">${match.line}:</span>${highlightedContent}
        </a>
      `;
    }

    html += `
        </div>
      </div>
    `;
  }

  html += '</div>';
  fileTreeNav.innerHTML = html;

  // Add click handlers for file headers
  const fileHeaders = fileTreeNav.querySelectorAll('.search-result-file');
  fileHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const path = header.dataset.path;
      const isExternal = header.dataset.external === 'true';
      const externalParam = isExternal ? '&external=true' : '';
      window.location.href = `index.html?path=${encodeURIComponent(path)}${externalParam}`;
    });
  });
}

// Highlight search term in text
function highlightMatch(text, query) {
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
  return text.replace(regex, '<span class="search-match-highlight">$1</span>');
}

// Escape special regex characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Clear search and restore file tree
function clearSearch() {
  searchInput.value = '';
  clearSearchBtn.classList.remove('visible');
  isSearchMode = false;
  lastSearchData = null;
  lastSearchQuery = null;
  lastSearchScope = null;
  sessionStorage.removeItem('searchState');
  loadFileTree();
}

// Toggle search panel visibility
function toggleSearchPanel() {
  const isVisible = searchPanel.style.display !== 'none';
  searchPanel.style.display = isVisible ? 'none' : 'block';
  if (!isVisible) {
    searchInput.focus();
  }
}

// Search input event handlers
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    performSearch(searchInput.value);
  } else if (e.key === 'Escape') {
    e.preventDefault();
    if (isSearchMode) {
      clearSearch();
    } else {
      searchInput.blur();
    }
  }
});

searchInput.addEventListener('input', () => {
  if (searchInput.value) {
    clearSearchBtn.classList.add('visible');
  } else {
    clearSearchBtn.classList.remove('visible');
    if (isSearchMode) {
      clearSearch();
    }
  }
});

clearSearchBtn.addEventListener('click', () => {
  clearSearch();
  searchInput.focus();
});

// Toggle search panel
toggleSearchBtn.addEventListener('click', () => {
  toggleSearchPanel();
});

// Hotkeys
document.addEventListener('keydown', (e) => {
  // Ignore if typing in input/textarea
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
    return;
  }

  if (e.key === 'f' || e.key === 'F') {
    // F => open search form, focus input
    e.preventDefault();
    searchPanel.style.display = 'block';
    searchInput.focus();
  } else if (e.key === 'l' || e.key === 'L') {
    // L => open last_talk.md
    e.preventDefault();
    window.location.href = 'index.html?path=last_talk.md';
  }
});

// ========================================
// RESTORE SEARCH STATE ON PAGE LOAD
// ========================================

function restoreSearchState() {
  const savedState = sessionStorage.getItem('searchState');

  if (savedState) {
    try {
      const state = JSON.parse(savedState);
      lastSearchData = state.data;
      lastSearchQuery = state.query;
      lastSearchScope = state.scope;
      isSearchMode = true;

      // Update search input
      searchInput.value = state.query;
      clearSearchBtn.classList.add('visible');

      // Update scope radio
      const scopeRadio = document.querySelector(`input[name="search-scope"][value="${state.scope}"]`);
      if (scopeRadio) {
        scopeRadio.checked = true;
      }

      // Render results
      renderSearchResults(state.data, state.query, state.scope);

      return true;
    } catch (e) {
      console.error('Error restoring search state:', e);
      sessionStorage.removeItem('searchState');
    }
  }
  return false;
}

// Try to restore search state, or load file tree if no search was active
const hasRestoredSearch = restoreSearchState();
if (!hasRestoredSearch) {
  loadFileTree();
}
