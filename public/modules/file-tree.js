// File tree loading and rendering

import { getFileIcon, TRASH_ICON, PENCIL_ICON, MOVE_ICON, CLOSE_ICON } from './icons.js';
import { getExternalFolders, removeExternalFolder } from './storage.js';
import { showConfirmDialog, showInputDialog, showMoveDialog } from './dialogs.js';
import { getState } from './state.js';

export { getFileIcon };

export async function loadFileTree() {
  const state = getState();
  const currentFilePath = state.currentFilePath;
  const isExternalFile = state.isExternalFile;

  try {
    const response = await fetch('/api/files');
    const files = await response.json();

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
      const groupedFiles = externalFiles[folderPath];
      const folderName = folderPath.split('/').pop() || folderPath;
      const folderId = `ext-folder-${folderPath.replace(/[^a-z0-9]/gi, '-')}`;

      const allFiles = Object.values(groupedFiles).flat();
      const isExpanded = allFiles.some(f => f.path === currentFilePath && isExternalFile);

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
            <button class="action-btn remove-external-btn" data-external-path="${folderPath}" title="Xoa khoi danh sach">${CLOSE_ICON}</button>
          </div>
          <div class="tree-folder-content" id="${folderId}">
      `;

      const sortedSubfolders = Object.keys(groupedFiles).sort((a, b) => {
        if (a === '.') return -1;
        if (b === '.') return 1;
        return a.localeCompare(b);
      });

      for (const subfolder of sortedSubfolders) {
        const subfolderFiles = groupedFiles[subfolder];

        if (subfolder === '.') {
          subfolderFiles.sort((a, b) => a.name.localeCompare(b.name));
          for (const file of subfolderFiles) {
            const isActive = file.path === currentFilePath && isExternalFile;
            html += `
              <div class="tree-file ${isActive ? 'active' : ''}" data-path="${file.path}" data-external="true">
                <a href="index.html?path=${encodeURIComponent(file.path)}&external=true" class="tree-file-link">
                  ${getFileIcon(file.name)}
                  <span class="tree-file-name">${file.name}</span>
                </a>
                <button class="action-btn delete-btn external-delete-btn" data-delete-type="file" data-delete-path="${file.path}" data-delete-name="${file.name}" data-delete-external="true" title="Xoa file">${TRASH_ICON}</button>
              </div>
            `;
          }
        } else {
          const subFolderId = `ext-subfolder-${folderPath.replace(/[^a-z0-9]/gi, '-')}-${subfolder.replace(/[^a-z0-9]/gi, '-')}`;
          const isSubfolderExpanded = subfolderFiles.some(f => f.path === currentFilePath && isExternalFile);

          html += `
            <div class="tree-folder external-subfolder ${isSubfolderExpanded ? 'expanded' : ''}">
              <div class="tree-folder-header" data-folder="${subFolderId}">
                <svg class="tree-icon folder-icon" viewBox="0 0 16 16" width="16" height="16">
                  <path d="M1.75 1A1.75 1.75 0 000 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0016 13.25v-8.5A1.75 1.75 0 0014.25 3H7.5a.25.25 0 01-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75z"></path>
                </svg>
                <svg class="tree-icon chevron-icon" viewBox="0 0 16 16" width="16" height="16">
                  <path d="M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0z"></path>
                </svg>
                <span class="tree-folder-name">${subfolder}</span>
              </div>
              <div class="tree-folder-content" id="${subFolderId}">
          `;

          subfolderFiles.sort((a, b) => a.name.localeCompare(b.name));
          for (const file of subfolderFiles) {
            const isActive = file.path === currentFilePath && isExternalFile;
            html += `
              <div class="tree-file ${isActive ? 'active' : ''}" data-path="${file.path}" data-external="true">
                <a href="index.html?path=${encodeURIComponent(file.path)}&external=true" class="tree-file-link">
                  ${getFileIcon(file.name)}
                  <span class="tree-file-name">${file.name}</span>
                </a>
                <button class="action-btn delete-btn external-delete-btn" data-delete-type="file" data-delete-path="${file.path}" data-delete-name="${file.name}" data-delete-external="true" title="Xoa file">${TRASH_ICON}</button>
              </div>
            `;
          }

          html += `
              </div>
            </div>
          `;
        }
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
              <button class="action-btn rename-btn" data-rename-type="folder" data-rename-path="${folder}" data-rename-name="${folder}" title="Doi ten">${PENCIL_ICON}</button>
              <button class="action-btn delete-btn" data-delete-type="folder" data-delete-path="${folder}" data-delete-name="${folder}" title="Xoa thu muc">${TRASH_ICON}</button>
            ` : ''}
          </div>
          <div class="tree-folder-content" id="${folderId}">
      `;

      folderFiles.sort((a, b) => a.name.localeCompare(b.name));

      for (const file of folderFiles) {
        const isActive = file.path === currentFilePath && !isExternalFile;
        html += `
          <div class="tree-file ${isActive ? 'active' : ''}" data-path="${file.path}">
            <a href="index.html?path=${encodeURIComponent(file.path)}" class="tree-file-link">
              ${getFileIcon(file.name)}
              <span class="tree-file-name">${file.name}</span>
            </a>
            <button class="action-btn rename-btn" data-rename-type="file" data-rename-path="${file.path}" data-rename-name="${file.name}" title="Doi ten">${PENCIL_ICON}</button>
            <button class="action-btn move-btn" data-move-path="${file.path}" data-move-name="${file.name}" title="Di chuyen">${MOVE_ICON}</button>
            <button class="action-btn delete-btn" data-delete-type="file" data-delete-path="${file.path}" data-delete-name="${file.name}" title="Xoa file">${TRASH_ICON}</button>
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
