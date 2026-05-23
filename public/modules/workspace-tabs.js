// Workspace tab bar — rendered inside a Shadow DOM root so it is fully
// isolated from any CSS (or DOM mutation) happening in the rest of the page.
// This avoids breakage from markdown <style> bleed, theme variable churn,
// transition rules on neighbour trees, etc.

import {
  getWorkspaces,
  getActiveWorkspaceId,
  setActiveWorkspaceId,
  createWorkspace,
  renameWorkspace,
  deleteWorkspace,
} from './workspaces.js';
import { loadFileTree } from './file-tree.js';
import { getState } from './state.js';
import { PENCIL_ICON, TRASH_ICON, PLUS_ICON } from './icons.js';

const CONTAINER_ID = 'workspace-tabs';
const DEFAULT_WORKSPACE_ID = 'ws-default';

// --- Shadow DOM bootstrap ---

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

const TAB_STYLES = `
  :host {
    display: block;
    background: var(--ws-bg, #ffffff);
    border-bottom: 1px solid var(--ws-border, #d8dee4);
  }
  :host([data-theme="dark"]) {
    background: var(--ws-bg, #282c34);
    border-bottom-color: var(--ws-border, #3B4048);
  }
  .root {
    --bg: #ffffff;
    --tab-hover: #eaeef2;
    --tab-active: #f6f8fa;
    --border: #d8dee4;
    --border-strong: #d1d9e0;
    --text: #1f2328;
    --text-muted: #6e7781;
    --danger: #cf222e;

    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: thin;
    padding: 6px 16px;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  }
  :host([data-theme="dark"]) .root {
    --bg: #282c34;
    --tab-hover: #383E4A;
    --tab-active: #2c313a;
    --border: #3B4048;
    --border-strong: #181A1F;
    --text: #abb2bf;
    --text-muted: #5c6370;
  }
  .tab {
    position: relative;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    border: 1px solid transparent;
    border-radius: 6px;
    background: transparent;
    transition: background 0.12s, border-color 0.12s;
    max-width: 200px;
  }
  .tab:hover { background: var(--tab-hover); }
  .tab.active {
    background: var(--tab-active);
    border-color: var(--border);
  }
  .tab-select {
    flex: 1;
    min-width: 0;
    padding: 4px 8px;
    border: none;
    background: transparent;
    color: var(--text-muted);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
    font-family: inherit;
  }
  .tab.active .tab-select {
    color: var(--text);
    font-weight: 600;
  }
  .tab-name {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: middle;
  }
  .tab-action {
    display: none;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    margin-right: 2px;
    padding: 0;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
  }
  .tab-action svg { width: 12px; height: 12px; fill: currentColor; }
  .tab:hover .tab-action,
  .tab.active .tab-action { display: inline-flex; }
  .tab-action:hover {
    background: var(--tab-hover);
    color: var(--text);
  }
  .tab-delete:hover { color: var(--danger); }
  .tab-add {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    padding: 0;
    border: 1px dashed var(--border);
    border-radius: 6px;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    transition: background 0.12s, color 0.12s, border-color 0.12s;
  }
  .tab-add svg { width: 12px; height: 12px; fill: currentColor; }
  .tab-add:hover {
    background: var(--tab-hover);
    color: var(--text);
    border-color: var(--border-strong);
  }
`;

let shadowRoot = null;
let modalRoot = null;

function ensureShadow() {
  if (shadowRoot) return shadowRoot;
  const host = document.getElementById(CONTAINER_ID);
  if (!host) return null;
  shadowRoot = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = TAB_STYLES;
  const root = document.createElement('div');
  root.className = 'root';
  shadowRoot.appendChild(style);
  shadowRoot.appendChild(root);

  // Theme sync: mirror data-theme from html to host so :host([data-theme="dark"]) matches.
  syncTheme(host);
  const themeObserver = new MutationObserver(() => syncTheme(host));
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  root.addEventListener('click', onClick);
  return shadowRoot;
}

function syncTheme(host) {
  const theme = document.documentElement.getAttribute('data-theme') || 'light';
  if (theme === 'dark') host.setAttribute('data-theme', 'dark');
  else host.removeAttribute('data-theme');
}

function getRoot() {
  return shadowRoot ? shadowRoot.querySelector('.root') : null;
}

// --- Rendering ---

function renderTab(workspace, activeId) {
  const isActive = workspace.id === activeId;
  const isDefault = workspace.id === DEFAULT_WORKSPACE_ID;
  const deleteBtn = isDefault
    ? ''
    : `<button class="tab-action tab-delete" data-action="delete" data-workspace-id="${workspace.id}" title="Xoá workspace">${TRASH_ICON}</button>`;

  return `
    <div class="tab ${isActive ? 'active' : ''}" data-workspace-id="${workspace.id}">
      <button class="tab-select" data-action="select" data-workspace-id="${workspace.id}" title="${escapeHtml(workspace.name)}">
        <span class="tab-name">${escapeHtml(workspace.name)}</span>
      </button>
      <button class="tab-action tab-rename" data-action="rename" data-workspace-id="${workspace.id}" title="Đổi tên">${PENCIL_ICON}</button>
      ${deleteBtn}
    </div>
  `;
}

function renderAddButton() {
  return `
    <button class="tab-add" data-action="create" title="Tạo workspace mới">${PLUS_ICON}</button>
  `;
}

function onClick(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  e.preventDefault();
  e.stopPropagation();
  const action = btn.dataset.action;
  const id = btn.dataset.workspaceId;
  switch (action) {
    case 'select': return handleSelect(id);
    case 'create': return handleCreate();
    case 'rename': return handleRename(id);
    case 'delete': return handleDelete(id);
  }
}

export function renderWorkspaceTabs() {
  const host = document.getElementById(CONTAINER_ID);
  if (!host) return;

  // Folder-filter mode (?f=...) views files outside any workspace, so the
  // tab bar is irrelevant — hide the host to remove its border/padding too.
  if (getState().folderFilter) {
    host.style.display = 'none';
    return;
  }
  host.style.display = '';

  ensureShadow();
  const root = getRoot();
  if (!root) return;
  const workspaces = getWorkspaces();
  const activeId = getActiveWorkspaceId();
  root.innerHTML = workspaces.map(ws => renderTab(ws, activeId)).join('') + renderAddButton();
}

// --- In-app modal (WKWebView-safe; rendered in light DOM so it's modal over everything) ---

function ensureModalRoot() {
  if (modalRoot) return modalRoot;
  modalRoot = document.createElement('div');
  modalRoot.id = 'ws-modal-root';
  document.body.appendChild(modalRoot);
  return modalRoot;
}

function closeModal() {
  if (modalRoot) modalRoot.innerHTML = '';
}

function wkPrompt(title, defaultValue = '') {
  return new Promise((resolve) => {
    const root = ensureModalRoot();
    root.innerHTML = `
      <div class="ws-modal-backdrop">
        <div class="ws-modal">
          <div class="ws-modal-title">${escapeHtml(title)}</div>
          <input type="text" class="ws-modal-input" value="${escapeHtml(defaultValue)}" />
          <div class="ws-modal-actions">
            <button type="button" class="ws-modal-btn ws-modal-cancel">Huỷ</button>
            <button type="button" class="ws-modal-btn ws-modal-ok">OK</button>
          </div>
        </div>
      </div>
    `;
    const input = root.querySelector('.ws-modal-input');
    const okBtn = root.querySelector('.ws-modal-ok');
    const cancelBtn = root.querySelector('.ws-modal-cancel');
    const backdrop = root.querySelector('.ws-modal-backdrop');

    const finish = (value) => { closeModal(); resolve(value); };

    okBtn.addEventListener('click', () => finish(input.value));
    cancelBtn.addEventListener('click', () => finish(null));
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) finish(null); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') finish(input.value);
      else if (e.key === 'Escape') finish(null);
    });

    setTimeout(() => { input.focus(); input.select(); }, 10);
  });
}

function wkConfirm(message) {
  return new Promise((resolve) => {
    const root = ensureModalRoot();
    root.innerHTML = `
      <div class="ws-modal-backdrop">
        <div class="ws-modal">
          <div class="ws-modal-message">${escapeHtml(message)}</div>
          <div class="ws-modal-actions">
            <button type="button" class="ws-modal-btn ws-modal-cancel">Huỷ</button>
            <button type="button" class="ws-modal-btn ws-modal-ok ws-modal-danger">OK</button>
          </div>
        </div>
      </div>
    `;
    const okBtn = root.querySelector('.ws-modal-ok');
    const cancelBtn = root.querySelector('.ws-modal-cancel');
    const backdrop = root.querySelector('.ws-modal-backdrop');

    const finish = (value) => { closeModal(); resolve(value); };

    okBtn.addEventListener('click', () => finish(true));
    cancelBtn.addEventListener('click', () => finish(false));
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) finish(false); });
    setTimeout(() => okBtn.focus(), 10);
  });
}

const wkAlert = (msg) => wkConfirm(msg);

// --- Handlers ---

async function handleSelect(workspaceId) {
  if (workspaceId === getActiveWorkspaceId()) return;
  setActiveWorkspaceId(workspaceId);
  renderWorkspaceTabs();
  await loadFileTree();
}

async function handleCreate() {
  const name = await wkPrompt('Tên workspace mới:');
  if (name === null) return;
  const trimmed = name.trim();
  if (!trimmed) { await wkAlert('Tên workspace không được rỗng'); return; }
  try {
    const ws = createWorkspace(trimmed);
    setActiveWorkspaceId(ws.id);
    renderWorkspaceTabs();
    await loadFileTree();
  } catch (err) {
    await wkAlert('Lỗi: ' + err.message);
  }
}

async function handleRename(workspaceId) {
  const current = getWorkspaces().find(w => w.id === workspaceId);
  if (!current) return;
  const next = await wkPrompt('Đổi tên workspace:', current.name);
  if (next === null) return;
  const trimmed = next.trim();
  if (!trimmed) { await wkAlert('Tên workspace không được rỗng'); return; }
  if (trimmed === current.name) return;
  try {
    renameWorkspace(workspaceId, trimmed);
    renderWorkspaceTabs();
  } catch (err) {
    await wkAlert('Lỗi: ' + err.message);
  }
}

async function handleDelete(workspaceId) {
  const ws = getWorkspaces().find(w => w.id === workspaceId);
  if (!ws) return;
  const folderCount = ws.folderPaths.length;
  const msg = folderCount > 0
    ? `Xoá workspace "${ws.name}"? ${folderCount} folder sẽ chuyển sang Default.`
    : `Xoá workspace "${ws.name}"?`;
  const ok = await wkConfirm(msg);
  if (!ok) return;
  const wasActive = workspaceId === getActiveWorkspaceId();
  try {
    deleteWorkspace(workspaceId);
    renderWorkspaceTabs();
    if (wasActive) await loadFileTree();
  } catch (err) {
    await wkAlert('Lỗi: ' + err.message);
  }
}
