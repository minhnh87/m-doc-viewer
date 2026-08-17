// Quick file picker (Cmd/Ctrl + P) — VS Code-style fuzzy file open.

import { apiFetch } from './api.js';
import { navigateToFile } from './navigation.js';
import { getFileIcon } from './icons.js';
import { getActiveWorkspaceFolders } from './workspaces.js';

const MAX_RESULTS = 50;

let overlayEl = null;
let inputEl = null;
let resultsEl = null;

let allFiles = [];
let filteredFiles = [];
let activeIndex = 0;
let isOpen = false;

function buildDom() {
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay quick-open-overlay';
  overlay.id = 'quick-open-overlay';
  overlay.innerHTML = `
    <div class="quick-open-dialog" role="dialog" aria-label="Quick open file">
      <input
        type="text"
        id="quick-open-input"
        class="quick-open-input"
        placeholder="Nhap ten file de tim..."
        autocomplete="off"
        spellcheck="false"
      >
      <div id="quick-open-results" class="quick-open-results"></div>
      <div class="quick-open-footer">
        <span><kbd>↑</kbd><kbd>↓</kbd> chon</span>
        <span><kbd>Enter</kbd> mo</span>
        <span><kbd>Esc</kbd> dong</span>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  return overlay;
}

async function loadAllFiles() {
  const collected = [];

  try {
    const grouped = await apiFetch('/api/files');
    for (const folderKey of Object.keys(grouped)) {
      for (const file of grouped[folderKey] || []) {
        collected.push({
          name: file.name,
          path: file.path,
          folder: folderKey === 'Root' ? '' : folderKey,
          isExternal: false,
        });
      }
    }
  } catch (error) {
    console.error('Quick open: failed to load project files', error);
  }

  const externalFolders = getActiveWorkspaceFolders();
  if (externalFolders.length > 0) {
    try {
      const extResponse = await apiFetch('/api/external-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths: externalFolders }),
      });

      for (const rootPath of Object.keys(extResponse || {})) {
        const grouped = extResponse[rootPath] || {};
        for (const subKey of Object.keys(grouped)) {
          for (const file of grouped[subKey] || []) {
            const displayFolder = subKey === '.'
              ? rootPath.split('/').pop() || rootPath
              : `${rootPath.split('/').pop()}/${subKey}`;
            collected.push({
              name: file.name,
              path: file.path,
              folder: displayFolder,
              isExternal: true,
            });
          }
        }
      }
    } catch (error) {
      console.error('Quick open: failed to load external files', error);
    }
  }

  const seen = new Set();
  const deduped = [];
  for (const file of collected) {
    const key = `${file.isExternal ? 'ext' : 'proj'}:${file.path}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(file);
  }
  return deduped;
}

// Subsequence-based fuzzy score. Higher = better. Returns null on no match.
// Bonuses: consecutive chars, name match over path match, prefix match.
function fuzzyScore(query, file) {
  if (!query) return 0;
  const q = query.toLowerCase();
  const name = file.name.toLowerCase();
  const path = file.path.toLowerCase();

  let score = scoreSubsequence(q, name);
  if (score !== null) {
    return score + 1000;
  }
  score = scoreSubsequence(q, path);
  return score;
}

function scoreSubsequence(query, target) {
  let score = 0;
  let qi = 0;
  let lastMatchIdx = -1;
  let consecutive = 0;

  for (let i = 0; i < target.length && qi < query.length; i++) {
    if (target[i] === query[qi]) {
      if (lastMatchIdx === i - 1) {
        consecutive++;
        score += 5 + consecutive;
      } else {
        consecutive = 0;
        score += 1;
      }
      if (i === 0 || target[i - 1] === '/' || target[i - 1] === '-' || target[i - 1] === '_' || target[i - 1] === '.') {
        score += 3;
      }
      lastMatchIdx = i;
      qi++;
    }
  }

  if (qi < query.length) return null;
  score -= target.length * 0.05;
  return score;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function highlightMatches(text, query) {
  if (!query) return escapeHtml(text);
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const parts = [];
  let qi = 0;
  let buffer = '';

  for (let i = 0; i < text.length; i++) {
    if (qi < lowerQuery.length && lowerText[i] === lowerQuery[qi]) {
      if (buffer) {
        parts.push(escapeHtml(buffer));
        buffer = '';
      }
      parts.push(`<mark>${escapeHtml(text[i])}</mark>`);
      qi++;
    } else {
      buffer += text[i];
    }
  }
  if (buffer) parts.push(escapeHtml(buffer));
  return parts.join('');
}

function applyFilter(query) {
  const trimmed = query.trim();
  if (!trimmed) {
    filteredFiles = [...allFiles]
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, MAX_RESULTS);
  } else {
    const scored = [];
    for (const file of allFiles) {
      const score = fuzzyScore(trimmed, file);
      if (score !== null && score > 0) {
        scored.push({ file, score });
      }
    }
    scored.sort((a, b) => b.score - a.score);
    filteredFiles = scored.slice(0, MAX_RESULTS).map(s => s.file);
  }
  activeIndex = 0;
  renderResults(trimmed);
}

function renderResults(query) {
  if (filteredFiles.length === 0) {
    resultsEl.innerHTML = '<div class="quick-open-empty">Khong tim thay file</div>';
    return;
  }

  const html = filteredFiles.map((file, idx) => {
    const icon = getFileIcon(file.name);
    const folderText = file.folder || (file.isExternal ? '' : 'Root');
    const externalBadge = file.isExternal ? '<span class="quick-open-badge">ext</span>' : '';
    return `
      <div class="quick-open-item ${idx === activeIndex ? 'active' : ''}"
           data-index="${idx}"
           data-path="${escapeHtml(file.path)}"
           data-external="${file.isExternal}">
        <span class="quick-open-icon">${icon}</span>
        <span class="quick-open-name">${highlightMatches(file.name, query)}</span>
        <span class="quick-open-folder">${escapeHtml(folderText)}</span>
        ${externalBadge}
      </div>
    `;
  }).join('');

  resultsEl.innerHTML = html;
  scrollActiveIntoView();
}

function scrollActiveIntoView() {
  const activeEl = resultsEl.querySelector('.quick-open-item.active');
  if (activeEl) {
    activeEl.scrollIntoView({ block: 'nearest' });
  }
}

function setActive(newIndex) {
  if (filteredFiles.length === 0) return;
  const clamped = Math.max(0, Math.min(newIndex, filteredFiles.length - 1));
  if (clamped === activeIndex) return;
  activeIndex = clamped;

  resultsEl.querySelectorAll('.quick-open-item').forEach(el => {
    const idx = Number(el.dataset.index);
    el.classList.toggle('active', idx === activeIndex);
  });
  scrollActiveIntoView();
}

function openSelected() {
  const file = filteredFiles[activeIndex];
  if (!file) return;
  hideQuickOpen();
  navigateToFile(file.path, file.isExternal);
}

function handleKeydown(e) {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    setActive(activeIndex + 1);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    setActive(activeIndex - 1);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    openSelected();
  } else if (e.key === 'Escape') {
    e.preventDefault();
    hideQuickOpen();
  }
}

function handleResultsClick(e) {
  const item = e.target.closest('.quick-open-item');
  if (!item) return;
  e.preventDefault();
  activeIndex = Number(item.dataset.index);
  openSelected();
}

function handleOverlayClick(e) {
  if (e.target === overlayEl) hideQuickOpen();
}

export function initQuickOpen() {
  if (overlayEl) return;
  overlayEl = buildDom();
  inputEl = document.getElementById('quick-open-input');
  resultsEl = document.getElementById('quick-open-results');

  inputEl.addEventListener('input', () => applyFilter(inputEl.value));
  inputEl.addEventListener('keydown', handleKeydown);
  resultsEl.addEventListener('click', handleResultsClick);
  overlayEl.addEventListener('click', handleOverlayClick);
}

export async function showQuickOpen() {
  if (!overlayEl) initQuickOpen();

  if (isOpen) {
    inputEl.focus();
    inputEl.select();
    return;
  }

  isOpen = true;
  overlayEl.classList.add('show');
  inputEl.value = '';
  resultsEl.innerHTML = '<div class="quick-open-empty">Dang tai danh sach file...</div>';
  setTimeout(() => inputEl.focus(), 50);

  allFiles = await loadAllFiles();
  if (!isOpen) return;
  applyFilter('');
}

export function hideQuickOpen() {
  if (!overlayEl) return;
  overlayEl.classList.remove('show');
  isOpen = false;
  activeIndex = 0;
  filteredFiles = [];
}

export function isQuickOpenVisible() {
  return isOpen;
}
