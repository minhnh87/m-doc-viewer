// Sidebar resize logic - drag handles between columns

const STORAGE_KEY = 'sidebarWidths';
const MIN_WIDTH = 160;
const MAX_WIDTH_RATIO = 0.45;
const MOBILE_BREAKPOINT = 1024;

function loadWidths() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch {
    return null;
  }
}

function saveWidths(widths) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(widths));
}

function clampWidth(width) {
  const max = window.innerWidth * MAX_WIDTH_RATIO;
  return Math.max(MIN_WIDTH, Math.min(max, width));
}

function applyWidths(left, right) {
  const root = document.documentElement.style;
  if (left != null) root.setProperty('--left-sidebar-width', `${left}px`);
  if (right != null) root.setProperty('--right-sidebar-width', `${right}px`);
}

export function initResize() {
  const leftHandle = document.getElementById('resize-handle-left');
  const rightHandle = document.getElementById('resize-handle-right');
  const leftSidebar = document.getElementById('file-tree-sidebar');
  const rightSidebar = document.getElementById('outline-sidebar');

  if (!leftHandle || !rightHandle || !leftSidebar || !rightSidebar) return;

  const saved = loadWidths();
  if (saved && window.innerWidth > MOBILE_BREAKPOINT) {
    applyWidths(clampWidth(saved.left), clampWidth(saved.right));
  }

  let activeHandle = null;
  let activeSide = null;
  let startX = 0;
  let startWidth = 0;

  function onMouseDown(e, handle, side) {
    if (window.innerWidth <= MOBILE_BREAKPOINT) return;
    e.preventDefault();
    activeHandle = handle;
    activeSide = side;
    startX = e.clientX;
    startWidth = side === 'left' ? leftSidebar.offsetWidth : rightSidebar.offsetWidth;
    handle.classList.add('dragging');
    document.body.classList.add('resizing');
  }

  function onMouseMove(e) {
    if (!activeHandle) return;
    const delta = activeSide === 'left' ? e.clientX - startX : startX - e.clientX;
    const newWidth = clampWidth(startWidth + delta);
    if (activeSide === 'left') {
      applyWidths(newWidth, null);
    } else {
      applyWidths(null, newWidth);
    }
  }

  function onMouseUp() {
    if (!activeHandle) return;
    activeHandle.classList.remove('dragging');
    document.body.classList.remove('resizing');
    activeHandle = null;
    activeSide = null;
    saveWidths({
      left: leftSidebar.offsetWidth,
      right: rightSidebar.offsetWidth,
    });
  }

  function onDoubleClick(side) {
    if (window.innerWidth <= MOBILE_BREAKPOINT) return;
    const defaultWidth = window.innerWidth <= 1200 ? 220 : 330;
    if (side === 'left') applyWidths(defaultWidth, null);
    else applyWidths(null, defaultWidth);
    saveWidths({
      left: leftSidebar.offsetWidth,
      right: rightSidebar.offsetWidth,
    });
  }

  leftHandle.addEventListener('mousedown', (e) => onMouseDown(e, leftHandle, 'left'));
  rightHandle.addEventListener('mousedown', (e) => onMouseDown(e, rightHandle, 'right'));
  leftHandle.addEventListener('dblclick', () => onDoubleClick('left'));
  rightHandle.addEventListener('dblclick', () => onDoubleClick('right'));
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);

  window.addEventListener('resize', () => {
    if (window.innerWidth <= MOBILE_BREAKPOINT) return;
    const current = loadWidths();
    if (current) {
      applyWidths(clampWidth(current.left), clampWidth(current.right));
    }
  });
}
