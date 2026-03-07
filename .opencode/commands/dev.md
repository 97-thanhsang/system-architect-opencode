---
description: "Master orchestrator for development workflows - automatically analyzes requests and coordinates agents/commands/skills"
argument-hint: "<request-description> [--quick] [--review-only] [--analyze-only]"
---

# /dev - Development Orchestrator

Intelligent development workflow orchestrator that analyzes user requirements and automatically coordinates the optimal sequence of agents, commands, and skills.

## Usage

```
/dev <mô-tả-yêu-cầu> [--quick] [--review-only] [--analyze-only]
```

**Examples:**
```
/dev "Tạo trang quản lý ngườ dùng với danh sách, form thêm/sửa, validation"
/dev "Review code module authentication" --review-only
/dev "Tạo API service cho quản lý sản phẩm" --quick
/dev "Phân tích yêu cầu tích hợp thanh toán" --analyze-only
```

**Flags:**
- `--quick`: Bỏ qua phase ANALYZE và SOLUTION, đi thẳng vào EXECUTE
- `--review-only`: Chỉ thực hiện code review
- `--analyze-only`: Chỉ thực hiện phân tích, không code

---

## Step 1: Parse và Phân tích Request

### 1.1 Extract Arguments

```typescript
// Parse from $ARGUMENTS
const rawInput = $ARGUMENTS;
const flags = {
  quick: rawInput.includes('--quick'),
  reviewOnly: rawInput.includes('--review-only'),
  analyzeOnly: rawInput.includes('--analyze-only')
};
const userRequest = rawInput.replace(/--(quick|review-only|analyze-only)/g, '').trim();
```

### 1.2 Phân tích Yêu cầu

**Xác định loại task:**
- `FE_CRUD`: Frontend CRUD operations (list, form, validation)
- `FE_COMPONENT`: UI component creation
- `FE_PAGE`: Full page with routing
- `API_DESIGN`: Backend API design
- `INTEGRATION`: API + UI integration
- `REFACTOR`: Code refactoring
- `REVIEW`: Code review only
- `BUGFIX`: Fix bugs
- `PERFORMANCE`: Performance optimization
- `SECURITY`: Security hardening

**Xác định độ phức tạp:**
- `SIMPLE`: 1-2 files, pattern rõ ràng
- `MEDIUM`: 3-5 files, cần design
- `COMPLEX`: 5+ files, cần full workflow

---

## Step 2: Chọn Workflow

### Decision Matrix

```
IF flags.reviewOnly:
  → WORKFLOW = "REVIEW"
  
ELSE IF flags.analyzeOnly:
  → WORKFLOW = "ANALYZE"
  
ELSE IF flags.quick AND complexity == "SIMPLE":
  → WORKFLOW = "QUICK"
  
ELSE IF taskType == "REVIEW":
  → WORKFLOW = "REVIEW"
  
ELSE IF complexity == "COMPLEX" OR taskType == "INTEGRATION":
  → WORKFLOW = "FULL"
  
ELSE IF complexity == "MEDIUM":
  → WORKFLOW = "STANDARD"
  
ELSE:
  → WORKFLOW = "QUICK"
```

### Workflow Definitions

#### WORKFLOW: FULL (4 phases)
```
ANALYZE → SOLUTION → EXECUTE → REVIEW
```
**Sử dụng khi**: Feature mới, độ phức tạp cao, cần design kỹ

#### WORKFLOW: STANDARD (3 phases)
```
SOLUTION → EXECUTE → REVIEW
```
**Sử dụng khi**: Feature medium, pattern đã biết

#### WORKFLOW: QUICK (2 phases)
```
EXECUTE → REVIEW
```
**Sử dụng khi**: Task đơn giản, urgent

#### WORKFLOW: REVIEW (1 phase)
```
REVIEW
```
**Sử dụng khi**: User chỉ cần review code

#### WORKFLOW: ANALYZE (1 phase)
```
ANALYZE
```
**Sử dụng khi**: User chỉ cần phân tích

---

## Step 3: Xác định Tools

### 3.1 Map Task Type → Tools

#### Cho FE Nghiệp vụ (Angular):
| Task | Tools |
|------|-------|
| Component mới | `/generate-component`, `ui-ux-designer` |
| Service API | `/generate-service`, `typescript-pro` |
| Forms | `angular-forms` skill |
| Routing | `angular-routing` skill |
| State Management | ANALYZE/SOLUTION agents |
| Review | `code-reviewer`, `/full-review` |
| Accessibility | `accessibility-expert` |
| Testing | `test-automator`, `/test-generate` |

#### Cho Integration:
| Task | Tools |
|------|-------|
| API Specs | `/integration-api` |
| UI Design | `/integration-design`, `ui-ux-designer` |
| Implementation | CODE agent |

#### Cho Security:
| Task | Tools |
|------|-------|
| Audit | `security-auditor` |
| SAST | `/security-sast` |
| Dependencies | `/security-dependencies` |

### 3.2 Build Tool Pipeline

```typescript
const toolPipeline = [];

// Phase 1: ANALYZE
if (workflow.includes('ANALYZE')) {
  toolPipeline.push({
    phase: 'ANALYZE',
    tool: 'ANALYZE agent',
    command: '/analyze-task',
    skill: 'receival',
    purpose: 'Phân tích yêu cầu và tạo Analysis Report'
  });
}

// Phase 2: SOLUTION
if (workflow.includes('SOLUTION')) {
  toolPipeline.push({
    phase: 'SOLUTION',
    tool: 'SOLUTION agent',
    command: '/solution-task',
    skill: 'design-solution',
    purpose: 'Thiết kế solution kỹ thuật'
  });
}

// Phase 3: EXECUTE
if (workflow.includes('EXECUTE')) {
  // Cho FE
  if (taskType.startsWith('FE_')) {
    toolPipeline.push({
      phase: 'EXECUTE',
      tool: 'CODE agent',
      command: '/execute-task',
      skill: 'execution',
      purpose: 'Implementation'
    });
    
    if (taskType === 'FE_COMPONENT' || taskType === 'FE_CRUD') {
      toolPipeline.push({
        phase: 'EXECUTE',
        tool: '/generate-component',
        purpose: 'Generate Angular components'
      });
    }
    
    if (taskType === 'FE_CRUD' || taskType === 'API_DESIGN') {
      toolPipeline.push({
        phase: 'EXECUTE',
        tool: '/generate-service',
        purpose: 'Generate services'
      });
    }
  }
  
  // Cho Integration
  if (taskType === 'INTEGRATION') {
    toolPipeline.push({
      phase: 'EXECUTE',
      tool: '/integration-api',
      purpose: 'Tạo API integration specs'
    });
    toolPipeline.push({
      phase: 'EXECUTE',
      tool: '/integration-design',
      purpose: 'Tạo UI/UX design specs'
    });
  }
}

// Phase 4: REVIEW
if (workflow.includes('REVIEW')) {
  toolPipeline.push({
    phase: 'REVIEW',
    tool: 'REVIEW agent',
    command: '/review-code',
    skill: 'reviewing-code',
    purpose: 'Code review'
  });
  
  // Thêm specialized reviews
  if (taskType === 'SECURITY') {
    toolPipeline.push({
      phase: 'REVIEW',
      tool: 'security-auditor',
      purpose: 'Security audit'
    });
  }
  
  if (taskType.startsWith('FE_')) {
    toolPipeline.push({
      phase: 'REVIEW',
      tool: 'accessibility-expert',
      purpose: 'Accessibility check'
    });
  }
}
```

---

## Step 4: Present Plan cho User

### 4.1 Generate Summary

```markdown
# 🎯 Development Plan

## Yêu cầu
${userRequest}

## Phân tích
- **Loại task**: ${taskType}
- **Độ phức tạp**: ${complexity}
- **Workflow**: ${workflow}

## Các bước thực hiện
${toolPipeline.map((step, index) => `
### Bước ${index + 1}: ${step.phase}
- **Tool**: ${step.tool}
- **Mục đích**: ${step.purpose}
`).join('\n')}

## ⏱️ Estimation
- **Thời gian dự kiến**: ${estimateTime(workflow, complexity)}
- **Số files dự kiến**: ${estimateFiles(taskType, complexity)}

---

**Bạn có muốn tôi tiếp tục với plan này không?** (Y/N/Modify)
- Y: Bắt đầu thực thi
- N: Hủy
- Modify: Điều chỉnh plan
```

### 4.2 Wait for User Confirmation

**PAUSE** - Chờ user phản hồi trước khi tiếp tục.

---

## Step 5: Thực thi Workflow (Sau khi User đồng ý)

### 5.1 Execute từng Phase

```typescript
for (const step of toolPipeline) {
  // Hiển thị progress
  console.log(`\n🚀 Đang thực hiện: ${step.phase} - ${step.tool}`);
  
  // Invoke tool
  if (step.tool.includes('agent')) {
    // Sử dụng task() cho agents
    await task({
      description: `${step.phase}: ${step.purpose}`,
      prompt: buildPrompt(step, userRequest, context),
      subagent_type: extractAgentType(step.tool)
    });
  } else if (step.tool.startsWith('/')) {
    // Sử dụng skill() cho commands
    await skill({ name: step.tool.substring(1) });
  }
  
  // Report progress
  console.log(`✅ Hoàn thành: ${step.phase}`);
}
```

### 5.2 Build Context-Aware Prompts

```typescript
function buildPrompt(step, userRequest, accumulatedContext) {
  const basePrompt = {
    ANALYZE: `
Phân tích yêu cầu sau và tạo Analysis Report:
"${userRequest}"

Yêu cầu:
1. Phân tích business requirements
2. Xác định technical requirements  
3. Liệt kê các components/modules cần tạo
4. Đánh giá complexity và risks
5. Đề xuất technical approach

Output: Analysis Report theo chuẩn receival skill v3.1
`,
    SOLUTION: `
Thiết kế solution kỹ thuật cho:
"${userRequest}"

Context từ Analysis:
${accumulatedContext.analyzeReport}

Yêu cầu:
1. Thiết kế kiến trúc tổng thể
2. Định nghĩa data models và interfaces
3. Thiết kế component hierarchy
4. State management strategy
5. API integration approach
6. Testing strategy

Output: Solution Design Document theo chuẩn design-solution skill v7.0
`,
    EXECUTE: `
Thực thi implementation cho:
"${userRequest}"

Context:
- Analysis: ${accumulatedContext.analyzeReport}
- Solution: ${accumulatedContext.solutionDesign}

Yêu cầu:
1. Tạo các files theo solution design
2. Tuân thủ coding standards (EMS Finance 4-layer)
3. Sử dụng Angular 17+, Signals, Standalone components
4. Viết tests cho business logic
5. Đảm bảo type safety

Output: Code implementation hoàn chỉnh
`,
    REVIEW: `
Review code đã implement cho:
"${userRequest}"

Yêu cầu:
1. Code quality review (clean code, DRY, SOLID)
2. Security review (OWASP, input validation)
3. Performance review (change detection, memory leaks)
4. Angular best practices review
5. TypeScript strict mode compliance
6. Testing coverage review

Output: Review Report với findings và recommendations
`
  };
  
  return basePrompt[step.phase];
}
```

---

## Step 6: Tổng kết và Báo cáo

### 6.1 Generate Final Report

```markdown
# ✅ Development Complete

## Tóm tắt
- **Yêu cầu**: ${userRequest}
- **Workflow**: ${workflow}
- **Thời gian**: ${actualTime}

## Các bước đã thực hiện
${completedSteps.map((step, i) => `${i + 1}. ✅ ${step.phase}: ${step.tool}`).join('\n')}

## Files đã tạo/cập nhật
${generatedFiles.map(f => `- ${f.path} (${f.type})`).join('\n')}

## Key Highlights
- [Liệt kê những điểm nổi bật của implementation]

## Next Steps (Optional)
- [Gợi ý các bước tiếp theo nếu có]

## Cần Review
${needsReview ? 'Một số phần cần review thêm, tôi đã đánh dấu trong code.' : 'Tất cả đã hoàn thiện.'}
```

### 6.2 Offer Next Actions

```markdown
---

## 🔄 Next Actions?

1. **/dev** "[Yêu cầu tiếp theo]" - Tiếp tục feature mới
2. **/review-code** - Review code vừa tạo chi tiết hơn
3. **/test-generate** - Tạo thêm test cases
4. **/doc-generate** - Tạo documentation
5. **Kết thúc** - Dừng tại đây
```

---

## Error Handling

### Nếu User từ chối Plan
```
User: N
→ "Đã hủy. Bạn có muốn điều chỉnh yêu cầu không?"
```

### Nếu User muốn Modify
```
User: Modify
→ "Bạn muốn điều chỉnh gì? (Thêm/bớt bước, đổi tool, etc.)"
→ Parse input và rebuild plan
→ Present lại cho user
```

### Nếu Tool thất bại
```
→ Báo lỗi rõ ràng cho user
→ Đề xuất alternative approach
→ Hỏi user có muốn retry, skip, hay modify
```

---

## Examples

### Example 1: FE CRUD Feature
```
User: /dev "Tạo trang quản lý ngườ dùng với danh sách, form thêm/sửa, validation"

AI:
🎯 Development Plan

Yêu cầu: Tạo trang quản lý ngườ dùng với danh sách, form thêm/sửa, validation

Phân tích:
- Loại task: FE_CRUD
- Độ phức tạp: MEDIUM
- Workflow: STANDARD (SOLUTION → EXECUTE → REVIEW)

Các bước thực hiện:

### Bước 1: SOLUTION
- Tool: SOLUTION agent
- Mục đích: Thiết kế kiến trúc và component hierarchy

### Bước 2: EXECUTE  
- Tool: CODE agent + /generate-component + /generate-service
- Mục đích: Tạo components và services

### Bước 3: REVIEW
- Tool: REVIEW agent + code-reviewer
- Mục đích: Code review và quality check

⏱️ Estimation: 45-60 phút
📁 Files dự kiến: 6-8 files

Bạn có muốn tôi tiếp tục? (Y/N/Modify)
```

### Example 2: Quick Fix
```
User: /dev "Fix lỗi validation không hiển thị error message" --quick

AI:
🎯 Quick Fix Plan

Yêu cầu: Fix lỗi validation không hiển thị error message
Phân tích:
- Loại task: BUGFIX
- Độ phức tạp: SIMPLE
- Workflow: QUICK (EXECUTE → REVIEW)

Các bước:
1. EXECUTE: CODE agent - Fix validation logic
2. REVIEW: Quick review của changes

⏱️ Estimation: 10-15 phút

Bạn có muốn tôi tiếp tục? (Y/N/Modify)
```

### Example 3: Review Only
```
User: /dev "Review code module authentication" --review-only

AI:
🎯 Review Plan

Yêu cầu: Review code module authentication
Workflow: REVIEW

Các bước:
1. /full-review - Comprehensive code review
2. security-auditor agent - Security audit
3. code-reviewer agent - Quality review

⏱️ Estimation: 20-30 phút

Bạn có muốn tôi tiếp tục? (Y/N/Modify)
```

---

## Integration với Hệ thống

### Luôn tuân thủ:
1. **AGENTS.md** - Đọc project context trước khi làm
2. **IAM v3.1** - Sử dụng đúng ACCESS_LEVEL
3. **State Management** - Cập nhật task state qua task-manager skill
4. **Context7** - Research khi cần thông tin mới
5. **Rule Enforcement** - Tuân thủ các RULE_IDS được resolve

### Không bao giờ:
1. Thực thi ngay không hỏi user
2. Bỏ qua error handling
3. Ignore project conventions (EMS Finance 4-layer, Angular 17 patterns)
4. Hardcode paths - luôn resolve từ machine config

---

_Dev Orchestrator Command v1.0_
