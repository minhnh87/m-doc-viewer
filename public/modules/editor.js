// Edit mode: raw markdown editing in a plain textarea, manual save.
//
// Flow: pencil button / hotkey E -> fetch fresh raw content (+mtime) ->
// swap the rendered view for a textarea -> Ctrl+S or Save writes back via
// PUT /content with `baseMtime` optimistic locking (409 -> offer force save).
// Only .md files are editable.

import { getState } from './state.js';
import { apiFetch } from './api.js';

const UNSAVED_STATUS = '● Chưa lưu';

let onAfterSave = null; // injected from view.js — re-renders the content area

let editing = false;
let dirty = false;
let saving = false;
let baseMtime = null;
let editingPath = null;
let editingExternal = false;

function els() {
  return {
    container: document.getElementById('editor-container'),
    textarea: document.getElementById('editor-textarea'),
    status: document.getElementById('editor-status'),
    saveBtn: document.getElementById('editor-save-btn'),
    cancelBtn: document.getElementById('editor-cancel-btn'),
    editBtn: document.getElementById('edit-file-btn'),
    content: document.getElementById('markdown-content'),
  };
}

export function isEditableFile(path) {
  return typeof path === 'string' && /\.md$/i.test(path);
}

export function isEditing() {
  return editing;
}

/** Pencil button is always visible; disabled for non-.md files. Called on every content load. */
export function updateEditButton(filePath) {
  const { editBtn } = els();
  if (!editBtn) return;
  editBtn.disabled = !isEditableFile(filePath);
}

export function initEditor({ afterSave }) {
  onAfterSave = afterSave;
  const { textarea, saveBtn, cancelBtn, editBtn } = els();

  editBtn.addEventListener('click', () => {
    if (editing) {
      cancelEdit();
    } else {
      enterEditMode();
    }
  });
  saveBtn.addEventListener('click', save);
  cancelBtn.addEventListener('click', cancelEdit);

  textarea.addEventListener('input', () => setDirty(true));
  textarea.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      save();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  });

  // Warn on tab close / reload while there are unsaved changes.
  window.addEventListener('beforeunload', (e) => {
    if (editing && dirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
}

export async function enterEditMode() {
  const state = getState();
  if (editing || !isEditableFile(state.currentFilePath)) return;

  const { container, textarea, status, content, editBtn } = els();

  // Fetch fresh content so we edit (and lock against) the latest disk state,
  // not a possibly stale render.
  let data;
  try {
    const externalParam = state.isExternalFile ? '&external=true' : '';
    data = await apiFetch(`/api/content?path=${encodeURIComponent(state.currentFilePath)}${externalParam}`);
  } catch (error) {
    console.error('Error loading content for edit:', error);
    alert(`Không tải được nội dung để edit: ${error.message}`);
    return;
  }

  editing = true;
  editingPath = state.currentFilePath;
  editingExternal = state.isExternalFile;
  baseMtime = data.mtime || null;

  textarea.value = data.content;
  setDirty(false);
  status.textContent = '';

  content.style.display = 'none';
  container.style.display = 'flex';
  editBtn.classList.add('active');
  textarea.focus();
}

/**
 * Leave edit mode without saving. Returns to the (unchanged) rendered view.
 */
export function exitEditMode() {
  if (!editing) return;
  const { container, content, editBtn } = els();

  editing = false;
  dirty = false;
  baseMtime = null;
  editingPath = null;

  container.style.display = 'none';
  content.style.display = '';
  editBtn.classList.remove('active');
  setTitleDirty(false);
}

/**
 * Ask before discarding unsaved changes, then close the editor.
 * Returns false when the user chose to stay — callers (navigation) must abort.
 */
export function confirmAndCloseEditor() {
  if (!editing) return true;
  if (dirty && !window.confirm('Có thay đổi chưa lưu. Bỏ thay đổi và rời khỏi editor?')) {
    return false;
  }
  exitEditMode();
  return true;
}

function cancelEdit() {
  confirmAndCloseEditor();
}

async function save() {
  if (!editing || saving) return;
  const { textarea, status } = els();
  saving = true;
  status.textContent = 'Đang lưu…';

  try {
    const result = await writeWithConflictRetry(textarea.value);
    if (!result) {
      // User declined to overwrite a conflicting file — stay in the editor.
      status.textContent = UNSAVED_STATUS;
      return;
    }
    baseMtime = result.mtime || null;
    setDirty(false);
    status.textContent = 'Đã lưu ✓';
    exitEditMode();
    if (onAfterSave) onAfterSave();
  } catch (error) {
    console.error('Error saving file:', error);
    status.textContent = 'Lỗi khi lưu';
    alert(`Lưu thất bại: ${error.message}`);
  } finally {
    saving = false;
  }
}

/**
 * PUT the content with the optimistic lock; on 409 (file changed on disk,
 * e.g. Claude Code wrote it) ask the user whether to overwrite.
 * Returns the API result, or null when the user kept the disk version.
 */
async function writeWithConflictRetry(content) {
  const body = {
    path: editingPath,
    external: editingExternal,
    content,
    baseMtime,
  };
  try {
    return await apiFetch('/api/file/write', { method: 'PUT', body: JSON.stringify(body) });
  } catch (error) {
    if (error.status !== 409) throw error;
    const overwrite = window.confirm(
      'File đã bị thay đổi trên ổ đĩa sau khi anh mở editor.\nGhi đè bản trên ổ đĩa bằng nội dung đang edit?',
    );
    if (!overwrite) return null;
    return apiFetch('/api/file/write', {
      method: 'PUT',
      body: JSON.stringify({ ...body, baseMtime: undefined }),
    });
  }
}

function setDirty(value) {
  dirty = value;
  const { status } = els();
  if (status) status.textContent = dirty ? UNSAVED_STATUS : '';
  setTitleDirty(dirty);
}

function setTitleDirty(value) {
  const title = document.getElementById('file-title');
  if (!title) return;
  title.classList.toggle('dirty', value);
}
