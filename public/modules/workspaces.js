// Workspace persistence (client-side localStorage)
//
// Data model: see src/domain/workspace.js for typedefs.
// localStorage key: 'workspacesState' — single JSON blob holding all workspaces
// and the active id. Legacy key 'externalFolders' (flat string[]) is migrated
// lazily on first read into a "Default" workspace.

const STATE_KEY = 'workspacesState';
const LEGACY_FOLDERS_KEY = 'externalFolders';
const DEFAULT_WORKSPACE_ID = 'ws-default';
const SCHEMA_VERSION = 1;

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `ws-${crypto.randomUUID()}`;
  }
  return `ws-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function createDefaultWorkspace(folderPaths = []) {
  return {
    id: DEFAULT_WORKSPACE_ID,
    name: 'Default',
    folderPaths: [...folderPaths],
    createdAt: Date.now(),
  };
}

function emptyState() {
  return {
    version: SCHEMA_VERSION,
    activeWorkspaceId: DEFAULT_WORKSPACE_ID,
    workspaces: [createDefaultWorkspace()],
  };
}

function isValidState(value) {
  return (
    value
    && typeof value === 'object'
    && typeof value.version === 'number'
    && typeof value.activeWorkspaceId === 'string'
    && Array.isArray(value.workspaces)
    && value.workspaces.every(isValidWorkspace)
  );
}

function isValidWorkspace(ws) {
  return (
    ws
    && typeof ws === 'object'
    && typeof ws.id === 'string'
    && typeof ws.name === 'string'
    && Array.isArray(ws.folderPaths)
    && ws.folderPaths.every(p => typeof p === 'string')
    && typeof ws.createdAt === 'number'
  );
}

function readLegacyFolders() {
  try {
    const raw = localStorage.getItem(LEGACY_FOLDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(p => typeof p === 'string') : [];
  } catch {
    return [];
  }
}

function migrateFromLegacy() {
  const legacyFolders = readLegacyFolders();
  return {
    version: SCHEMA_VERSION,
    activeWorkspaceId: DEFAULT_WORKSPACE_ID,
    workspaces: [createDefaultWorkspace(legacyFolders)],
  };
}

/**
 * @returns {import('../../src/domain/workspace.js').WorkspacesState}
 */
export function getWorkspacesState() {
  let raw;
  try {
    raw = localStorage.getItem(STATE_KEY);
  } catch {
    return emptyState();
  }

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (isValidState(parsed)) return parsed;
      console.warn('[workspaces] Invalid state shape, falling back to migration');
    } catch {
      console.warn('[workspaces] Corrupted state JSON, falling back to migration');
    }
  }

  const migrated = migrateFromLegacy();
  saveWorkspacesState(migrated);
  return migrated;
}

/**
 * @param {import('../../src/domain/workspace.js').WorkspacesState} state
 */
export function saveWorkspacesState(state) {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

export function getActiveWorkspaceId() {
  return getWorkspacesState().activeWorkspaceId;
}

/**
 * @param {string} id
 */
export function setActiveWorkspaceId(id) {
  const state = getWorkspacesState();
  if (!state.workspaces.some(w => w.id === id)) {
    throw new Error(`Workspace not found: ${id}`);
  }
  saveWorkspacesState({ ...state, activeWorkspaceId: id });
}

/**
 * @returns {import('../../src/domain/workspace.js').Workspace[]}
 */
export function getWorkspaces() {
  return getWorkspacesState().workspaces;
}

/**
 * @param {string} id
 * @returns {import('../../src/domain/workspace.js').Workspace | null}
 */
export function getWorkspaceById(id) {
  return getWorkspaces().find(w => w.id === id) || null;
}

/**
 * @returns {import('../../src/domain/workspace.js').Workspace}
 */
export function getActiveWorkspace() {
  const state = getWorkspacesState();
  return state.workspaces.find(w => w.id === state.activeWorkspaceId)
    || state.workspaces[0];
}

/**
 * @returns {string[]}
 */
export function getActiveWorkspaceFolders() {
  return [...getActiveWorkspace().folderPaths];
}

/**
 * @param {string} name
 * @returns {import('../../src/domain/workspace.js').Workspace}
 */
export function createWorkspace(name) {
  const trimmed = (name || '').trim();
  if (!trimmed) throw new Error('Workspace name is required');

  const state = getWorkspacesState();
  const workspace = {
    id: generateId(),
    name: trimmed,
    folderPaths: [],
    createdAt: Date.now(),
  };
  saveWorkspacesState({
    ...state,
    workspaces: [...state.workspaces, workspace],
  });
  return workspace;
}

/**
 * @param {string} id
 * @param {string} newName
 */
export function renameWorkspace(id, newName) {
  const trimmed = (newName || '').trim();
  if (!trimmed) throw new Error('Workspace name is required');

  const state = getWorkspacesState();
  if (!state.workspaces.some(w => w.id === id)) {
    throw new Error(`Workspace not found: ${id}`);
  }
  saveWorkspacesState({
    ...state,
    workspaces: state.workspaces.map(w => (
      w.id === id ? { ...w, name: trimmed } : w
    )),
  });
}

/**
 * @param {string} id
 */
export function deleteWorkspace(id) {
  if (id === DEFAULT_WORKSPACE_ID) {
    throw new Error('Cannot delete default workspace');
  }
  const state = getWorkspacesState();
  const target = state.workspaces.find(w => w.id === id);
  if (!target) throw new Error(`Workspace not found: ${id}`);

  const orphanFolders = target.folderPaths;
  const nextWorkspaces = state.workspaces
    .filter(w => w.id !== id)
    .map(w => (
      w.id === DEFAULT_WORKSPACE_ID
        ? { ...w, folderPaths: mergeUnique(w.folderPaths, orphanFolders) }
        : w
    ));

  const nextActiveId = state.activeWorkspaceId === id
    ? DEFAULT_WORKSPACE_ID
    : state.activeWorkspaceId;

  saveWorkspacesState({
    ...state,
    activeWorkspaceId: nextActiveId,
    workspaces: nextWorkspaces,
  });
}

/**
 * @param {string} workspaceId
 * @param {string} folderPath
 */
export function addFolderToWorkspace(workspaceId, folderPath) {
  if (!folderPath) throw new Error('folderPath is required');

  const state = getWorkspacesState();
  if (!state.workspaces.some(w => w.id === workspaceId)) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }
  saveWorkspacesState({
    ...state,
    workspaces: state.workspaces.map(w => (
      w.id === workspaceId && !w.folderPaths.includes(folderPath)
        ? { ...w, folderPaths: [...w.folderPaths, folderPath] }
        : w
    )),
  });
}

/**
 * @param {string} workspaceId
 * @param {string} folderPath
 */
export function removeFolderFromWorkspace(workspaceId, folderPath) {
  const state = getWorkspacesState();
  if (!state.workspaces.some(w => w.id === workspaceId)) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }
  saveWorkspacesState({
    ...state,
    workspaces: state.workspaces.map(w => (
      w.id === workspaceId
        ? { ...w, folderPaths: w.folderPaths.filter(p => p !== folderPath) }
        : w
    )),
  });
}

function mergeUnique(a, b) {
  const seen = new Set(a);
  const result = [...a];
  for (const item of b) {
    if (!seen.has(item)) {
      seen.add(item);
      result.push(item);
    }
  }
  return result;
}

export const __testing__ = {
  STATE_KEY,
  LEGACY_FOLDERS_KEY,
  DEFAULT_WORKSPACE_ID,
  SCHEMA_VERSION,
};
