/**
 * Conversation viewer entry point. Wires config/theme, the three panes, data
 * loading, keyboard shortcuts, and the command palette. Runs as an esbuild IIFE
 * bundle (`claude.bundle.js`) loaded by `claude.html` over file://.
 */

import claudeCss from '../claude.css';

import { listProjects, listSessions, loadSession, loadSessionSummary } from './data.js';
import { ApiError } from './lib/api-error.js';
import { getFavourites, isFavourite, toggleFavourite, removeFavourite } from './lib/favourites.js';
import { getMarkedSessions, toggleSessionMark } from './lib/marked-sessions.js';
import { shortDisplayPath } from './lib/paths.js';
import { scrollToMessage } from './lib/scroll-to-message.js';
import { attachKeyboardMap } from './lib/keyboard.js';

import { createBanners } from './ui/banner.js';
import { createProjectSwitcher } from './ui/project-switcher.js';
import { createFavouriteList } from './ui/favourites.js';
import { createSessionList } from './ui/session-list.js';
import { renderMessages } from './ui/message-stream.js';
import { renderMetadata, renderOutline } from './ui/metadata-panel.js';
import { createPalette } from './ui/command-palette.js';

// claudeCss is loaded via <link> in claude.html; the import keeps esbuild's
// css-as-text loader satisfied and documents the styling dependency.
void claudeCss;

const $ = (id) => document.getElementById(id);

const state = {
  projects: [],
  slug: null,
  sessions: [],
  sessionId: null,
  showHidden: false,
  markedSessions: new Set(),
  markedSessionsOnly: false,
  userPrompts: [],
  detail: null,
  loadToken: 0,
};

// --- elements --------------------------------------------------------------
const els = {
  banners: $('claude-banners'),
  stream: $('message-stream'),
  metadata: $('metadata-panel'),
  outline: $('outline-panel'),
  sessionList: $('session-list'),
  switcher: $('project-switcher'),
  favourites: $('favourites'),
  progress: $('load-progress'),
  progressFill: $('load-progress-fill'),
  progressLabel: $('load-progress-label'),
  showHidden: $('show-hidden-toggle'),
  themeToggle: $('claude-theme-toggle'),
  paletteBtn: $('palette-btn'),
  markedSessionsBtn: $('marked-sessions-btn'),
};

const banners = createBanners(els.banners);
const switcher = createProjectSwitcher(els.switcher, {
  onSelect: (slug) => selectProject(slug),
  onToggleFavourite: () => {
    if (!state.slug) return;
    toggleFavourite(state.slug);
    renderFavourites();
  },
});
const favourites = createFavouriteList(els.favourites, {
  onSelect: (slug) => selectProject(slug),
  onRemove: (slug) => { removeFavourite(slug); renderFavourites(); },
});
const sessionList = createSessionList(els.sessionList, {
  onOpen: (session) => openSession(session),
  loadSummary: (session) => loadSessionSummary(state.slug, session.id, session.mtimeMs),
  onToggleMark: (sessionId) => handleToggleSessionMark(sessionId),
});
const palette = createPalette(
  { overlay: $('palette-overlay'), input: $('palette-input'), results: $('palette-results') },
  { getCommands: buildCommands },
);

// --- theme -----------------------------------------------------------------
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem('theme', theme); } catch { /* ignore */ }
  const light = $('hljs-light');
  const dark = $('hljs-dark');
  if (light && dark) { light.disabled = theme === 'dark'; dark.disabled = theme !== 'dark'; }
}
function initTheme() {
  applyTheme(document.documentElement.getAttribute('data-theme') || 'light');
  els.themeToggle.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  });
}

// --- URL deep-linking ------------------------------------------------------
function readUrl() {
  const p = new URLSearchParams(window.location.search);
  return { slug: p.get('slug'), id: p.get('id') };
}
function syncUrl() {
  const p = new URLSearchParams();
  if (state.slug) p.set('slug', state.slug);
  if (state.sessionId) p.set('id', state.sessionId);
  const theme = document.documentElement.getAttribute('data-theme');
  if (theme) p.set('theme', theme);
  history.replaceState(null, '', `${window.location.pathname}?${p.toString()}`);
}

// --- favourites ------------------------------------------------------------
/** Re-read the pinned slugs and sync both the list and the star button. */
function renderFavourites() {
  favourites.render(getFavourites(), state.projects, state.slug);
  switcher.setFavourite(isFavourite(state.slug));
}

// --- projects --------------------------------------------------------------
async function refreshProjects(preferred) {
  banners.clear();
  sessionList.showLoading();
  let result;
  try {
    result = await listProjects();
  } catch (err) {
    handleError(err, () => refreshProjects(preferred));
    sessionList.showEmpty('Could not load projects.');
    return;
  }
  state.projects = result.projects;
  if (!result.setup) {
    switcher.render([], null);
    renderFavourites();
    sessionList.showEmpty('Claude Code has not created any projects yet.');
    return;
  }
  if (!state.projects.length) {
    switcher.render([], null);
    renderFavourites();
    sessionList.showEmpty('No projects found.');
    return;
  }
  const target = state.projects.find((p) => p.slug === preferred) || state.projects[0];
  switcher.render(state.projects, target.slug);
  await selectProject(target.slug);
}

async function selectProject(slug, deepLinkId) {
  state.slug = slug;
  state.sessions = [];
  state.markedSessions = new Set(getMarkedSessions(slug));
  switcher.setCurrent(slug);
  renderFavourites();
  sessionList.showLoading();
  banners.clear();
  syncUrl();
  let sessions;
  try {
    sessions = await listSessions(slug);
  } catch (err) {
    handleError(err, () => selectProject(slug, deepLinkId));
    sessionList.showEmpty('Could not load sessions.');
    return;
  }
  state.sessions = sessions;
  if (!sessions.length) {
    sessionList.showEmpty('No sessions in this project.');
    resetStream();
    return;
  }
  renderSessionList();
  if (deepLinkId) {
    const match = sessions.find((s) => s.id === deepLinkId);
    if (match) openSession(match);
  }
}

// --- session ---------------------------------------------------------------
async function openSession(session) {
  state.sessionId = session.id;
  sessionList.setActive(session.id);
  syncUrl();
  banners.clear();
  showProgress(0, session.size || 0);

  const token = ++state.loadToken;
  let detail;
  try {
    detail = await loadSession(state.slug, session.id, {
      onProgress: (loaded, total) => { if (token === state.loadToken) showProgress(loaded, total); },
    });
  } catch (err) {
    if (token !== state.loadToken) return;
    hideProgress();
    handleSessionError(err, session);
    return;
  }
  if (token !== state.loadToken) return;
  hideProgress();

  state.detail = detail;
  banners.parseErrors(detail.parseErrors.length);
  const { userPrompts } = renderMessages(els.stream, detail.messages, { showHidden: state.showHidden });
  state.userPrompts = userPrompts;
  els.stream.scrollTop = 0;
  renderMetadata(els.metadata, detail.session, { messageCount: detail.snapshot.messageCount });
  renderOutline(els.outline, userPrompts, { onJump: (uuid) => scrollToMessage(uuid) });
}

/** Re-render the current stream in place (e.g. after toggling show-hidden). */
function rerenderStream() {
  if (!state.sessionId || !state.detail) return;
  const { userPrompts } = renderMessages(els.stream, state.detail.messages, { showHidden: state.showHidden });
  state.userPrompts = userPrompts;
}

// --- marked sessions -------------------------------------------------------
/** Sessions the list currently shows — all of them, or only the marked ones. */
function visibleSessions() {
  if (!state.markedSessionsOnly) return state.sessions;
  return state.sessions.filter((s) => state.markedSessions.has(s.id));
}

function renderSessionList() {
  const sessions = visibleSessions();
  if (!sessions.length && state.markedSessionsOnly) {
    sessionList.showEmpty('No marked sessions. Hover a session and click ⚑ to mark it.');
    return;
  }
  sessionList.render(sessions, state.markedSessions);
}

function handleToggleSessionMark(sessionId) {
  if (!state.slug) return;
  state.markedSessions = new Set(toggleSessionMark(state.slug, sessionId));
  // Unmarking while filtering drops the row, so that case needs a re-render;
  // otherwise flip the one row and keep its already-loaded summary.
  if (state.markedSessionsOnly) renderSessionList();
  else sessionList.setMarked(sessionId, state.markedSessions.has(sessionId));
}

function setMarkedSessionsOnly(on) {
  state.markedSessionsOnly = on;
  els.markedSessionsBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
  els.markedSessionsBtn.title = on ? 'Show all sessions' : 'Show only marked sessions';
  if (state.sessions.length) renderSessionList();
}

function resetStream() {
  state.sessionId = null;
  state.detail = null;
  state.userPrompts = [];
  els.stream.innerHTML = '';
  els.stream.appendChild(placeholder('Select a session to view the conversation.'));
  els.metadata.innerHTML = '';
  els.outline.innerHTML = '';
}

// --- progress --------------------------------------------------------------
function showProgress(loaded, total) {
  els.progress.hidden = false;
  const pct = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0;
  els.progressFill.style.width = `${pct}%`;
  els.progressLabel.textContent = total > 0
    ? `Loading ${(loaded / 1048576).toFixed(1)} / ${(total / 1048576).toFixed(1)} MiB (${pct}%)`
    : 'Loading…';
}
function hideProgress() { els.progress.hidden = true; }

// --- errors ----------------------------------------------------------------
function handleError(err, onRetry) {
  if (err instanceof ApiError && err.status === 401) {
    banners.error('API key or prefix in config.js is incorrect (401).');
  } else if (err instanceof ApiError && err.isNetwork) {
    banners.error(err.message, onRetry);
  } else {
    banners.error(err && err.message ? err.message : 'Request failed.', onRetry);
  }
}

function handleSessionError(err, session) {
  if (err instanceof ApiError && err.status === 404) {
    banners.error('Session not found — it may have been deleted.', () => selectProject(state.slug));
    sessionList.setActive(null);
    resetStream();
  } else if (err instanceof ApiError && err.status === 401) {
    banners.error('API key or prefix in config.js is incorrect (401).');
  } else if (err instanceof ApiError && err.status === 413) {
    banners.error('This session file is too large to slice.');
  } else {
    banners.error(err && err.message ? err.message : 'Failed to load session.', () => openSession(session));
  }
}

// --- command palette commands ---------------------------------------------
function buildCommands() {
  const projectCmds = state.projects.map((p) => ({
    kind: 'project',
    label: shortDisplayPath(p.path),
    run: () => selectProject(p.slug),
  }));
  // Session commands make the palette a complete navigation fallback on narrow
  // screens where the left sidebar (project switcher + session list) is hidden.
  const sessionCmds = state.sessions.map((s) => ({
    kind: 'session',
    label: s.id,
    run: () => openSession(s),
  }));
  const promptCmds = state.userPrompts.map((pr) => ({
    kind: 'prompt',
    label: pr.text,
    run: () => scrollToMessage(pr.uuid),
  }));
  return [...projectCmds, ...sessionCmds, ...promptCmds];
}

// --- session navigation ----------------------------------------------------
function navigateSession(delta) {
  // j/k walks what the list shows, so filtering also narrows the navigation.
  const sessions = visibleSessions();
  if (!sessions.length) return;
  const idx = sessions.findIndex((s) => s.id === state.sessionId);
  const next = idx === -1 ? 0 : Math.min(sessions.length - 1, Math.max(0, idx + delta));
  const session = sessions[next];
  if (session) {
    sessionList.scrollActiveIntoView(session.id);
    openSession(session);
  }
}

function showHelp() {
  banners.clear();
  banners.info('Shortcuts: ⌘K/Ctrl-K palette · j/k next/prev session · ? help · Esc close', { dismissible: true });
}

// --- helpers ---------------------------------------------------------------
function placeholder(text) {
  const div = document.createElement('div');
  div.className = 'stream-placeholder';
  div.textContent = text;
  return div;
}

// --- boot ------------------------------------------------------------------
function boot() {
  initTheme();
  if (window.marked && typeof window.marked.setOptions === 'function') {
    window.marked.setOptions({ gfm: true, breaks: false });
  }

  els.showHidden.addEventListener('change', () => {
    state.showHidden = els.showHidden.checked;
    rerenderStream();
  });
  els.paletteBtn.addEventListener('click', () => palette.toggle());
  els.markedSessionsBtn.addEventListener('click', () => setMarkedSessionsOnly(!state.markedSessionsOnly));

  attachKeyboardMap([
    { key: 'k', mod: true, allowInInput: true, handler: () => palette.toggle() },
    { key: 'j', handler: () => navigateSession(1) },
    { key: 'k', handler: () => navigateSession(-1) },
    { key: '?', handler: () => showHelp() },
    { key: 'Escape', allowInInput: true, preventDefault: false, handler: () => palette.close() },
  ]);

  window.addEventListener('popstate', () => {
    const { slug, id } = readUrl();
    if (slug && slug !== state.slug) selectProject(slug, id);
  });

  // Deep-link: refreshProjects picks the URL's slug; open the URL's session too.
  const { slug, id } = readUrl();
  refreshProjects(slug).then(() => {
    if (id && state.slug && !state.sessionId) {
      const match = state.sessions.find((s) => s.id === id);
      if (match) openSession(match);
    }
  });
}

boot();
