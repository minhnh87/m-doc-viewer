# Plan: Workspace Management — Milestone 1

**Source PRD**: `.claude/prds/workspace-management.prd.md`
**Selected Milestone**: M1 — Workspace data model + persistence
**Complexity**: Small

## Summary
Tạo lớp persistence cho workspace ở client-side (localStorage), với lazy migration từ `externalFolders` (flat array hiện tại) sang cấu trúc workspace mới. Milestone này **không** thay đổi UI, không thay đổi backend. Code hiện tại vẫn chạy bình thường vì `storage.js` cũ được giữ nguyên; module mới `workspaces.js` co-exist và sẽ được M2 (UI) tiếp nhận.

## Decisions Resolved During Planning

Hai open question trong PRD ảnh hưởng trực tiếp schema, mình quyết định default sau (có thể đảo ngược ở milestone sau):

| Open Question | Decision | Rationale |
|---|---|---|
| Folder thuộc 1 hay nhiều workspace? | **1-to-many** (mỗi folder thuộc đúng 1 workspace) | Mental model "folder là một phần của project X" đơn giản hơn; schema phẳng; YAGNI — many-to-many có thể thêm sau nếu pain phát sinh. |
| Xoá workspace → folder đi đâu? | **Move sang "Default" workspace** | Folder do user thêm thủ công — tránh data loss. "Default" luôn tồn tại làm fallback an toàn. UI có thể prompt user ở M3, layer data luôn move-to-default. |
| Default workspace protected? | **Không xoá được, có thể rename** | Cần một sink workspace để move folder khi xoá ws khác. Rename OK để user customize. |

## Patterns to Mirror

| Category | Source | Pattern |
|---|---|---|
| Storage module shape | `public/modules/storage.js:1-32` | Function-based, named exports `getX`/`saveX`/`addX`/`removeX`, defensive `try/catch` quanh `JSON.parse` |
| State module shape | `public/modules/state.js:1-26` | Module-scope state + named getters; immutable update via `Object.assign` (mình sẽ dùng spread thay vì assign để strict immutable theo `.claude/rules`) |
| JSDoc cho types | `src/services/external-folders.service.js:4-9` | `@typedef`/`@param` với JSDoc thay vì TS interface |
| Naming convention | `storage.js` `EXTERNAL_FOLDERS_KEY` | UPPER_SNAKE_CASE cho localStorage keys; camelCase cho functions |
| File size discipline | Hầu hết module 200-400 dòng | Tách module mới thay vì nhồi vào `storage.js` |
| Error handling | `getExternalFolders` swallows parse error, returns `[]` | Same pattern — corrupted storage không được crash app, fall back sang empty state |

**Pattern không có sẵn**: Không có test framework setup. Sẽ defer test infrastructure sang task riêng cuối milestone (xem Task 5).

## Files to Change

| File | Action | Why |
|---|---|---|
| `public/modules/workspaces.js` | CREATE | Module persistence mới cho workspace + folder mapping |
| `public/modules/storage.js` | UNCHANGED (M1) | Giữ nguyên — code hiện tại còn dùng. M5 sẽ retire sau. |
| `src/domain/workspace.js` | CREATE | JSDoc `@typedef` cho `Workspace` và `WorkspacesState` (mirror `src/domain/file-entry.js`) |
| `package.json` | UPDATE (optional) | Thêm script `test` dùng `node --test` nếu Task 5 được approve |
| `tests/workspaces.test.js` | CREATE (optional) | Smoke test cho workspaces module nếu Task 5 được approve |

## Data Model

```js
// localStorage key: 'workspacesState'
{
  "version": 1,
  "activeWorkspaceId": "ws-default",
  "workspaces": [
    {
      "id": "ws-default",
      "name": "Default",
      "folderPaths": ["/abs/path/foo", "/abs/path/bar"],
      "createdAt": 1716470000000
    }
  ]
}
```

- `id`: UUID-like string. `ws-default` reserved cho Default workspace.
- `version`: dành cho future schema migration; M1 = 1.
- `folderPaths`: absolute paths (giống `externalFolders` cũ).
- Không lưu `updatedAt`, search query, scroll position — YAGNI cho M1.

## Tasks

### Task 1: Tạo JSDoc typedef cho Workspace domain

- **Action**: Tạo `src/domain/workspace.js` với `@typedef` cho `Workspace` (`{ id, name, folderPaths, createdAt }`) và `WorkspacesState` (`{ version, activeWorkspaceId, workspaces }`).
- **Mirror**: `src/domain/file-entry.js` — pure JSDoc export, không có runtime code.
- **Validate**: `node -e "import('./src/domain/workspace.js').then(() => console.log('ok'))"` không throw.

### Task 2: Tạo `public/modules/workspaces.js` storage module

- **Action**: Implement các named export theo function-based pattern của `storage.js`:
  - `getWorkspacesState()` — đọc localStorage, parse, lazy-migrate nếu cần, trả về state.
  - `saveWorkspacesState(state)` — persist.
  - `getActiveWorkspaceId()` / `setActiveWorkspaceId(id)`.
  - `getWorkspaces()` — array.
  - `getWorkspaceById(id)`.
  - `getActiveWorkspace()`.
  - `getActiveWorkspaceFolders()` — folderPaths array (đây sẽ là thay thế cho `getExternalFolders()` ở M2).
  - `createWorkspace(name)` → trả về workspace mới (id sinh tự động via `crypto.randomUUID()`).
  - `renameWorkspace(id, newName)`.
  - `deleteWorkspace(id)` — move folders sang Default, không cho xoá `ws-default`.
  - `addFolderToWorkspace(workspaceId, folderPath)` — idempotent (không thêm trùng).
  - `removeFolderFromWorkspace(workspaceId, folderPath)`.
- **Lazy migration logic** (trong `getWorkspacesState`):
  1. Đọc `localStorage['workspacesState']`. Nếu parse OK + hợp lệ → return.
  2. Nếu chưa có hoặc parse fail: đọc legacy `localStorage['externalFolders']`. Tạo Default workspace với folderPaths đó.
  3. Save state mới về `workspacesState`. **Không xoá** `externalFolders` ở M1 (M5 cleanup).
  4. Return state.
- **Immutable updates**: mọi mutation đều dùng spread (`{...state, workspaces: [...state.workspaces, newWs]}`), không in-place mutate.
- **Error handling**: corrupted JSON → fall back sang empty Default workspace; log `console.warn` nhưng không throw.
- **Mirror**: `storage.js:1-32` cho shape; `state.js:1-26` cho module-scope helper structure.
- **Validate**:
  - Manual: mở app, run trong DevTools console:
    ```js
    const m = await import('/modules/workspaces.js');
    m.getWorkspacesState(); // → state with Default ws có folders cũ
    m.createWorkspace('Research');
    m.getWorkspaces(); // → 2 workspaces
    location.reload(); // sau reload, vẫn còn 2 ws
    ```
  - Hoặc unit test (Task 5).

### Task 3: Verify migration scenarios

- **Action**: Chạy thủ công 4 kịch bản trong DevTools console:
  1. **Fresh state**: `localStorage.clear()` → `getWorkspacesState()` trả về 1 Default ws rỗng.
  2. **Legacy only**: clear, set `externalFolders` = `["/a","/b"]` → `getWorkspacesState()` trả về Default ws với 2 folder.
  3. **Mixed legacy + new**: set cả `externalFolders` và `workspacesState` → ưu tiên `workspacesState`, ignore legacy.
  4. **Corrupted**: set `workspacesState = "not json"` → fall back sang fresh Default, không crash.
- **Validate**: 4/4 scenarios pass. Document kết quả trong PR description khi M1 merge.

### Task 4: Verify persistence + idempotency

- **Action**: Trong DevTools:
  1. `createWorkspace('A')` → reload → workspace A vẫn còn.
  2. `addFolderToWorkspace(id, '/x')` × 2 lần → folderPaths chỉ có 1 entry `/x`.
  3. `deleteWorkspace(id)` với A có folder `/y` → `/y` xuất hiện trong Default.
  4. `deleteWorkspace('ws-default')` → throw hoặc no-op (decision: throw `Error('Cannot delete default workspace')`).
- **Validate**: All assertions hold.

### Task 5 (Optional): Setup minimal test infrastructure

- **Action**: 
  - Thêm `"test": "node --test tests/**/*.test.js"` vào `package.json` scripts.
  - Tạo `tests/workspaces.test.js` dùng built-in `node:test` + `node:assert`.
  - Mock localStorage cho Node environment (đơn giản: in-memory Map shim ở đầu file test).
  - Cover: lazy migration, create/rename/delete, add/remove folder, persistence shape.
- **Mirror**: Không có precedent trong repo — minimal `node:test` style.
- **Validate**: `npm test` exit 0.
- **Defer if**: User muốn ship M1 nhanh; manual verification (Task 3+4) là đủ cho personal use. Có thể làm sau khi M2-M4 hoàn thành.

## Validation

```bash
# Syntax check toàn bộ JS module mới (không có linter setup, dùng node --check)
node --check public/modules/workspaces.js
node --check src/domain/workspace.js

# Smoke: app boot không crash
npm start &
sleep 2
curl -sf http://localhost:8080 > /dev/null && echo "boot ok"
kill %1

# Manual: DevTools console assertions trong Task 3 + Task 4

# Optional (nếu Task 5 được làm)
npm test
```

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Migration đọc `externalFolders` sai shape (vd folders là object cũ hơn) | Low | Defensive: chỉ accept khi `Array.isArray(legacy)`; fallback empty. |
| `crypto.randomUUID()` không có ở browser cũ | Very Low | App đã dùng modern ES modules + fetch, không support browser cũ. Fallback `Date.now()+random` nếu cần. |
| Lazy migration chạy nhiều lần do code khác đọc trực tiếp localStorage | Low | Migration check `localStorage['workspacesState']` trước; chỉ migrate khi key chưa có. Idempotent. |
| Conflict giữa `externalFolders` (legacy) và workspace folder list khi M2 chưa xong | Medium | M1 không thay đổi code consumer cũ. File-tree vẫn đọc `getExternalFolders()`. M2 sẽ swap. Trong khoảng giữa, 2 nguồn tồn tại song song nhưng UI cũ chỉ đọc nguồn cũ → không conflict thực tế. |
| Test infrastructure tốn thời gian cho personal MVP | Medium | Task 5 marked optional. Manual verification đủ cho personal use. |

## Acceptance

- [ ] `src/domain/workspace.js` chứa JSDoc typedef cho `Workspace` và `WorkspacesState`.
- [ ] `public/modules/workspaces.js` exports đầy đủ functions trong Task 2.
- [ ] Lazy migration hoạt động: 4 scenarios trong Task 3 đều pass.
- [ ] Persistence + idempotency: 4 assertions trong Task 4 đều pass.
- [ ] `storage.js` cũ **không bị sửa** ở M1 (consumer code chưa break).
- [ ] App vẫn boot bình thường, file-tree vẫn render như trước (`getExternalFolders()` không bị ảnh hưởng).
- [ ] All immutable update patterns (spread, không in-place mutation).
- [ ] No `console.log` còn sót (chỉ `console.warn` cho migration errors).
- [ ] (Optional) `npm test` pass nếu Task 5 được thực hiện.

## Next Milestone Preview

**M2 — Workspace tab UI + switching** sẽ:
- Add tab bar component vào `index.html` header area.
- Swap `file-tree.js` để đọc `getActiveWorkspaceFolders()` thay vì `getExternalFolders()`.
- Click tab → setActiveWorkspaceId + reload tree.
- Lúc đó M1's storage module mới thực sự được consume.

---
*Plan generated by `/plan`. WAITING FOR CONFIRMATION before writing code.*
