// Theme management (light/dark) — persists to localStorage

const THEME_KEY = 'theme';
const THEMES = { LIGHT: 'light', DARK: 'dark' };

function getThemeFromUrl() {
  try {
    const v = new URLSearchParams(window.location.search).get('theme');
    return v === THEMES.DARK || v === THEMES.LIGHT ? v : null;
  } catch {
    return null;
  }
}

export function getTheme() {
  const fromUrl = getThemeFromUrl();
  if (fromUrl) return fromUrl;
  try {
    return localStorage.getItem(THEME_KEY) || THEMES.LIGHT;
  } catch {
    return THEMES.LIGHT;
  }
}

export function setTheme(theme) {
  const value = theme === THEMES.DARK ? THEMES.DARK : THEMES.LIGHT;
  document.documentElement.setAttribute('data-theme', value);
  try {
    localStorage.setItem(THEME_KEY, value);
  } catch {}

  if (window.mermaid) {
    try {
      window.mermaid.initialize({
        startOnLoad: false,
        theme: value === THEMES.DARK ? 'dark' : 'default',
      });
    } catch {}
  }
}

export function toggleTheme() {
  const next = getTheme() === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
  setTheme(next);
  return next;
}

export function initTheme() {
  setTheme(getTheme());
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.addEventListener('click', toggleTheme);
  }
}
