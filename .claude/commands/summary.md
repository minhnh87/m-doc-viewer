# Summary Article Skill

Skill này tự động summary bài viết từ link Reddit hoặc GitHub và lưu vào thư mục `3_READING/`.

## Trigger
- Khi user gọi `/summary <url>`
- Hoặc khi user paste link Reddit/GitHub

## Instructions

Khi nhận được link Reddit hoặc GitHub:

### 1. Xác định loại link
- **Reddit**: `reddit.com`, `old.reddit.com`, `www.reddit.com`
- **GitHub**: `github.com` (repo, issue, discussion, PR, gist)

### 2. Fetch và Extract nội dung
Sử dụng `tavily_extract` để lấy nội dung:
```
tavily_extract(
  urls=["<url>"],
  query="main content summary key points",
  extract_depth="basic"
)
```

### 3. Tạo Summary
Viết summary theo format:

```markdown
# [Tiêu đề bài viết]

**Source**: [URL gốc]
**Date**: [Ngày summary: YYYY-MM-DD]
**Type**: [Reddit Post | GitHub Repo | GitHub Issue | GitHub Discussion | GitHub PR]

## TL;DR
[1-2 câu tóm tắt ngắn gọn nhất]

## Key Points
- [Điểm chính 1]
- [Điểm chính 2]
- [Điểm chính 3]
...

## Summary
[Tóm tắt chi tiết hơn, 3-5 đoạn]

## Notable Comments/Discussions (nếu có)
- [Comment hay/insight đáng chú ý]

## Tags
`tag1` `tag2` `tag3`
```

### 4. Lưu file
- Đường dẫn: `3_READING/`
- Tên file: `<slug-title>.md`
  - Ví dụ: `how-to-build-ai-agent.md`
- Slug: lowercase, dấu gạch ngang, tối đa 50 ký tự

### 5. Confirm với user
Sau khi lưu, thông báo:
- Tên file đã tạo
- Đường dẫn đầy đủ
- TL;DR của bài viết

## Examples

**Input**: `/summary https://www.reddit.com/r/LocalLLaMA/comments/abc123/...`

**Output**:
```
Đã tạo summary: 3_READING/local-llm-performance-tips.md

TL;DR: Bài viết chia sẻ 5 tips tối ưu performance cho local LLM...
```

## Notes
- Với GitHub repo: focus vào README, mục đích, features chính
- Với Reddit: bao gồm cả top comments nếu có giá trị
- Với GitHub Issue/PR: tóm tắt vấn đề và giải pháp
- Giữ summary ngắn gọn, dễ scan
