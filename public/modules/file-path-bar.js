// File path bar — dải mờ neo cuối trang hiển thị full path của file đang mở
// (chỉ màn hình rộng, xem styles.css). Click vào path để copy.
//
// Không import state.js ở đây để module còn import được trong vitest (node,
// không có window) — caller truyền path/isExternal vào.

const COPIED_FEEDBACK_MS = 1500;
let feedbackTimer = null;

/**
 * @param {string|null} filePath - Path từ state (relative với project, hoặc absolute nếu external)
 * @param {boolean} isExternal
 * @param {string|undefined} projectRoot - APP_CONFIG.PROJECT_ROOT
 * @returns {string} Absolute path để hiển thị, '' nếu không có file
 */
export function toAbsolutePath(filePath, isExternal, projectRoot) {
  if (!filePath) return '';
  if (isExternal) return filePath;
  const root = String(projectRoot || '').replace(/\/+$/, '');
  return root ? `${root}/${filePath}` : filePath;
}

export function updateFilePathBar(filePath, isExternal) {
  const bar = document.getElementById('file-path-bar');
  if (!bar) return;

  const root = (window.APP_CONFIG || {}).PROJECT_ROOT;
  const absPath = toAbsolutePath(filePath, isExternal, root);
  if (!absPath) {
    bar.replaceChildren();
    return;
  }

  let text = bar.querySelector('.file-path-text');
  if (!text) {
    text = document.createElement('span');
    text.className = 'file-path-text';
    text.title = 'Click để copy path';
    text.addEventListener('click', onPathClick);
    bar.appendChild(text);
  }

  // Hủy feedback "Đã copy" đang chờ để không ghi đè path mới sau khi navigate
  clearTimeout(feedbackTimer);
  text.textContent = absPath;
  text.dataset.path = absPath;
}

async function onPathClick(event) {
  const text = event.currentTarget;
  const path = text.dataset.path;
  if (!path) return;

  const copied = await copyToClipboard(path);
  clearTimeout(feedbackTimer);
  text.textContent = copied ? '✓ Đã copy' : '⚠ Copy thất bại';
  feedbackTimer = setTimeout(() => {
    text.textContent = path;
  }, COPIED_FEEDBACK_MS);
}

async function copyToClipboard(value) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return copyViaTextarea(value);
  }
}

// Fallback khi Clipboard API không khả dụng (http:// không phải localhost, file:// trên vài browser)
function copyViaTextarea(value) {
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  }
  textarea.remove();
  return copied;
}
