// App configuration — a classic script kept OUTSIDE the esbuild bundle so it can
// be hand-edited without rebuilding. Loaded before app.bundle.js.
window.APP_CONFIG = {
  // Where the generic file API (m-local-api) is listening.
  API_BASE_URL: 'http://localhost:3333',

  // Obfuscated route prefix + shared secret. These MUST match m-local-api's
  // API_PREFIX / API_KEY (its defaults are identical). CHANGE BOTH for real
  // security — set the server's `API_PREFIX` / `API_KEY` env to the same values.
  API_PREFIX: '/apif7f9470e8818',
  API_KEY: '1acad1323344b15937de23f02afc4e964f77cf76c9c9f20b',

  // This app's notes root (absolute — the browser can't expand '~').
  PROJECT_ROOT: '/Users/minh/www/git/personal/tools/m-md-viewer',

  // Directories hidden from the project file tree.
  PROJECT_EXCLUDE: ['node_modules', '.git', 'public', '.ipam', '.playwright-mcp'],

  // Global "latest plan" directory (already expanded — no '~').
  PLANS_DIR: '/Users/minh/.claude/plans',

  // Claude Code projects root for the conversation viewer (claude.html).
  // A leading '~' is fine here: m-local-api expands it server-side.
  CLAUDE_PROJECTS_DIR: '~/.claude/projects',

  // Per-folder session conventions.
  SESSIONS_DIR_NAME: '.clsessions',
  LAST_TALK_FILE: 'last_talk.md',
};
