# 🎯 Prompts Directory

> **Purpose**: Centralized prompt templates and orchestration guides for OpenCode development
> **Location**: `.opencode/prompts/`

---

## 📁 Files trong thư mục này

| File | Mục đích | Khi nào dùng |
|------|----------|--------------|
| `master-orchestrator.md` | Full prompt template để copy-paste | Khi muốn AI tự động điều phối workflow |
| `quick-reference.md` | Hướng dẫn sử dụng nhanh `/dev` command | Tham khảo cú pháp và ví dụ |
| `README.md` | File này - Tổng quan | Đọc lần đầu để hiểu hệ thống |

---

## 🚀 Bắt đầu nhanh

### Cách 1: Sử dụng Command `/dev` (Khuyến nghị)

```bash
# Bước 1: Gõ command với mô tả yêu cầu
/dev "Tạo trang quản lý ngườ dùng với danh sách, form thêm/sửa, validation"

# Bước 2: AI sẽ phân tích và đề xuất plan
# Bước 3: Xác nhận (Y) để bắt đầu
# Bước 4: AI tự động điều phối các agents/commands/skills
# Bước 5: Nhận kết quả và review
```

### Cách 2: Copy-Paste Prompt Template

```bash
# 1. Mở file: .opencode/prompts/master-orchestrator.md
# 2. Copy phần "Template (Copy & Paste)"
# 3. Paste vào chat, điền yêu cầu của bạn
# 4. AI sẽ thực hiện theo hướng dẫn trong prompt
```

---

## 📊 So sánh 2 cách

| Tiêu chí | `/dev` Command | Copy-Paste Prompt |
|----------|---------------|-------------------|
| **Độ nhanh** | ⚡ Rất nhanh | 📝 Trung bình |
| **Linh hoạt** | ✅ Có flags (--quick, --review-only) | ✅ Hoàn toàn customizable |
| **Interactive** | ✅ Có xác nhận từng bước | ❅ Tùy cách viết prompt |
| **Reusability** | ✅ Luôn available | ✅ Có thể save lại |
| **Best for** | Daily development | Complex custom workflows |

**Khuyến nghị**: Dùng `/dev` cho 90% trường hợp, chỉ dùng custom prompt khi cần workflow đặc biệt.

---

## 🎮 Workflows Available

### 1. Full Development Cycle
```
ANALYZE → SOLUTION → EXECUTE → REVIEW
```
**Phù hợp**: Feature mới, độ phức tạp trung bình-cao
**Thờ gian**: 60-90 phút

### 2. Quick Implementation
```
EXECUTE → REVIEW
```
**Phù hợp**: Bug fix, task đơn giản, urgent
**Thờ gian**: 15-30 phút
**Flag**: `--quick`

### 3. Review Only
```
REVIEW
```
**Phù hợp**: Code review, audit
**Thờ gian**: 20-30 phút
**Flag**: `--review-only`

### 4. Analysis Only
```
ANALYZE
```
**Phù hợp**: Research, phân tích requirements
**Thờ gian**: 15-20 phút
**Flag**: `--analyze-only`

---

## 🛠️ Ecosystem

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR REQUEST                            │
│         "Tạo trang user management..."                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   /dev COMMAND                              │
│              (Phân tích + Điều phối)                        │
│                                                             │
│   • Parse yêu cầu                                          │
│   • Chọn workflow                                          │
│   • Map tools phù hợp                                      │
│   • Present plan cho user                                  │
│   • Execute từng bước                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
         ┌──────────────────┼──────────────────┐
         ↓                  ↓                  ↓
   ┌──────────┐      ┌──────────┐      ┌──────────┐
   │  AGENTS  │      │ COMMANDS │      │  SKILLS  │
   ├──────────┤      ├──────────┤      ├──────────┤
   │ANALYZE   │      │/generate │      │angular-  │
   │CODE      │      │-component│      │signals   │
   │SOLUTION  │      │/generate │      │angular-  │
   │REVIEW    │      │-service  │      │forms     │
   │typescript│      │/full-    │      │typescript│
   │ -pro     │      │review    │      │-advanced │
   │ui-ux-    │      │/test-    │      │-types    │
   │designer  │      │generate  │      │...       │
   │...       │      │...       │      │          │
   └──────────┘      └──────────┘      └──────────┘
```

---

## 📖 Documentation Links

### Commands
- [dev.md](../commands/dev.md) - Master orchestrator command
- [generate-component.md](../commands/generate-component.md) - Angular component generator
- [generate-service.md](../commands/generate-service.md) - Angular service generator
- [full-review.md](../commands/full-review.md) - Code review
- [test-generate.md](../commands/test-generate.md) - Test generator
- [integration-api.md](../commands/integration-api.md) - API integration
- [integration-design.md](../commands/integration-design.md) - UI/UX design specs

### Agents
- [code-reviewer.md](../agents/code-reviewer.md) - Code quality & security
- [typescript-pro.md](../agents/typescript-pro.md) - Advanced TypeScript
- [test-automator.md](../agents/test-automator.md) - Test automation
- [security-auditor.md](../agents/security-auditor.md) - Security audit
- [ui-ux-designer.md](../agents/ui-ux-designer.md) - UI design
- [accessibility-expert.md](../agents/accessibility-expert.md) - WCAG compliance

### Skills
- `angular-signals` - State management
- `angular-forms` - Forms & validation
- `typescript-advanced-types` - Type patterns
- `design-system-patterns` - Design tokens
- `web-component-design` - Component architecture
- `accessibility-compliance` - A11y guidelines

---

## 💡 Best Practices

### 1. Luôn bắt đầu với `/dev`
```bash
# ✅ Good
/dev "Tạo trang quản lý ngườ dùng với CRUD"

# ❌ Not recommended (không rõ ràng)
"Làm giúp tôi cái trang user"
```

### 2. Mô tả chi tiết = Kết quả tốt
```bash
# ✅ Good
/dev "Tạo trang dashboard hiển thị: 
  - Biểu đồ doanh thu theo tháng (chart),
  - Danh sách đơn hàng gần đây (table),
  - Cards thống kê tổng quan,
  Responsive design, dùng Angular Material"

# ❌ Too vague
/dev "Làm dashboard"
```

### 3. Chọn flag phù hợp
```bash
# Bug fix đơn giản → --quick
/dev "Fix lỗi validation email" --quick

# Chỉ review → --review-only
/dev "Review code module auth" --review-only

# Feature mới → no flag (full workflow)
/dev "Tạo trang user management"
```

### 4. Luôn review kết quả
```bash
# Sau khi /dev hoàn thành, có thể:
/dev "Review code vừa tạo" --review-only
# hoặc
/full-review
```

---

## 🆘 Troubleshooting

### AI không hiểu yêu cầu?
- Thêm context cụ thể hơn
- Liệt kê các features cần có
- Đề cập constraints (framework, design system, etc.)

### AI chọn sai workflow?
```
Bạn: /dev "Tạo component"
AI: [Đề xuất FULL workflow]
Bạn: "Modify: Dùng QUICK workflow thôi, component đơn giản"
```

### Cần thêm/bớt tools?
```
Bạn: "Modify: Thêm accessibility audit sau khi code xong"
```

### Muốn dừng giữa chừng?
```
Bạn: "Stop" hoặc "Cancel"
```

---

## 🔄 Workflow Integration

### Tích hợp với Jira
```bash
# 1. Lấy task từ Jira
/jira

# 2. Phân tích task
/dev "Phân tích EMSPRO2-1234" --analyze-only

# 3. Thực thi
/dev "Implement EMSPRO2-1234"

# 4. Update Jira
/jira EMSPRO2-1234 "Done implementation"
```

### Tích hợp với Context7
```bash
# Research trước khi dev
/context7 "Tìm best practices cho Angular signals"

# Sau đó dev
/dev "Tạo feature sử dụng signals"
```

---

## 📈 Development Flow

```
Day-to-day development:

1. Nhận task (từ Jira hoặc discussion)
   ↓
2. Gọi /dev với mô tả task
   ↓
3. Review plan AI đề xuất
   ↓
4. Xác nhận (Y) để thực thi
   ↓
5. AI tự động điều phối agents/commands/skills
   ↓
6. Review kết quả
   ↓
7. (Optional) /dev --review-only để double-check
   ↓
8. Done!
```

---

## 🎓 Learning Path

### Beginner
1. Đọc `quick-reference.md` - Hiểu cú pháp
2. Thử `/dev` với yêu cầu đơn giản
3. Quan sát AI chọn workflow như thế nào

### Intermediate
1. Thử các flags khác nhau (`--quick`, `--review-only`)
2. Tìm hiểu agents/commands/skills được sử dụng
3. Xem source code các agents trong `.opencode/agents/`

### Advanced
1. Tùy chỉnh `master-orchestrator.md` cho use case đặc biệt
2. Tạo custom commands cho team
3. Extend với agents/skills mới

---

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra `quick-reference.md` phần Troubleshooting
2. Review source code `../commands/dev.md`
3. Tham khảo agents tương ứng trong `../agents/`

---

_Last Updated: 2026-03-07_
