# 🚀 Dev Orchestrator - Quick Reference

## Cách sử dụng

### 1. Sử dụng Command `/dev` (Khuyến nghị)

```bash
# Cú pháp cơ bản
/dev "<mô tả yêu cầu>" [flags]

# Flags:
--quick         # Bỏ qua ANALYZE + SOLUTION, đi thẳng EXECUTE
--review-only   # Chỉ thực hiện code review
--analyze-only  # Chỉ phân tích, không code
```

### 2. Ví dụ sử dụng

```bash
# Feature mới - Full workflow
/dev "Tạo trang quản lý ngườ dùng với danh sách, form thêm/sửa, validation"

# Bug fix nhanh
/dev "Fix lỗi không hiển thị error message trong form login" --quick

# Code review
/dev "Review code module authentication và payment" --review-only

# Phân tích yêu cầu
/dev "Phân tích yêu cầu tích hợp cổng thanh toán VNPay" --analyze-only

# Tạo API service
/dev "Tạo service quản lý sản phẩm với CRUD operations"

# Refactor
/dev "Refactor code module dashboard để tối ưu performance"

# Security audit
/dev "Kiểm tra bảo mật cho module xác thực ngườ dùng"
```

---

## Workflows

```
┌─────────────────────────────────────────────────────────────┐
│  FULL WORKFLOW (Khuyến nghị cho feature mới)                │
│  Thờ gian: 60-90 phút                                       │
├─────────────────────────────────────────────────────────────┤
│  ANALYZE → SOLUTION → EXECUTE → REVIEW                      │
│                                                             │
│  1. Phân tích requirements                                  │
│  2. Thiết kế solution                                       │
│  3. Code implementation                                     │
│  4. Review & QA                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  STANDARD WORKFLOW (Feature medium)                         │
│  Thờ gian: 45-60 phút                                       │
├─────────────────────────────────────────────────────────────┤
│  SOLUTION → EXECUTE → REVIEW                                │
│                                                             │
│  1. Thiết kế solution                                       │
│  2. Code implementation                                     │
│  3. Review & QA                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  QUICK WORKFLOW (--quick flag)                              │
│  Thờ gian: 15-30 phút                                       │
├─────────────────────────────────────────────────────────────┤
│  EXECUTE → REVIEW                                           │
│                                                             │
│  1. Code implementation (skip design)                       │
│  2. Quick review                                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  REVIEW ONLY (--review-only)                                │
│  Thờ gian: 20-30 phút                                       │
├─────────────────────────────────────────────────────────────┤
│  REVIEW                                                     │
│                                                             │
│  1. Comprehensive code review                               │
│  2. Security audit (nếu cần)                                │
│  3. Accessibility check                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Mapping: Yêu cầu → Tools

### Frontend Development

| Yêu cầu của bạn | AI sẽ sử dụng |
|----------------|---------------|
| Tạo trang mới | `/generate-component`, `ui-ux-designer` |
| Tạo component | `/generate-component`, `angular-signals` |
| Form + Validation | `angular-forms` skill, `/generate-component` |
| Service/API calls | `/generate-service`, `angular-http` skill |
| State management | `angular-signals` skill, ANALYZE agent |
| Routing | `angular-routing` skill |
| TypeScript types | `typescript-pro` agent |

### Code Quality

| Yêu cầu của bạn | AI sẽ sử dụng |
|----------------|---------------|
| Review code | `/full-review`, `code-reviewer` agent |
| Security audit | `security-auditor` agent, `/security-sast` |
| Accessibility | `accessibility-expert` agent, `/accessibility-audit` |
| Performance | `/performance-optimization` |
| Testing | `test-automator` agent, `/test-generate` |

### Integration

| Yêu cầu của bạn | AI sẽ sử dụng |
|----------------|---------------|
| API + UI Integration | `/integration-api` → `/integration-design` |
| Third-party API | `api-inspector` skill |
| Design System | `design-system-architect` agent |

---

## Checklist khi sử dụng

### Trước khi gọi `/dev`:
- [ ] Mô tả yêu cầu rõ ràng, cụ thể
- [ ] Xác định được loại task (FE/API/Review/...)
- [ ] Chọn đúng flag (--quick/--review-only/...)

### Trong quá trình:
- [ ] Đọc kỹ plan AI đề xuất
- [ ] Xác nhận (Y) trước khi AI thực thi
- [ ] Theo dõi progress từng bước

### Sau khi hoàn thành:
- [ ] Review code được tạo ra
- [ ] Kiểm tra tests (nếu có)
- [ ] Xác nhận acceptance criteria

---

## Quy trình tương tác

```
Bạn: /dev "Tạo trang user management"
    ↓
AI: 🎯 Development Plan
    Workflow: FULL
    Steps: ANALYZE → SOLUTION → EXECUTE → REVIEW
    Bạn có muốn tiếp tục? (Y/N/Modify)
    ↓
Bạn: Y
    ↓
AI: 🚀 Đang thực hiện: ANALYZE
    [Kết quả phân tích]
    ↓
AI: 🚀 Đang thực hiện: SOLUTION
    [Solution design]
    ↓
AI: 🚀 Đang thực hiện: EXECUTE
    [Code implementation]
    ↓
AI: 🚀 Đang thực hiện: REVIEW
    [Review report]
    ↓
AI: ✅ Development Complete!
    [Summary + Next actions]
```

---

## Files đã tạo

```
.opencode/
├── commands/
│   └── dev.md                    # ← Command chính
├── prompts/
│   ├── master-orchestrator.md    # ← Full prompt template
│   └── quick-reference.md        # ← File này
└── agents/
    ├── code-reviewer.md          # Agent cho review
    ├── typescript-pro.md         # Agent cho TypeScript
    ├── test-automator.md         # Agent cho testing
    ├── security-auditor.md       # Agent cho security
    ├── ui-ux-designer.md         # Agent cho UI design
    ├── accessibility-expert.md   # Agent cho a11y
    └── ...                       # Các agent khác
```

---

## Troubleshooting

### AI chọn sai workflow?
→ Reply: "Modify: Chuyển sang workflow QUICK"

### Cần thêm bước testing?
→ Reply: "Modify: Thêm bước testing sau EXECUTE"

### Muốn bỏ qua 1 bước?
→ Reply: "Modify: Bỏ qua bước SOLUTION"

### AI không hiểu yêu cầu?
→ Cung cấp thêm context, ví dụ cụ thể hơn

---

## Tips & Tricks

1. **Mô tả cụ thể hơn** = Kết quả tốt hơn
   - ❌ "Tạo trang user"
   - ✅ "Tạo trang quản lý ngườ dùng với: danh sách có filter/search, form thêm/sửa với validation email/phone, phân trang 10 items/page"

2. **Sử dụng domain terms** để AI hiểu rõ hơn
   - "CRUD operations"
   - "Standalone components"
   - "Reactive forms"
   - "Signals state management"

3. **Đề cập constraints** nếu có
   - "Phải dùng Angular Material"
   - "Cần support mobile responsive"
   - "Integrate với API đã có"

4. **Chọn flag phù hợp** để tiết kiệm thờ gian
   - Bug fix đơn giản → `--quick`
   - Chỉ review code → `--review-only`
   - Research trước → `--analyze-only`

---

## Next Steps

Sau khi hoàn thành `/dev`, bạn có thể:

```bash
# Tạo documentation
/doc-generate

# Tạo thêm tests
/test-generate

# Audit security
/dev "Security audit cho module vừa tạo" --review-only

# Optimize performance
/performance-optimization

# Bắt đầu feature tiếp theo
/dev "Feature tiếp theo..."
```

---

_Happy Coding! 🚀_
