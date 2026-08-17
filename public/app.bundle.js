(() => {
  // public/modules/state.js
  var urlParams = new URLSearchParams(window.location.search);
  var state = {
    currentFilePath: urlParams.get("path"),
    isExternalFile: urlParams.get("external") === "true",
    folderFilter: urlParams.get("f") || null
  };
  function getState() {
    return state;
  }
  function updateState(updates) {
    Object.assign(state, updates);
  }

  // public/modules/icons.js
  var TRASH_ICON = `<svg viewBox="0 0 16 16"><path d="M6.5 1.75a.25.25 0 01.25-.25h2.5a.25.25 0 01.25.25V3h-3V1.75zm4.5 0V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675a.75.75 0 10-1.492.15l.66 6.6A1.75 1.75 0 005.405 15h5.19c.9 0 1.652-.681 1.741-1.576l.66-6.6a.75.75 0 00-1.492-.149l-.66 6.6a.25.25 0 01-.249.225h-5.19a.25.25 0 01-.249-.225l-.66-6.6z"></path></svg>`;
  var FILE_ICON = `<svg class="tree-icon file-icon" viewBox="0 0 16 16" width="16" height="16"><path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0113.25 16h-9.5A1.75 1.75 0 012 14.25V1.75zm1.75-.25a.25.25 0 00-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 00.25-.25V6h-2.75A1.75 1.75 0 019 4.25V1.5H3.75a.25.25 0 00-.25.25z"></path></svg>`;
  var DIAGRAM_FILE_ICON = `<svg class="tree-icon file-icon diagram-icon" viewBox="0 0 16 16" width="16" height="16"><path fill="#FF6D00" d="M1.5 3.25c0-.966.784-1.75 1.75-1.75h9.5c.966 0 1.75.784 1.75 1.75v9.5a1.75 1.75 0 01-1.75 1.75h-9.5a1.75 1.75 0 01-1.75-1.75v-9.5zM3.25 3a.25.25 0 00-.25.25v9.5c0 .138.112.25.25.25h9.5a.25.25 0 00.25-.25v-9.5a.25.25 0 00-.25-.25h-9.5zM5 7.75A.75.75 0 015.75 7h4.5a.75.75 0 010 1.5h-4.5A.75.75 0 015 7.75zm.75 2.25a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5zM5 4.75A.75.75 0 015.75 4h4.5a.75.75 0 010 1.5h-4.5A.75.75 0 015 4.75z"></path></svg>`;
  var MERMAID_FILE_ICON = `<svg class="tree-icon file-icon mermaid-icon" viewBox="0 0 16 16" width="16" height="16"><path fill="#FF3670" d="M8 0C3.58 0 0 3.58 0 8c0 4.42 3.58 8 8 8 4.42 0 8-3.58 8-8 0-4.42-3.58-8-8-8zm0 14.5c-3.59 0-6.5-2.91-6.5-6.5S4.41 1.5 8 1.5s6.5 2.91 6.5 6.5-2.91 6.5-6.5 6.5zM5.5 5.5l2.5 2 2.5-2v5l-2.5-2-2.5 2v-5z"></path></svg>`;
  var WARNING_ICON = `<svg viewBox="0 0 16 16"><path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0114.082 15H1.918a1.75 1.75 0 01-1.543-2.575zM8 5a.75.75 0 00-.75.75v2.5a.75.75 0 001.5 0v-2.5A.75.75 0 008 5zm1 6a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>`;
  var PENCIL_ICON = `<svg viewBox="0 0 16 16"><path d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61zm1.414 1.06a.25.25 0 00-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 000-.354l-1.086-1.086zM11.189 6.25L9.75 4.81l-6.286 6.287a.25.25 0 00-.064.108l-.558 1.953 1.953-.558a.249.249 0 00.108-.064l6.286-6.286z"></path></svg>`;
  var MOVE_ICON = `<svg viewBox="0 0 16 16"><path d="M8.22 2.97a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.751.751 0 01-1.042-.018.751.751 0 01-.018-1.042l2.97-2.97H3.75a.75.75 0 010-1.5h7.44L8.22 4.03a.75.75 0 010-1.06z"></path></svg>`;
  var PLUS_ICON = `<svg viewBox="0 0 16 16"><path d="M7.75 2a.75.75 0 01.75.75V7h4.25a.75.75 0 010 1.5H8.5v4.25a.75.75 0 01-1.5 0V8.5H2.75a.75.75 0 010-1.5H7V2.75A.75.75 0 017.75 2z"></path></svg>`;
  var CLOSE_ICON = `<svg viewBox="0 0 16 16"><path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"></path></svg>`;
  var FOLDER_ICON = `<svg class="tree-icon folder-icon" viewBox="0 0 16 16" width="16" height="16">
  <path d="M1.75 1A1.75 1.75 0 000 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0016 13.25v-8.5A1.75 1.75 0 0014.25 3H7.5a.25.25 0 01-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75z"></path>
</svg>`;
  var CHEVRON_ICON = `<svg class="tree-icon chevron-icon" viewBox="0 0 16 16" width="16" height="16">
  <path d="M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0z"></path>
</svg>`;
  function getFileIcon(fileName) {
    if (fileName.endsWith(".drawio")) {
      return DIAGRAM_FILE_ICON;
    }
    if (fileName.endsWith(".mermaid") || fileName.endsWith(".mmd")) {
      return MERMAID_FILE_ICON;
    }
    return FILE_ICON;
  }

  // public/modules/workspaces.js
  var STATE_KEY = "workspacesState";
  var LEGACY_FOLDERS_KEY = "externalFolders";
  var DEFAULT_WORKSPACE_ID = "ws-default";
  var SCHEMA_VERSION = 1;
  function generateId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return `ws-${crypto.randomUUID()}`;
    }
    return `ws-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
  function createDefaultWorkspace(folderPaths = []) {
    return {
      id: DEFAULT_WORKSPACE_ID,
      name: "Default",
      folderPaths: [...folderPaths],
      createdAt: Date.now()
    };
  }
  function emptyState() {
    return {
      version: SCHEMA_VERSION,
      activeWorkspaceId: DEFAULT_WORKSPACE_ID,
      workspaces: [createDefaultWorkspace()]
    };
  }
  function isValidState(value) {
    return value && typeof value === "object" && typeof value.version === "number" && typeof value.activeWorkspaceId === "string" && Array.isArray(value.workspaces) && value.workspaces.every(isValidWorkspace);
  }
  function isValidWorkspace(ws) {
    return ws && typeof ws === "object" && typeof ws.id === "string" && typeof ws.name === "string" && Array.isArray(ws.folderPaths) && ws.folderPaths.every((p) => typeof p === "string") && typeof ws.createdAt === "number";
  }
  function readLegacyFolders() {
    try {
      const raw = localStorage.getItem(LEGACY_FOLDERS_KEY);
      if (!raw)
        return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((p) => typeof p === "string") : [];
    } catch {
      return [];
    }
  }
  function migrateFromLegacy() {
    const legacyFolders = readLegacyFolders();
    return {
      version: SCHEMA_VERSION,
      activeWorkspaceId: DEFAULT_WORKSPACE_ID,
      workspaces: [createDefaultWorkspace(legacyFolders)]
    };
  }
  function getWorkspacesState() {
    let raw;
    try {
      raw = localStorage.getItem(STATE_KEY);
    } catch {
      return emptyState();
    }
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (isValidState(parsed))
          return parsed;
        console.warn("[workspaces] Invalid state shape, falling back to migration");
      } catch {
        console.warn("[workspaces] Corrupted state JSON, falling back to migration");
      }
    }
    const migrated = migrateFromLegacy();
    saveWorkspacesState(migrated);
    return migrated;
  }
  function saveWorkspacesState(state3) {
    localStorage.setItem(STATE_KEY, JSON.stringify(state3));
  }
  function getActiveWorkspaceId() {
    return getWorkspacesState().activeWorkspaceId;
  }
  function setActiveWorkspaceId(id) {
    const state3 = getWorkspacesState();
    if (!state3.workspaces.some((w) => w.id === id)) {
      throw new Error(`Workspace not found: ${id}`);
    }
    saveWorkspacesState({ ...state3, activeWorkspaceId: id });
  }
  function getWorkspaces() {
    return getWorkspacesState().workspaces;
  }
  function getActiveWorkspace() {
    const state3 = getWorkspacesState();
    return state3.workspaces.find((w) => w.id === state3.activeWorkspaceId) || state3.workspaces[0];
  }
  function getActiveWorkspaceFolders() {
    return [...getActiveWorkspace().folderPaths];
  }
  function createWorkspace(name) {
    const trimmed = (name || "").trim();
    if (!trimmed)
      throw new Error("Workspace name is required");
    const state3 = getWorkspacesState();
    const workspace = {
      id: generateId(),
      name: trimmed,
      folderPaths: [],
      createdAt: Date.now()
    };
    saveWorkspacesState({
      ...state3,
      workspaces: [...state3.workspaces, workspace]
    });
    return workspace;
  }
  function renameWorkspace(id, newName) {
    const trimmed = (newName || "").trim();
    if (!trimmed)
      throw new Error("Workspace name is required");
    const state3 = getWorkspacesState();
    if (!state3.workspaces.some((w) => w.id === id)) {
      throw new Error(`Workspace not found: ${id}`);
    }
    saveWorkspacesState({
      ...state3,
      workspaces: state3.workspaces.map((w) => w.id === id ? { ...w, name: trimmed } : w)
    });
  }
  function deleteWorkspace(id) {
    if (id === DEFAULT_WORKSPACE_ID) {
      throw new Error("Cannot delete default workspace");
    }
    const state3 = getWorkspacesState();
    const target = state3.workspaces.find((w) => w.id === id);
    if (!target)
      throw new Error(`Workspace not found: ${id}`);
    const orphanFolders = target.folderPaths;
    const nextWorkspaces = state3.workspaces.filter((w) => w.id !== id).map((w) => w.id === DEFAULT_WORKSPACE_ID ? { ...w, folderPaths: mergeUnique(w.folderPaths, orphanFolders) } : w);
    const nextActiveId = state3.activeWorkspaceId === id ? DEFAULT_WORKSPACE_ID : state3.activeWorkspaceId;
    saveWorkspacesState({
      ...state3,
      activeWorkspaceId: nextActiveId,
      workspaces: nextWorkspaces
    });
  }
  function addFolderToWorkspace(workspaceId, folderPath) {
    if (!folderPath)
      throw new Error("folderPath is required");
    const state3 = getWorkspacesState();
    if (!state3.workspaces.some((w) => w.id === workspaceId)) {
      throw new Error(`Workspace not found: ${workspaceId}`);
    }
    saveWorkspacesState({
      ...state3,
      workspaces: state3.workspaces.map((w) => w.id === workspaceId && !w.folderPaths.includes(folderPath) ? { ...w, folderPaths: [...w.folderPaths, folderPath] } : w)
    });
  }
  function removeFolderFromWorkspace(workspaceId, folderPath) {
    const state3 = getWorkspacesState();
    if (!state3.workspaces.some((w) => w.id === workspaceId)) {
      throw new Error(`Workspace not found: ${workspaceId}`);
    }
    saveWorkspacesState({
      ...state3,
      workspaces: state3.workspaces.map((w) => w.id === workspaceId ? { ...w, folderPaths: w.folderPaths.filter((p) => p !== folderPath) } : w)
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

  // public/modules/filter-folders.js
  var STORAGE_KEY = "filterFolders";
  function readAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw)
        return {};
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
        return {};
      return parsed;
    } catch {
      return {};
    }
  }
  function writeAll(map) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  }
  function readListFor(map, filterKey) {
    const arr = map[filterKey];
    return Array.isArray(arr) ? arr.filter((p) => typeof p === "string") : [];
  }
  function getFilterFolders(filterKey) {
    if (!filterKey)
      return [];
    return [...readListFor(readAll(), filterKey)];
  }
  function addFilterFolder(filterKey, folderPath) {
    if (!filterKey || !folderPath)
      return;
    if (folderPath === filterKey)
      return;
    const map = readAll();
    const existing = readListFor(map, filterKey);
    if (existing.includes(folderPath))
      return;
    writeAll({ ...map, [filterKey]: [...existing, folderPath] });
  }
  function removeFilterFolder(filterKey, folderPath) {
    if (!filterKey)
      return;
    const map = readAll();
    const existing = readListFor(map, filterKey);
    if (!existing.includes(folderPath))
      return;
    writeAll({ ...map, [filterKey]: existing.filter((p) => p !== folderPath) });
  }

  // public/modules/http-core.js
  function cfg() {
    return window.APP_CONFIG || {};
  }
  function apiBase() {
    return String(cfg().API_BASE_URL || "").replace(/\/+$/, "");
  }
  function apiPrefix() {
    const p = String(cfg().API_PREFIX || "/api").trim().replace(/\/+$/, "");
    return p.startsWith("/") ? p : `/${p}`;
  }
  function apiKey() {
    return cfg().API_KEY || "";
  }
  function authHeaders(extra) {
    const headers = { ...extra || {} };
    const key = apiKey();
    if (key)
      headers["X-API-Key"] = key;
    return headers;
  }
  function buildQuery(params) {
    const parts = [];
    for (const [key, value] of Object.entries(params)) {
      if (value === void 0 || value === null)
        continue;
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
    return parts.length ? `?${parts.join("&")}` : "";
  }
  async function rawFetch(subPath, options = {}) {
    let response;
    try {
      response = await fetch(apiBase() + apiPrefix() + subPath, {
        ...options,
        headers: authHeaders(options.headers)
      });
    } catch (err) {
      throw new Error(`Cannot reach API at ${apiBase() || "(unset API_BASE_URL)"} \u2014 ${err.message}`);
    }
    const text = await response.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
    }
    if (!response.ok) {
      const error = new Error(data && data.error || `Request failed (${response.status})`);
      error.status = response.status;
      throw error;
    }
    return data;
  }

  // public/modules/api.js
  function projectRoot() {
    return String(cfg().PROJECT_ROOT || "").replace(/\/+$/, "");
  }
  function projectExclude() {
    return cfg().PROJECT_EXCLUDE || [];
  }
  function toAbs(rel) {
    const root = projectRoot();
    return rel ? `${root}/${rel}` : root;
  }
  function under(abs) {
    const root = projectRoot();
    return abs === root || abs.startsWith(`${root}/`);
  }
  function toRel(abs) {
    const root = projectRoot();
    return under(abs) ? abs.slice(root.length + 1) : abs;
  }
  function isExt(abs) {
    return !under(abs);
  }
  function stripTrailingSlash(p) {
    return String(p).replace(/\/+$/, "");
  }
  function parseJsonArray(raw) {
    if (!raw)
      return [];
    if (Array.isArray(raw))
      return raw;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  async function getFiles() {
    const data = await rawFetch(`/tree${buildQuery({
      root: projectRoot(),
      exclude: projectExclude().join(","),
      includeHidden: "true"
    })}`);
    const grouped = {};
    for (const file of data.files || []) {
      const key = file.folder === "." || file.folder === "" || file.folder == null ? "Root" : file.folder;
      if (!grouped[key])
        grouped[key] = [];
      grouped[key].push({
        name: file.name,
        path: file.relPath,
        folder: file.folder,
        type: file.type
      });
    }
    for (const folder of data.folders || []) {
      if (!grouped[folder])
        grouped[folder] = [];
    }
    return grouped;
  }
  async function scanTrees(body) {
    const paths = body && body.paths || [];
    const data = await rawFetch("/trees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roots: paths, includeHidden: true })
    });
    const result = {};
    for (const entry of data.roots || []) {
      const grouped = {};
      for (const file of entry.files || []) {
        const key = file.folder || ".";
        if (!grouped[key])
          grouped[key] = [];
        grouped[key].push({
          name: file.name,
          path: file.path,
          folder: file.folder,
          type: file.type,
          isExternal: true
        });
      }
      result[entry.root] = grouped;
    }
    return result;
  }
  async function getContent(sp) {
    const p = sp.get("path");
    const external = sp.get("external") === "true";
    const abs = external ? p : toAbs(p);
    const data = await rawFetch(`/content${buildQuery({ path: abs })}`);
    const isMarkdown = !/\.(drawio|mermaid|mmd)$/i.test(p || "");
    const result = {
      content: data.content,
      type: isMarkdown ? "markdown" : data.type,
      path: p,
      isExternal: external,
      mtime: data.mtime
    };
    if (isMarkdown) {
      result.html = window.marked && window.marked.parse ? window.marked.parse(data.content) : data.content;
    }
    return result;
  }
  async function doSearch(sp) {
    const query = sp.get("query");
    const scope = sp.get("scope") || "folder";
    let roots;
    let recursive;
    const extraParams = {};
    if (scope === "all") {
      const externalFolders = parseJsonArray(sp.get("externalFolders"));
      roots = [projectRoot(), ...externalFolders];
      recursive = true;
      extraParams.exclude = projectExclude().join(",");
      extraParams.includeHidden = "true";
    } else {
      const external = sp.get("external") === "true";
      const folder = sp.get("folder") || "";
      roots = [external ? folder : toAbs(folder)];
      recursive = false;
    }
    const data = await rawFetch(`/search${buildQuery({
      query,
      roots: JSON.stringify(roots),
      recursive: recursive ? "true" : "false",
      ...extraParams
    })}`);
    const results = (data.results || []).map((r) => {
      const abs = r.file.path;
      const external = isExt(abs);
      return {
        file: { ...r.file, path: external ? abs : toRel(abs), isExternal: external },
        matches: r.matches
      };
    });
    return { results, totalMatches: data.totalMatches, totalFiles: data.totalFiles };
  }
  async function createFolder(body) {
    await rawFetch("/folder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: toAbs(body.name) })
    });
    return { success: true };
  }
  async function deleteFolder(sp) {
    const p = sp.get("path");
    const external = sp.get("external") === "true";
    const abs = external ? p : toAbs(p);
    const data = await rawFetch(`/folder${buildQuery({ path: abs })}`, { method: "DELETE" });
    return data || { success: true };
  }
  async function deleteFile(sp) {
    const p = sp.get("path");
    const external = sp.get("external") === "true";
    const abs = external ? p : toAbs(p);
    const data = await rawFetch(`/file${buildQuery({ path: abs })}`, { method: "DELETE" });
    return data || { success: true };
  }
  async function writeFileContent(body) {
    const abs = body.external ? body.path : toAbs(body.path);
    return rawFetch("/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: abs, content: body.content, baseMtime: body.baseMtime })
    });
  }
  async function moveFile(body) {
    await rawFetch("/file/move", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: toAbs(body.from), to: toAbs(body.to || "") })
    });
    return { success: true };
  }
  async function renameItem(body) {
    await rawFetch("/rename", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: toAbs(body.oldPath), newName: body.newName })
    });
    return { success: true };
  }
  async function validateFolder(body) {
    return rawFetch("/validate-folder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: body.path })
    });
  }
  async function latestPlan() {
    const data = await rawFetch(`/newest${buildQuery({ dir: cfg().PLANS_DIR, ext: ".md" })}`);
    return { path: data.path, name: data.name };
  }
  async function latestSession(sp) {
    const folder = sp.get("folder");
    const dir = `${stripTrailingSlash(folder)}/${cfg().SESSIONS_DIR_NAME || ".clsessions"}`;
    const data = await rawFetch(`/newest${buildQuery({ dir, ext: ".md" })}`);
    return { path: data.path, name: data.name };
  }
  async function lastTalk(sp) {
    const folder = sp.get("folder");
    const fileName = cfg().LAST_TALK_FILE || "last_talk.md";
    const filePath = `${stripTrailingSlash(folder)}/${cfg().SESSIONS_DIR_NAME || ".clsessions"}/${fileName}`;
    let response;
    try {
      response = await fetch(`${apiBase()}${apiPrefix()}/content${buildQuery({ path: filePath })}`, { headers: authHeaders() });
    } catch (err) {
      throw new Error(`Cannot reach API at ${apiBase()} \u2014 ${err.message}`);
    }
    if (response.status === 404)
      throw new Error("last_talk.md not found");
    if (!response.ok) {
      let message = "Request failed";
      try {
        const d = await response.json();
        message = d.error || message;
      } catch {
      }
      throw new Error(message);
    }
    return { path: filePath, name: fileName };
  }
  async function dispatch(url, options) {
    const method = (options.method || "GET").toUpperCase();
    const u = new URL(url, "http://local");
    const sp = u.searchParams;
    const body = options.body ? JSON.parse(options.body) : null;
    switch (u.pathname) {
      case "/api/files":
        return getFiles();
      case "/api/external-files":
        return scanTrees(body);
      case "/api/content":
        return getContent(sp);
      case "/api/search":
        return doSearch(sp);
      case "/api/folder":
        return method === "DELETE" ? deleteFolder(sp) : createFolder(body);
      case "/api/file":
        return deleteFile(sp);
      case "/api/file/write":
        return writeFileContent(body);
      case "/api/file/move":
        return moveFile(body);
      case "/api/rename":
        return renameItem(body);
      case "/api/validate-folder":
        return validateFolder(body);
      case "/api/latest-plan":
        return latestPlan();
      case "/api/latest-session":
        return latestSession(sp);
      case "/api/last-talk":
        return lastTalk(sp);
      default:
        throw new Error(`Unsupported API route: ${u.pathname}`);
    }
  }
  async function apiFetch(url, options = {}) {
    if (typeof url === "string" && url.startsWith("/api/")) {
      return dispatch(url, options);
    }
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error || "Request failed");
    return data;
  }

  // public/modules/outline.js
  function generateOutline(htmlContent) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    const headings = tempDiv.querySelectorAll("h1, h2, h3, h4, h5, h6");
    const outline = [];
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.substring(1));
      const text = heading.textContent;
      const id = `heading-${index}`;
      heading.id = id;
      outline.push({
        level,
        text,
        id
      });
    });
    return { outline, html: tempDiv.innerHTML };
  }
  function renderOutline(outline) {
    const outlineNav = document.getElementById("outline");
    if (outline.length === 0) {
      outlineNav.innerHTML = '<p class="no-outline">No headings found</p>';
      return;
    }
    let html = '<ul class="outline-list">';
    outline.forEach((item) => {
      html += `
      <li class="outline-item outline-level-${item.level}">
        <a href="#${item.id}" class="outline-link">${item.text}</a>
      </li>
    `;
    });
    html += "</ul>";
    outlineNav.innerHTML = html;
    const links = outlineNav.querySelectorAll(".outline-link");
    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = link.getAttribute("href").substring(1);
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          links.forEach((l) => l.classList.remove("active"));
          link.classList.add("active");
        }
      });
    });
  }

  // public/modules/scroll-spy.js
  function setupScrollSpy(outline) {
    const links = document.querySelectorAll(".outline-link");
    const content = document.querySelector(".viewer-content");
    content.addEventListener("scroll", () => {
      let current = "";
      outline.forEach((item) => {
        const section = document.getElementById(item.id);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 100) {
            current = item.id;
          }
        }
      });
      links.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${current}`) {
          link.classList.add("active");
        }
      });
    });
  }

  // public/modules/file-path-bar.js
  var COPIED_FEEDBACK_MS = 1500;
  var feedbackTimer = null;
  function toAbsolutePath(filePath, isExternal, projectRoot2) {
    if (!filePath)
      return "";
    if (isExternal)
      return filePath;
    const root = String(projectRoot2 || "").replace(/\/+$/, "");
    return root ? `${root}/${filePath}` : filePath;
  }
  function updateFilePathBar(filePath, isExternal) {
    const bar = document.getElementById("file-path-bar");
    if (!bar)
      return;
    const root = (window.APP_CONFIG || {}).PROJECT_ROOT;
    const absPath = toAbsolutePath(filePath, isExternal, root);
    if (!absPath) {
      bar.replaceChildren();
      return;
    }
    let text = bar.querySelector(".file-path-text");
    if (!text) {
      text = document.createElement("span");
      text.className = "file-path-text";
      text.title = "Click \u0111\u1EC3 copy path";
      text.addEventListener("click", onPathClick);
      bar.appendChild(text);
    }
    clearTimeout(feedbackTimer);
    text.textContent = absPath;
    text.dataset.path = absPath;
  }
  async function onPathClick(event) {
    const text = event.currentTarget;
    const path = text.dataset.path;
    if (!path)
      return;
    const copied = await copyToClipboard(path);
    clearTimeout(feedbackTimer);
    text.textContent = copied ? "\u2713 \u0110\xE3 copy" : "\u26A0 Copy th\u1EA5t b\u1EA1i";
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
  function copyViaTextarea(value) {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }
    textarea.remove();
    return copied;
  }

  // public/modules/scroll-to-match.js
  var FLASH_DURATION_MS = 2e3;
  var FLASH_CLASS = "search-scroll-flash";
  var SKIP_TAGS = /* @__PURE__ */ new Set(["STYLE", "SCRIPT", "NOSCRIPT", "TEMPLATE"]);
  var BLOCK_TAGS = /* @__PURE__ */ new Set([
    "P",
    "LI",
    "H1",
    "H2",
    "H3",
    "H4",
    "H5",
    "H6",
    "PRE",
    "TD",
    "TH",
    "BLOCKQUOTE",
    "DT",
    "DD"
  ]);
  function countNonOverlapping(haystack, needle) {
    let count = 0;
    let idx = haystack.indexOf(needle);
    while (idx !== -1) {
      count += 1;
      idx = haystack.indexOf(needle, idx + needle.length);
    }
    return count;
  }
  function computeOccurrenceIndex(rawContent, lineNumber, query) {
    if (!rawContent || !query || !Number.isInteger(lineNumber) || lineNumber < 1)
      return -1;
    const lines = rawContent.split("\n");
    if (lineNumber > lines.length)
      return -1;
    const needle = query.toLowerCase();
    if (!lines[lineNumber - 1].toLowerCase().includes(needle))
      return -1;
    let occurrencesBefore = 0;
    for (let i = 0; i < lineNumber - 1; i++) {
      occurrencesBefore += countNonOverlapping(lines[i].toLowerCase(), needle);
    }
    return occurrencesBefore;
  }
  function locateOccurrence(texts, query, k) {
    if (!texts.length || !query || k < 0)
      return null;
    const joined = texts.join("").toLowerCase();
    const needle = query.toLowerCase();
    const starts = [];
    let idx = joined.indexOf(needle);
    while (idx !== -1) {
      starts.push(idx);
      idx = joined.indexOf(needle, idx + needle.length);
    }
    if (!starts.length)
      return null;
    const target = starts[Math.min(k, starts.length - 1)];
    let consumed = 0;
    for (let nodeIndex = 0; nodeIndex < texts.length; nodeIndex++) {
      const end = consumed + texts[nodeIndex].length;
      if (target < end) {
        return { nodeIndex, offset: target - consumed };
      }
      consumed = end;
    }
    return null;
  }
  function collectTextNodes(container) {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const tag = node.parentElement ? node.parentElement.tagName : "";
        return SKIP_TAGS.has(tag) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode())
      nodes.push(walker.currentNode);
    return nodes;
  }
  function findBlockAncestor(textNode, container) {
    let el = textNode.parentElement;
    while (el && el !== container) {
      if (BLOCK_TAGS.has(el.tagName) || el.parentElement === container)
        return el;
      el = el.parentElement;
    }
    return null;
  }
  function flash(element) {
    element.classList.remove(FLASH_CLASS);
    void element.offsetWidth;
    element.classList.add(FLASH_CLASS);
    setTimeout(() => element.classList.remove(FLASH_CLASS), FLASH_DURATION_MS);
  }
  function scrollToSearchMatch(container, rawContent, lineNumber, query) {
    const k = computeOccurrenceIndex(rawContent, lineNumber, query);
    if (k < 0)
      return false;
    const nodes = collectTextNodes(container);
    const location = locateOccurrence(nodes.map((n) => n.nodeValue), query, k);
    if (!location)
      return false;
    const block = findBlockAncestor(nodes[location.nodeIndex], container);
    if (!block)
      return false;
    block.scrollIntoView({ block: "center", behavior: "smooth" });
    flash(block);
    return true;
  }

  // public/modules/editor.js
  var UNSAVED_STATUS = "\u25CF Ch\u01B0a l\u01B0u";
  var onAfterSave = null;
  var editing = false;
  var dirty = false;
  var saving = false;
  var baseMtime = null;
  var editingPath = null;
  var editingExternal = false;
  function els() {
    return {
      container: document.getElementById("editor-container"),
      textarea: document.getElementById("editor-textarea"),
      status: document.getElementById("editor-status"),
      saveBtn: document.getElementById("editor-save-btn"),
      cancelBtn: document.getElementById("editor-cancel-btn"),
      editBtn: document.getElementById("edit-file-btn"),
      content: document.getElementById("markdown-content")
    };
  }
  function isEditableFile(path) {
    return typeof path === "string" && /\.md$/i.test(path);
  }
  function updateEditButton(filePath) {
    const { editBtn } = els();
    if (!editBtn)
      return;
    editBtn.disabled = !isEditableFile(filePath);
  }
  function initEditor({ afterSave }) {
    onAfterSave = afterSave;
    const { textarea, saveBtn, cancelBtn, editBtn } = els();
    editBtn.addEventListener("click", () => {
      if (editing) {
        cancelEdit();
      } else {
        enterEditMode();
      }
    });
    saveBtn.addEventListener("click", save);
    cancelBtn.addEventListener("click", cancelEdit);
    textarea.addEventListener("input", () => setDirty(true));
    textarea.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        save();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancelEdit();
      }
    });
    window.addEventListener("beforeunload", (e) => {
      if (editing && dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    });
  }
  async function enterEditMode() {
    const state3 = getState();
    if (editing || !isEditableFile(state3.currentFilePath))
      return;
    const { container, textarea, status, content, editBtn } = els();
    let data;
    try {
      const externalParam = state3.isExternalFile ? "&external=true" : "";
      data = await apiFetch(`/api/content?path=${encodeURIComponent(state3.currentFilePath)}${externalParam}`);
    } catch (error) {
      console.error("Error loading content for edit:", error);
      alert(`Kh\xF4ng t\u1EA3i \u0111\u01B0\u1EE3c n\u1ED9i dung \u0111\u1EC3 edit: ${error.message}`);
      return;
    }
    editing = true;
    editingPath = state3.currentFilePath;
    editingExternal = state3.isExternalFile;
    baseMtime = data.mtime || null;
    textarea.value = data.content;
    setDirty(false);
    status.textContent = "";
    content.style.display = "none";
    container.style.display = "flex";
    editBtn.classList.add("active");
    textarea.focus();
  }
  function exitEditMode() {
    if (!editing)
      return;
    const { container, content, editBtn } = els();
    editing = false;
    dirty = false;
    baseMtime = null;
    editingPath = null;
    container.style.display = "none";
    content.style.display = "";
    editBtn.classList.remove("active");
    setTitleDirty(false);
  }
  function confirmAndCloseEditor() {
    if (!editing)
      return true;
    if (dirty && !window.confirm("C\xF3 thay \u0111\u1ED5i ch\u01B0a l\u01B0u. B\u1ECF thay \u0111\u1ED5i v\xE0 r\u1EDDi kh\u1ECFi editor?")) {
      return false;
    }
    exitEditMode();
    return true;
  }
  function cancelEdit() {
    confirmAndCloseEditor();
  }
  async function save() {
    if (!editing || saving)
      return;
    const { textarea, status } = els();
    saving = true;
    status.textContent = "\u0110ang l\u01B0u\u2026";
    try {
      const result = await writeWithConflictRetry(textarea.value);
      if (!result) {
        status.textContent = UNSAVED_STATUS;
        return;
      }
      baseMtime = result.mtime || null;
      setDirty(false);
      status.textContent = "\u0110\xE3 l\u01B0u \u2713";
      exitEditMode();
      if (onAfterSave)
        onAfterSave();
    } catch (error) {
      console.error("Error saving file:", error);
      status.textContent = "L\u1ED7i khi l\u01B0u";
      alert(`L\u01B0u th\u1EA5t b\u1EA1i: ${error.message}`);
    } finally {
      saving = false;
    }
  }
  async function writeWithConflictRetry(content) {
    const body = {
      path: editingPath,
      external: editingExternal,
      content,
      baseMtime
    };
    try {
      return await apiFetch("/api/file/write", { method: "PUT", body: JSON.stringify(body) });
    } catch (error) {
      if (error.status !== 409)
        throw error;
      const overwrite = window.confirm(
        "File \u0111\xE3 b\u1ECB thay \u0111\u1ED5i tr\xEAn \u1ED5 \u0111\u0129a sau khi anh m\u1EDF editor.\nGhi \u0111\xE8 b\u1EA3n tr\xEAn \u1ED5 \u0111\u0129a b\u1EB1ng n\u1ED9i dung \u0111ang edit?"
      );
      if (!overwrite)
        return null;
      return apiFetch("/api/file/write", {
        method: "PUT",
        body: JSON.stringify({ ...body, baseMtime: void 0 })
      });
    }
  }
  function setDirty(value) {
    dirty = value;
    const { status } = els();
    if (status)
      status.textContent = dirty ? UNSAVED_STATUS : "";
    setTitleDirty(dirty);
  }
  function setTitleDirty(value) {
    const title = document.getElementById("file-title");
    if (!title)
      return;
    title.classList.toggle("dirty", value);
  }

  // public/modules/content-loader.js
  function scopeStyleTags(container) {
    const styles = container.querySelectorAll("style");
    for (const styleEl of styles) {
      const raw = styleEl.textContent || "";
      try {
        styleEl.textContent = scopeCss(raw);
      } catch {
        styleEl.remove();
      }
    }
  }
  function scopeCss(css) {
    const SCOPE = ".markdown-body";
    let src = css.replace(/\/\*[\s\S]*?\*\//g, "");
    let out = "";
    let i = 0;
    while (i < src.length) {
      while (i < src.length && /\s/.test(src[i])) {
        out += src[i];
        i++;
      }
      if (i >= src.length)
        break;
      if (src[i] === "@") {
        const start = i;
        while (i < src.length && src[i] !== "{" && src[i] !== ";")
          i++;
        if (i >= src.length) {
          out += src.slice(start);
          break;
        }
        if (src[i] === ";") {
          out += src.slice(start, i + 1);
          i++;
          continue;
        }
        const prelude = src.slice(start, i);
        const ident = (prelude.match(/^@([\w-]+)/) || [])[1] || "";
        if (/^(media|supports|container|layer|scope)$/i.test(ident)) {
          const { body: body2, end: end2 } = readBlock(src, i);
          out += `${prelude}{${scopeCss(body2)}}`;
          i = end2;
        } else {
          const { body: body2, end: end2 } = readBlock(src, i);
          out += `${prelude}{${body2}}`;
          i = end2;
        }
        continue;
      }
      const selStart = i;
      while (i < src.length && src[i] !== "{")
        i++;
      if (i >= src.length) {
        out += src.slice(selStart);
        break;
      }
      const selectorPart = src.slice(selStart, i);
      const { body, end } = readBlock(src, i);
      const scoped = selectorPart.split(",").map((s) => s.trim()).filter(Boolean).map((s) => `${SCOPE} ${s}`).join(", ");
      out += `${scoped}{${body}}`;
      i = end;
    }
    return out;
  }
  function readBlock(src, openBraceIdx) {
    let depth = 0;
    let i = openBraceIdx;
    if (src[i] !== "{")
      return { body: "", end: i };
    depth = 1;
    i++;
    const start = i;
    while (i < src.length && depth > 0) {
      if (src[i] === "{")
        depth++;
      else if (src[i] === "}")
        depth--;
      if (depth === 0)
        break;
      i++;
    }
    return { body: src.slice(start, i), end: i + 1 };
  }
  async function loadMarkdown(scrollTo = null) {
    const state3 = getState();
    const currentFilePath = state3.currentFilePath;
    const isExternalFile = state3.isExternalFile;
    try {
      const externalParam = isExternalFile ? "&external=true" : "";
      const data = await apiFetch(`/api/content?path=${encodeURIComponent(currentFilePath)}${externalParam}`);
      const fileName = currentFilePath.split("/").pop();
      document.getElementById("file-title").textContent = fileName;
      document.title = fileName;
      const { outline, html } = generateOutline(data.html);
      const contentDiv = document.getElementById("markdown-content");
      const loadingDiv = document.getElementById("loading");
      loadingDiv.style.display = "none";
      contentDiv.innerHTML = html;
      scopeStyleTags(contentDiv);
      renderOutline(outline);
      setupScrollSpy(outline);
      if (scrollTo && scrollTo.query && scrollTo.line) {
        requestAnimationFrame(() => {
          scrollToSearchMatch(contentDiv, data.content, scrollTo.line, scrollTo.query);
        });
      }
    } catch (error) {
      console.error("Error loading markdown:", error);
      document.getElementById("loading").innerHTML = `Error: ${error.message}`;
    }
  }
  async function loadDrawio() {
    const state3 = getState();
    const currentFilePath = state3.currentFilePath;
    const isExternalFile = state3.isExternalFile;
    try {
      const externalParam = isExternalFile ? "&external=true" : "";
      const data = await apiFetch(`/api/content?path=${encodeURIComponent(currentFilePath)}${externalParam}`);
      const fileName = currentFilePath.split("/").pop();
      document.getElementById("file-title").textContent = fileName;
      document.title = fileName;
      const contentDiv = document.getElementById("markdown-content");
      const loadingDiv = document.getElementById("loading");
      loadingDiv.style.display = "none";
      const diagramContainer = document.createElement("div");
      diagramContainer.className = "mxgraph";
      diagramContainer.style.maxWidth = "100%";
      diagramContainer.style.border = "1px solid var(--border-primary)";
      diagramContainer.style.borderRadius = "8px";
      diagramContainer.style.overflow = "hidden";
      diagramContainer.style.background = "var(--diagram-bg)";
      diagramContainer.setAttribute("data-mxgraph", JSON.stringify({
        highlight: "#0000ff",
        nav: true,
        resize: true,
        toolbar: "zoom layers lightbox",
        xml: data.content
      }));
      contentDiv.innerHTML = "";
      contentDiv.appendChild(diagramContainer);
      renderOutline([]);
      if (window.GraphViewer) {
        GraphViewer.createViewerForElement(diagramContainer);
      } else {
        const checkViewer = setInterval(() => {
          if (window.GraphViewer) {
            clearInterval(checkViewer);
            GraphViewer.createViewerForElement(diagramContainer);
          }
        }, 100);
        setTimeout(() => clearInterval(checkViewer), 1e4);
      }
    } catch (error) {
      console.error("Error loading drawio:", error);
      document.getElementById("loading").innerHTML = `Error: ${error.message}`;
    }
  }
  async function loadMermaid() {
    const state3 = getState();
    const currentFilePath = state3.currentFilePath;
    const isExternalFile = state3.isExternalFile;
    try {
      const externalParam = isExternalFile ? "&external=true" : "";
      const data = await apiFetch(`/api/content?path=${encodeURIComponent(currentFilePath)}${externalParam}`);
      const fileName = currentFilePath.split("/").pop();
      document.getElementById("file-title").textContent = fileName;
      document.title = fileName;
      const contentDiv = document.getElementById("markdown-content");
      const loadingDiv = document.getElementById("loading");
      loadingDiv.style.display = "none";
      const diagramContainer = document.createElement("div");
      diagramContainer.className = "mermaid-container";
      diagramContainer.style.maxWidth = "100%";
      diagramContainer.style.padding = "20px";
      diagramContainer.style.background = "var(--diagram-bg)";
      diagramContainer.style.borderRadius = "8px";
      diagramContainer.style.border = "1px solid var(--border-primary)";
      diagramContainer.style.overflow = "auto";
      const mermaidDiv = document.createElement("div");
      mermaidDiv.className = "mermaid";
      mermaidDiv.textContent = data.content;
      diagramContainer.appendChild(mermaidDiv);
      contentDiv.innerHTML = "";
      contentDiv.appendChild(diagramContainer);
      renderOutline([]);
      if (window.mermaid) {
        try {
          await mermaid.run({ nodes: [mermaidDiv] });
        } catch (mermaidError) {
          console.error("Mermaid render error:", mermaidError);
          mermaidDiv.innerHTML = `<pre style="color: red;">Mermaid syntax error:
${mermaidError.message}</pre><pre>${data.content}</pre>`;
        }
      }
    } catch (error) {
      console.error("Error loading mermaid:", error);
      document.getElementById("loading").innerHTML = `Error: ${error.message}`;
    }
  }
  function loadContent(scrollTo = null) {
    const state3 = getState();
    const currentFilePath = state3.currentFilePath;
    updateFilePathBar(currentFilePath, state3.isExternalFile);
    updateEditButton(currentFilePath);
    if (!currentFilePath)
      return;
    if (currentFilePath.endsWith(".drawio")) {
      loadDrawio();
    } else if (currentFilePath.endsWith(".mermaid") || currentFilePath.endsWith(".mmd")) {
      loadMermaid();
    } else {
      loadMarkdown(scrollTo);
    }
  }

  // public/modules/navigation.js
  function navigateToFile(filePath, isExternal = false, { pushState = true, scrollTo = null } = {}) {
    if (!filePath)
      return;
    if (!confirmAndCloseEditor())
      return;
    updateState({ currentFilePath: filePath, isExternalFile: isExternal });
    const { folderFilter } = getState();
    const params = new URLSearchParams();
    params.set("path", filePath);
    if (isExternal)
      params.set("external", "true");
    if (folderFilter)
      params.set("f", folderFilter);
    const newUrl = `index.html?${params.toString()}`;
    if (pushState) {
      history.pushState({ path: filePath, external: isExternal }, "", newUrl);
    }
    updateActiveHighlight(filePath, isExternal);
    loadContent(scrollTo);
  }
  function updateActiveHighlight(filePath, isExternal) {
    const fileTree = document.getElementById("file-tree");
    if (!fileTree)
      return;
    const allFiles2 = fileTree.querySelectorAll(".tree-file.active");
    allFiles2.forEach((el) => el.classList.remove("active"));
    const allTreeFiles = fileTree.querySelectorAll(".tree-file");
    for (const el of allTreeFiles) {
      const elPath = el.dataset.path;
      const elExternal = el.dataset.external === "true";
      if (elPath === filePath && elExternal === isExternal) {
        el.classList.add("active");
        break;
      }
    }
  }

  // public/modules/file-tree.js
  var LAST_TALK_FILES = [
    { name: "last_talk.md", path: "last_talk.md", type: "markdown" },
    { name: "last_talk_1.md", path: "last_talk_1.md", type: "markdown" },
    { name: "last_talk_2.md", path: "last_talk_2.md", type: "markdown" }
  ];
  var NEST_INDENT = 16;
  var BASE_FILE_PAD = 44;
  var BASE_SUBFOLDER_PAD = 44;
  function renderExternalFileItem(file, isActive, depth = 0) {
    const padLeft = BASE_FILE_PAD + depth * NEST_INDENT;
    const linkStyle = depth > 0 ? ` style="padding-left: ${padLeft}px"` : "";
    return `
    <div class="tree-file ${isActive ? "active" : ""}" data-path="${file.path}" data-external="true">
      <a href="#" class="tree-file-link" title="${file.name}" data-nav-path="${file.path}" data-nav-external="true"${linkStyle}>
        ${getFileIcon(file.name)}
        <span class="tree-file-name">${file.name}</span>
      </a>
      <button class="action-btn delete-btn external-delete-btn" data-delete-type="file" data-delete-path="${file.path}" data-delete-name="${file.name}" data-delete-external="true" title="Xoa file">${TRASH_ICON}</button>
    </div>
  `;
  }
  function renderFileItem(file, isActive) {
    return `
    <div class="tree-file ${isActive ? "active" : ""}" data-path="${file.path}">
      <a href="#" class="tree-file-link" title="${file.name}" data-nav-path="${file.path}" data-nav-external="false">
        ${getFileIcon(file.name)}
        <span class="tree-file-name">${file.name}</span>
      </a>
      ${renderActionButtons(file)}
    </div>
  `;
  }
  function renderActionButtons(file) {
    return `
    <button class="action-btn rename-btn" data-rename-type="file" data-rename-path="${file.path}" data-rename-name="${file.name}" title="Doi ten">${PENCIL_ICON}</button>
    <button class="action-btn move-btn" data-move-path="${file.path}" data-move-name="${file.name}" title="Di chuyen">${MOVE_ICON}</button>
    <button class="action-btn delete-btn" data-delete-type="file" data-delete-path="${file.path}" data-delete-name="${file.name}" title="Xoa file">${TRASH_ICON}</button>
  `;
  }
  function renderFolderHeader(folderId, folderName, { folderPath, extraClass = "", titleAttr = "", actions = "", headerStyle = "" } = {}) {
    const styleAttr = headerStyle ? ` style="${headerStyle}"` : "";
    return `
    <div class="tree-folder-header ${extraClass}" data-folder="${folderId}"${folderPath !== void 0 ? ` data-folder-path="${folderPath}"` : ""}${styleAttr}>
      ${FOLDER_ICON}
      ${CHEVRON_ICON}
      <span class="tree-folder-name"${titleAttr ? ` title="${titleAttr}"` : ""}>${folderName}</span>
      ${actions}
    </div>
  `;
  }
  function buildSubfolderTree(groupedFiles) {
    const root = { files: [], children: {} };
    for (const folderKey of Object.keys(groupedFiles)) {
      const files = groupedFiles[folderKey] || [];
      if (folderKey === ".") {
        root.files = root.files.concat(files);
        continue;
      }
      const parts = folderKey.split("/").filter(Boolean);
      let node = root;
      for (const part of parts) {
        if (!node.children[part]) {
          node.children[part] = { files: [], children: {} };
        }
        node = node.children[part];
      }
      node.files = node.files.concat(files);
    }
    return root;
  }
  function treeContainsActiveFile(node, matches) {
    if (node.files.some(matches))
      return true;
    for (const child of Object.values(node.children)) {
      if (treeContainsActiveFile(child, matches))
        return true;
    }
    return false;
  }
  function makeExternalMatcher(currentFilePath, isExternalFile) {
    if (!isExternalFile || !currentFilePath)
      return () => false;
    return (f) => f.path === currentFilePath;
  }
  function makeProjectMatcher(currentFilePath, isExternalFile) {
    if (isExternalFile || !currentFilePath)
      return () => false;
    return (f) => f.path === currentFilePath;
  }
  function renderNestedExternalSubfolder(name, subPath, subtree, externalRootPath, currentFilePath, isExternalFile, depth) {
    const rootSlug = externalRootPath.replace(/[^a-z0-9]/gi, "-");
    const subSlug = subPath.replace(/[^a-z0-9]/gi, "-");
    const subFolderId = `ext-subfolder-${rootSlug}-${subSlug}`;
    const isExpanded = treeContainsActiveFile(subtree, makeExternalMatcher(currentFilePath, isExternalFile));
    const headerPad = BASE_SUBFOLDER_PAD + depth * NEST_INDENT;
    const contentHtml = renderExternalTreeContent(subtree, externalRootPath, subPath, currentFilePath, isExternalFile, depth + 1);
    return `
    <div class="tree-folder external-subfolder ${isExpanded ? "expanded" : ""}">
      ${renderFolderHeader(subFolderId, name, {
      titleAttr: subPath,
      headerStyle: `padding-left: ${headerPad}px`
    })}
      <div class="tree-folder-content" id="${subFolderId}">
        ${contentHtml}
      </div>
    </div>
  `;
  }
  function renderExternalTreeContent(node, externalRootPath, parentSubPath, currentFilePath, isExternalFile, depth) {
    const sortedFiles = [...node.files].sort((a, b) => a.name.localeCompare(b.name));
    const filesHtml = sortedFiles.map((file) => {
      const isActive = file.path === currentFilePath && isExternalFile;
      return renderExternalFileItem(file, isActive, depth);
    }).join("");
    const sortedChildren = Object.keys(node.children).sort((a, b) => a.localeCompare(b));
    const subfoldersHtml = sortedChildren.map((name) => {
      const subPath = parentSubPath ? `${parentSubPath}/${name}` : name;
      return renderNestedExternalSubfolder(name, subPath, node.children[name], externalRootPath, currentFilePath, isExternalFile, depth);
    }).join("");
    return filesHtml + subfoldersHtml;
  }
  function renderExternalFolderGroup(folderPath, groupedFiles, currentFilePath, isExternalFile) {
    const folderName = folderPath.split("/").pop() || folderPath;
    const folderId = `ext-folder-${folderPath.replace(/[^a-z0-9]/gi, "-")}`;
    const tree = buildSubfolderTree(groupedFiles);
    const isExpanded = treeContainsActiveFile(tree, makeExternalMatcher(currentFilePath, isExternalFile));
    const contentHtml = renderExternalTreeContent(tree, folderPath, "", currentFilePath, isExternalFile, 0);
    const removeBtn = `<button class="action-btn remove-external-btn" data-external-path="${folderPath}" title="Xoa khoi danh sach">${CLOSE_ICON}</button>`;
    return `
    <div class="tree-folder external-folder ${isExpanded ? "expanded" : ""}">
      ${renderFolderHeader(folderId, folderName, { folderPath, extraClass: "external-folder-header", titleAttr: folderPath, actions: removeBtn })}
      <div class="tree-folder-content" id="${folderId}">
        ${contentHtml}
      </div>
    </div>
  `;
  }
  function renderProjectFileItem(file, isActive, depth = 0) {
    const padLeft = BASE_FILE_PAD + depth * NEST_INDENT;
    const linkStyle = depth > 0 ? ` style="padding-left: ${padLeft}px"` : "";
    return `
    <div class="tree-file ${isActive ? "active" : ""}" data-path="${file.path}">
      <a href="#" class="tree-file-link" title="${file.name}" data-nav-path="${file.path}" data-nav-external="false"${linkStyle}>
        ${getFileIcon(file.name)}
        <span class="tree-file-name">${file.name}</span>
      </a>
      ${renderActionButtons(file)}
    </div>
  `;
  }
  function renderProjectFolderActions(name, fullSubPath) {
    return `
    <button class="action-btn rename-btn" data-rename-type="folder" data-rename-path="${fullSubPath}" data-rename-name="${name}" title="Doi ten">${PENCIL_ICON}</button>
    <button class="action-btn delete-btn" data-delete-type="folder" data-delete-path="${fullSubPath}" data-delete-name="${name}" title="Xoa thu muc">${TRASH_ICON}</button>
  `;
  }
  function renderProjectTreeContent(node, parentSubPath, currentFilePath, isExternalFile, depth) {
    const sortedFiles = [...node.files].sort((a, b) => a.name.localeCompare(b.name));
    const filesHtml = sortedFiles.map((file) => {
      const isActive = file.path === currentFilePath && !isExternalFile;
      return renderProjectFileItem(file, isActive, depth);
    }).join("");
    const sortedChildren = Object.keys(node.children).sort((a, b) => a.localeCompare(b));
    const subfoldersHtml = sortedChildren.map((name) => {
      const subPath = parentSubPath ? `${parentSubPath}/${name}` : name;
      return renderNestedProjectSubfolder(name, subPath, node.children[name], currentFilePath, isExternalFile, depth);
    }).join("");
    return filesHtml + subfoldersHtml;
  }
  function renderNestedProjectSubfolder(name, subPath, subtree, currentFilePath, isExternalFile, depth) {
    const folderId = `folder-${subPath.replace(/[^a-z0-9]/gi, "-")}`;
    const isExpanded = treeContainsActiveFile(subtree, makeProjectMatcher(currentFilePath, isExternalFile));
    const headerPad = BASE_SUBFOLDER_PAD + depth * NEST_INDENT;
    const contentHtml = renderProjectTreeContent(subtree, subPath, currentFilePath, isExternalFile, depth + 1);
    return `
    <div class="tree-folder ${isExpanded ? "expanded" : ""}">
      ${renderFolderHeader(folderId, name, {
      folderPath: subPath,
      titleAttr: subPath,
      actions: renderProjectFolderActions(name, subPath),
      headerStyle: `padding-left: ${headerPad}px`
    })}
      <div class="tree-folder-content" id="${folderId}">
        ${contentHtml}
      </div>
    </div>
  `;
  }
  function renderProjectFolderGroup(name, fullSubPath, node, currentFilePath, isExternalFile) {
    const folderId = `folder-${fullSubPath.replace(/[^a-z0-9]/gi, "-")}`;
    const isExpanded = treeContainsActiveFile(node, makeProjectMatcher(currentFilePath, isExternalFile));
    const contentHtml = renderProjectTreeContent(node, fullSubPath, currentFilePath, isExternalFile, 0);
    return `
    <div class="tree-folder ${isExpanded ? "expanded" : ""}">
      ${renderFolderHeader(folderId, name, {
      folderPath: fullSubPath,
      titleAttr: fullSubPath,
      actions: renderProjectFolderActions(name, fullSubPath)
    })}
      <div class="tree-folder-content" id="${folderId}">
        ${contentHtml}
      </div>
    </div>
  `;
  }
  function renderLastTalkSection(files, currentFilePath, isExternalFile) {
    const folderId = "folder-last-talk";
    const isExpanded = files.some((f) => f.path === currentFilePath && !isExternalFile);
    const filesHtml = files.map((file) => {
      const isActive = file.path === currentFilePath && !isExternalFile;
      return renderFileItem(file, isActive);
    }).join("");
    return `
    <div class="tree-folder ${isExpanded ? "expanded" : ""}">
      ${renderFolderHeader(folderId, "Last Talk", { folderPath: "" })}
      <div class="tree-folder-content" id="${folderId}">
        ${filesHtml}
      </div>
    </div>
  `;
  }
  function renderFolderGroup(folder, folderFiles, currentFilePath, isExternalFile) {
    const folderId = `folder-${folder.replace(/[^a-z0-9]/gi, "-")}`;
    const isExpanded = folderFiles.some((f) => f.path === currentFilePath);
    const folderActions = folder !== "Root" ? `
    <button class="action-btn rename-btn" data-rename-type="folder" data-rename-path="${folder}" data-rename-name="${folder}" title="Doi ten">${PENCIL_ICON}</button>
    <button class="action-btn delete-btn" data-delete-type="folder" data-delete-path="${folder}" data-delete-name="${folder}" title="Xoa thu muc">${TRASH_ICON}</button>
  ` : "";
    folderFiles.sort((a, b) => a.name.localeCompare(b.name));
    const filesHtml = folderFiles.map((file) => {
      const isActive = file.path === currentFilePath && !isExternalFile;
      return renderFileItem(file, isActive);
    }).join("");
    return `
    <div class="tree-folder ${isExpanded ? "expanded" : ""}">
      ${renderFolderHeader(folderId, folder, { folderPath: folder === "Root" ? "" : folder, actions: folderActions })}
      <div class="tree-folder-content" id="${folderId}">
        ${filesHtml}
      </div>
    </div>
  `;
  }
  function saveTreeState() {
    const fileTree = document.getElementById("file-tree");
    if (!fileTree)
      return null;
    const expandedIds = [];
    fileTree.querySelectorAll(".tree-folder.expanded").forEach((folder) => {
      const header = folder.querySelector(".tree-folder-header");
      if (header && header.dataset.folder) {
        expandedIds.push(header.dataset.folder);
      }
    });
    return { scrollTop: fileTree.scrollTop, expandedIds };
  }
  function restoreTreeState(state3) {
    if (!state3)
      return;
    const fileTree = document.getElementById("file-tree");
    if (!fileTree)
      return;
    for (const id of state3.expandedIds) {
      const header = fileTree.querySelector(`.tree-folder-header[data-folder="${id}"]`);
      if (header && header.parentElement) {
        header.parentElement.classList.add("expanded");
      }
    }
    fileTree.scrollTop = state3.scrollTop;
  }
  function attachTreeEventHandlers(fileTreeNav) {
    fileTreeNav.addEventListener("click", (e) => {
      const link = e.target.closest(".tree-file-link");
      if (!link)
        return;
      e.preventDefault();
      const path = link.dataset.navPath;
      const isExternal = link.dataset.navExternal === "true";
      if (path) {
        navigateToFile(path, isExternal);
      }
    });
    fileTreeNav.querySelectorAll(".tree-folder-header").forEach((header) => {
      header.addEventListener("click", (e) => {
        if (e.target.closest(".action-btn"))
          return;
        header.parentElement.classList.toggle("expanded");
      });
    });
    fileTreeNav.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const type = btn.dataset.deleteType;
        const path = btn.dataset.deletePath;
        const name = btn.dataset.deleteName;
        const isExternal = btn.dataset.deleteExternal === "true";
        showConfirmDialog(type, path, name, isExternal);
      });
    });
    fileTreeNav.querySelectorAll(".rename-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const type = btn.dataset.renameType;
        const path = btn.dataset.renamePath;
        const name = btn.dataset.renameName;
        showInputDialog("rename", { type, path, name });
      });
    });
    fileTreeNav.querySelectorAll(".move-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const path = btn.dataset.movePath;
        const name = btn.dataset.moveName;
        showMoveDialog(path, name);
      });
    });
    fileTreeNav.querySelectorAll(".remove-external-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const path = btn.dataset.externalPath;
        const filterKey = getState().folderFilter;
        if (filterKey) {
          if (path === filterKey)
            return;
          removeFilterFolder(filterKey, path);
        } else {
          removeFolderFromWorkspace(getActiveWorkspaceId(), path);
        }
        loadFileTree();
      });
    });
  }
  async function loadFileTree() {
    const state3 = getState();
    const currentFilePath = state3.currentFilePath;
    const isExternalFile = state3.isExternalFile;
    const folderFilter = state3.folderFilter;
    if (folderFilter) {
      return loadFilteredFileTree(folderFilter, currentFilePath, isExternalFile);
    }
    try {
      const files = await apiFetch("/api/files");
      const externalFolders = getActiveWorkspaceFolders();
      let externalFiles = {};
      if (externalFolders.length > 0) {
        try {
          const extResponse = await apiFetch("/api/external-files", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paths: externalFolders })
          });
          externalFiles = extResponse;
        } catch (e) {
          console.error("Error loading external files:", e);
        }
      }
      const fileTreeNav = document.getElementById("file-tree");
      const loadingTree = fileTreeNav.querySelector(".loading-tree");
      if (loadingTree) {
        loadingTree.remove();
      }
      const externalHtml = Object.keys(externalFiles).sort().map((folderPath) => renderExternalFolderGroup(folderPath, externalFiles[folderPath], currentFilePath, isExternalFile)).join("");
      const hasRoot = Object.prototype.hasOwnProperty.call(files, "Root");
      const { Root: rootFiles = [], ...nestedFolders } = files;
      const rootHtml = hasRoot ? renderFolderGroup("Root", rootFiles, currentFilePath, isExternalFile) : "";
      const projectTree = buildSubfolderTree(nestedFolders);
      const projectHtml = Object.keys(projectTree.children).sort((a, b) => a.localeCompare(b)).map((name) => renderProjectFolderGroup(name, name, projectTree.children[name], currentFilePath, isExternalFile)).join("");
      fileTreeNav.innerHTML = externalHtml + rootHtml + projectHtml;
      attachTreeEventHandlers(fileTreeNav);
    } catch (error) {
      console.error("Error loading file tree:", error);
    }
  }
  async function loadFilteredFileTree(folderPath, currentFilePath, isExternalFile) {
    try {
      const extraFolders = getFilterFolders(folderPath).filter((p) => p !== folderPath);
      const requestedPaths = [folderPath, ...extraFolders];
      const extResponse = await apiFetch("/api/external-files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paths: requestedPaths })
      });
      const fileTreeNav = document.getElementById("file-tree");
      const loadingTree = fileTreeNav.querySelector(".loading-tree");
      if (loadingTree)
        loadingTree.remove();
      const lastTalkHtml = renderLastTalkSection(LAST_TALK_FILES, currentFilePath, isExternalFile);
      const filterFolderHtml = renderExternalFolderGroup(
        folderPath,
        extResponse[folderPath] || {},
        currentFilePath,
        isExternalFile
      );
      const extraFoldersHtml = extraFolders.map((p) => renderExternalFolderGroup(p, extResponse[p] || {}, currentFilePath, isExternalFile)).join("");
      fileTreeNav.innerHTML = lastTalkHtml + filterFolderHtml + extraFoldersHtml;
      attachTreeEventHandlers(fileTreeNav);
    } catch (error) {
      console.error("Error loading filtered file tree:", error);
    }
  }

  // public/modules/dialogs.js
  var deleteTarget = null;
  function handleConfirmDialogKeydown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      hideConfirmDialog();
    } else if (e.key === "Enter") {
      e.preventDefault();
      executeDelete();
    }
  }
  function createConfirmDialog() {
    const dialog = document.createElement("div");
    dialog.className = "confirm-overlay";
    dialog.id = "confirm-dialog";
    dialog.innerHTML = `
    <div class="confirm-dialog">
      <div class="confirm-header">
        ${WARNING_ICON}
        <h3>Xac nhan xoa</h3>
      </div>
      <div class="confirm-body">
        <p>Ban co chac muon xoa <span class="item-name" id="delete-item-name"></span>?</p>
      </div>
      <div class="confirm-actions">
        <button class="confirm-btn confirm-btn-cancel" id="cancel-delete">Huy</button>
        <button class="confirm-btn confirm-btn-delete" id="confirm-delete">Xoa</button>
      </div>
    </div>
  `;
    document.body.appendChild(dialog);
    document.getElementById("cancel-delete").addEventListener("click", hideConfirmDialog);
    document.getElementById("confirm-delete").addEventListener("click", executeDelete);
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog)
        hideConfirmDialog();
    });
  }
  function showConfirmDialog(type, path, name, isExternal = false) {
    deleteTarget = { type, path, name, isExternal };
    const typeLabel = type === "folder" ? "thu muc" : "file";
    document.getElementById("delete-item-name").textContent = `${typeLabel} "${name}"`;
    document.getElementById("confirm-dialog").classList.add("show");
    document.addEventListener("keydown", handleConfirmDialogKeydown);
  }
  function hideConfirmDialog() {
    document.getElementById("confirm-dialog").classList.remove("show");
    deleteTarget = null;
    document.removeEventListener("keydown", handleConfirmDialogKeydown);
  }
  async function executeDelete() {
    if (!deleteTarget)
      return;
    const { type, path, isExternal } = deleteTarget;
    const endpoint = type === "folder" ? "/api/folder" : "/api/file";
    const externalParam = isExternal ? "&external=true" : "";
    try {
      const data = await apiFetch(`${endpoint}?path=${encodeURIComponent(path)}${externalParam}`, {
        method: "DELETE"
      });
      hideConfirmDialog();
      const treeState = saveTreeState();
      await loadFileTree();
      restoreTreeState(treeState);
      const state3 = getState();
      if (type === "file" && path === state3.currentFilePath) {
        navigateToFile("/", false);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Loi: " + error.message);
      hideConfirmDialog();
    }
  }
  var inputTarget = null;
  function createInputDialog() {
    const dialog = document.createElement("div");
    dialog.className = "confirm-overlay";
    dialog.id = "input-dialog";
    dialog.innerHTML = `
    <div class="confirm-dialog">
      <div class="confirm-header">
        <h3 id="input-dialog-title">Nhap ten</h3>
      </div>
      <div class="confirm-body">
        <input type="text" id="input-dialog-input" class="input-dialog-field" placeholder="Nhap ten..." autocomplete="off">
      </div>
      <div class="confirm-actions">
        <button class="confirm-btn confirm-btn-cancel" id="cancel-input">Huy</button>
        <button class="confirm-btn confirm-btn-ok" id="confirm-input">OK</button>
      </div>
    </div>
  `;
    document.body.appendChild(dialog);
    const inputField = document.getElementById("input-dialog-input");
    document.getElementById("cancel-input").addEventListener("click", hideInputDialog);
    document.getElementById("confirm-input").addEventListener("click", executeInputAction);
    inputField.addEventListener("keydown", (e) => {
      if (e.key === "Enter")
        executeInputAction();
      if (e.key === "Escape")
        hideInputDialog();
    });
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog)
        hideInputDialog();
    });
  }
  function showInputDialog(action, options = {}) {
    inputTarget = { action, ...options };
    const titleEl = document.getElementById("input-dialog-title");
    const inputEl2 = document.getElementById("input-dialog-input");
    if (action === "create-folder") {
      titleEl.textContent = "Tao thu muc moi";
      inputEl2.placeholder = "Nhap ten thu muc...";
      inputEl2.value = "";
    } else if (action === "rename") {
      const typeLabel = options.type === "folder" ? "thu muc" : "file";
      titleEl.textContent = `Doi ten ${typeLabel}`;
      inputEl2.placeholder = "Nhap ten moi...";
      inputEl2.value = options.name || "";
    }
    document.getElementById("input-dialog").classList.add("show");
    setTimeout(() => inputEl2.focus(), 100);
  }
  function hideInputDialog() {
    document.getElementById("input-dialog").classList.remove("show");
    inputTarget = null;
  }
  async function executeInputAction() {
    if (!inputTarget)
      return;
    const inputEl2 = document.getElementById("input-dialog-input");
    const value = inputEl2.value.trim();
    if (!value) {
      alert("Vui long nhap ten");
      return;
    }
    try {
      if (inputTarget.action === "create-folder") {
        const data = await apiFetch("/api/folder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: value })
        });
      } else if (inputTarget.action === "rename") {
        const data = await apiFetch("/api/rename", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            oldPath: inputTarget.path,
            newName: value,
            type: inputTarget.type
          })
        });
        const state3 = getState();
        if (inputTarget.type === "file" && inputTarget.path === state3.currentFilePath) {
          const newPath = inputTarget.path.replace(/[^/]+$/, value);
          hideInputDialog();
          const treeState2 = saveTreeState();
          await loadFileTree();
          restoreTreeState(treeState2);
          navigateToFile(newPath, false);
          return;
        }
      }
      hideInputDialog();
      const treeState = saveTreeState();
      await loadFileTree();
      restoreTreeState(treeState);
    } catch (error) {
      console.error("Action error:", error);
      alert("Loi: " + error.message);
    }
  }
  var moveTarget = null;
  function escapeHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function isHiddenFolder(folderPath) {
    return folderPath.split("/").some((segment) => segment.startsWith("."));
  }
  function buildMoveFolderTree(folderPaths) {
    const root = { children: {} };
    for (const folderPath of folderPaths) {
      let node = root;
      for (const segment of folderPath.split("/")) {
        if (!node.children[segment]) {
          node.children[segment] = { children: {} };
        }
        node = node.children[segment];
      }
    }
    return root;
  }
  function renderMoveFolderNode(name, fullPath, node, currentFolder) {
    const childNames = Object.keys(node.children).sort((a, b) => a.localeCompare(b));
    const isCurrent = fullPath === currentFolder;
    const optionClass = isCurrent ? "folder-option folder-option-disabled" : "folder-option";
    const toggleHtml = childNames.length > 0 ? `<span class="folder-toggle" data-toggle>${CHEVRON_ICON}</span>` : '<span class="folder-toggle folder-toggle-spacer"></span>';
    const childrenHtml = childNames.length > 0 ? `<div class="folder-children">${childNames.map((child) => renderMoveFolderNode(child, `${fullPath}/${child}`, node.children[child], currentFolder)).join("")}</div>` : "";
    return `<div class="folder-node">
    <div class="${optionClass}" data-folder="${escapeHtml(fullPath)}">
      ${toggleHtml}
      ${FOLDER_ICON}
      <span>${escapeHtml(name)}</span>
    </div>
    ${childrenHtml}
  </div>`;
  }
  function handleFolderListClick(e) {
    const toggle = e.target.closest(".folder-toggle[data-toggle]");
    if (toggle) {
      toggle.closest(".folder-node").classList.toggle("expanded");
      return;
    }
    const option = e.target.closest(".folder-option");
    if (option && !option.classList.contains("folder-option-disabled")) {
      executeMove(option.dataset.folder);
    }
  }
  function createMoveDialog() {
    const dialog = document.createElement("div");
    dialog.className = "confirm-overlay";
    dialog.id = "move-dialog";
    dialog.innerHTML = `
    <div class="confirm-dialog move-dialog">
      <div class="confirm-header">
        <h3>Di chuyen file</h3>
      </div>
      <div class="confirm-body">
        <p>Chon thu muc dich cho <span class="item-name" id="move-item-name"></span>:</p>
        <div class="folder-list" id="folder-list"></div>
      </div>
      <div class="confirm-actions">
        <button class="confirm-btn confirm-btn-cancel" id="cancel-move">Huy</button>
      </div>
    </div>
  `;
    document.body.appendChild(dialog);
    document.getElementById("cancel-move").addEventListener("click", hideMoveDialog);
    document.getElementById("folder-list").addEventListener("click", handleFolderListClick);
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog)
        hideMoveDialog();
    });
  }
  async function showMoveDialog(path, name) {
    moveTarget = { path, name };
    document.getElementById("move-item-name").textContent = `"${name}"`;
    const currentFolder = path.includes("/") ? path.substring(0, path.lastIndexOf("/")) : "";
    try {
      const files = await apiFetch("/api/files");
      const visibleFolders = Object.keys(files).filter((f) => f !== "Root" && !isHiddenFolder(f));
      const tree = buildMoveFolderTree(visibleFolders);
      const topLevelNames = Object.keys(tree.children).sort((a, b) => a.localeCompare(b));
      let html = "";
      if (currentFolder !== "") {
        html += `<div class="folder-node">
        <div class="folder-option" data-folder="">
          <span class="folder-toggle folder-toggle-spacer"></span>
          ${FOLDER_ICON}
          <span>Root</span>
        </div>
      </div>`;
      }
      html += topLevelNames.map((topName) => renderMoveFolderNode(topName, topName, tree.children[topName], currentFolder)).join("");
      if (!html) {
        html = '<p class="no-folders">Khong co thu muc khac de di chuyen</p>';
      }
      document.getElementById("folder-list").innerHTML = html;
      document.getElementById("move-dialog").classList.add("show");
    } catch (error) {
      console.error("Error loading folders:", error);
      alert("Loi tai danh sach thu muc");
    }
  }
  function hideMoveDialog() {
    document.getElementById("move-dialog").classList.remove("show");
    moveTarget = null;
  }
  async function executeMove(toFolder) {
    if (!moveTarget)
      return;
    const { path: fromPath, name: fileName } = moveTarget;
    try {
      const data = await apiFetch("/api/file/move", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: fromPath,
          to: toFolder
        })
      });
      hideMoveDialog();
      const treeState = saveTreeState();
      await loadFileTree();
      restoreTreeState(treeState);
      const state3 = getState();
      if (fromPath === state3.currentFilePath) {
        const newPath = toFolder ? `${toFolder}/${fileName}` : fileName;
        navigateToFile(newPath, false);
      }
    } catch (error) {
      console.error("Move error:", error);
      alert("Loi: " + error.message);
    }
  }
  function createAddFolderDialog() {
    const dialog = document.createElement("div");
    dialog.className = "confirm-overlay";
    dialog.id = "add-folder-dialog";
    dialog.innerHTML = `
    <div class="confirm-dialog">
      <div class="confirm-header">
        <h3>Them folder ngoai</h3>
      </div>
      <div class="confirm-body">
        <input type="text" id="add-folder-input" class="input-dialog-field" placeholder="Nhap duong dan folder (vd: /Users/minh/.claude/plans)" autocomplete="off">
        <p class="add-folder-hint">Folder se duoc luu va hien thi sau khi refresh trang</p>
      </div>
      <div class="confirm-actions">
        <button class="confirm-btn confirm-btn-cancel" id="cancel-add-folder">Huy</button>
        <button class="confirm-btn confirm-btn-ok" id="confirm-add-folder">Them</button>
      </div>
    </div>
  `;
    document.body.appendChild(dialog);
    const inputField = document.getElementById("add-folder-input");
    document.getElementById("cancel-add-folder").addEventListener("click", hideAddFolderDialog);
    document.getElementById("confirm-add-folder").addEventListener("click", executeAddFolder);
    inputField.addEventListener("keydown", (e) => {
      if (e.key === "Enter")
        executeAddFolder();
      if (e.key === "Escape")
        hideAddFolderDialog();
    });
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog)
        hideAddFolderDialog();
    });
  }
  function showAddFolderDialog() {
    const inputEl2 = document.getElementById("add-folder-input");
    inputEl2.value = "";
    document.getElementById("add-folder-dialog").classList.add("show");
    setTimeout(() => inputEl2.focus(), 100);
  }
  function hideAddFolderDialog() {
    document.getElementById("add-folder-dialog").classList.remove("show");
  }
  async function executeAddFolder() {
    const inputEl2 = document.getElementById("add-folder-input");
    const folderPath = inputEl2.value.trim();
    if (!folderPath) {
      alert("Vui long nhap duong dan folder");
      return;
    }
    try {
      const data = await apiFetch("/api/validate-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: folderPath })
      });
      if (!data.valid) {
        alert("Loi: " + (data.error || "Folder khong hop le"));
        return;
      }
      const filterKey = getState().folderFilter;
      if (filterKey) {
        addFilterFolder(filterKey, folderPath);
      } else {
        addFolderToWorkspace(getActiveWorkspaceId(), folderPath);
      }
      hideAddFolderDialog();
      const treeState = saveTreeState();
      await loadFileTree();
      restoreTreeState(treeState);
    } catch (error) {
      console.error("Error adding folder:", error);
      alert("Loi: " + error.message);
    }
  }
  function initDialogs() {
    createConfirmDialog();
    createInputDialog();
    createMoveDialog();
    createAddFolderDialog();
  }

  // public/modules/workspace-tabs.js
  var CONTAINER_ID = "workspace-tabs";
  var DEFAULT_WORKSPACE_ID2 = "ws-default";
  function escapeHtml2(str) {
    return String(str).replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[ch]);
  }
  var TAB_STYLES = `
  :host {
    display: block;
    background: transparent;
  }
  .root {
    --bg: #ffffff;
    --tab-hover: #eaeef2;
    --tab-active: #f6f8fa;
    --border: #d8dee4;
    --border-strong: #d1d9e0;
    --text: #1f2328;
    --text-muted: #6e7781;
    --danger: #cf222e;

    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: thin;
    padding: 2px 0;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  }
  :host([data-theme="dark"]) .root {
    --bg: #282c34;
    --tab-hover: #383E4A;
    --tab-active: #2c313a;
    --border: #3B4048;
    --border-strong: #181A1F;
    --text: #abb2bf;
    --text-muted: #5c6370;
  }
  .tab {
    position: relative;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    border: 1px solid transparent;
    border-radius: 6px;
    background: transparent;
    transition: background 0.12s, border-color 0.12s;
    max-width: 200px;
  }
  .tab:hover { background: var(--tab-hover); }
  .tab.active {
    background: var(--tab-active);
    border-color: var(--border);
  }
  .tab-select {
    flex: 1;
    min-width: 0;
    padding: 4px 8px;
    border: none;
    background: transparent;
    color: var(--text-muted);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
    font-family: inherit;
  }
  .tab.active .tab-select {
    color: var(--text);
    font-weight: 600;
  }
  .tab-name {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: middle;
  }
  .tab-action {
    display: none;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    margin-right: 2px;
    padding: 0;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
  }
  .tab-action svg { width: 12px; height: 12px; fill: currentColor; }
  .tab:hover .tab-action,
  .tab.active .tab-action { display: inline-flex; }
  .tab-action:hover {
    background: var(--tab-hover);
    color: var(--text);
  }
  .tab-delete:hover { color: var(--danger); }
  .tab-add {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    padding: 0;
    border: 1px dashed var(--border);
    border-radius: 6px;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    transition: background 0.12s, color 0.12s, border-color 0.12s;
  }
  .tab-add svg { width: 12px; height: 12px; fill: currentColor; }
  .tab-add:hover {
    background: var(--tab-hover);
    color: var(--text);
    border-color: var(--border-strong);
  }
`;
  var shadowRoot = null;
  var modalRoot = null;
  function ensureShadow() {
    if (shadowRoot)
      return shadowRoot;
    const host = document.getElementById(CONTAINER_ID);
    if (!host)
      return null;
    shadowRoot = host.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = TAB_STYLES;
    const root = document.createElement("div");
    root.className = "root";
    shadowRoot.appendChild(style);
    shadowRoot.appendChild(root);
    syncTheme(host);
    const themeObserver = new MutationObserver(() => syncTheme(host));
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    root.addEventListener("click", onClick);
    return shadowRoot;
  }
  function syncTheme(host) {
    const theme = document.documentElement.getAttribute("data-theme") || "light";
    if (theme === "dark")
      host.setAttribute("data-theme", "dark");
    else
      host.removeAttribute("data-theme");
  }
  function getRoot() {
    return shadowRoot ? shadowRoot.querySelector(".root") : null;
  }
  function renderTab(workspace, activeId) {
    const isActive = workspace.id === activeId;
    const isDefault = workspace.id === DEFAULT_WORKSPACE_ID2;
    const deleteBtn = isDefault ? "" : `<button class="tab-action tab-delete" data-action="delete" data-workspace-id="${workspace.id}" title="Xo\xE1 workspace">${TRASH_ICON}</button>`;
    return `
    <div class="tab ${isActive ? "active" : ""}" data-workspace-id="${workspace.id}">
      <button class="tab-select" data-action="select" data-workspace-id="${workspace.id}" title="${escapeHtml2(workspace.name)}">
        <span class="tab-name">${escapeHtml2(workspace.name)}</span>
      </button>
      <button class="tab-action tab-rename" data-action="rename" data-workspace-id="${workspace.id}" title="\u0110\u1ED5i t\xEAn">${PENCIL_ICON}</button>
      ${deleteBtn}
    </div>
  `;
  }
  function renderAddButton() {
    return `
    <button class="tab-add" data-action="create" title="T\u1EA1o workspace m\u1EDBi">${PLUS_ICON}</button>
  `;
  }
  function onClick(e) {
    const btn = e.target.closest("[data-action]");
    if (!btn)
      return;
    e.preventDefault();
    e.stopPropagation();
    const action = btn.dataset.action;
    const id = btn.dataset.workspaceId;
    switch (action) {
      case "select":
        return handleSelect(id);
      case "create":
        return handleCreate();
      case "rename":
        return handleRename(id);
      case "delete":
        return handleDelete(id);
    }
  }
  function renderWorkspaceTabs() {
    const host = document.getElementById(CONTAINER_ID);
    if (!host)
      return;
    if (getState().folderFilter) {
      host.style.display = "none";
      return;
    }
    host.style.display = "";
    ensureShadow();
    const root = getRoot();
    if (!root)
      return;
    const workspaces = getWorkspaces();
    const activeId = getActiveWorkspaceId();
    root.innerHTML = workspaces.map((ws) => renderTab(ws, activeId)).join("") + renderAddButton();
  }
  function ensureModalRoot() {
    if (modalRoot)
      return modalRoot;
    modalRoot = document.createElement("div");
    modalRoot.id = "ws-modal-root";
    document.body.appendChild(modalRoot);
    return modalRoot;
  }
  function closeModal() {
    if (modalRoot)
      modalRoot.innerHTML = "";
  }
  function wkPrompt(title, defaultValue = "") {
    return new Promise((resolve) => {
      const root = ensureModalRoot();
      root.innerHTML = `
      <div class="ws-modal-backdrop">
        <div class="ws-modal">
          <div class="ws-modal-title">${escapeHtml2(title)}</div>
          <input type="text" class="ws-modal-input" value="${escapeHtml2(defaultValue)}" />
          <div class="ws-modal-actions">
            <button type="button" class="ws-modal-btn ws-modal-cancel">Hu\u1EF7</button>
            <button type="button" class="ws-modal-btn ws-modal-ok">OK</button>
          </div>
        </div>
      </div>
    `;
      const input = root.querySelector(".ws-modal-input");
      const okBtn = root.querySelector(".ws-modal-ok");
      const cancelBtn = root.querySelector(".ws-modal-cancel");
      const backdrop = root.querySelector(".ws-modal-backdrop");
      const finish = (value) => {
        closeModal();
        resolve(value);
      };
      okBtn.addEventListener("click", () => finish(input.value));
      cancelBtn.addEventListener("click", () => finish(null));
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop)
          finish(null);
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter")
          finish(input.value);
        else if (e.key === "Escape")
          finish(null);
      });
      setTimeout(() => {
        input.focus();
        input.select();
      }, 10);
    });
  }
  function wkConfirm(message) {
    return new Promise((resolve) => {
      const root = ensureModalRoot();
      root.innerHTML = `
      <div class="ws-modal-backdrop">
        <div class="ws-modal">
          <div class="ws-modal-message">${escapeHtml2(message)}</div>
          <div class="ws-modal-actions">
            <button type="button" class="ws-modal-btn ws-modal-cancel">Hu\u1EF7</button>
            <button type="button" class="ws-modal-btn ws-modal-ok ws-modal-danger">OK</button>
          </div>
        </div>
      </div>
    `;
      const okBtn = root.querySelector(".ws-modal-ok");
      const cancelBtn = root.querySelector(".ws-modal-cancel");
      const backdrop = root.querySelector(".ws-modal-backdrop");
      const finish = (value) => {
        closeModal();
        resolve(value);
      };
      okBtn.addEventListener("click", () => finish(true));
      cancelBtn.addEventListener("click", () => finish(false));
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop)
          finish(false);
      });
      setTimeout(() => okBtn.focus(), 10);
    });
  }
  var wkAlert = (msg) => wkConfirm(msg);
  async function handleSelect(workspaceId) {
    if (workspaceId === getActiveWorkspaceId())
      return;
    setActiveWorkspaceId(workspaceId);
    renderWorkspaceTabs();
    await loadFileTree();
  }
  async function handleCreate() {
    const name = await wkPrompt("T\xEAn workspace m\u1EDBi:");
    if (name === null)
      return;
    const trimmed = name.trim();
    if (!trimmed) {
      await wkAlert("T\xEAn workspace kh\xF4ng \u0111\u01B0\u1EE3c r\u1ED7ng");
      return;
    }
    try {
      const ws = createWorkspace(trimmed);
      setActiveWorkspaceId(ws.id);
      renderWorkspaceTabs();
      await loadFileTree();
    } catch (err) {
      await wkAlert("L\u1ED7i: " + err.message);
    }
  }
  async function handleRename(workspaceId) {
    const current = getWorkspaces().find((w) => w.id === workspaceId);
    if (!current)
      return;
    const next = await wkPrompt("\u0110\u1ED5i t\xEAn workspace:", current.name);
    if (next === null)
      return;
    const trimmed = next.trim();
    if (!trimmed) {
      await wkAlert("T\xEAn workspace kh\xF4ng \u0111\u01B0\u1EE3c r\u1ED7ng");
      return;
    }
    if (trimmed === current.name)
      return;
    try {
      renameWorkspace(workspaceId, trimmed);
      renderWorkspaceTabs();
    } catch (err) {
      await wkAlert("L\u1ED7i: " + err.message);
    }
  }
  async function handleDelete(workspaceId) {
    const ws = getWorkspaces().find((w) => w.id === workspaceId);
    if (!ws)
      return;
    const folderCount = ws.folderPaths.length;
    const msg = folderCount > 0 ? `Xo\xE1 workspace "${ws.name}"? ${folderCount} folder s\u1EBD chuy\u1EC3n sang Default.` : `Xo\xE1 workspace "${ws.name}"?`;
    const ok = await wkConfirm(msg);
    if (!ok)
      return;
    const wasActive = workspaceId === getActiveWorkspaceId();
    try {
      deleteWorkspace(workspaceId);
      renderWorkspaceTabs();
      if (wasActive)
        await loadFileTree();
    } catch (err) {
      await wkAlert("L\u1ED7i: " + err.message);
    }
  }

  // public/modules/search.js
  var isSearchMode = false;
  var lastSearchData = null;
  var lastSearchQuery = null;
  var lastSearchScope = null;
  function getCurrentFolder() {
    const state3 = getState();
    const currentFilePath = state3.currentFilePath;
    const isExternalFile = state3.isExternalFile;
    if (!currentFilePath)
      return null;
    if (isExternalFile) {
      const lastSlash = currentFilePath.lastIndexOf("/");
      return lastSlash > 0 ? currentFilePath.substring(0, lastSlash) : currentFilePath;
    } else {
      const lastSlash = currentFilePath.lastIndexOf("/");
      return lastSlash > 0 ? currentFilePath.substring(0, lastSlash) : "";
    }
  }
  function getSearchScope() {
    const selected = document.querySelector('input[name="search-scope"]:checked');
    return selected ? selected.value : "folder";
  }
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  function highlightMatch(text, query) {
    const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
    return text.replace(regex, '<span class="search-match-highlight">$1</span>');
  }
  function renderSearchResults(data, query, scope = "folder") {
    const state3 = getState();
    const isExternalFile = state3.isExternalFile;
    const fileTreeNav = document.getElementById("file-tree");
    const folder = getCurrentFolder();
    const folderDisplay = isExternalFile ? folder.split("/").pop() : folder || "Root";
    const scopeLabel = scope === "all" ? "tat ca" : folderDisplay;
    if (data.results.length === 0) {
      fileTreeNav.innerHTML = `
      <div class="search-results">
        <div class="search-results-header">
          Tim "${query}" trong ${scopeLabel}
        </div>
        <div class="search-no-results">Khong tim thay ket qua</div>
      </div>
    `;
      return;
    }
    let html = `
    <div class="search-results">
      <div class="search-results-header">
        Tim thay ${data.totalMatches} ket qua trong ${data.totalFiles} file (${scopeLabel})
      </div>
  `;
    for (const result of data.results) {
      const file = result.file;
      const fileIcon = getFileIcon(file.name);
      const externalParam = file.isExternal ? "&external=true" : "";
      let folderInfo = "";
      if (scope === "all") {
        if (file.isExternal) {
          const parts = file.path.split("/");
          parts.pop();
          const folderName = parts.pop() || "External";
          folderInfo = `<span class="search-result-folder">${folderName}/</span>`;
        } else {
          const fileParts = file.path.split("/");
          if (fileParts.length > 1) {
            fileParts.pop();
            folderInfo = `<span class="search-result-folder">${fileParts.join("/")}/</span>`;
          } else {
            folderInfo = `<span class="search-result-folder">Root/</span>`;
          }
        }
      }
      html += `
      <div class="search-result-item">
        <div class="search-result-file" data-path="${file.path}" data-external="${file.isExternal}">
          ${fileIcon}
          <span>${folderInfo}${file.name}</span>
        </div>
        <div class="search-result-matches">
    `;
      for (const match of result.matches) {
        const highlightedContent = highlightMatch(match.content, query);
        html += `
        <a href="#" class="search-match-line" data-nav-path="${file.path}" data-nav-external="${file.isExternal}" data-nav-line="${match.line}">
          <span class="line-number">${match.line}:</span>${highlightedContent}
        </a>
      `;
      }
      html += `
        </div>
      </div>
    `;
    }
    html += "</div>";
    fileTreeNav.innerHTML = html;
    const fileHeaders = fileTreeNav.querySelectorAll(".search-result-file");
    fileHeaders.forEach((header) => {
      header.addEventListener("click", () => {
        const path = header.dataset.path;
        const isExternal = header.dataset.external === "true";
        navigateToFile(path, isExternal);
      });
    });
    const matchLinks = fileTreeNav.querySelectorAll(".search-match-line");
    matchLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const path = link.dataset.navPath;
        const isExternal = link.dataset.navExternal === "true";
        const line = Number.parseInt(link.dataset.navLine, 10);
        navigateToFile(path, isExternal, { scrollTo: { line, query } });
      });
    });
  }
  async function performSearch(query) {
    const state3 = getState();
    const currentFilePath = state3.currentFilePath;
    const isExternalFile = state3.isExternalFile;
    if (!query.trim()) {
      clearSearch();
      return;
    }
    const scope = getSearchScope();
    const folder = getCurrentFolder();
    if (scope === "folder" && folder === null && !currentFilePath) {
      alert("Vui long mo mot file truoc khi tim kiem");
      return;
    }
    try {
      let url;
      if (scope === "all") {
        const externalFolders = getActiveWorkspaceFolders();
        url = `/api/search?query=${encodeURIComponent(query)}&scope=all&externalFolders=${encodeURIComponent(JSON.stringify(externalFolders))}`;
      } else {
        const externalParam = isExternalFile ? "&external=true" : "";
        const folderParam = folder !== null ? folder : "";
        url = `/api/search?query=${encodeURIComponent(query)}&folder=${encodeURIComponent(folderParam)}${externalParam}&scope=folder`;
      }
      const data = await apiFetch(url);
      lastSearchData = data;
      lastSearchQuery = query;
      lastSearchScope = scope;
      isSearchMode = true;
      sessionStorage.setItem("searchState", JSON.stringify({
        query,
        scope,
        data
      }));
      renderSearchResults(data, query, scope);
      const clearSearchBtn = document.getElementById("clear-search-btn");
      if (clearSearchBtn) {
        clearSearchBtn.classList.add("visible");
      }
    } catch (error) {
      console.error("Search error:", error);
      alert("Loi tim kiem: " + error.message);
    }
  }
  function clearSearch() {
    const searchInput2 = document.getElementById("search-input");
    const clearSearchBtn = document.getElementById("clear-search-btn");
    if (searchInput2)
      searchInput2.value = "";
    if (clearSearchBtn)
      clearSearchBtn.classList.remove("visible");
    isSearchMode = false;
    lastSearchData = null;
    lastSearchQuery = null;
    lastSearchScope = null;
    sessionStorage.removeItem("searchState");
    loadFileTree();
  }
  function restoreSearchState() {
    const savedState = sessionStorage.getItem("searchState");
    if (savedState) {
      try {
        const state3 = JSON.parse(savedState);
        lastSearchData = state3.data;
        lastSearchQuery = state3.query;
        lastSearchScope = state3.scope;
        isSearchMode = true;
        const searchInput2 = document.getElementById("search-input");
        const clearSearchBtn = document.getElementById("clear-search-btn");
        if (searchInput2)
          searchInput2.value = state3.query;
        if (clearSearchBtn)
          clearSearchBtn.classList.add("visible");
        const scopeRadio = document.querySelector(`input[name="search-scope"][value="${state3.scope}"]`);
        if (scopeRadio) {
          scopeRadio.checked = true;
        }
        return true;
      } catch (e) {
        console.error("Error restoring search state:", e);
        sessionStorage.removeItem("searchState");
      }
    }
    return false;
  }
  function showSearchResults() {
    if (!isSearchMode || !lastSearchData)
      return false;
    renderSearchResults(lastSearchData, lastSearchQuery, lastSearchScope);
    return true;
  }
  function hideSearchResults() {
    if (!isSearchMode)
      return;
    loadFileTree();
  }
  function setupSearchListeners() {
    const searchInput2 = document.getElementById("search-input");
    const clearSearchBtn = document.getElementById("clear-search-btn");
    const searchPanel2 = document.getElementById("search-panel");
    const toggleSearchBtn = document.getElementById("toggle-search-btn");
    if (searchInput2) {
      searchInput2.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          performSearch(searchInput2.value);
        } else if (e.key === "Escape") {
          e.preventDefault();
          if (isSearchMode) {
            clearSearch();
          } else {
            searchInput2.blur();
          }
        }
      });
      searchInput2.addEventListener("input", () => {
        if (searchInput2.value) {
          if (clearSearchBtn)
            clearSearchBtn.classList.add("visible");
        } else {
          if (clearSearchBtn)
            clearSearchBtn.classList.remove("visible");
          if (isSearchMode) {
            clearSearch();
          }
        }
      });
    }
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener("click", () => {
        clearSearch();
        if (searchInput2)
          searchInput2.focus();
      });
    }
    if (toggleSearchBtn && searchPanel2) {
      toggleSearchBtn.addEventListener("click", () => {
        const isVisible = searchPanel2.style.display !== "none";
        if (isVisible) {
          searchPanel2.style.display = "none";
          hideSearchResults();
        } else {
          searchPanel2.style.display = "block";
          showSearchResults();
          if (searchInput2)
            searchInput2.focus();
        }
      });
    }
    const hideSearchBtn = document.getElementById("hide-search-btn");
    if (hideSearchBtn && searchPanel2) {
      hideSearchBtn.addEventListener("click", () => {
        searchPanel2.style.display = "none";
        hideSearchResults();
      });
    }
  }

  // public/modules/keyboard.js
  function setupKeyboardNavigation() {
    document.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable) {
        return;
      }
      const links = document.querySelectorAll(".outline-link");
      if (links.length === 0)
        return;
      let currentIndex = -1;
      links.forEach((link, index) => {
        if (link.classList.contains("active")) {
          currentIndex = index;
        }
      });
      let newIndex = -1;
      if (e.key === "j" || e.key === "J") {
        e.preventDefault();
        if (currentIndex === -1) {
          newIndex = 0;
        } else {
          newIndex = Math.min(currentIndex + 1, links.length - 1);
        }
      } else if (e.key === "k" || e.key === "K") {
        e.preventDefault();
        if (currentIndex === -1) {
          newIndex = 0;
        } else {
          newIndex = Math.max(currentIndex - 1, 0);
        }
      }
      if (newIndex !== -1 && newIndex !== currentIndex) {
        links.forEach((l) => l.classList.remove("active"));
        links[newIndex].classList.add("active");
        const targetId = links[newIndex].getAttribute("href").substring(1);
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        links[newIndex].scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  }
  function setupHotkeys(searchPanel2, searchInput2, toggleLeftPanel2) {
    document.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable) {
        return;
      }
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        searchPanel2.style.display = "block";
        showSearchResults();
        searchInput2.focus();
      } else if (e.key === "l" || e.key === "L") {
        e.preventDefault();
        const { folderFilter } = getState();
        if (!folderFilter) {
          navigateToFile("last_talk.md", false);
          return;
        }
        apiFetch(`/api/last-talk?folder=${encodeURIComponent(folderFilter)}`).then((data) => {
          navigateToFile(data.path, true);
        }).catch((error) => {
          console.error("Error getting last_talk session:", error);
          alert("Khong co file last_talk trong thu muc nay");
        });
      } else if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        apiFetch("/api/latest-plan").then((data) => {
          navigateToFile(data.path, true);
        }).catch((error) => {
          console.error("Error getting latest plan:", error);
          alert("Loi: " + error.message);
        });
      } else if (e.key === "e" || e.key === "E") {
        e.preventDefault();
        enterEditMode();
      } else if (e.key === "a" || e.key === "A") {
        if (typeof toggleLeftPanel2 === "function") {
          e.preventDefault();
          toggleLeftPanel2();
        }
      } else if (e.key === "s" || e.key === "S") {
        const { folderFilter } = getState();
        if (!folderFilter)
          return;
        e.preventDefault();
        apiFetch(`/api/latest-session?folder=${encodeURIComponent(folderFilter)}`).then((data) => {
          navigateToFile(data.path, true);
        }).catch((error) => {
          console.error("Error getting latest session:", error);
          alert("Loi: " + error.message);
        });
      }
    });
  }

  // public/styles.css
  var styles_default = `/* ========================================
   MINIMALIST DOCUMENT READER
   GitHub-style typography
   ======================================== */

:root {
  /* Pure White Theme */
  --bg-primary: #ffffff;
  --bg-secondary: #f6f8fa;
  --bg-tertiary: #f6f8fa;
  --bg-hover: #eaeef2;

  /* Text Colors - GitHub style */
  --text-primary: #000;
  --text-secondary: #333;
  --text-tertiary: #666;

  /* Accent - GitHub blue */
  --accent-primary: #0969da;
  --accent-hover: #0550ae;
  --accent-light: #ddf4ff;

  /* Borders - GitHub style */
  --border-primary: #d1d9e0;
  --border-secondary: #d8dee4;

  /* Markdown heading colors (light theme) */
  --md-h1: darkblue;
  --md-h2: darkgreen;
  --md-h3: darkorchid;
  --md-h4: darkred;
  --md-h5: darkcyan;
  --md-h6: darkgoldenrod;
  --md-strong: #1055C9;
  --md-link-active: blue;
  --md-pre-bg: #ECFAE5;
  --md-pre-fg: #332D56;
  --md-code-bg: rgb(246 186 140 / 20%);
  --md-search-highlight-bg: #fff3bf;
  --diagram-bg: #ffffff;

  /* Typography - GitHub style (system fonts) */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
  --font-mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;

  /* Spacing */
  --header-height: 0px;
  --sidebar-width: 330px;
  --left-sidebar-width: 330px;
  --right-sidebar-width: 330px;
  --resize-handle-width: 5px;

  /* Content zoom */
  --content-base-size: 16px;
  --content-zoom: 1;
}

/* ========================================
   DARK THEME \u2014 One Monokai
   ======================================== */
[data-theme="dark"] {
  /* Backgrounds */
  --bg-primary: #282c34;       /* editor.background */
  --bg-secondary: #21252b;     /* sideBar.background */
  --bg-tertiary: #2c313a;      /* list.activeSelectionBackground */
  --bg-hover: #383E4A;         /* editor.lineHighlightBackground */

  /* Text */
  --text-primary: #d7dae0;     /* activityBar.foreground */
  --text-secondary: #abb2bf;   /* terminal.foreground */
  --text-tertiary: #676f7d;    /* comment */

  /* Accent \u2014 One Monokai blue + class blue */
  --accent-primary: #528bff;
  --accent-hover: #61afef;
  --accent-light: #314365;     /* editor.findMatchHighlightBackground */

  /* Borders */
  --border-primary: #181A1F;
  --border-secondary: #3B4048;

  /* Markdown */
  --md-h1: #61afef;            /* class blue */
  --md-h2: #98c379;            /* function green */
  --md-h3: #c678dd;            /* number magenta */
  --md-h4: #e06c75;            /* keyword red */
  --md-h5: #56b6c2;            /* constant cyan */
  --md-h6: #e5c07b;            /* string yellow */
  --md-strong: #61afef;
  --md-link-active: #61afef;
  --md-pre-bg: #21252B;
  --md-pre-fg: #abb2bf;
  --md-code-bg: rgba(86, 182, 194, 0.15);
  --md-search-highlight-bg: #42557B;
  --diagram-bg: #21252b;
}

/* Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-sans);
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.6;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Header - Hidden */
.viewer-header {
  display: none;
}

/* ========================================
   LAYOUT - 3 COLUMNS
   ======================================== */

.viewer-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.viewer-layout {
  display: grid;
  grid-template-columns: var(--left-sidebar-width) var(--resize-handle-width) 1fr var(--resize-handle-width) var(--right-sidebar-width);
  /* Fill the space left under .workspace-bar instead of a fixed 100vh \u2014
   * an oversized layout makes the document scrollable by the toolbar's
   * height, and scrollIntoView() (outline/keyboard nav) then pushes the
   * toolbar off-screen permanently (body overflow is hidden). */
  flex: 1;
  min-height: 0;
}

body.left-panel-hidden .viewer-layout {
  grid-template-columns: 1fr var(--resize-handle-width) var(--right-sidebar-width);
}

body.left-panel-hidden .file-tree-sidebar,
body.left-panel-hidden #resize-handle-left {
  display: none;
}

/* ========================================
   RESIZE HANDLES
   ======================================== */

.resize-handle {
  cursor: col-resize;
  background: transparent;
  position: relative;
  z-index: 50;
  transition: background 0.15s ease;
  user-select: none;
}

.resize-handle::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: -2px;
  right: -2px;
}

.resize-handle:hover,
.resize-handle.dragging {
  background: var(--accent-primary);
}

body.resizing,
body.resizing * {
  cursor: col-resize !important;
  user-select: none !important;
}

/* ========================================
   LEFT SIDEBAR - FILE TREE
   ======================================== */

.file-tree-sidebar {
  background: var(--bg-primary);
  border-right: 1px solid var(--border-primary);
  overflow-y: auto;
  overflow-x: hidden;
}

/* Sidebar header now only hosts the mobile close button + the toggled search
 * panel, so it stays collapsed until one of those is visible (each supplies
 * its own spacing). */
.file-tree-header {
  position: sticky;
  top: 0;
  background: var(--bg-primary);
  z-index: 10;
}

/* Top toolbar: logo + action buttons + workspace tabs, all on one row. */
.workspace-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
}

/* #workspace-tabs is a shadow-DOM host \u2014 visual styles live inside the
 * shadow root (see public/modules/workspace-tabs.js). Note: do NOT apply
 * :empty hiding here \u2014 shadow children are invisible to :empty so the host
 * always matches it. It fills the remaining toolbar width; long tab lists
 * scroll inside the shadow root. */
#workspace-tabs { flex: 1; min-width: 0; }

/* Workspace modal (WKWebView-safe) */
#ws-modal-root:empty { display: none; }
.ws-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
}
.ws-modal {
  background: var(--bg-primary);
  color: var(--text-primary, inherit);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 20px;
  min-width: 320px;
  max-width: 90vw;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.ws-modal-title,
.ws-modal-message {
  font-size: 14px;
  font-weight: 600;
}
.ws-modal-input {
  padding: 8px 10px;
  border: 1px solid var(--border-primary);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-primary, inherit);
  font: inherit;
  font-size: 13px;
  width: 100%;
  box-sizing: border-box;
}
.ws-modal-input:focus { outline: 2px solid #0969da; outline-offset: -2px; }
.ws-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.ws-modal-btn {
  padding: 6px 14px;
  border: 1px solid var(--border-primary);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-primary, inherit);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.ws-modal-btn:hover { background: var(--bg-hover); }
.ws-modal-ok {
  background: #0969da;
  color: #fff;
  border-color: #0969da;
}
.ws-modal-ok:hover { background: #0860c7; }
.ws-modal-danger {
  background: #cf222e;
  border-color: #cf222e;
}
.ws-modal-danger:hover { background: #b21724; }

/* (workspace tab styles moved into Shadow DOM \u2014 see modules/workspace-tabs.js) */

.header-logo {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}

.logo-link {
  display: flex;
  transition: transform 0.15s ease;
}

.logo-link:hover {
  transform: scale(1.1);
}

.close-sidebar {
  display: none;
  background: none;
  border: none;
  color: var(--text-tertiary);
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  transition: color 0.15s ease;
}

.close-sidebar:hover {
  color: var(--text-primary);
}

.file-tree {
  padding: 8px 0;
}

.loading-tree {
  padding: 20px;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 13px;
}

/* Tree Folder */
.tree-folder {
  margin-bottom: 2px;
}

.tree-folder-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  cursor: pointer;
  user-select: none;
  transition: background 0.1s ease;
}

.tree-folder-header:hover {
  background: var(--bg-tertiary);
}

.tree-icon {
  flex-shrink: 0;
  fill: var(--text-tertiary);
  transition: all 0.15s ease;
}

.chevron-icon {
  transform: rotate(-90deg);
  transition: transform 0.15s ease;
}

.tree-folder.expanded > .tree-folder-header > .chevron-icon {
  transform: rotate(0deg);
}

.tree-folder-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.tree-folder-content {
  interpolate-size: allow-keywords;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.2s ease;
}

.tree-folder.expanded > .tree-folder-content {
  max-height: max-content;
}

/* Tree File */
.tree-file {
  display: flex;
  align-items: center;
  position: relative;
  transition: all 0.1s ease;
}

.tree-file-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 40px 8px 44px;
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 13px;
  flex: 1;
  min-width: 0;
}

.tree-file:hover {
  background: var(--bg-tertiary);
}

.tree-file:hover .tree-file-link {
  color: var(--text-primary);
}

.tree-file.active {
  background: var(--bg-tertiary);
}

.tree-file.active .tree-file-link {
  color: var(--md-link-active);
  font-weight: 500;
}

.tree-file-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ========================================
   MAIN CONTENT - Reading Optimized
   ======================================== */

.viewer-content {
  background: var(--bg-primary);
  overflow-y: auto;
  padding: 20px 20px 40px;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

/* Floating actions pinned to the content's top-right corner.
   height: 0 keeps the sticky wrapper out of the layout flow. */
.content-float-actions {
  position: sticky;
  top: 0;
  height: 0;
  display: flex;
  justify-content: flex-end;
  z-index: 50;
}

.content-float-actions .action-btn {
  width: 32px;
  height: 32px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.content-float-actions .action-btn:hover {
  background: var(--bg-hover);
}

.content-float-actions .action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.content-float-actions .action-btn:disabled:hover {
  background: var(--bg-secondary);
}

.content-float-actions .action-btn:disabled svg {
  fill: var(--text-tertiary);
}

.loading {
  padding: 80px 20px;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 14px;
}

/* Markdown Styles - GitHub-style */
.markdown-body {
  font-family: var(--font-sans);
  font-size: calc(var(--content-base-size) * var(--content-zoom));
  line-height: 1.5;
  color: var(--text-primary);
  word-wrap: break-word;
}

.markdown-body > *:first-child {
  margin-top: 0 !important;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
  color: var(--text-primary);
  scroll-margin-top: 16px;
}
.markdown-body h1 {
  color: var(--md-h1)!important;
}
.markdown-body h2 {
  color: var(--md-h2)!important;
}
.markdown-body h3 {
  color: var(--md-h3)!important;
}
.markdown-body h4 {
  color: var(--md-h4)!important;
}
.markdown-body h5 {
  color: var(--md-h5)!important;
}
.markdown-body h6 {
  color: var(--md-h6)!important;
}
.markdown-body strong {
  color: var(--md-strong);
}

.markdown-body h1 {
  font-size: 2em;
  font-weight: 600;
  padding-bottom: 0.3em;
  border-bottom: 1px solid var(--border-secondary);
}

.markdown-body h2 {
  font-size: 1.5em;
  font-weight: 600;
  padding-bottom: 0.3em;
  border-bottom: 1px solid var(--border-secondary);
}

.markdown-body h3 {
  font-size: 1.25em;
  font-weight: 600;
}

.markdown-body h4 {
  font-size: 1em;
  font-weight: 600;
}

.markdown-body h5 {
  font-size: 0.875em;
  font-weight: 600;
}

.markdown-body h6 {
  font-size: 0.85em;
  font-weight: 600;
  color: var(--text-secondary);
}

.markdown-body p {
  margin-top: 0;
  margin-bottom: 16px;
}

.markdown-body ul,
.markdown-body ol {
  margin-top: 0;
  margin-bottom: 16px;
  padding-left: 2em;
}

.markdown-body li {
  margin-top: 0.25em;
}

.markdown-body li + li {
  margin-top: 0.25em;
}

.markdown-body li > ul,
.markdown-body li > ol {
  margin-top: 0;
  margin-bottom: 0;
}

.markdown-body code {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background: var(--md-code-bg);
  border-radius: 6px;
  font-family: var(--font-mono);
}

.markdown-body pre {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background: var(--md-pre-bg);
  color: var(--md-pre-fg);
  border-radius: 6px;
  margin-top: 0;
  margin-bottom: 16px;
  font-weight: 500;
}

.markdown-body pre code {
  padding: 0;
  margin: 0;
  font-size: 100%;
  background: transparent;
  border-radius: 0;
  word-break: normal;
  white-space: pre;
}

.markdown-body blockquote {
  margin: 0 0 16px 0;
  padding: 0 1em;
  color: var(--text-secondary);
  border-left: 0.25em solid var(--border-primary);
}

.markdown-body blockquote > :first-child {
  margin-top: 0;
}

.markdown-body blockquote > :last-child {
  margin-bottom: 0;
}

.markdown-body table {
  display: block;
  width: max-content;
  max-width: 100%;
  overflow: auto;
  border-spacing: 0;
  border-collapse: collapse;
  margin-top: 0;
  margin-bottom: 16px;
}

.markdown-body th,
.markdown-body td {
  padding: 6px 13px;
  border: 1px solid var(--border-primary);
}

.markdown-body th {
  font-weight: 600;
}

.markdown-body tr {
  background: var(--bg-primary);
  border-top: 1px solid var(--border-secondary);
}

.markdown-body tr:nth-child(2n) {
  background: var(--bg-tertiary);
}

.markdown-body a {
  color: var(--accent-primary);
  text-decoration: none;
}

.markdown-body a:hover {
  text-decoration: underline;
}

.markdown-body img {
  max-width: 100%;
  box-sizing: content-box;
  background: var(--bg-primary);
}

.markdown-body hr {
  height: 0.25em;
  padding: 0;
  margin: 24px 0;
  background: var(--border-secondary);
  border: 0;
}

.markdown-body strong {
  font-weight: 600;
}

.markdown-body em {
  font-style: italic;
}

/* ========================================
   RIGHT SIDEBAR - OUTLINE
   ======================================== */

.outline-sidebar {
  background: var(--bg-primary);
  border-left: 1px solid var(--border-primary);
  overflow-y: auto;
  overflow-x: hidden;
}

.outline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px 12px;
  border-bottom: 1px solid var(--border-secondary);
  position: sticky;
  top: 0;
  background: var(--bg-primary);
  z-index: 10;
}

.outline-header h3 {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-tertiary);
}

.outline {
  padding: 12px 0;
}

.no-outline {
  padding: 20px;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 13px;
}

.outline-list {
  list-style: none;
}

.outline-item {
  margin: 1px 0;
}

.outline-link {
  display: block;
  padding: 6px 20px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 13px;
  line-height: 1.4;
  transition: all 0.1s ease;
}

.outline-link:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.outline-link.active {
  color: var(--md-link-active);
  font-weight: 500;
}

/* Outline Levels */
.outline-level-1 .outline-link {
  font-weight: 500;
  color: var(--text-primary);
}

.outline-level-2 .outline-link {
  padding-left: 32px;
}

.outline-level-3 .outline-link {
  padding-left: 44px;
  font-size: 12px;
}

.outline-level-4 .outline-link {
  padding-left: 56px;
  font-size: 12px;
}

.outline-level-5 .outline-link,
.outline-level-6 .outline-link {
  padding-left: 68px;
  font-size: 12px;
}

/* ========================================
   MOBILE TOGGLE BUTTONS
   ======================================== */

.toggle-file-tree,
.toggle-outline {
  display: none;
  position: fixed;
  padding: 10px 16px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  z-index: 1000;
  transition: all 0.15s ease;
}

.toggle-file-tree {
  top: 6px;
  left: 8px;
  width: 40px;
  height: 32px;
  padding: 0;
  font-size: 18px;
  line-height: 1;
  justify-content: center;
}

.toggle-outline {
  bottom: 24px;
  right: 20px;
}

.toggle-file-tree:hover,
.toggle-outline:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

/* ========================================
   ZOOM CONTROLS
   ======================================== */

.zoom-controls {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: stretch;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 100;
  overflow: hidden;
}

.zoom-controls .zoom-btn,
.zoom-controls .zoom-level {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  font-family: var(--font-sans);
}

.zoom-controls .zoom-btn {
  width: 32px;
  height: 32px;
  font-size: 18px;
  font-weight: 600;
  line-height: 1;
}

.zoom-controls .zoom-level {
  min-width: 52px;
  padding: 0 8px;
  border-left: 1px solid var(--border-secondary);
  border-right: 1px solid var(--border-secondary);
  font-size: 12px;
  font-weight: 500;
}

.zoom-controls .zoom-btn:hover,
.zoom-controls .zoom-level:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

@media (max-width: 1024px) {
  .zoom-controls {
    bottom: 80px;
  }
}

/* ========================================
   FILE PATH BAR - d\u1EA3i m\u1EDD full path cu\u1ED1i trang (ch\u1EC9 m\xE0n h\xECnh r\u1ED9ng)
   ======================================== */

.file-path-bar {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 4px 12px;
  text-align: center;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  color: var(--text-primary);
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none; /* d\u1EA3i kh\xF4ng ch\u1EB7n t\u01B0\u01A1ng t\xE1c trang; ch\u1EC9 text b\xEAn trong nh\u1EADn click */
  z-index: 50; /* d\u01B0\u1EDBi zoom-controls (100) */
}

.file-path-text {
  pointer-events: auto;
  cursor: pointer;
}

@media (min-width: 1025px) {
  .file-path-bar {
    display: block;
  }
}

/* ========================================
   SCROLLBAR - Minimal
   ======================================== */

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--border-primary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--accent-light);
}

/* ========================================
   RESPONSIVE DESIGN
   ======================================== */

@media (max-width: 1200px) {
  :root {
    --sidebar-width: 220px;
    --left-sidebar-width: 220px;
    --right-sidebar-width: 220px;
  }

  .viewer-content {
    padding: 20px 20px 40px;
  }
}

@media (max-width: 1024px) {
  .viewer-header {
    grid-template-columns: auto 1fr auto;
  }

  .viewer-layout {
    grid-template-columns: 1fr;
  }

  .resize-handle {
    display: none;
  }

  .file-tree-sidebar,
  .outline-sidebar {
    position: fixed;
    top: 0;
    bottom: 0;
    width: 280px;
    z-index: 200;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.08);
  }

  .file-tree-sidebar {
    left: 0;
  }

  .outline-sidebar {
    right: 0;
    transform: translateX(100%);
  }

  .file-tree-sidebar.open {
    transform: translateX(0);
  }

  .outline-sidebar.open {
    transform: translateX(0);
  }

  /* Make room on the left for the fixed \u2630 toggle so it doesn't cover the logo. */
  .workspace-bar {
    padding-left: 56px;
  }

  .file-tree-header {
    padding: 6px 8px;
    text-align: right;
  }

  .close-sidebar {
    display: inline-block;
  }

  .toggle-file-tree,
  .toggle-outline {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .viewer-content {
    padding: 20px 20px 40px;
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .file-tree-sidebar,
  .outline-sidebar {
    width: 260px;
  }

  :root {
    --content-base-size: 14px;
  }

  .markdown-body h1 {
    font-size: 1.75em;
  }

  .markdown-body h2 {
    font-size: 1.375em;
  }

  .markdown-body h3 {
    font-size: 1.125em;
  }
}

/* ========================================
   HOME PAGE STYLES
   ======================================== */

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 24px;
  background: var(--bg-primary);
  min-height: 100vh;
}

header {
  margin-bottom: 48px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border-primary);
}

header h1 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.subtitle {
  font-size: 15px;
  color: var(--text-secondary);
}

.folder-section {
  margin-bottom: 40px;
  animation: fadeIn 0.3s ease;
}

.folder-name {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 8px;
}

.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.file-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  text-decoration: none;
  color: var(--text-primary);
  transition: all 0.15s ease;
}

.file-card:hover {
  background: var(--bg-tertiary);
  border-color: var(--accent-light);
}

.file-icon {
  font-size: 28px;
  opacity: 0.6;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-path {
  font-size: 12px;
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.no-files {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-tertiary);
  font-size: 15px;
}

/* ========================================
   ACTION BUTTONS in File Tree - Hover to reveal
   (Styles moved to end of file under "HEADER ACTIONS")
   ======================================== */

/* Position context for action buttons */
.tree-folder-header {
  position: relative;
}

/* ========================================
   CONFIRM DIALOG
   ======================================== */

.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
}

.confirm-overlay.show {
  opacity: 1;
  visibility: visible;
}

.confirm-dialog {
  background: var(--bg-primary);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  width: 90%;
  transform: scale(0.95);
  transition: transform 0.2s ease;
}

.confirm-overlay.show .confirm-dialog {
  transform: scale(1);
}

.confirm-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 0;
}

.confirm-header svg {
  width: 24px;
  height: 24px;
  fill: #cf222e;
  flex-shrink: 0;
}

.confirm-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.confirm-body {
  padding: 12px 20px 20px;
}

.confirm-body p {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.confirm-body .item-name {
  font-weight: 600;
  color: var(--text-primary);
  word-break: break-all;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 20px;
  border-top: 1px solid var(--border-secondary);
  background: var(--bg-secondary);
  border-radius: 0 0 8px 8px;
}

.confirm-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid transparent;
}

.confirm-btn-cancel {
  background: var(--bg-primary);
  border-color: var(--border-primary);
  color: var(--text-secondary);
}

.confirm-btn-cancel:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.confirm-btn-delete {
  background: #cf222e;
  color: white;
}

.confirm-btn-delete:hover {
  background: #a40e26;
}

/* ========================================
   INPUT DIALOG
   ======================================== */

.input-dialog-field {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  outline: none;
  transition: border-color 0.15s ease;
}

.input-dialog-field:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.1);
}

.confirm-btn-ok {
  background: var(--accent-primary);
  color: white;
}

.confirm-btn-ok:hover {
  background: var(--accent-hover);
}

/* ========================================
   MOVE DIALOG
   ======================================== */

.move-dialog .confirm-body {
  padding: 12px 20px 16px;
}

.folder-list {
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid var(--border-secondary);
  border-radius: 6px;
  margin-top: 12px;
}

.folder-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.1s ease;
}

.folder-option:hover {
  background: var(--bg-tertiary);
}

.folder-option-disabled {
  cursor: default;
  opacity: 0.45;
}

.folder-option-disabled:hover {
  background: transparent;
}

.folder-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  cursor: pointer;
  border-radius: 3px;
}

.folder-toggle:hover {
  background: var(--border-secondary);
}

.folder-toggle-spacer {
  cursor: default;
  pointer-events: none;
}

.folder-node.expanded > .folder-option .folder-toggle .chevron-icon {
  transform: rotate(0deg);
}

.folder-children {
  display: none;
  padding-left: 20px;
}

.folder-node.expanded > .folder-children {
  display: block;
}

.folder-option svg {
  width: 16px;
  height: 16px;
  fill: var(--text-tertiary);
}

.folder-option span {
  font-size: 14px;
  color: var(--text-primary);
}

.no-folders {
  padding: 20px;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 13px;
}

/* ========================================
   HEADER ACTIONS (Create folder button)
   ======================================== */

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 0 0 auto;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--bg-hover);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn svg {
  width: 16px;
  height: 16px;
  fill: var(--text-tertiary);
  transition: fill 0.15s ease;
}

.action-btn:hover {
  background: var(--bg-hover);
}

.action-btn:hover svg {
  fill: var(--text-primary);
}

/* File tree action buttons */
.tree-folder-header .action-btn,
.tree-file .action-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 0.15s ease;
  z-index: 5;
}

.tree-folder-header:hover .action-btn,
.tree-file:hover .action-btn {
  opacity: 1;
}

/* Position action buttons */
.tree-folder-header .rename-btn {
  right: 40px;
}

.tree-folder-header .delete-btn {
  right: 12px;
}

.tree-file .rename-btn {
  right: 68px;
}

.tree-file .move-btn {
  right: 40px;
}

.tree-file .delete-btn {
  right: 12px;
}

/* Delete button special color */
.action-btn.delete-btn svg {
  fill: #cf222e;
}

.action-btn.delete-btn:hover {
  background: rgba(207, 34, 46, 0.15);
}

.action-btn.delete-btn:hover svg {
  fill: #cf222e;
}

/* ========================================
   EXTERNAL FOLDERS
   ======================================== */

.external-folder {
  border-bottom: 1px dashed var(--border-secondary);
  margin-bottom: 8px;
  padding-bottom: 4px;
}

.external-folder-header {
  background: linear-gradient(90deg, rgba(9, 105, 218, 0.05) 0%, transparent 100%);
}

.external-folder-header .folder-icon {
  fill: var(--accent-primary);
}

.external-folder-header .tree-folder-name {
  color: var(--accent-primary);
  font-size: 12px;
}

.external-folder-header .remove-external-btn {
  right: 12px;
}

.remove-external-btn svg {
  fill: var(--text-tertiary);
}

.remove-external-btn:hover svg {
  fill: #cf222e;
}

/* ========================================
   ADD FOLDER DIALOG
   ======================================== */

.add-folder-hint {
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-tertiary);
  font-style: italic;
}

/* ========================================
   QUICK BUTTONS
   ======================================== */

.quick-btn {
  background: var(--accent-light);
  border: 1px solid var(--accent-primary);
}

.quick-btn svg {
  fill: var(--accent-primary);
}

.quick-btn:hover {
  background: var(--accent-primary);
}

.quick-btn:hover svg {
  fill: white;
}

/* ========================================
   SEARCH FUNCTIONALITY
   ======================================== */

.search-container {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  position: relative;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  font-size: 13px;
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.search-input:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.1);
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.clear-search-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: var(--bg-hover);
  border: none;
  border-radius: 4px;
  color: var(--text-tertiary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.clear-search-btn.visible {
  display: flex;
}

.clear-search-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

/* Search Panel */
.search-panel {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-secondary);
  background: var(--bg-primary);
}

/* Search Scope Options */
.search-scope-options {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0 0;
}

.hide-search-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--text-tertiary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.hide-search-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.scope-option {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-size: 12px;
  color: var(--text-secondary);
  transition: color 0.15s ease;
}

.scope-option:hover {
  color: var(--text-primary);
}

.scope-option input[type="radio"] {
  width: 14px;
  height: 14px;
  margin: 0;
  cursor: pointer;
  accent-color: var(--accent-primary);
}

.scope-option input[type="radio"]:checked + span {
  color: var(--accent-primary);
  font-weight: 500;
}

/* Search Results */
.search-results {
  padding: 8px 0;
}

.search-results-header {
  padding: 8px 20px;
  font-size: 12px;
  color: var(--text-tertiary);
  border-bottom: 1px solid var(--border-secondary);
}

.search-no-results {
  padding: 20px;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 13px;
}

.search-result-item {
  border-bottom: 1px solid var(--border-secondary);
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-file {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
  transition: background 0.1s ease;
}

.search-result-file:hover {
  background: var(--bg-tertiary);
}

.search-result-file svg {
  width: 16px;
  height: 16px;
  fill: var(--text-tertiary);
  flex-shrink: 0;
}

.search-result-matches {
  padding: 0 20px 8px 44px;
}

.search-match-line {
  display: block;
  padding: 4px 8px;
  margin: 2px 0;
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.1s ease;
  line-height: 1.4;
  word-break: break-word;
}

.search-match-line:hover {
  background: var(--bg-hover);
}

.search-match-line .line-number {
  color: var(--text-tertiary);
  margin-right: 8px;
  font-family: var(--font-mono);
}

.search-match-highlight {
  background: var(--md-search-highlight-bg);
  color: var(--text-primary);
  font-weight: 500;
  padding: 1px 2px;
  border-radius: 2px;
}

.search-result-folder {
  color: var(--text-tertiary);
  font-weight: 400;
  font-size: 12px;
}

/* Flash the block that holds the clicked search match after scrolling to it */
.search-scroll-flash {
  animation: search-scroll-flash 2s ease-out;
  border-radius: 4px;
}

@keyframes search-scroll-flash {
  0%, 50% { background: var(--md-search-highlight-bg); }
  100% { background: transparent; }
}

/* ========================================
   THEME TOGGLE BUTTON
   ======================================== */

.theme-toggle-btn .theme-icon-dark { display: none; }
.theme-toggle-btn .theme-icon-light { display: block; }

[data-theme="dark"] .theme-toggle-btn .theme-icon-light { display: none; }
[data-theme="dark"] .theme-toggle-btn .theme-icon-dark { display: block; }

/* ========================================
   DARK THEME \u2014 Component overrides
   ======================================== */

[data-theme="dark"] body {
  color: var(--text-secondary);
}

[data-theme="dark"] .markdown-body {
  color: var(--text-secondary);
}

[data-theme="dark"] .markdown-body blockquote {
  color: var(--text-tertiary);
  border-left-color: var(--border-secondary);
}

[data-theme="dark"] .markdown-body hr {
  background: var(--border-secondary);
}

[data-theme="dark"] .markdown-body img {
  background: transparent;
  opacity: 0.92;
}

[data-theme="dark"] .markdown-body table tr {
  background: var(--bg-primary);
}

[data-theme="dark"] .markdown-body table tr:nth-child(2n) {
  background: var(--bg-secondary);
}

[data-theme="dark"] .markdown-body th,
[data-theme="dark"] .markdown-body td {
  border-color: var(--border-secondary);
}

[data-theme="dark"] .markdown-body a {
  color: var(--accent-hover);
}

[data-theme="dark"] .action-btn {
  background: transparent;
}

[data-theme="dark"] .action-btn:hover {
  background: var(--bg-hover);
}

/* Floating button needs a solid background \u2014 it sits on top of content text */
[data-theme="dark"] .content-float-actions .action-btn {
  background: var(--bg-secondary);
  border-color: var(--border-primary);
}

[data-theme="dark"] .content-float-actions .action-btn:hover {
  background: var(--bg-hover);
}

[data-theme="dark"] .quick-btn {
  background: rgba(82, 139, 255, 0.15);
  border-color: var(--accent-primary);
}

[data-theme="dark"] .quick-btn svg {
  fill: var(--accent-hover);
}

[data-theme="dark"] .quick-btn:hover {
  background: var(--accent-primary);
}

[data-theme="dark"] .quick-btn:hover svg {
  fill: var(--text-primary);
}

[data-theme="dark"] .search-input {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-color: var(--border-secondary);
}

[data-theme="dark"] .search-input:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(82, 139, 255, 0.15);
}

[data-theme="dark"] .input-dialog-field {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-color: var(--border-secondary);
}

[data-theme="dark"] .input-dialog-field:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(82, 139, 255, 0.15);
}

[data-theme="dark"] .confirm-overlay {
  background: rgba(0, 0, 0, 0.7);
}

[data-theme="dark"] .confirm-dialog {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  border: 1px solid var(--border-secondary);
}

[data-theme="dark"] .confirm-actions {
  background: var(--bg-secondary);
}

[data-theme="dark"] .confirm-btn-cancel {
  background: var(--bg-secondary);
  border-color: var(--border-secondary);
}

[data-theme="dark"] .confirm-btn-cancel:hover {
  background: var(--bg-hover);
}

[data-theme="dark"] .external-folder-header {
  background: linear-gradient(90deg, rgba(82, 139, 255, 0.12) 0%, transparent 100%);
}

[data-theme="dark"] .zoom-controls {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

[data-theme="dark"] ::-webkit-scrollbar-thumb {
  background: var(--border-secondary);
}

[data-theme="dark"] ::-webkit-scrollbar-thumb:hover {
  background: var(--accent-primary);
}

[data-theme="dark"] .tree-icon {
  fill: var(--text-secondary);
}

[data-theme="dark"] .file-card:hover {
  background: var(--bg-hover);
  border-color: var(--accent-primary);
}

/* ========================================
   QUICK OPEN (Cmd/Ctrl+P)
   ======================================== */

.quick-open-overlay {
  align-items: flex-start;
  padding-top: 10vh;
}

.quick-open-dialog {
  background: var(--bg-primary);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  width: 92%;
  max-width: 640px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border-primary);
  transform: scale(0.97);
  transition: transform 0.15s ease;
}

.quick-open-overlay.show .quick-open-dialog {
  transform: scale(1);
}

.quick-open-input {
  width: 100%;
  padding: 14px 16px;
  font-size: 15px;
  background: var(--bg-primary);
  color: var(--text-primary);
  border: none;
  border-bottom: 1px solid var(--border-secondary);
  outline: none;
  font-family: var(--font-sans);
}

.quick-open-input:focus {
  border-bottom-color: var(--accent-primary);
}

.quick-open-results {
  max-height: 50vh;
  overflow-y: auto;
  padding: 4px 0;
}

.quick-open-empty {
  padding: 24px;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 13px;
}

.quick-open-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  cursor: pointer;
  transition: background 0.08s ease;
  font-size: 13px;
  color: var(--text-primary);
}

.quick-open-item:hover {
  background: var(--bg-hover);
}

.quick-open-item.active {
  background: var(--accent-light);
}

.quick-open-icon {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.quick-open-icon svg {
  width: 16px;
  height: 16px;
  fill: var(--text-secondary);
}

.quick-open-name {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
  max-width: 50%;
}

.quick-open-name mark {
  background: transparent;
  color: var(--accent-primary);
  font-weight: 700;
}

.quick-open-folder {
  color: var(--text-tertiary);
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.quick-open-badge {
  font-size: 10px;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--bg-tertiary);
  color: var(--text-tertiary);
  font-weight: 600;
  flex-shrink: 0;
}

.quick-open-footer {
  display: flex;
  gap: 16px;
  padding: 8px 14px;
  border-top: 1px solid var(--border-secondary);
  background: var(--bg-secondary);
  font-size: 11px;
  color: var(--text-tertiary);
}

.quick-open-footer kbd {
  display: inline-block;
  padding: 1px 6px;
  margin-right: 4px;
  font-family: var(--font-mono);
  font-size: 10px;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 3px;
  color: var(--text-secondary);
}

[data-theme="dark"] .quick-open-dialog {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  border-color: var(--border-secondary);
}

[data-theme="dark"] .quick-open-item.active {
  background: var(--bg-tertiary);
}

[data-theme="dark"] .quick-open-name mark {
  color: var(--accent-hover);
}

/* ===== Edit mode ===== */

.editor-container {
  display: flex;
  flex-direction: column;
}

.editor-toolbar {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  /* right padding clears the floating edit button (32px + gap) pinned at the content's top-right */
  padding: 8px 44px 8px 0;
  background: var(--bg-primary);
}

.editor-status {
  margin-right: auto;
  font-size: 13px;
  color: var(--text-tertiary);
}

.editor-btn {
  padding: 5px 16px;
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.editor-save-btn {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: #fff;
}

.editor-save-btn:hover {
  background: var(--accent-hover);
}

.editor-cancel-btn {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.editor-cancel-btn:hover {
  background: var(--bg-tertiary);
}

.editor-textarea {
  width: 100%;
  min-height: calc(100vh - 170px);
  padding: 16px;
  resize: vertical;
  font-family: var(--font-mono);
  font-size: 14px;
  line-height: 1.6;
  tab-size: 2;
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  outline: none;
}

.editor-textarea:focus {
  border-color: var(--accent-primary);
}

/* Unsaved indicator on the header title */
.file-title.dirty::after {
  content: ' \u2022';
  color: var(--accent-primary);
}

/* Pencil button stays highlighted while edit mode is on */
.action-btn.active {
  background: var(--accent-light);
}

.action-btn.active svg {
  fill: var(--accent-primary);
}

`;

  // public/modules/export.js
  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
  function buildStaticHTML(title, markdownContent, outlineContent, cssContent, theme) {
    const layoutOverride = `
    /* Override for 2-column layout (no file tree) */
    .file-tree-sidebar,
    .toggle-file-tree,
    .close-sidebar {
      display: none !important;
    }

    .viewer-layout {
      grid-template-columns: 1fr var(--sidebar-width) !important;
    }

    .viewer-header {
      display: flex !important;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      border-bottom: 1px solid var(--border-primary);
      background: var(--bg-primary);
    }

    .header-left, .header-right {
      display: none;
    }

    .header-center {
      flex: 1;
    }

    .file-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    @media (max-width: 1024px) {
      .viewer-layout {
        grid-template-columns: 1fr !important;
      }

      .outline-sidebar {
        position: fixed !important;
        top: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 280px !important;
        transform: translateX(100%) !important;
        transition: transform 0.2s ease !important;
        z-index: 200 !important;
      }

      .outline-sidebar.open {
        transform: translateX(0) !important;
      }

      .toggle-outline {
        display: flex !important;
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        background: var(--accent-primary);
        color: white;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        z-index: 100;
      }

      .outline-header .close-sidebar {
        display: flex !important;
      }
    }

    @media (min-width: 1025px) {
      .toggle-outline,
      .outline-header .close-sidebar {
        display: none !important;
      }
    }
  `;
    const scrollSpyJS = `
    document.addEventListener('DOMContentLoaded', function() {
      const links = document.querySelectorAll('.outline-link');
      const content = document.querySelector('.viewer-content');

      // Smooth scroll on click
      links.forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          const targetId = this.getAttribute('href').substring(1);
          const target = document.getElementById(targetId);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            links.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
          }
        });
      });

      // Scroll spy
      if (content) {
        content.addEventListener('scroll', function() {
          let current = '';
          const headings = document.querySelectorAll('[id^="heading-"]');

          headings.forEach(heading => {
            const rect = heading.getBoundingClientRect();
            if (rect.top <= 100) {
              current = heading.id;
            }
          });

          links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
              link.classList.add('active');
            }
          });
        });
      }

      // Mobile toggle
      const toggleBtn = document.getElementById('toggle-outline');
      const outlineSidebar = document.querySelector('.outline-sidebar');
      const closeBtn = document.getElementById('close-outline');

      if (toggleBtn && outlineSidebar) {
        toggleBtn.addEventListener('click', function() {
          outlineSidebar.classList.add('open');
        });
      }

      if (closeBtn && outlineSidebar) {
        closeBtn.addEventListener('click', function() {
          outlineSidebar.classList.remove('open');
        });
      }

      // Close outline when clicking a link on mobile
      links.forEach(link => {
        link.addEventListener('click', function() {
          if (window.innerWidth <= 1024 && outlineSidebar) {
            outlineSidebar.classList.remove('open');
          }
        });
      });
    });
  `;
    return `<!DOCTYPE html>
<html lang="en" data-theme="${theme === "dark" ? "dark" : "light"}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(title)}</title>
  <style>
${cssContent}

${layoutOverride}
  </style>
</head>
<body>
  <div class="viewer-container">
    <header class="viewer-header">
      <div class="header-left"></div>
      <div class="header-center">
        <h1 class="file-title">${escapeHTML(title)}</h1>
      </div>
      <div class="header-right"></div>
    </header>

    <div class="viewer-layout">
      <!-- Main Content -->
      <main class="viewer-content">
        <div class="markdown-body">
${markdownContent}
        </div>
      </main>

      <!-- Right Sidebar: Outline -->
      <aside class="outline-sidebar">
        <div class="outline-header">
          <h3>Outline</h3>
          <button id="close-outline" class="close-sidebar">\u2715</button>
        </div>
        <nav id="outline" class="outline">
${outlineContent}
        </nav>
      </aside>
    </div>

    <!-- Mobile Toggle Button -->
    <button id="toggle-outline" class="toggle-outline">
      <span>\u2630</span> Outline
    </button>
  </div>

  <script>
${scrollSpyJS}
  <\/script>
</body>
</html>`;
  }
  function collectCss() {
    let css = "";
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        const rules = sheet.cssRules;
        if (!rules)
          continue;
        for (const rule of Array.from(rules))
          css += `${rule.cssText}
`;
      } catch {
      }
    }
    if (!css) {
      for (const styleEl of Array.from(document.querySelectorAll("style"))) {
        css += `${styleEl.textContent || ""}
`;
      }
    }
    return css;
  }
  async function exportToStaticHTML() {
    try {
      const title = document.getElementById("file-title").textContent || "Exported Document";
      const markdownContent = document.getElementById("markdown-content").innerHTML;
      const outlineContent = document.getElementById("outline").innerHTML;
      const cssContent = styles_default || collectCss();
      const theme = document.documentElement.getAttribute("data-theme") || "light";
      const staticHTML = buildStaticHTML(title, markdownContent, outlineContent, cssContent, theme);
      const blob = new Blob([staticHTML], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9\u00C0-\u024F]/gi, "_")}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export: " + error.message);
    }
  }

  // public/modules/resize.js
  var STORAGE_KEY2 = "sidebarWidths";
  var MIN_WIDTH = 160;
  var MAX_WIDTH_RATIO = 0.45;
  var MOBILE_BREAKPOINT = 1024;
  function loadWidths() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY2)) || null;
    } catch {
      return null;
    }
  }
  function saveWidths(widths) {
    localStorage.setItem(STORAGE_KEY2, JSON.stringify(widths));
  }
  function clampWidth(width) {
    const max = window.innerWidth * MAX_WIDTH_RATIO;
    return Math.max(MIN_WIDTH, Math.min(max, width));
  }
  function applyWidths(left, right) {
    const root = document.documentElement.style;
    if (left != null)
      root.setProperty("--left-sidebar-width", `${left}px`);
    if (right != null)
      root.setProperty("--right-sidebar-width", `${right}px`);
  }
  function initResize() {
    const leftHandle = document.getElementById("resize-handle-left");
    const rightHandle = document.getElementById("resize-handle-right");
    const leftSidebar = document.getElementById("file-tree-sidebar");
    const rightSidebar = document.getElementById("outline-sidebar");
    if (!leftHandle || !rightHandle || !leftSidebar || !rightSidebar)
      return;
    const saved = loadWidths();
    if (saved && window.innerWidth > MOBILE_BREAKPOINT) {
      applyWidths(clampWidth(saved.left), clampWidth(saved.right));
    }
    let activeHandle = null;
    let activeSide = null;
    let startX = 0;
    let startWidth = 0;
    function onMouseDown(e, handle, side) {
      if (window.innerWidth <= MOBILE_BREAKPOINT)
        return;
      e.preventDefault();
      activeHandle = handle;
      activeSide = side;
      startX = e.clientX;
      startWidth = side === "left" ? leftSidebar.offsetWidth : rightSidebar.offsetWidth;
      handle.classList.add("dragging");
      document.body.classList.add("resizing");
    }
    function onMouseMove(e) {
      if (!activeHandle)
        return;
      const delta = activeSide === "left" ? e.clientX - startX : startX - e.clientX;
      const newWidth = clampWidth(startWidth + delta);
      if (activeSide === "left") {
        applyWidths(newWidth, null);
      } else {
        applyWidths(null, newWidth);
      }
    }
    function onMouseUp() {
      if (!activeHandle)
        return;
      activeHandle.classList.remove("dragging");
      document.body.classList.remove("resizing");
      activeHandle = null;
      activeSide = null;
      saveWidths({
        left: leftSidebar.offsetWidth,
        right: rightSidebar.offsetWidth
      });
    }
    function onDoubleClick(side) {
      if (window.innerWidth <= MOBILE_BREAKPOINT)
        return;
      const defaultWidth = window.innerWidth <= 1200 ? 220 : 330;
      if (side === "left")
        applyWidths(defaultWidth, null);
      else
        applyWidths(null, defaultWidth);
      saveWidths({
        left: leftSidebar.offsetWidth,
        right: rightSidebar.offsetWidth
      });
    }
    leftHandle.addEventListener("mousedown", (e) => onMouseDown(e, leftHandle, "left"));
    rightHandle.addEventListener("mousedown", (e) => onMouseDown(e, rightHandle, "right"));
    leftHandle.addEventListener("dblclick", () => onDoubleClick("left"));
    rightHandle.addEventListener("dblclick", () => onDoubleClick("right"));
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    window.addEventListener("resize", () => {
      if (window.innerWidth <= MOBILE_BREAKPOINT)
        return;
      const current = loadWidths();
      if (current) {
        applyWidths(clampWidth(current.left), clampWidth(current.right));
      }
    });
  }

  // public/modules/zoom.js
  var STORAGE_KEY3 = "contentZoom";
  var MIN_ZOOM = 0.7;
  var MAX_ZOOM = 2.5;
  var STEP = 0.1;
  var DEFAULT_ZOOM = 1;
  var currentZoom = DEFAULT_ZOOM;
  function loadFromUrl() {
    try {
      const raw = new URLSearchParams(window.location.search).get("zoom");
      if (raw === null)
        return null;
      const n = parseFloat(raw);
      if (!Number.isFinite(n))
        return null;
      const z = n > 5 ? n / 100 : n;
      return z >= MIN_ZOOM && z <= MAX_ZOOM ? Math.round(z * 10) / 10 : null;
    } catch {
      return null;
    }
  }
  function load() {
    const fromUrl = loadFromUrl();
    if (fromUrl !== null) {
      save2(fromUrl);
      return fromUrl;
    }
    const v = parseFloat(localStorage.getItem(STORAGE_KEY3));
    return Number.isFinite(v) && v >= MIN_ZOOM && v <= MAX_ZOOM ? v : DEFAULT_ZOOM;
  }
  function save2(z) {
    localStorage.setItem(STORAGE_KEY3, String(z));
  }
  function apply(z) {
    document.documentElement.style.setProperty("--content-zoom", z);
    const label = document.getElementById("zoom-level-btn");
    if (label)
      label.textContent = `${Math.round(z * 100)}%`;
  }
  function setZoom(z) {
    currentZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.round(z * 10) / 10));
    apply(currentZoom);
    save2(currentZoom);
  }
  function initZoom() {
    currentZoom = load();
    apply(currentZoom);
    const inBtn = document.getElementById("zoom-in-btn");
    const outBtn = document.getElementById("zoom-out-btn");
    const levelBtn = document.getElementById("zoom-level-btn");
    if (inBtn)
      inBtn.addEventListener("click", () => setZoom(currentZoom + STEP));
    if (outBtn)
      outBtn.addEventListener("click", () => setZoom(currentZoom - STEP));
    if (levelBtn)
      levelBtn.addEventListener("click", () => setZoom(DEFAULT_ZOOM));
    document.addEventListener("keydown", (e) => {
      const target = e.target;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "=" || e.key === "+") {
          e.preventDefault();
          setZoom(currentZoom + STEP);
        } else if (e.key === "-" || e.key === "_") {
          e.preventDefault();
          setZoom(currentZoom - STEP);
        } else if (e.key === "0") {
          e.preventDefault();
          setZoom(DEFAULT_ZOOM);
        }
        return;
      }
      if (e.key === "z") {
        e.preventDefault();
        setZoom(currentZoom + STEP);
      } else if (e.key === "Z") {
        e.preventDefault();
        setZoom(currentZoom - STEP);
      }
    });
  }

  // public/modules/theme.js
  var THEME_KEY = "theme";
  var THEMES = { LIGHT: "light", DARK: "dark" };
  function getThemeFromUrl() {
    try {
      const v = new URLSearchParams(window.location.search).get("theme");
      return v === THEMES.DARK || v === THEMES.LIGHT ? v : null;
    } catch {
      return null;
    }
  }
  function getTheme() {
    const fromUrl = getThemeFromUrl();
    if (fromUrl)
      return fromUrl;
    try {
      return localStorage.getItem(THEME_KEY) || THEMES.LIGHT;
    } catch {
      return THEMES.LIGHT;
    }
  }
  function setTheme(theme) {
    const value = theme === THEMES.DARK ? THEMES.DARK : THEMES.LIGHT;
    document.documentElement.setAttribute("data-theme", value);
    try {
      localStorage.setItem(THEME_KEY, value);
    } catch {
    }
    if (window.mermaid) {
      try {
        window.mermaid.initialize({
          startOnLoad: false,
          theme: value === THEMES.DARK ? "dark" : "default"
        });
      } catch {
      }
    }
  }
  function toggleTheme() {
    const next = getTheme() === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    setTheme(next);
    return next;
  }
  function initTheme() {
    setTheme(getTheme());
    const btn = document.getElementById("theme-toggle-btn");
    if (btn) {
      btn.addEventListener("click", toggleTheme);
    }
  }

  // public/modules/quick-open.js
  var MAX_RESULTS = 50;
  var overlayEl = null;
  var inputEl = null;
  var resultsEl = null;
  var allFiles = [];
  var filteredFiles = [];
  var activeIndex = 0;
  var isOpen = false;
  function buildDom() {
    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay quick-open-overlay";
    overlay.id = "quick-open-overlay";
    overlay.innerHTML = `
    <div class="quick-open-dialog" role="dialog" aria-label="Quick open file">
      <input
        type="text"
        id="quick-open-input"
        class="quick-open-input"
        placeholder="Nhap ten file de tim..."
        autocomplete="off"
        spellcheck="false"
      >
      <div id="quick-open-results" class="quick-open-results"></div>
      <div class="quick-open-footer">
        <span><kbd>\u2191</kbd><kbd>\u2193</kbd> chon</span>
        <span><kbd>Enter</kbd> mo</span>
        <span><kbd>Esc</kbd> dong</span>
      </div>
    </div>
  `;
    document.body.appendChild(overlay);
    return overlay;
  }
  async function loadAllFiles() {
    const collected = [];
    try {
      const grouped = await apiFetch("/api/files");
      for (const folderKey of Object.keys(grouped)) {
        for (const file of grouped[folderKey] || []) {
          collected.push({
            name: file.name,
            path: file.path,
            folder: folderKey === "Root" ? "" : folderKey,
            isExternal: false
          });
        }
      }
    } catch (error) {
      console.error("Quick open: failed to load project files", error);
    }
    const externalFolders = getActiveWorkspaceFolders();
    if (externalFolders.length > 0) {
      try {
        const extResponse = await apiFetch("/api/external-files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paths: externalFolders })
        });
        for (const rootPath of Object.keys(extResponse || {})) {
          const grouped = extResponse[rootPath] || {};
          for (const subKey of Object.keys(grouped)) {
            for (const file of grouped[subKey] || []) {
              const displayFolder = subKey === "." ? rootPath.split("/").pop() || rootPath : `${rootPath.split("/").pop()}/${subKey}`;
              collected.push({
                name: file.name,
                path: file.path,
                folder: displayFolder,
                isExternal: true
              });
            }
          }
        }
      } catch (error) {
        console.error("Quick open: failed to load external files", error);
      }
    }
    const seen = /* @__PURE__ */ new Set();
    const deduped = [];
    for (const file of collected) {
      const key = `${file.isExternal ? "ext" : "proj"}:${file.path}`;
      if (seen.has(key))
        continue;
      seen.add(key);
      deduped.push(file);
    }
    return deduped;
  }
  function fuzzyScore(query, file) {
    if (!query)
      return 0;
    const q = query.toLowerCase();
    const name = file.name.toLowerCase();
    const path = file.path.toLowerCase();
    let score = scoreSubsequence(q, name);
    if (score !== null) {
      return score + 1e3;
    }
    score = scoreSubsequence(q, path);
    return score;
  }
  function scoreSubsequence(query, target) {
    let score = 0;
    let qi = 0;
    let lastMatchIdx = -1;
    let consecutive = 0;
    for (let i = 0; i < target.length && qi < query.length; i++) {
      if (target[i] === query[qi]) {
        if (lastMatchIdx === i - 1) {
          consecutive++;
          score += 5 + consecutive;
        } else {
          consecutive = 0;
          score += 1;
        }
        if (i === 0 || target[i - 1] === "/" || target[i - 1] === "-" || target[i - 1] === "_" || target[i - 1] === ".") {
          score += 3;
        }
        lastMatchIdx = i;
        qi++;
      }
    }
    if (qi < query.length)
      return null;
    score -= target.length * 0.05;
    return score;
  }
  function escapeHtml3(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function highlightMatches(text, query) {
    if (!query)
      return escapeHtml3(text);
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const parts = [];
    let qi = 0;
    let buffer = "";
    for (let i = 0; i < text.length; i++) {
      if (qi < lowerQuery.length && lowerText[i] === lowerQuery[qi]) {
        if (buffer) {
          parts.push(escapeHtml3(buffer));
          buffer = "";
        }
        parts.push(`<mark>${escapeHtml3(text[i])}</mark>`);
        qi++;
      } else {
        buffer += text[i];
      }
    }
    if (buffer)
      parts.push(escapeHtml3(buffer));
    return parts.join("");
  }
  function applyFilter(query) {
    const trimmed = query.trim();
    if (!trimmed) {
      filteredFiles = [...allFiles].sort((a, b) => a.name.localeCompare(b.name)).slice(0, MAX_RESULTS);
    } else {
      const scored = [];
      for (const file of allFiles) {
        const score = fuzzyScore(trimmed, file);
        if (score !== null && score > 0) {
          scored.push({ file, score });
        }
      }
      scored.sort((a, b) => b.score - a.score);
      filteredFiles = scored.slice(0, MAX_RESULTS).map((s) => s.file);
    }
    activeIndex = 0;
    renderResults(trimmed);
  }
  function renderResults(query) {
    if (filteredFiles.length === 0) {
      resultsEl.innerHTML = '<div class="quick-open-empty">Khong tim thay file</div>';
      return;
    }
    const html = filteredFiles.map((file, idx) => {
      const icon = getFileIcon(file.name);
      const folderText = file.folder || (file.isExternal ? "" : "Root");
      const externalBadge = file.isExternal ? '<span class="quick-open-badge">ext</span>' : "";
      return `
      <div class="quick-open-item ${idx === activeIndex ? "active" : ""}"
           data-index="${idx}"
           data-path="${escapeHtml3(file.path)}"
           data-external="${file.isExternal}">
        <span class="quick-open-icon">${icon}</span>
        <span class="quick-open-name">${highlightMatches(file.name, query)}</span>
        <span class="quick-open-folder">${escapeHtml3(folderText)}</span>
        ${externalBadge}
      </div>
    `;
    }).join("");
    resultsEl.innerHTML = html;
    scrollActiveIntoView();
  }
  function scrollActiveIntoView() {
    const activeEl = resultsEl.querySelector(".quick-open-item.active");
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }
  function setActive(newIndex) {
    if (filteredFiles.length === 0)
      return;
    const clamped = Math.max(0, Math.min(newIndex, filteredFiles.length - 1));
    if (clamped === activeIndex)
      return;
    activeIndex = clamped;
    resultsEl.querySelectorAll(".quick-open-item").forEach((el) => {
      const idx = Number(el.dataset.index);
      el.classList.toggle("active", idx === activeIndex);
    });
    scrollActiveIntoView();
  }
  function openSelected() {
    const file = filteredFiles[activeIndex];
    if (!file)
      return;
    hideQuickOpen();
    navigateToFile(file.path, file.isExternal);
  }
  function handleKeydown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(activeIndex + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(activeIndex - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      openSelected();
    } else if (e.key === "Escape") {
      e.preventDefault();
      hideQuickOpen();
    }
  }
  function handleResultsClick(e) {
    const item = e.target.closest(".quick-open-item");
    if (!item)
      return;
    e.preventDefault();
    activeIndex = Number(item.dataset.index);
    openSelected();
  }
  function handleOverlayClick(e) {
    if (e.target === overlayEl)
      hideQuickOpen();
  }
  function initQuickOpen() {
    if (overlayEl)
      return;
    overlayEl = buildDom();
    inputEl = document.getElementById("quick-open-input");
    resultsEl = document.getElementById("quick-open-results");
    inputEl.addEventListener("input", () => applyFilter(inputEl.value));
    inputEl.addEventListener("keydown", handleKeydown);
    resultsEl.addEventListener("click", handleResultsClick);
    overlayEl.addEventListener("click", handleOverlayClick);
  }
  async function showQuickOpen() {
    if (!overlayEl)
      initQuickOpen();
    if (isOpen) {
      inputEl.focus();
      inputEl.select();
      return;
    }
    isOpen = true;
    overlayEl.classList.add("show");
    inputEl.value = "";
    resultsEl.innerHTML = '<div class="quick-open-empty">Dang tai danh sach file...</div>';
    setTimeout(() => inputEl.focus(), 50);
    allFiles = await loadAllFiles();
    if (!isOpen)
      return;
    applyFilter("");
  }
  function hideQuickOpen() {
    if (!overlayEl)
      return;
    overlayEl.classList.remove("show");
    isOpen = false;
    activeIndex = 0;
    filteredFiles = [];
  }

  // public/view.js
  var state2 = getState();
  if (!state2.currentFilePath) {
    document.getElementById("loading").innerHTML = "No file specified.";
  }
  initDialogs();
  initResize();
  initZoom();
  initTheme();
  var toggleFileTreeButton = document.getElementById("toggle-file-tree");
  var toggleOutlineButton = document.getElementById("toggle-outline");
  var closeFileTreeButton = document.getElementById("close-file-tree");
  var closeOutlineButton = document.getElementById("close-outline");
  var fileTreeSidebar = document.querySelector(".file-tree-sidebar");
  var outlineSidebar = document.querySelector(".outline-sidebar");
  var OVERLAY_BREAKPOINT = 1024;
  function toggleLeftPanel() {
    if (window.innerWidth <= OVERLAY_BREAKPOINT) {
      fileTreeSidebar.classList.toggle("open");
      outlineSidebar.classList.remove("open");
    } else {
      document.body.classList.toggle("left-panel-hidden");
    }
  }
  toggleFileTreeButton.addEventListener("click", toggleLeftPanel);
  toggleOutlineButton.addEventListener("click", () => {
    outlineSidebar.classList.toggle("open");
    fileTreeSidebar.classList.remove("open");
  });
  closeFileTreeButton.addEventListener("click", () => {
    fileTreeSidebar.classList.remove("open");
  });
  closeOutlineButton.addEventListener("click", () => {
    outlineSidebar.classList.remove("open");
  });
  document.addEventListener("click", (e) => {
    if (!fileTreeSidebar.classList.contains("open"))
      return;
    if (fileTreeSidebar.contains(e.target))
      return;
    if (toggleFileTreeButton.contains(e.target))
      return;
    if (e.target.closest(".confirm-overlay"))
      return;
    fileTreeSidebar.classList.remove("open");
  });
  document.getElementById("create-folder-btn").addEventListener("click", () => {
    showInputDialog("create-folder");
  });
  document.getElementById("add-external-folder-btn").addEventListener("click", () => {
    showAddFolderDialog();
  });
  document.getElementById("quick-last-talk-btn").addEventListener("click", () => {
    navigateToFile("last_talk.md", false);
  });
  document.getElementById("quick-latest-plan-btn").addEventListener("click", async () => {
    try {
      const data = await apiFetch("/api/latest-plan");
      navigateToFile(data.path, true);
    } catch (error) {
      console.error("Error getting latest plan:", error);
      alert("Loi: " + error.message);
    }
  });
  document.getElementById("export-html-btn").addEventListener("click", exportToStaticHTML);
  initEditor({ afterSave: loadContent });
  loadContent();
  setupKeyboardNavigation();
  setupSearchListeners();
  var searchPanel = document.getElementById("search-panel");
  var searchInput = document.getElementById("search-input");
  setupHotkeys(searchPanel, searchInput, toggleLeftPanel);
  initQuickOpen();
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && (e.key === "p" || e.key === "P") && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      showQuickOpen();
    }
  });
  renderWorkspaceTabs();
  restoreSearchState();
  loadFileTree();
  window.addEventListener("popstate", () => {
    const params = new URLSearchParams(window.location.search);
    const path = params.get("path");
    const external = params.get("external") === "true";
    if (path) {
      navigateToFile(path, external, { pushState: false });
    }
  });
})();
