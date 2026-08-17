# m-local-api — API Reference

> Audience: an AI/agent that will integrate a client against this server. This
> file is the **single source of truth** for the HTTP contract. Everything here
> is derived from the server source (`src/`) and is intentionally generic — no
> assumptions about the consuming app.

---

## 1. What this is

A generic, **path-based** local file API. It reads, scans, searches, and mutates
files **anywhere the server process can access on the machine**. It renders
nothing — `/content` returns raw bytes/text, so the client formats however it
likes.

Mental model:

- **One process, localhost only.** Binds `127.0.0.1` by default. This binding
  is the primary guard rail — there is **no path allowlist**. Any file the OS
  user running the server can read/write is reachable.
- **Absolute paths in, absolute paths out.** Every endpoint takes absolute
  filesystem paths (with `~` / `~/…` expansion). Relative paths are resolved
  against the server's *current working directory* — unreliable, so always send
  absolute paths.
- **Format-agnostic.** No markdown/HTML rendering, no content transformation.
- **Stateless.** No sessions, no database, no cross-request state. Each call is
  an independent filesystem operation.

Runtime: Node.js + Express (`type: module`). Dependencies: `express`, `cors`.

---

## 2. Base URL & request shape

```
http://{HOST}:{PORT}{API_PREFIX}{ENDPOINT}
        │      │      │           └─ e.g. /tree, /content, /search
        │      │      └───────────── obfuscated prefix, default /apif7f9470e8818
        │      └──────────────────── default 3333
        └─────────────────────────── default 127.0.0.1
```

Default base for a stock install:

```
http://127.0.0.1:3333/apif7f9470e8818
```

Rules:

- **Every** endpoint below is mounted **under `API_PREFIX`** (including
  `/health`). There is nothing served at `/api/...` or at the bare path.
- Request bodies are JSON (`Content-Type: application/json`). Query params are
  standard URL query strings.
- Responses are always JSON (`application/json`), except unmatched routes (see
  §8).

---

## 3. Authentication

Every request must carry the API key header:

```
X-API-Key: <API_KEY>
```

| Case | Result |
|---|---|
| Header matches `API_KEY` exactly | request proceeds |
| Header missing or wrong | `401 { "error": "Invalid or missing API key", "code": "UNAUTHORIZED" }` |
| `OPTIONS` (CORS preflight) | always allowed (never checked) |
| `…/health` | always allowed (liveness, no key needed) |
| Server started with `API_KEY=""` | auth **disabled** — all requests pass (a startup warning is logged) |

- Header name is case-insensitive (`X-API-Key`, `x-api-key`, … all work).
- Comparison is an exact string equality check (no hashing, no timing-safe
  compare — this is a localhost dev tool).
- The key ships with a **built-in default** (`1acad1323344b15937de23f02afc4e964f77cf76c9c9f20b`).
  It is duplicated in each client's config. For real security, override both the
  server's `API_KEY` **and** `API_PREFIX` env vars and the matching client
  config. See §11.

---

## 4. CORS & host binding

- CORS: `origin: *`, methods `GET,POST,PUT,DELETE,OPTIONS`, allowed headers
  `Content-Type,X-API-Key`. The wildcard origin is deliberate so pages opened
  over `file://` (origin `null`, no credentials) can call the API.
- Host binds `127.0.0.1` by default. Do not expose it on `0.0.0.0` / a LAN
  interface without adding your own network controls — there is no path
  sandbox.

---

## 5. Configuration (environment variables)

All optional; defaults shown. Read once at startup.

| Var | Default | Meaning |
|---|---|---|
| `M_LOCAL_API_PORT` / `PORT` | `3333` | Listen port (`M_LOCAL_API_PORT` wins; then `PORT`) |
| `M_LOCAL_API_HOST` | `127.0.0.1` | Listen host — keep local |
| `EXCLUDE_DIRS` | `node_modules,.git` | CSV of directory **names** skipped while scanning |
| `EXTENSIONS` | `.md,.drawio,.mermaid,.mmd` | CSV default file filter. `*` = all files |
| `INCLUDE_HIDDEN` | `false` | Descend into / list hidden **directories** while scanning (`"true"` to enable). Hidden **files** are emitted regardless — see §6.4 |
| `MAX_FILE_BYTES` | `26214400` (25 MiB) | `/content` size ceiling; larger → `413` |
| `ENABLE_WRITES` | `true` | `"false"` → all mutation routes return `403` |
| `API_KEY` | built-in default | Required `X-API-Key` value. Empty string disables auth |
| `API_PREFIX` | `/apif7f9470e8818` | Route prefix (normalized to a leading-slash, no-trailing-slash path) |

Per-request query/body params override the scan-related defaults
(`EXTENSIONS`, `EXCLUDE_DIRS`, `INCLUDE_HIDDEN`) for that call only.

---

## 6. Conventions

### 6.1 Path resolution
- Input paths run through `path.resolve(expandTilde(path))`.
- `~` → home dir, `~/foo` → `<home>/foo`. `~otheruser` is **not** supported.
- No `..` sanitization and no allowlist — traversal is "allowed" because the
  whole filesystem (for that OS user) is in scope by design.
- **Response `path`/`oldPath`/`newPath`/`from`/`to` fields are always the
  resolved absolute path.**

### 6.2 Root echoing
- `/tree` and `/trees` echo back the `root` **exactly as you sent it** (raw,
  un-resolved) in the `root` field, so you can key results by your own input.
  All other path fields inside those responses are absolute.

### 6.3 Timestamps
- `mtime` fields are JS `Date` objects serialized to JSON, i.e. **ISO 8601
  strings** (e.g. `"2026-07-01T09:15:00.000Z"`). Exception: `/stat` on a missing
  path returns `mtime: null`.

### 6.4 Scan semantics (shared by `/tree`, `/trees`, recursive `/search`)
A directory walk that:
- Recurses to a **depth guard** (default `50`) which also breaks symlink loops.
- Skips any directory whose **name** is in `excludeDirs`.
- Skips hidden **directories** (name starts with `.`) unless `includeHidden` is
  true — this gates whether the walk *descends* into dot-dirs and whether they
  appear in `folders[]`.
- **Hidden files are always emitted.** `includeHidden` does **not** filter
  files: a dotfile such as `.env` or `.gitignore` appears in `files[]` whenever
  its extension passes the `ext` filter (e.g. with `ext=*`), even when
  `includeHidden=false`. Filter dotfiles client-side if you need them excluded.
- Emits only files whose extension passes the `extensions` filter
  (`null`/`*` = all).
- On a subtree it can't read (e.g. `EACCES`), **skips that subtree and keeps
  going** (logged to stderr; never fails the whole request).
- `depth` param semantics: `depth=0` = the root's own files only (no descent);
  `depth=1` = root + one level; etc.

### 6.5 Boolean & list params
- Booleans (`includeHidden`, `recursive`): true only for the literal values
  `true`, `"true"`, or `"1"`. Anything else is false.
- CSV params (`exclude`, `ext`): comma-separated; whitespace trimmed; empties
  dropped. Passing a **non-empty** value **replaces** the default list; passing
  an empty string falls back to the config default. (To scan into
  `node_modules`, override `exclude` with a name that doesn't match it.)
- `ext` normalization: each entry lowercased and dot-prefixed
  (`md` → `.md`). The single value `*` means "all files" (no extension filter).

---

## 7. Shared data types

### FileEntry (from `/tree`, `/trees`)
```jsonc
{
  "name": "notes.md",          // basename
  "path": "/abs/dir/notes.md", // absolute path
  "relPath": "sub/notes.md",   // path relative to the scanned root
  "folder": "sub",             // parent dir relative to root, or "." for the root itself
  "ext": ".md",                // lowercased extension
  "type": "markdown"           // coarse type — see below
}
```

### SearchResult (from `/search`)
```jsonc
{
  "file": {
    "name": "notes.md",
    "path": "/abs/dir/notes.md", // absolute
    "ext": ".md",
    "type": "markdown"
    // NOTE: no relPath / folder on search results
  },
  "matches": [
    {
      "line": 12,               // 1-based line number
      "content": "...context around the hit...", // may be prefixed/suffixed with "..."
      "matchStart": 8           // index of the match within `content`
    }
  ]
}
```

### `type` values
Coarse type derived from extension:

| Extension(s) | `type` |
|---|---|
| `.md`, `.markdown` | `markdown` |
| `.drawio` | `drawio` |
| `.mermaid`, `.mmd` | `mermaid` |
| anything else | `text` |

`type` is a hint only. It does **not** imply the content was parsed or is valid.

---

## 8. Error model

Thrown errors serialize to a JSON envelope with the matching HTTP status:

```jsonc
{ "error": "human message", "code": "MACHINE_CODE" }
```

| Status | `code` | When |
|---|---|---|
| `400` | `VALIDATION_FAILED` | Missing/invalid params. `error` is `"field: reason; field2: reason"` |
| `400` | `BAD_REQUEST` | Semantic error (e.g. root is not a directory, path is a directory, invalid new name) |
| `401` | `UNAUTHORIZED` | Missing/wrong `X-API-Key` |
| `403` | `WRITES_DISABLED` | Mutation attempted while `ENABLE_WRITES=false` |
| `403` | `FORBIDDEN` | Generic forbidden (base class; `WRITES_DISABLED` is the only concrete use) |
| `404` | `NOT_FOUND` | Path/file/directory/newest-file does not exist |
| `409` | `CONFLICT` | Destination already exists (create folder, move, rename) |
| `413` | `FILE_TOO_LARGE` | `/content` on a file above `MAX_FILE_BYTES` |
| `500` | *(none — no `code` field)* | Unhandled error, e.g. malformed JSON body, cross-device move (`EXDEV`) |

Validation-message vocabulary (joined by `; `): `is required`, `must be string`,
`must be array`, `must be one of utf-8, base64`.

Notes:
- **Unmatched routes** (unknown path under the prefix) return Express's default
  `404` **HTML**, *not* the JSON envelope. Only known routes and thrown
  `HttpError`s use the JSON shape.
- A **malformed JSON request body** surfaces as `500 { "error": "Internal
  server error" }` (the body parser error is not mapped to 400).

---

## 9. Endpoints

Legend: **Auth** = needs `X-API-Key` (all except `/health`). **Writes** = gated
by `ENABLE_WRITES` (returns `403` when disabled). Required params marked `*`.

### 9.1 `GET /health` — liveness
- Auth: **no**. Writes: no.
- Params: none.
- `200`:
  ```json
  { "ok": true, "name": "m-local-api", "version": "1.0.0" }
  ```
- The only unauthenticated endpoint. Use it to detect that the server is up and
  which prefix is live (a wrong `API_PREFIX` → HTML 404).

### 9.2 `GET /stat` — path metadata (non-throwing for "missing")
- Auth: yes. Writes: no.
- Query: `path`\* (string).
- Missing path → still `200`:
  ```json
  { "exists": false, "isFile": false, "isDirectory": false, "size": 0, "mtime": null }
  ```
- Existing path → `200`:
  ```json
  { "exists": true, "isFile": true, "isDirectory": false, "size": 1234, "mtime": "2026-07-01T09:15:00.000Z" }
  ```
- Errors: `400 VALIDATION_FAILED` if `path` missing.

### 9.3 `GET /tree` — scan one directory
- Auth: yes. Writes: no.
- Query: `root`\* (string), `ext`, `exclude`, `includeHidden`, `depth`.
  - `ext`: CSV or `*`; unset → config default.
  - `exclude`: CSV of dir names; unset → config default.
  - `includeHidden`: bool; unset → config default.
  - `depth`: integer; unset → `50`.
- `200`:
  ```jsonc
  {
    "root": "/Users/me/notes",   // echoed verbatim from your input
    "files": [ /* FileEntry[] */ ],
    "folders": ["sub", "sub/deep", "empty-dir"] // all dirs incl. empty, relative to root
  }
  ```
- Errors: `404 NOT_FOUND` "Root not found"; `400 BAD_REQUEST` "Root is not a
  directory".

### 9.4 `POST /trees` — scan many directories in one call
- Auth: yes. Writes: no.
- Body:
  ```jsonc
  {
    "roots": ["/abs/a", "~/b"],  // required array
    "ext": "*",                   // optional (same semantics as /tree)
    "exclude": "node_modules,.git",
    "includeHidden": true,
    "depth": 3
  }
  ```
- `200`:
  ```jsonc
  {
    "roots": [
      { "root": "/abs/a", "files": [ /* FileEntry[] */ ], "folders": [ /* string[] */ ] }
    ]
  }
  ```
- **Bad roots are silently skipped** (missing / not a directory / read error) —
  they simply don't appear in the response `roots` array. No error is raised for
  them. `root` is echoed verbatim so you can match results to inputs.
- Errors: `400 VALIDATION_FAILED` if `roots` missing or not an array.

### 9.5 `GET /content` — read a file's raw content
- Auth: yes. Writes: no.
- Query: `path`\* (string), `encoding` (`utf-8` | `base64`, default `utf-8`).
- `200`:
  ```jsonc
  {
    "path": "/abs/dir/notes.md", // resolved absolute
    "name": "notes.md",
    "ext": ".md",
    "type": "markdown",
    "content": "raw file contents…", // string; base64 if requested
    "encoding": "utf-8",
    "size": 1234,
    "mtime": "2026-07-01T09:15:00.000Z"
  }
  ```
- Use `encoding=base64` for binary/non-UTF-8 files.
- No `html` / rendered field — render client-side.
- Errors: `404 NOT_FOUND` "File not found"; `400 BAD_REQUEST` "Path is a
  directory" / "Path is not a file"; `413 FILE_TOO_LARGE` (over `MAX_FILE_BYTES`);
  `400 VALIDATION_FAILED` if `encoding` not one of the allowed values.

### 9.6 `GET /content-range` — read a byte-range slice (streams large files)
- Auth: yes. Writes: no.
- Query: `path`\* (string, `~`-expanded), `offset` (byte offset, default `0`),
  `length` (byte count, default & max `8388608` = 8 MiB per call).
- **Not** subject to the `MAX_FILE_BYTES` (25 MiB) cap that `/content` enforces —
  this endpoint exists to read files *larger* than that cap, one slice at a time.
- `200`:
  ```jsonc
  {
    "path": "/abs/.claude/projects/-slug/id.jsonl", // resolved absolute
    "size": 26843545,        // total file size in bytes
    "offset": 8388608,       // byte offset this slice starts at (clamped ≥ 0)
    "length": 8388608,       // bytes actually returned (≤ 8 MiB; smaller at EOF)
    "content": "eyJ0eXBl..", // base64 of the raw slice bytes
    "eof": false,            // true once offset+length reaches size
    "mtime": "2026-07-01T09:15:00.000Z"
  }
  ```
- `content` is **always base64** (raw bytes) so multi-byte UTF-8 sequences that
  straddle a slice boundary aren't corrupted — the client concatenates decoded
  bytes across slices and decodes text itself (e.g. `TextDecoder({stream:true})`).
- Clients read the whole file by looping: start at `offset=0`, then advance
  `offset += length` each call until `eof` is `true`.
- `length` is clamped to `[0, 8 MiB]`; a request for more returns at most one
  8 MiB slice (continue from the next offset).
- When `offset >= size`, the response is `200` with `content:""`, `length:0`,
  `eof:true`.
- Errors: `400 VALIDATION_FAILED` if `path` missing; `404 NOT_FOUND` "File not
  found"; `400 BAD_REQUEST` "Path is a directory" / "Path is not a file";
  `401 UNAUTHORIZED` on missing/wrong `X-API-Key`.

### 9.7 `GET /search` — case-insensitive substring search
- Auth: yes. Writes: no.
- Query:
  | Param | Req | Notes |
  |---|---|---|
  | `query` | \* | Search string (plain substring, **not** regex) |
  | `roots` | \* | **JSON array string**, e.g. `["/abs/a","/abs/b"]` |
  | `recursive` | | bool. `false` (default) = **direct children only, depth 0** |
  | `ext` | | CSV / `*`; unset → config default |
  | `exclude` | | CSV dir names; unset → config default (recursive only) |
  | `includeHidden` | | bool; unset → config default (recursive only) |
  | `maxMatches` | | integer, default `5` — max matches **per file** |
  | `context` | | integer, default `50` — context chars each side of a hit |
- `200`:
  ```jsonc
  {
    "results": [ /* SearchResult[] — see §7 */ ],
    "totalMatches": 7,   // sum of matches across files
    "totalFiles": 3      // number of files with ≥1 match
  }
  ```
- Behavior:
  - Match is **case-insensitive substring**, evaluated **per line** (content is
    split on `\n`; a hit can't span lines).
  - Stops at `maxMatches` per file.
  - `recursive=true` → deep scan (respects `ext`/`exclude`; `includeHidden`
    gates descent into hidden dirs only — hidden files always match, see §6.4;
    depth `50`). `recursive=false` → only the immediate files directly inside
    each root (`exclude`/`includeHidden` have no effect in this mode).
  - Roots that don't exist / aren't directories are skipped. Files that can't be
    read are skipped.
  - `matchStart` is the offset of the hit **inside the returned `content`
    string** (already accounts for a leading `"..."` truncation marker).
- Errors: `400 VALIDATION_FAILED` if `query`/`roots` missing;
  `400 BAD_REQUEST` "roots is required" if `roots` parses to an empty array
  (e.g. `roots=[]` or invalid JSON).

### 9.8 `GET /newest` — newest file by mtime under a directory
- Auth: yes. Writes: no.
- Query: `dir`\* (string), `ext` (CSV/`*`, unset → config default),
  `recursive` (bool, default false).
- `200`:
  ```jsonc
  {
    "path": "/abs/dir/2026-07-01.md", // absolute
    "name": "2026-07-01.md",
    "mtime": "2026-07-01T09:15:00.000Z",
    "size": 512
  }
  ```
- `recursive=true` descends into subdirectories; otherwise only direct children.
- Errors: `404 NOT_FOUND` "Directory not found"; `404 NOT_FOUND` "No files
  found" (dir exists but nothing matches the filter).

### 9.9 `POST /folder` — create a directory (mkdir -p) 🔒 writes
- Auth: yes. Writes: **yes**.
- Body: `{ "path": "/abs/new/dir" }` (required).
- Creates recursively (parents made as needed).
- `200`:
  ```json
  { "success": true, "message": "Folder created successfully", "path": "/abs/new/dir" }
  ```
- Errors: `409 CONFLICT` "Folder already exists"; `403 WRITES_DISABLED`.

### 9.10 `DELETE /folder` — delete a directory recursively 🔒 writes
- Auth: yes. Writes: **yes**.
- Query: `path`\* (string).
- Deletes recursively (`rm -rf`-style). **No confirmation, no trash.**
- `200`:
  ```json
  { "success": true, "message": "Folder deleted successfully", "path": "/abs/dir" }
  ```
- Errors: `404 NOT_FOUND` "Folder not found"; `400 BAD_REQUEST` "Path is not a
  folder"; `403 WRITES_DISABLED`.

### 9.11 `DELETE /file` — delete a file 🔒 writes
- Auth: yes. Writes: **yes**.
- Query: `path`\* (string).
- **No extension/allowlist restriction** — deletes any file (permanent, no
  trash).
- `200`:
  ```json
  { "success": true, "message": "File deleted successfully", "path": "/abs/file.md" }
  ```
- Errors: `404 NOT_FOUND` "File not found"; `400 BAD_REQUEST` "Path is not a
  file"; `403 WRITES_DISABLED`.

### 9.12 `PUT /file/move` — move a file or folder (`mv`) 🔒 writes
- Auth: yes. Writes: **yes**.
- Body: `{ "from": "/abs/src", "to": "/abs/dest" }` (both required).
- Semantics:
  - If `to` is an **existing directory**, the item is moved **into** it
    (`to/basename(from)`).
  - Otherwise `to` is treated as the full destination path (also serves as a
    rename-with-move).
  - Works for both files and directories (`fs.rename`).
- `200`:
  ```jsonc
  { "success": true, "message": "Moved successfully", "from": "/abs/src", "to": "/abs/dest/src" }
  ```
- Errors: `404 NOT_FOUND` "Source not found"; `409 CONFLICT` "A file with this
  name already exists in the destination"; `403 WRITES_DISABLED`. A cross-device
  move (`EXDEV`) surfaces as an unhandled `500`.

### 9.13 `PUT /rename` — rename in place 🔒 writes
- Auth: yes. Writes: **yes**.
- Body: `{ "path": "/abs/item", "newName": "new-name.md" }` (both required).
- `newName` is **sanitized**: the characters `< > : " / \ | ? *` are stripped
  and it is trimmed. Because `/` and `\` are removed, `newName` **cannot change
  directories** — the item stays in its current parent.
- `200`:
  ```jsonc
  { "success": true, "message": "Renamed successfully", "oldPath": "/abs/item", "newPath": "/abs/new-name.md" }
  ```
- Errors: `400 BAD_REQUEST` "Invalid new name" (empty after sanitizing);
  `404 NOT_FOUND` "File or folder not found"; `409 CONFLICT` "A file or folder
  with this name already exists"; `403 WRITES_DISABLED`.

### 9.14 `POST /validate-folder` — non-throwing directory check
- Auth: yes. Writes: **no** (read-only probe — *not* gated by `ENABLE_WRITES`,
  despite being a POST).
- Body: `{ "path": "/abs/maybe-dir" }` (required).
- **Always `200`.** Never throws for a bad/missing path:
  ```json
  { "valid": true }
  ```
  ```json
  { "valid": false, "error": "Path does not exist" }
  ```
- `error` is one of: `"Path does not exist"`, `"Path is not a directory"`, or a
  raw filesystem error message.

---

## 10. Quick reference

| Method | Path | Auth | Writes | Required params | Success payload (top-level keys) |
|---|---|---|---|---|---|
| GET | `/health` | – | – | – | `ok, name, version` |
| GET | `/stat` | ✓ | – | `path` | `exists, isFile, isDirectory, size, mtime` |
| GET | `/tree` | ✓ | – | `root` | `root, files, folders` |
| POST | `/trees` | ✓ | – | `roots[]` | `roots[]` |
| GET | `/content` | ✓ | – | `path` | `path, name, ext, type, content, encoding, size, mtime` |
| GET | `/content-range` | ✓ | – | `path` | `path, size, offset, length, content, eof, mtime` |
| GET | `/search` | ✓ | – | `query, roots` | `results, totalMatches, totalFiles` |
| GET | `/newest` | ✓ | – | `dir` | `path, name, mtime, size` |
| POST | `/folder` | ✓ | ✓ | `path` | `success, message, path` |
| DELETE | `/folder` | ✓ | ✓ | `path` | `success, message, path` |
| DELETE | `/file` | ✓ | ✓ | `path` | `success, message, path` |
| PUT | `/file/move` | ✓ | ✓ | `from, to` | `success, message, from, to` |
| PUT | `/rename` | ✓ | ✓ | `path, newName` | `success, message, oldPath, newPath` |
| POST | `/validate-folder` | ✓ | – | `path` | `valid` (+ `error` when invalid) |

All paths are relative to `{API_PREFIX}` (default `/apif7f9470e8818`).

---

## 11. Integration checklist

For a client integrating against this API:

1. **Config surface.** Expose (env or config): `baseUrl`
   (`http://127.0.0.1:3333`), `apiPrefix` (`/apif7f9470e8818`), `apiKey`. Build
   request URLs as `baseUrl + apiPrefix + endpoint`.
2. **Always send `X-API-Key`** on every request (skip only `/health`).
3. **Send absolute paths** (or `~`-prefixed). Never rely on relative paths.
4. **Handle the error envelope.** On non-2xx, parse `{ error, code }`; fall back
   to a status-based message if the body isn't JSON (unmatched-route 404s are
   HTML). Map `code` to app behavior where useful (`WRITES_DISABLED`,
   `FILE_TOO_LARGE`, `CONFLICT`, `NOT_FOUND`).
5. **`mtime` is an ISO string** — parse to a date on the client.
6. **Bound your scans.** `/tree` has no pagination; use `ext` / `exclude` /
   `depth` for large roots.
7. **Security before leaving localhost.** The defaults (`API_KEY`, `API_PREFIX`)
   are public knowledge (they're in this repo). Override **both** the server env
   and the client config if the host is anything but a private machine. There is
   no path allowlist — treat write endpoints (`/file`, `/folder`, `/file/move`,
   `/rename`) as capable of touching *any* file the server user owns. Set
   `ENABLE_WRITES=false` for a read-only deployment.

### Minimal client (language-agnostic pseudocode)

```
BASE   = "http://127.0.0.1:3333"
PREFIX = "/apif7f9470e8818"
KEY    = "<API_KEY>"

func call(method, endpoint, {query, body}):
    url = BASE + PREFIX + endpoint + encodeQuery(query)
    res = http(method, url,
               headers = { "X-API-Key": KEY, "Content-Type": "application/json" },
               body    = body ? json(body) : none)
    text = res.body
    data = tryParseJson(text)          // may be null for HTML 404s
    if res.status >= 400:
        throw Error(data?.error ?? ("request failed " + res.status), code = data?.code)
    return data

// examples
call("GET",  "/tree",    { query: { root: "/Users/me/notes", ext: "*" } })
call("GET",  "/content", { query: { path: "/Users/me/notes/a.md" } })
call("GET",  "/search",  { query: { query: "todo", roots: '["/Users/me/notes"]', recursive: "true" } })
call("POST", "/folder",  { body:  { path: "/Users/me/notes/new" } })
call("PUT",  "/rename",  { body:  { path: "/Users/me/notes/a.md", newName: "b.md" } })
```

### JavaScript / TypeScript `fetch` shape

```ts
async function call(method: string, endpoint: string, opts: {
  query?: Record<string, string>;
  body?: unknown;
} = {}) {
  const qs = opts.query ? "?" + new URLSearchParams(opts.query).toString() : "";
  const res = await fetch(`${BASE}${PREFIX}${endpoint}${qs}`, {
    method,
    headers: {
      "X-API-Key": KEY,
      ...(opts.body ? { "Content-Type": "application/json" } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const text = await res.text();
  const data = text ? safeJsonParse(text) : null; // null on HTML/empty
  if (!res.ok) throw new Error(data?.error ?? `Request failed (${res.status})`);
  return data;
}
```

---

## 12. Behavioral gotchas (read before implementing)

- `/search` `roots` is a **JSON-encoded array in a query string**, not a CSV.
- `recursive=false` on `/search` = **depth 0** (direct children only), and in
  that mode `exclude`/`includeHidden` are ignored.
- `/trees` never errors on bad roots — it just omits them. If you need to know a
  root failed, diff your input list against the returned `root` values.
- `/validate-folder` is a POST but is **not** write-gated and **always** returns
  `200` — check the `valid` flag, don't rely on status.
- Deletes and folder-deletes are **permanent and recursive** — no trash, no
  confirmation.
- `/content` refuses files over `MAX_FILE_BYTES` (`413`) — decide whether to
  stream/skip large files on the client.
- Unknown routes and malformed JSON bodies do **not** return the `{error,code}`
  envelope (HTML 404 and bare-500 respectively).
- `includeHidden=false` still returns **hidden files** (dotfiles) in `/tree`,
  `/trees`, and `/search` — it only hides dot-**directories**. Strip dotfiles
  client-side if you don't want them.
- `type` (`markdown`/`drawio`/`mermaid`/`text`) is extension-based only; unknown
  extensions are `text`. Don't treat it as validation.
```
