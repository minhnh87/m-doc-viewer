// Search functionality

import { getExternalFolders } from './storage.js';
import { getFileIcon } from './icons.js';
import { loadFileTree } from './file-tree.js';
import { getState } from './state.js';
import { apiFetch } from './api.js';
import { navigateToFile } from './navigation.js';

let isSearchMode = false;
let lastSearchData = null;
let lastSearchQuery = null;
let lastSearchScope = null;

function getCurrentFolder() {
  const state = getState();
  const currentFilePath = state.currentFilePath;
  const isExternalFile = state.isExternalFile;

  if (!currentFilePath) return null;

  if (isExternalFile) {
    const lastSlash = currentFilePath.lastIndexOf('/');
    return lastSlash > 0 ? currentFilePath.substring(0, lastSlash) : currentFilePath;
  } else {
    const lastSlash = currentFilePath.lastIndexOf('/');
    return lastSlash > 0 ? currentFilePath.substring(0, lastSlash) : '';
  }
}

function getSearchScope() {
  const selected = document.querySelector('input[name="search-scope"]:checked');
  return selected ? selected.value : 'folder';
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightMatch(text, query) {
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
  return text.replace(regex, '<span class="search-match-highlight">$1</span>');
}

function renderSearchResults(data, query, scope = 'folder') {
  const state = getState();
  const isExternalFile = state.isExternalFile;

  const fileTreeNav = document.getElementById('file-tree');
  const folder = getCurrentFolder();
  const folderDisplay = isExternalFile ? folder.split('/').pop() : (folder || 'Root');
  const scopeLabel = scope === 'all' ? 'tat ca' : folderDisplay;

  if (data.results.length === 0) {
    fileTreeNav.innerHTML = `
      <div class="search-results">
        <div class="search-results-header">
          Tim "${query}" trong ${scopeLabel}
        </div>
        <div class="search-no-results">Khong tim thay ket qua</div>
      </div>
    `;
    return;
  }

  let html = `
    <div class="search-results">
      <div class="search-results-header">
        Tim thay ${data.totalMatches} ket qua trong ${data.totalFiles} file (${scopeLabel})
      </div>
  `;

  for (const result of data.results) {
    const file = result.file;
    const fileIcon = getFileIcon(file.name);
    const externalParam = file.isExternal ? '&external=true' : '';

    let folderInfo = '';
    if (scope === 'all') {
      if (file.isExternal) {
        const parts = file.path.split('/');
        parts.pop();
        const folderName = parts.pop() || 'External';
        folderInfo = `<span class="search-result-folder">${folderName}/</span>`;
      } else {
        const fileParts = file.path.split('/');
        if (fileParts.length > 1) {
          fileParts.pop();
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
      const highlightedContent = highlightMatch(match.content, query);
      html += `
        <a href="#" class="search-match-line" data-nav-path="${file.path}" data-nav-external="${file.isExternal}">
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

  const fileHeaders = fileTreeNav.querySelectorAll('.search-result-file');
  fileHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const path = header.dataset.path;
      const isExternal = header.dataset.external === 'true';
      navigateToFile(path, isExternal);
    });
  });

  // Event delegation for search match line clicks
  const matchLinks = fileTreeNav.querySelectorAll('.search-match-line');
  matchLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const path = link.dataset.navPath;
      const isExternal = link.dataset.navExternal === 'true';
      navigateToFile(path, isExternal);
    });
  });
}

export async function performSearch(query) {
  const state = getState();
  const currentFilePath = state.currentFilePath;
  const isExternalFile = state.isExternalFile;

  if (!query.trim()) {
    clearSearch();
    return;
  }

  const scope = getSearchScope();
  const folder = getCurrentFolder();

  if (scope === 'folder' && folder === null && !currentFilePath) {
    alert('Vui long mo mot file truoc khi tim kiem');
    return;
  }

  try {
    let url;

    if (scope === 'all') {
      const externalFolders = getExternalFolders();
      url = `/api/search?query=${encodeURIComponent(query)}&scope=all&externalFolders=${encodeURIComponent(JSON.stringify(externalFolders))}`;
    } else {
      const externalParam = isExternalFile ? '&external=true' : '';
      const folderParam = folder !== null ? folder : '';
      url = `/api/search?query=${encodeURIComponent(query)}&folder=${encodeURIComponent(folderParam)}${externalParam}&scope=folder`;
    }

    const data = await apiFetch(url);

    lastSearchData = data;
    lastSearchQuery = query;
    lastSearchScope = scope;
    isSearchMode = true;

    sessionStorage.setItem('searchState', JSON.stringify({
      query: query,
      scope: scope,
      data: data
    }));

    renderSearchResults(data, query, scope);

    const clearSearchBtn = document.getElementById('clear-search-btn');
    if (clearSearchBtn) {
      clearSearchBtn.classList.add('visible');
    }

  } catch (error) {
    console.error('Search error:', error);
    alert('Loi tim kiem: ' + error.message);
  }
}

export function clearSearch() {
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search-btn');

  if (searchInput) searchInput.value = '';
  if (clearSearchBtn) clearSearchBtn.classList.remove('visible');

  isSearchMode = false;
  lastSearchData = null;
  lastSearchQuery = null;
  lastSearchScope = null;
  sessionStorage.removeItem('searchState');
  loadFileTree();
}

export function restoreSearchState() {
  const savedState = sessionStorage.getItem('searchState');

  if (savedState) {
    try {
      const state = JSON.parse(savedState);
      lastSearchData = state.data;
      lastSearchQuery = state.query;
      lastSearchScope = state.scope;
      isSearchMode = true;

      const searchInput = document.getElementById('search-input');
      const clearSearchBtn = document.getElementById('clear-search-btn');

      if (searchInput) searchInput.value = state.query;
      if (clearSearchBtn) clearSearchBtn.classList.add('visible');

      const scopeRadio = document.querySelector(`input[name="search-scope"][value="${state.scope}"]`);
      if (scopeRadio) {
        scopeRadio.checked = true;
      }

      renderSearchResults(state.data, state.query, state.scope);

      return true;
    } catch (e) {
      console.error('Error restoring search state:', e);
      sessionStorage.removeItem('searchState');
    }
  }
  return false;
}

export function setupSearchListeners() {
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search-btn');
  const searchPanel = document.getElementById('search-panel');
  const toggleSearchBtn = document.getElementById('toggle-search-btn');

  if (searchInput) {
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
        if (clearSearchBtn) clearSearchBtn.classList.add('visible');
      } else {
        if (clearSearchBtn) clearSearchBtn.classList.remove('visible');
        if (isSearchMode) {
          clearSearch();
        }
      }
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      clearSearch();
      if (searchInput) searchInput.focus();
    });
  }

  if (toggleSearchBtn && searchPanel) {
    toggleSearchBtn.addEventListener('click', () => {
      const isVisible = searchPanel.style.display !== 'none';
      searchPanel.style.display = isVisible ? 'none' : 'block';
      if (!isVisible && searchInput) {
        searchInput.focus();
      }
    });
  }
}

export function isInSearchMode() {
  return isSearchMode;
}
