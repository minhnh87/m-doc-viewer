# m-local-api

A generic, **path-based** local file API for building local-first apps. It reads,
scans, searches and mutates files anywhere on the machine. It renders nothing —
responses are raw content, so any client can format them however it likes.

- Binds `127.0.0.1` only (the sole guard rail — no path allowlist).
- CORS `*`, so pages opened over `file://` (origin `null`) can call it.
- Every endpoint takes **absolute paths** (with `~` expansion). Scans skip
  `node_modules` and `.git` by default (overridable).

## Run

```bash
npm install
npm start          # http://127.0.0.1:3333
```

## Config (env)

| Var | Default | Meaning |
|---|---|---|
| `M_LOCAL_API_PORT` / `PORT` | `3333` | Listen port |
| `M_LOCAL_API_HOST` | `127.0.0.1` | Listen host (keep local) |
| `EXCLUDE_DIRS` | `node_modules,.git` | Dirs skipped while scanning |
| `EXTENSIONS` | `.md,.drawio,.mermaid,.mmd` | Default file filter (`*` = all) |
| `INCLUDE_HIDDEN` | `false` | Include dotfiles/dotdirs while scanning |
| `MAX_FILE_BYTES` | `26214400` (25 MB) | `/content` size ceiling (413 above) |
| `ENABLE_WRITES` | `true` | `false` → mutation routes return 403 |
| `API_KEY` | (built-in default) | Clients must send `X-API-Key: <key>`. Empty = auth off |
| `API_PREFIX` | `/apif7f9470e8818` | Obfuscated route prefix (layered with the key) |

## Auth

Every request must send `X-API-Key: <API_KEY>` (except CORS preflight and
`/health`). Routes are mounted under the obfuscated `API_PREFIX`, not `/api`.
`API_KEY` and `API_PREFIX` ship with built-in defaults that are duplicated in the
client's `public/config.js` — **change both** (set the server's `API_KEY` /
`API_PREFIX` env and the matching keys in `config.js`) for real security. Setting
`API_KEY=""` disables auth (a startup warning is logged).

## API (prefix `API_PREFIX`, default `/apif7f9470e8818`)

`FileEntry = { name, path (abs), relPath, folder, ext, type }`

| Method | Path | Params | Response |
|---|---|---|---|
| GET | `/health` | — | `{ ok, name, version }` |
| GET | `/tree` | `root`*, `ext`, `exclude`, `includeHidden`, `depth` | `{ root, files[], folders[] }` (empty folders included) |
| POST | `/trees` | body `{ roots[], ext?, exclude?, includeHidden? }` | `{ roots: [{ root, files, folders }] }` (bad roots skipped) |
| GET | `/content` | `path`*, `encoding` (`utf-8`\|`base64`) | `{ path, name, ext, type, content, encoding, size, mtime }` — no `html` |
| GET | `/search` | `query`*, `roots`* (json), `recursive`, `ext`, `exclude`, `includeHidden`, `maxMatches`, `context` | `{ results:[{ file, matches:[{ line, content, matchStart }] }], totalMatches, totalFiles }` |
| GET | `/newest` | `dir`*, `ext`, `recursive` | `{ path, name, mtime, size }` |
| POST | `/folder` | body `{ path }` | `{ success, message, path }` (mkdir -p, 409 if exists) |
| DELETE | `/folder` | `path` | `{ success, message, path }` (recursive) |
| DELETE | `/file` | `path` | `{ success, message, path }` |
| PUT | `/file/move` | body `{ from, to }` | `{ success, message, from, to }` (mv; into dir if `to` is a dir; 409 on collision) |
| PUT | `/rename` | body `{ path, newName }` | `{ success, message, oldPath, newPath }` |
| POST | `/validate-folder` | body `{ path }` | `{ valid }` / `{ valid:false, error }` (always 200) |
| GET | `/stat` | `path` | `{ exists, isFile, isDirectory, size, mtime }` |

\* required.

`recursive=false` on `/search` means **direct children only** (depth 0).

## Notes

- `/search` never descends into subfolders unless `recursive=true`.
- Symlinks are followed; the `depth` guard (default 50) prevents infinite loops.
- Deleting a file has no extension restriction — it's a generic path API.
