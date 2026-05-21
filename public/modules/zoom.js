// Content zoom controls (Ctrl + +/- and floating buttons)

const STORAGE_KEY = 'contentZoom';
const MIN_ZOOM = 0.7;
const MAX_ZOOM = 2.5;
const STEP = 0.1;
const DEFAULT_ZOOM = 1.0;

let currentZoom = DEFAULT_ZOOM;

function load() {
  const v = parseFloat(localStorage.getItem(STORAGE_KEY));
  return Number.isFinite(v) && v >= MIN_ZOOM && v <= MAX_ZOOM ? v : DEFAULT_ZOOM;
}

function save(z) {
  localStorage.setItem(STORAGE_KEY, String(z));
}

function apply(z) {
  document.documentElement.style.setProperty('--content-zoom', z);
  const label = document.getElementById('zoom-level-btn');
  if (label) label.textContent = `${Math.round(z * 100)}%`;
}

function setZoom(z) {
  currentZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.round(z * 10) / 10));
  apply(currentZoom);
  save(currentZoom);
}

export function initZoom() {
  currentZoom = load();
  apply(currentZoom);

  const inBtn = document.getElementById('zoom-in-btn');
  const outBtn = document.getElementById('zoom-out-btn');
  const levelBtn = document.getElementById('zoom-level-btn');

  if (inBtn) inBtn.addEventListener('click', () => setZoom(currentZoom + STEP));
  if (outBtn) outBtn.addEventListener('click', () => setZoom(currentZoom - STEP));
  if (levelBtn) levelBtn.addEventListener('click', () => setZoom(DEFAULT_ZOOM));

  document.addEventListener('keydown', (e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    const target = e.target;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
      return;
    }
    if (e.key === '=' || e.key === '+') {
      e.preventDefault();
      setZoom(currentZoom + STEP);
    } else if (e.key === '-' || e.key === '_') {
      e.preventDefault();
      setZoom(currentZoom - STEP);
    } else if (e.key === '0') {
      e.preventDefault();
      setZoom(DEFAULT_ZOOM);
    }
  });
}
