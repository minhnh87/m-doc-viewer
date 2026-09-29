// Drag & drop: files dropped on the drop box are copied into the project's
// DROP_TARGET_DIR (default 3_READING) and the first one is opened. Name clashes
// are auto-renamed (notes.md -> notes-1.md) — existing files are never touched.
// A dropped folder opens the "add external folder" dialog instead: the browser
// never exposes its absolute path, so the user pastes it.

import { apiFetch } from './api.js';
import {
  loadFileTree, saveTreeState, restoreTreeState, revealActiveFile,
} from './file-tree.js';
import { navigateToFile } from './navigation.js';
import { showAddFolderDialog } from './dialogs.js';

const DEFAULT_TARGET_DIR = '3_READING';
const MAX_RENAME_ATTEMPTS = 100;
const HTTP_CONFLICT = 409;
const DRAG_OVER_LABEL = 'Thả để mở';
const UNSAFE_NAME_CHARS = /[<>:"/\\|?*\u0000-\u001f]/g;
const MIXED_DROP_MESSAGE = 'Chỉ thả file hoặc folder, không thả lẫn lộn.';
const MULTI_FOLDER_MESSAGE = 'Thả từng folder một.';

function targetDir() {
  const dir = (window.APP_CONFIG || {}).DROP_TARGET_DIR || DEFAULT_TARGET_DIR;
  return dir.replace(/^\/+|\/+$/g, '');
}

/** Strip filesystem-unsafe characters; '' when nothing usable is left. */
export function sanitizeFileName(name) {
  const cleaned = String(name || '').replace(UNSAFE_NAME_CHARS, '').trim();
  return cleaned === '.' || cleaned === '..' ? '' : cleaned;
}

/** attempt 0 -> name as-is; attempt n -> suffix `-n` before the extension. */
export function candidateName(name, attempt) {
  if (attempt === 0) return name;
  const dot = name.lastIndexOf('.');
  if (dot <= 0) return `${name}-${attempt}`;
  return `${name.slice(0, dot)}-${attempt}${name.slice(dot)}`;
}

/** Text files never contain NUL; binaries (images, pdf, zip...) almost always do. */
export function isBinaryContent(text) {
  return text.includes('\u0000');
}

async function createWithUniqueName(dir, name, content) {
  for (let attempt = 0; attempt < MAX_RENAME_ATTEMPTS; attempt++) {
    const path = `${dir}/${candidateName(name, attempt)}`;
    try {
      await apiFetch('/api/file/create', {
        method: 'POST',
        body: JSON.stringify({ path, content }),
      });
      return path;
    } catch (error) {
      if (error.status !== HTTP_CONFLICT) throw error;
    }
  }
  throw new Error('đã có quá nhiều file trùng tên');
}

async function readText(file) {
  try {
    return await file.text();
  } catch {
    return null;
  }
}

/**
 * Copy dropped files into the drop dir, one by one.
 * @param {Array<{ name: string, text: () => Promise<string> }>} files
 * @returns {Promise<{ imported: string[], skipped: Array<{ name: string, reason: string }> }>}
 */
export async function importFiles(files) {
  const dir = targetDir();
  const imported = [];
  const skipped = [];

  for (const file of files) {
    const name = sanitizeFileName(file.name);
    if (!name) {
      skipped.push({ name: file.name, reason: 'tên file không hợp lệ' });
      continue;
    }
    const content = await readText(file);
    if (content === null) {
      skipped.push({ name: file.name, reason: 'không đọc được file' });
      continue;
    }
    if (isBinaryContent(content)) {
      skipped.push({ name: file.name, reason: 'không phải file text' });
      continue;
    }
    try {
      imported.push(await createWithUniqueName(dir, name, content));
    } catch (error) {
      console.error('Drop import failed:', file.name, error);
      skipped.push({ name: file.name, reason: error.message });
    }
  }
  return { imported, skipped };
}

export async function handleDrop(files) {
  if (!files.length) return;
  const { imported, skipped } = await importFiles(files);

  if (imported.length) {
    // Navigate first: the tree expands the folder of the *current* file when it
    // renders, so the rebuild must see the new file as current.
    const treeState = saveTreeState();
    navigateToFile(imported[0], false);
    await loadFileTree();
    restoreTreeState(treeState);
    revealActiveFile();
  }
  if (skipped.length) {
    const lines = skipped.map(({ name, reason }) => `- ${name}: ${reason}`);
    alert(`Không copy được ${skipped.length} file:\n${lines.join('\n')}`);
  }
}

/**
 * Split dropped items into files and folder names. Must run synchronously inside
 * the drop handler — DataTransferItems are emptied once the event returns.
 * @param {DataTransferItemList|Array} items
 * @returns {{ files: File[], folderNames: string[] }}
 */
export function classifyDrop(items) {
  const files = [];
  const folderNames = [];
  for (const item of Array.from(items || [])) {
    if (item.kind !== 'file') continue;
    const entry = item.webkitGetAsEntry();
    if (!entry) continue;
    if (entry.isDirectory) {
      folderNames.push(entry.name);
      continue;
    }
    const file = item.getAsFile();
    if (file) files.push(file);
  }
  return { files, folderNames };
}

/** Files -> copy flow; exactly one folder -> add-folder dialog; anything else is rejected. */
export async function routeDrop({ files, folderNames }) {
  if (files.length && folderNames.length) {
    alert(MIXED_DROP_MESSAGE);
    return;
  }
  if (folderNames.length > 1) {
    alert(MULTI_FOLDER_MESSAGE);
    return;
  }
  if (folderNames.length === 1) {
    showAddFolderDialog({ folderName: folderNames[0] });
    return;
  }
  await handleDrop(files);
}

function hasFiles(event) {
  return Array.from(event.dataTransfer?.types || []).includes('Files');
}

// Window-level: "arm" the zone while files are dragged anywhere over the page,
// so the user sees where to drop. A depth counter survives child-element
// enter/leave pairs; any drop disarms.
function trackWindowDrag(zone) {
  let depth = 0;
  const disarm = () => {
    depth = 0;
    zone.classList.remove('drag-armed');
  };

  window.addEventListener('dragenter', (e) => {
    if (!hasFiles(e)) return;
    depth += 1;
    zone.classList.add('drag-armed');
  });
  window.addEventListener('dragleave', (e) => {
    if (!hasFiles(e)) return;
    depth = Math.max(0, depth - 1);
    if (depth === 0) disarm();
  });
  // Dropping a file anywhere else would make the browser navigate away to it.
  window.addEventListener('dragover', (e) => { if (hasFiles(e)) e.preventDefault(); });
  window.addEventListener('drop', (e) => {
    if (hasFiles(e)) e.preventDefault();
    disarm();
  });
}

// Zone-level hover state; counter-based so crossing the icon/label children
// doesn't flicker it.
function trackZoneDrag(zone) {
  const label = zone.querySelector('.file-drop-label');
  const idleLabel = label.textContent;
  let depth = 0;
  const setDragOver = (isOver) => {
    zone.classList.toggle('drag-over', isOver);
    label.textContent = isOver ? DRAG_OVER_LABEL : idleLabel;
  };

  zone.addEventListener('dragenter', (e) => {
    if (!hasFiles(e)) return;
    depth += 1;
    setDragOver(true);
  });
  zone.addEventListener('dragover', (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  });
  zone.addEventListener('dragleave', (e) => {
    if (!hasFiles(e)) return;
    depth = Math.max(0, depth - 1);
    if (depth === 0) setDragOver(false);
  });
  zone.addEventListener('drop', (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    depth = 0;
    setDragOver(false);
    routeDrop(classifyDrop(e.dataTransfer.items));
  });
}

// Click / Enter / Space opens the OS file picker — same import path as a drop.
function bindFilePicker(zone, input) {
  const openPicker = () => input.click();
  zone.addEventListener('click', openPicker);
  zone.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    openPicker();
  });
  input.addEventListener('change', () => {
    const files = Array.from(input.files || []);
    input.value = ''; // allow picking the same file again
    handleDrop(files);
  });
}

export function initFileDrop() {
  const zone = document.getElementById('file-drop-zone');
  const input = document.getElementById('file-drop-input');
  if (!zone || !input) return;
  zone.title = `Kéo thả hoặc click để chọn file — copy vào ${targetDir()}`;

  trackWindowDrag(zone);
  trackZoneDrag(zone);
  bindFilePicker(zone, input);
}
