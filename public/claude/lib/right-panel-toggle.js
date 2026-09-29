// Right panel (session metadata + prompt outline) show/hide (button + O hotkey).
// Collapses to a narrow rail holding only the expand button, remembered across
// reloads — same behaviour as the markdown viewer's outline toggle.

const STORAGE_KEY = 'claudeRightPanelCollapsed';
const COLLAPSED_CLASS = 'right-panel-collapsed';

export function toggleRightPanel() {
  const isCollapsed = document.body.classList.toggle(COLLAPSED_CLASS);
  localStorage.setItem(STORAGE_KEY, String(isCollapsed));
}

export function initRightPanelToggle() {
  if (localStorage.getItem(STORAGE_KEY) === 'true') {
    document.body.classList.add(COLLAPSED_CLASS);
  }
  const button = document.getElementById('collapse-right-panel');
  if (button) button.addEventListener('click', toggleRightPanel);
}
