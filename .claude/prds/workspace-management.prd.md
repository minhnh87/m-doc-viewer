# Workspace Management

## Problem
Người dùng cá nhân quản lý nhiều folder trong app research, hiện tại tất cả folder được liệt kê phẳng trong một danh sách duy nhất. Khi số lượng folder tăng lên, danh sách trở nên khó tra cứu và làm page load chậm (render nặng). Người dùng không có cơ chế nhóm folder theo bối cảnh công việc (project, chủ đề nghiên cứu, etc.).

## Evidence
- Pain point được người dùng (owner của tool) báo cáo trực tiếp: "các folder đều liệt kê 1 chỗ, khó tra cứu cũng như làm nặng page"
- Assumption — cần validate: số folder cụ thể gây ra perf issue (ví dụ: >20 folder làm page chậm rõ rệt). Validate bằng cách đo render time với N folder.
- Assumption — cần validate: thời gian tra cứu folder hiện tại (UX cost). Validate bằng tự quan sát/log.

## Users
- **Primary**: Owner của tool (personal use) — research worker quản lý nhiều bộ folder song song theo chủ đề/project khác nhau, cần switch context nhanh giữa các nhóm.
- **Not for**: Multi-user / team collaboration. Không có sharing, không có sync, không có permission.

## Hypothesis
Chúng tôi tin rằng **workspace dạng tab (mỗi workspace chứa một tập folder riêng)** sẽ **giảm số folder phải render đồng thời và cho phép phân nhóm theo bối cảnh** cho **người dùng cá nhân quản lý nhiều project**.

Chúng tôi biết mình đúng khi **chỉ folder thuộc workspace đang active được render** (giảm DOM nodes / network calls), và **người dùng có thể switch giữa các nhóm folder mà không phải scroll qua danh sách phẳng**.

## Success Metrics
| Metric | Target | How measured |
|---|---|---|
| Số folder render đồng thời | ≤ folder trong workspace active (không phải toàn bộ) | Quan sát DOM / network panel |
| Thời gian switch context | < 1s | Đo thời gian từ click tab → folder list ready |
| Subjective: "dễ tra cứu" | Cải thiện rõ | Self-report sau 1 tuần dùng |

## Scope

**MVP** — Minimum để test hypothesis:
- Tạo / đổi tên / xoá workspace
- Add / remove folder vào workspace (folder có thể thuộc nhiều workspace? — xem Open Questions)
- UI dạng tab bar để switch giữa workspace
- Persist workspace + folder mapping qua reload
- Workspace mặc định "Default" để không break trải nghiệm hiện tại của user

**Out of scope**
- Sharing workspace giữa người dùng — không phải multi-user tool
- Sync workspace qua nhiều device — chưa cần
- Drag-and-drop folder giữa workspace — defer sau khi MVP hoạt động
- Nested workspace / workspace group — YAGNI
- Workspace template / preset — YAGNI
- Search xuyên workspace — defer, MVP search trong workspace active là đủ
- Import/export workspace config — defer

## Delivery Milestones
<!-- Business outcomes, not engineering tasks. /plan turns each into a plan. -->
<!-- Status: pending | in-progress | complete -->

| # | Milestone | Outcome | Status | Plan |
|---|---|---|---|---|
| 1 | Workspace data model + persistence | Workspace và folder mapping được lưu, restore đúng sau reload | complete | [.claude/plans/workspace-management.plan.md](../plans/workspace-management.plan.md) |
| 2 | Workspace tab UI + switching | User thấy tab bar, click tab → chỉ folder của workspace đó hiển thị | complete | [.claude/plans/workspace-management-m2.plan.md](../plans/workspace-management-m2.plan.md) |
| 3 | Workspace CRUD (create/rename/delete) | User tự tạo / đổi tên / xoá workspace từ UI | complete | (inline — no separate plan) |
| 4 | Add/remove folder vào workspace | User chọn folder nào thuộc workspace nào | complete | (implicit — covered by M2 dialog/file-tree swap) |
| 5 | Migration: gom folder hiện tại vào "Default" workspace | User không mất folder đã add khi nâng cấp | complete | (implicit — lazy migration in M1 `workspaces.js`) |

## Open Questions
- [ ] Một folder có thể thuộc **nhiều workspace** cùng lúc, hay **chỉ 1 workspace**? (Many-to-many vs 1-to-many) — ảnh hưởng data model.
- [ ] Khi xoá workspace, các folder reference bên trong: xoá luôn (chỉ remove khỏi UI tracking, không động vào filesystem) hay move về "Default"?
- [ ] Tab bar đặt ở đâu trong UI? (Trên cùng / sidebar / dưới header?)
- [ ] Có giới hạn số workspace không? (Để tránh chính workspace tab bar trở thành vấn đề tương tự)
- [ ] State per-workspace: search query, scroll position, selected file — có cần lưu riêng cho từng workspace không, hay chỉ folder list là đủ?
- [ ] Workspace "Default" có thể bị xoá / đổi tên không?

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Migration làm mất folder đã add của user | Medium | High | Backup state trước migration; "Default" workspace tự động chứa toàn bộ folder cũ |
| Tab UI lại làm page nặng (nếu render toàn bộ folder của mọi workspace) | Medium | High | Chỉ render folder của workspace active; lazy-load workspace khác |
| Over-engineer (nested workspace, template, sharing) | High | Medium | Strict YAGNI — MVP chỉ flat workspace, defer mọi feature khác |
| Workspace state không sync giữa nhiều tab browser cùng mở app | Low | Medium | Defer — single-user, hiếm khi mở nhiều tab; nếu cần thì dùng BroadcastChannel sau |

---
*Status: DRAFT — requirements only. Implementation planning pending via /plan.*
