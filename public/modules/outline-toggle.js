// Outline panel show/hide (header button + O hotkey)
//   - desktop: collapse the right panel to a narrow rail, remembered across reloads
//   - narrow screens (<= 1024px): slide the overlay in/out like the ☰ Outline button

const STORAGE_KEY = 'outlineCollapsed';
const COLLAPSED_CLASS = 'outline-collapsed';
const OVERLAY_BREAKPOINT = 1024;

export function toggleOutlinePanel() {
  if (window.innerWidth <= OVERLAY_BREAKPOINT) {
    document.querySelector('.outline-sidebar').classList.toggle('open');
    document.querySelector('.file-tree-sidebar').classList.remove('open');
    return;
  }
  const isCollapsed = document.body.classList.toggle(COLLAPSED_CLASS);
  localStorage.setItem(STORAGE_KEY, String(isCollapsed));
}

export function initOutlineToggle() {
  if (localStorage.getItem(STORAGE_KEY) === 'true') {
    document.body.classList.add(COLLAPSED_CLASS);
  }
  const button = document.getElementById('collapse-outline');
  if (button) button.addEventListener('click', toggleOutlinePanel);
}
