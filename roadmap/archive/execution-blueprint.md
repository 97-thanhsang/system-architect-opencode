# 🚀 OPENCODE WORKFLOW PLATFORM - EXECUTION BLUEPRINT

> **Phiên bản**: 1.0.0  
> **Ngày tạo**: March 2026  
> **Tác giả**: SYSTEM-ARCHITECT Agent  
> **Hệ thống**: 2-Layer Agents (Global + Project)  

**File này chứa toàn bộ kế hoạch phát triển chi tiết cho 5 phases của OpenCode Workflow Platform.**

---

## 📊 CURRENT STATUS (Updated: March 2026)

### ✅ ĐÃ HOÀN THÀNH

#### Phase 0: Foundation & Architecture ✅ 100%
- [x] Angular 17+ project initialized (`apps/web`)
- [x] Angular Material 17 installed
- [x] Taiga UI 3.117 installed
- [x] Tailwind CSS 3.4 configured
- [x] TypeScript 5.2 strict mode
- [x] Project structure: core/, features/, shared/
- [x] Environment configuration

#### Phase 1: MVP - Base Structure ✅ 80%
- [x] Jira OAuth Authentication (AuthService, JiraAuthService)
- [x] Role Selection (FE/BE/QC/BA) with roleGuard
- [x] Module FE with Dynamic Layout (sidebar/header toggle)
- [x] LayoutService with Angular Signals
- [x] Menu Configuration system
- [x] 5 pages: Dashboard, Tasks, Projects, Team, Settings
- [x] Routing with lazy loading
- [x] JWT Interceptor
- [x] Auth Guards (authGuard, roleGuard)
- [ ] **CHƯA CÓ**: 3-board Analyze workflow (Input/Progress/Output)
- [ ] **CHƯA CÓ**: Queue integration
- [ ] **CHƯA CÓ**: WebSocket real-time
- [ ] **CHƯA CÓ**: Backend API (NestJS)

### 🎯 TIẾP THEO: Phase 2 - Workflow Expansion
**Ưu tiên cao:**
1. Backend NestJS setup (API, Queue, WebSocket)
2. Analyze Module với 3 boards (Input/Progress/Output)
3. Solution Module
4. Execute Module
5. Pipeline Orchestration

---

## 📚 MỤC LỤC

1. [Tổng Quan Hệ Thống](#1-tổng-quan-hệ-thống)
2. [Phase 0: Foundation](#2-phase-0-foundation--architecture)
3. [Phase 1: MVP Analyze](#3-phase-1-mvp---analyze-module)
4. [Phase 2: Workflow Expansion](#4-phase-2-workflow-expansion)
5. [Phase 3: Advanced Features](#5-phase-3-advanced-features)
6. [Phase 4: Multi-Role](#6-phase-4-multi-role--scale)
7. [Daily Execution Workflow](#7-daily-execution-workflow)
8. [Quick Reference](#8-quick-reference)

---

## 1. TỔNG QUAN HỆ THỐNG

### 1.1 Two-Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 2: Project-Level (system-architect-opencode/.opencode)│
├─────────────────────────────────────────────────────────────┤
│  Agents: ANGULAR, ui-ux-designer, test-automator,           │
│          security-auditor, monorepo-architect, etc.         │
│  Commands: /angular-init, /generate-component, /tdd-cycle   │
│  Skills: angular-signals, angular-testing, design-system    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: Global (C:/Users/My PC/.config/opencode/)         │
├─────────────────────────────────────────────────────────────┤
│  Agents: ANALYZE, SOLUTION, CODE, REVIEW, INTEGRATION, JIRA │
│  Commands: /analyze-task, /solution-task, /execute-task     │
│  Skills: receival, design-solution, execution, reviewing    │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Agent Assignments by Phase

| Phase | Primary Agents | Support Agents | Est. Hours |
|-------|---------------|----------------|------------|
| Phase 0 | SYSTEM-ARCHITECT, SOLUTION, CODE | ANGULAR, monorepo-architect | 80-100 |
| Phase 1 | ANALYZE, SOLUTION, CODE, REVIEW | ui-ux-designer, test-automator | 160-200 |
| Phase 2 | ANALYZE, SOLUTION, CODE | typescript-pro, test-automator | 160-240 |
| Phase 3 | JIRA, ANALYZE, SOLUTION, CODE | design-system-architect, accessibility-expert | 160-240 |
| Phase 4 | ANALYZE, SOLUTION, CODE | security-auditor, typescript-pro | 160-240 |

---

## 2. PHASE 0: FOUNDATION & ARCHITECTURE

> **Thờigian**: 1-2 tuần  
> **Mục tiêu**: Project structure, Angular 17 + NestJS setup, base infrastructure

### 2.1 Agent Assignments

| Role | Agent | Responsibility |
|------|-------|----------------|
| System Architect | SYSTEM-ARCHITECT | Research, validate architecture |
| Solution Designer | SOLUTION | Technical architecture, DB schema |
| Integration Specialist | INTEGRATION | API design, patterns |
| Angular Expert | ANGULAR (L2) | Frontend setup, Material |
| Monorepo Architect | monorepo-architect (L2) | Nx workspace |
| Implementation Lead | CODE | Execute setup tasks |

### 2.2 Week 1: Project Initialization

#### Day 1-2: Angular Frontend Setup

```bash
# AI Agent: ANGULAR (L2)
# Skills: workspace-guide, get-started, angular-tooling

/angular-init --name=opencode-platform --routing --style=scss --strict
/design-system-setup --framework=angular --ui=material --theme=indigo-pink
```

**Output Checklist:**
- [ ] apps/web/ structure created
- [ ] Angular Material configured
- [ ] Routing module working
- [ ] Tailwind CSS integrated
- [ ] Base folders (core/, features/, shared/)
- [ ] ng build successful

#### Day 3-4: NestJS Backend Setup

```bash
# AI Agent: SOLUTION → CODE
# Skills: design-solution, api-inspector, typescript-advanced-types

# Step 1: Design architecture
/solution-task "Design NestJS backend with modular structure: auth, tasks, queue, opencode, jira, websocket modules" --full

# Step 2: Implement
/execute-task "Initialize NestJS with strict TypeScript, setup 6 core modules" --solution=solution-designs/backend-architecture.md
```

**Output Checklist:**
- [ ] apps/api/ structure created
- [ ] 6 modules initialized
- [ ] TypeORM configured (SQLite)
- [ ] Basic controllers/services
- [ ] API health check working

#### Day 5-7: Infrastructure Layer

```bash
# AI Agent: INTEGRATION → CODE
# Skills: integration-design, api-inspector, mcp-builder

# Design integration patterns
/integration-api "Design REST API for: task queue, WebSocket events, file operations" --full
/integration-design "Design infrastructure: Redis queue, WebSocket gateway" --full

# Implementation
/execute-task "Implement Queue module with BullMQ + Redis" --solution=solution-designs/queue-module.md
/execute-task "Implement WebSocket Gateway with Socket.IO" --solution=solution-designs/websocket-gateway.md
/execute-task "Implement OpenCode service for CLI spawning" --solution=solution-designs/opencode-service.md
```

**Output Checklist:**
- [ ] Queue processor with job handlers
- [ ] WebSocket gateway with rooms
- [ ] OpenCode service (process spawn)
- [ ] Docker compose (Redis)
- [ ] Queue jobs process correctly

### 2.3 Week 2: Authentication & Base UI

#### Day 8-10: Jira OAuth Integration

```bash
# AI Agent: SOLUTION → CODE
# Skills: design-solution, angular-di, angular-http, security-auditor

# Design auth flow
/solution-task "Design Jira OAuth 2.0 integration with JWT management, refresh token flow" --full

# Implementation
/execute-task "Implement Jira OAuth strategy with Passport.js, JWT generation" --solution=solution-designs/jira-auth.md
/execute-task "Implement Auth Guard and JWT Interceptor for Angular" --solution=solution-designs/auth-frontend.md
```

**Output Checklist:**
- [ ] OAuth flow working
- [ ] JWT tokens generated/validated
- [ ] Auth Guard protecting routes
- [ ] Login/logout functional

#### Day 11-14: Base Components

```bash
# AI Agent: ui-ux-designer → ANGULAR (L2)
# Skills: design-ui, angular-signals, responsive-design, visual-design-foundations

# Design UI
/design-ui "Design base layout: sidebar, header, main content with responsive breakpoints" --responsive

# Generate components
/generate-component layout/sidebar --type=smart --signals=true
/generate-component layout/header --type=smart --signals=true
/generate-component layout/main-content --type=dumb
/generate-service core/services/layout --singleton

# Implementation
/execute-task "Implement LayoutService with sidebar/header toggle, responsive breakpoints" --solution=solution-designs/layout-service.md
/execute-task "Implement routing with lazy loading" --solution=solution-designs/routing.md
```

**Output Checklist:**
- [ ] Sidebar (collapsible)
- [ ] Header (dynamic)
- [ ] LayoutService with signals
- [ ] Routing structure
- [ ] Responsive layout working

### 2.4 Phase 0 Deliverables

```markdown
✅ PHASE 0 COMPLETION CHECKLIST:
├─ Frontend (apps/web/) ✅ DONE
│  ├─ [x] Angular 17+ initialized (v17.0.0)
│  ├─ [x] Angular Material configured (v17.0.0)
│  ├─ [x] Taiga UI installed (v3.117.0)
│  ├─ [x] Tailwind CSS integrated (v3.4.0)
│  ├─ [x] Base layout components (sidebar, header, dynamic-layout)
│  ├─ [x] Routing with lazy loading
│  ├─ [x] Auth service with Jira OAuth (JiraAuthService, AuthService)
│  ├─ [x] Core services structure (LayoutService with Signals, ApiService)
│  ├─ [x] HTTP Interceptors (jwt, error, logging)
│  └─ [x] Route Guards (authGuard, roleGuard)
│
├─ Backend (apps/api/) ⏭️ PENDING - Phase 2
│  ├─ [ ] NestJS initialized
│  ├─ [ ] 6 core modules
│  ├─ [ ] Queue processor (BullMQ)
│  ├─ [ ] WebSocket gateway
│  ├─ [ ] OpenCode service
│  ├─ [ ] Database entities
│  └─ [ ] Jira OAuth integration
│
├─ Infrastructure ⏭️ PENDING - Phase 2
│  ├─ [ ] Docker compose (Redis)
│  ├─ [x] Environment configuration (environments/*.ts)
│  └─ [ ] API documentation (Swagger)
│
└─ Documentation ✅ DONE
   ├─ [x] README.md
   ├─ [x] SETUP.md
   ├─ [x] PROJECT_SUMMARY.md
   └─ [x] AGENTS.md
```

---

## 3. PHASE 1: MVP - ANALYZE MODULE

> **Thờigian**: 4-5 tuần  
> **Mục tiêu**: 3-board UI (Input/Progress/Output), real-time updates, multi-task queue

### 3.1 Agent Assignments

| Role | Agent | Responsibility |
|------|-------|----------------|
| Requirement Analyst | ANALYZE | Phân tích UI/UX requirements |
| Solution Designer | SOLUTION | Component architecture |
| UI/UX Specialist | ui-ux-designer (L2) | Design system, visual consistency |
| Integration Designer | INTEGRATION | API integration, real-time |
| Frontend Developer | ANGULAR (L2) | Component generation |
| Implementation Lead | CODE | Business logic, services |
| Testing Engineer | test-automator (L2) | Unit tests |
| Code Reviewer | REVIEW | Quality assurance |

### 3.2 Week 1: Board 1 - Input Configuration

#### Days 1-2: Analysis & Design

```bash
# AI Agent: ANALYZE → SOLUTION
# Skills: receival v4.1, task-manager, design-solution v8.4, angular-forms

# Step 1: Requirements analysis
/analyze-task "Design Board 1: Input Configuration with path selection, task input types (Jira/URL/Text), validation, max 5 tasks, drag-drop" --smart-auto

# Step 2: Solution design
/solution-task "Design Board 1 components: PathSelector, TaskInput, TaskList with data models and validation" --full
```

**Outputs:**
- `analysis-reports/board1-input-analysis.md`
- `solution-designs/board1-components-design.md`

#### Days 3-5: Component Generation (L2)

```bash
# AI Agent: ANGULAR (L2)
# Skills: angular-forms, angular-directives, web-component-design

# Generate components
/generate-component modules/fe-module/analyze/components/path-selector --type=smart --form=reactive
/generate-component modules/fe-module/analyze/components/task-input --type=smart --form=reactive
/generate-component modules/fe-module/analyze/components/task-list --type=dumb --cdk=drag-drop

# Generate tests
test-automator generate --component=path-selector --coverage=80
test-automator generate --component=task-input --coverage=80
```

**Outputs:**
- PathSelector component
- TaskInput component
- TaskList component (drag-drop)
- Unit tests (80%+ coverage)

#### Days 6-7: Integration

```bash
# AI Agent: CODE
# Skills: execution v8.5, git-commit

# Implementation
/execute-task "Implement Board 1: combine components with validation, max 5 tasks, drag-drop, START button" --solution=solution-designs/board1-integration.md

# Quality Gates
✓ Lint pass
✓ TypeScript compile
✓ Unit tests pass
✓ Build successful
```

### 3.3 Week 2: Board 2 - Real-time Progress

#### Days 8-9: Analysis & Design

```bash
# AI Agent: ANALYZE → INTEGRATION
# Skills: receival, integration-design, interaction-design

# Requirements
/analyze-task "Design Board 2: Real-time Progress with WebSocket, queue status, progress bar, live logs" --full

# Integration design
/integration-design "Design real-time UI: ProgressMonitor, LogStream with WebSocket events" --full
```

#### Days 10-12: Component Generation

```bash
# AI Agent: ANGULAR (L2)
# Skills: angular-signals, angular-http

# Generate components
/generate-component modules/fe-module/analyze/components/progress-monitor --type=smart --signals=true
/generate-component modules/fe-module/analyze/components/log-stream --type=smart --signals=true
/generate-service core/services/queue-status --singleton

# Implementation
/execute-task "Implement QueueStatusService with WebSocket, progress tracking" --solution=solution-designs/queue-status-service.md
/execute-task "Implement WebSocket events: task:progress, task:complete, task:error" --solution=solution-designs/websocket-events.md
```

#### Days 13-14: Integration

```bash
# AI Agent: CODE
/execute-task "Integrate Board 2 with real-time updates, queue status table, live logs" --solution=solution-designs/board2-integration.md

# Quality Gates
✓ WebSocket connects < 1s
✓ Progress updates < 100ms
✓ Auto-scroll works
```

### 3.4 Week 3: Board 3 - Output Viewer

#### Days 15-16: Analysis & Design

```bash
# AI Agent: SOLUTION
# Skills: design-solution, frontend-design

/solution-task "Design Board 3: Output Viewer with tabs (Analysis/Spec/Technical/JSON), markdown rendering, download/copy" --full
```

#### Days 17-19: Component Generation

```bash
# AI Agent: ANGULAR (L2)
# Skills: angular-directives, web-component-design

# Generate components
/generate-component shared/components/markdown-viewer --type=dumb
/generate-component modules/fe-module/analyze/components/output-tabs --type=smart
/generate-service core/services/file-viewer --singleton

# Implementation
/execute-task "Implement FileViewerService for loading files, download, copy" --solution=solution-designs/file-viewer-service.md
/execute-task "Implement MarkdownViewer with marked.js, syntax highlighting" --solution=solution-designs/markdown-viewer.md
```

#### Days 20-21: Integration

```bash
# AI Agent: CODE
/execute-task "Integrate Board 3 with file browser, tab navigation, viewers, actions" --solution=solution-designs/board3-integration.md

# Quality Gates
✓ Markdown renders correctly
✓ Syntax highlighting works
✓ File download works
```

### 3.5 Week 4: Integration & Code Review

#### Days 22-25: Full Integration

```bash
# AI Agent: CODE
# Skills: execution v8.5, git-commit

/execute-task "Integrate all 3 boards with state machine, error handling, retry, dashboard stats" --solution=solution-designs/analyze-integration.md

# Generate integration tests
test-automator generate --scope=integration --coverage=80
```

#### Days 26-28: Code Review

```bash
# AI Agent: REVIEW
# Skills: reviewing-code v6.0, code-review-excellence, web-design-guidelines

# L1 Review
/review-code --mode=self --task=phase1-analyze-module --show-code

# L2 Review
code-reviewer review --scope=phase1 --strictness=high
/ui-visual-validator check --component=analyze-page
```

**Output:**
- `review-reports/phase1-review.md`

### 3.6 Phase 1 Deliverables

```markdown
✅ PHASE 1 COMPLETION CHECKLIST:

### Base Infrastructure ✅ DONE
├─ [x] Angular 17+ Standalone Components
├─ [x] Angular Material + Taiga UI integration
├─ [x] Tailwind CSS with custom theme
├─ [x] Jira OAuth Authentication flow
├─ [x] Role-based access control (FE/BE/QC/BA)
├─ [x] Dynamic Layout (sidebar/header toggle)
├─ [x] LayoutService with Angular Signals
├─ [x] Menu Configuration system
├─ [x] JWT Interceptor
├─ [x] Auth Guards (authGuard, roleGuard)
└─ [x] 5 Module Pages (Dashboard, Tasks, Projects, Team, Settings)

### Workflow 3-Board UI ⏭️ PENDING - Phase 2
├─ Board 1: Input Configuration
│  ├─ [ ] PathSelector (directory browser)
│  ├─ [ ] TaskInput (Jira/URL/Text types)
│  ├─ [ ] TaskList (drag-drop, max 5 tasks)
│  └─ [ ] Form validation
│
├─ Board 2: Real-time Progress
│  ├─ [ ] QueueStatusService (WebSocket)
│  ├─ [ ] ProgressMonitor (overall/current)
│  ├─ [ ] LogStream (auto-scroll, color-coded)
│  └─ [ ] Queue management (cancel/remove)
│
├─ Board 3: Output Viewer
│  ├─ [ ] FileViewerService
│  ├─ [ ] MarkdownViewer (syntax highlighting)
│  ├─ [ ] OutputTabs (4 file types)
│  └─ [ ] Download/Copy functionality
│
├─ Backend Integration
│  ├─ [ ] Queue processor (analyze jobs)
│  ├─ [ ] OpenCode CLI spawning
│  ├─ [ ] File copy automation
│  └─ [ ] Real-time progress emission
│
├─ Testing
│  ├─ [x] Unit tests (spec files generated)
│  ├─ [ ] Integration tests
│  └─ [ ] E2E tests (happy path)
│
└─ Documentation
   ├─ [x] Component documentation (inline)
   ├─ [ ] API documentation
   └─ [ ] User guide
```

---

## 4. PHASE 2: WORKFLOW EXPANSION

> **Thờigian**: 4-6 tuần  
> **Mục tiêu**: Solution + Execute modules, Pipeline orchestration

### 4.1 Week 1-2: Solution Module

```bash
# AI Agent: ANALYZE → SOLUTION → ANGULAR (L2) → CODE

# 1. Analysis
/analyze-task "Design Solution Module: Select Analysis Output, Configuration, Design Progress (4 phases), Design Decisions approval, Solution Output" --full

# 2. Solution Design
/solution-task "Design Solution Module: SolutionInput, DesignProgress (4 phases), DesignDecisions, SolutionOutput" --full

# 3. L2 Component Generation
generate-component modules/fe-module/solution/components/solution-input --type=smart --form=reactive
generate-component modules/fe-module/solution/components/design-progress --type=smart --signals=true
generate-component modules/fe-module/solution/components/design-decisions --type=smart
generate-component modules/fe-module/solution/components/solution-output --type=smart

# 4. Implementation
/execute-task "Implement Solution Module with 4-phase progress, decision tracking, approval workflow" --solution=solution-designs/solution-module-design.md
```

### 4.2 Week 3-4: Execute Module

```bash
# AI Agent: ANALYZE → SOLUTION → ANGULAR (L2) → CODE

# 1. Analysis
/analyze-task "Design Execute Module: Select Solution Output, Configuration, File Selection, Implementation Progress, Quality Gates" --full

# 2. Solution Design
/solution-task "Design Execute Module: ExecuteInput, AffectedFileDetector, ImplementationProgress, ImplementationOutput" --full

# 3. L2 Component Generation
generate-component modules/fe-module/execute/components/execute-input --type=smart --form=reactive
generate-component modules/fe-module/execute/components/implementation-progress --type=smart --signals=true
generate-component modules/fe-module/execute/components/diff-viewer --type=dumb --monaco=diff
generate-component modules/fe-module/execute/components/implementation-output --type=smart

# 4. Implementation
/execute-task "Implement Execute Module with file detection, Monaco diff view, quality gates, apply/rollback" --solution=solution-designs/execute-module-design.md
```

### 4.3 Week 5-6: Pipeline Orchestration

```bash
# AI Agent: ANALYZE → SOLUTION → CODE

# 1. Analysis
/analyze-task "Design Pipeline: Full workflow (Analyze→Solution→Execute), Checkpoint & Resume, Workflow Templates, Error handling" --full

# 2. Solution Design
/solution-task "Design WorkflowPipelineService with runFullWorkflow(), checkpoint service, resume logic, workflow templates" --full

# 3. TDD (L2)
tdd-cycle "Pipeline should execute steps sequentially"
tdd-cycle "Pipeline should save checkpoint after each step"
tdd-cycle "Pipeline should resume from checkpoint"

# 4. Implementation
/execute-task "Implement pipeline orchestration, checkpoint service, workflow templates" --solution=solution-designs/pipeline-design.md
/execute-task "Implement PipelineProcessor with BullMQ job orchestration" --solution=solution-designs/pipeline-processor.md
```

### 4.4 Phase 2 Deliverables

```markdown
✅ PHASE 2 COMPLETION CHECKLIST:
├─ Solution Module
│  ├─ [ ] SolutionInput (analysis selection)
│  ├─ [ ] DesignProgress (4 phases)
│  ├─ [ ] DesignDecisions (approve/reject)
│  └─ [ ] SolutionOutput (4 tabs)
│
├─ Execute Module
│  ├─ [ ] ExecuteInput (solution selection)
│  ├─ [ ] ImplementationProgress (stats, diff)
│  ├─ [ ] ImplementationOutput (quality gates)
│  └─ [ ] Apply/Rollback actions
│
├─ Pipeline Orchestration
│  ├─ [ ] WorkflowPipelineService
│  ├─ [ ] Checkpoint & Resume
│  ├─ [ ] Workflow Templates
│  └─ [ ] Error handling
│
└─ Integration
   ├─ [ ] Inter-module data flow
   ├─ [ ] Shared state management
   └─ [ ] Workflow state persistence
```

---

## 5. PHASE 3: ADVANCED FEATURES

> **Thờigian**: 4-6 tuần  
> **Mục tiêu**: Dashboard Jira, Reporting, Analytics, Review Module

### 5.1 Week 1-2: Dashboard Jira Integration

```bash
# AI Agent: JIRA → ANALYZE → design-system-architect (L2) → ANGULAR (L2) → CODE

# 1. Jira Data (L1)
jira my-issues --max=50
jira get-sprint-board --current

# 2. Analysis
/analyze-task "Design Dashboard: My Tasks, Sprint Board, Workflow Status, Performance Charts, Recent Activity" --full

# 3. Design System (L2)
design-system-architect create-tokens --primary=#1976d2 --accent=#e91e63

# 4. L2 Component Generation
generate-component features/dashboard/components/my-tasks --type=smart --signals=true
generate-component features/dashboard/components/sprint-board --type=smart --cdk=drag-drop
generate-component features/dashboard/components/performance-charts --type=dumb --chart=echarts
generate-component features/dashboard/components/recent-activity --type=dumb

# 5. Implementation
/execute-task "Implement Dashboard with Jira integration, charts, real-time widgets" --solution=solution-designs/dashboard-design.md
```

### 5.2 Week 3: Reporting System

```bash
# AI Agent: SOLUTION → CODE

# 1. Solution Design
/solution-task "Design Reporting: PDF/HTML/Markdown export, Report templates, Scheduled reports" --full

# 2. Implementation
/execute-task "Implement ReportGeneratorService with Puppeteer PDF generation, scheduled reports" --solution=solution-designs/reporting-design.md
/execute-task "Implement ReportController with PDF endpoint, scheduled jobs" --solution=solution-designs/report-controller.md

# Skills: pdf (L1)
```

### 5.3 Week 4: Analytics & Insights

```bash
# AI Agent: ANALYZE → ANGULAR (L2) → CODE

# 1. Analysis
/analyze-task "Design Analytics: Performance metrics, Bottleneck identification, Trends, Data visualization" --full

# 2. L2 Component Generation
generate-component features/analytics/components/metrics-cards --type=dumb
generate-component features/analytics/components/trend-charts --type=dumb --chart=echarts
generate-component features/analytics/components/bottleneck-analysis --type=smart

# 3. Implementation
/execute-task "Implement AnalyticsService with calculations, bottleneck detection, predictions" --solution=solution-designs/analytics-design.md
```

### 5.4 Week 5: Review Module

```bash
# AI Agent: ANALYZE → SOLUTION → ANGULAR (L2) → CODE → REVIEW

# 1. Analysis
/analyze-task "Design Review Module: Code diff view, Comments, Quality gates, Approve/Request changes" --full

# 2. Solution Design
/solution-task "Design Review: DiffViewer, CommentThread, QualityGates, ReviewActions" --full

# 3. L2 Component Generation
generate-component features/review/components/diff-viewer --type=dumb --monaco=diff
generate-component features/review/components/comment-thread --type=smart
generate-component features/review/components/quality-gates --type=dumb

# 4. Implementation
/execute-task "Implement Review Module with Monaco diff, comments, quality gates, approval" --solution=solution-designs/review-module-design.md

# 5. Review
/review-code --mode=self --task=review-module --show-code
```

### 5.5 Week 6: Accessibility & Polish

```bash
# AI Agent: accessibility-expert (L2) → CODE → ui-visual-validator (L2)

# 1. Accessibility Audit
accessibility-expert audit --standard=wcag2.1-aa

# Skills: accessibility-compliance (L2), web-design-guidelines (L1)

# 2. Fixes
/execute-task "Fix accessibility: keyboard navigation, ARIA labels, color contrast" --priority=high

# 3. Visual Validation
ui-visual-validator check --scope=phase3
```

### 5.6 Phase 3 Deliverables

```markdown
✅ PHASE 3 COMPLETION CHECKLIST:
├─ Dashboard
│  ├─ [ ] My Tasks (Jira integration)
│  ├─ [ ] Sprint Board (drag-drop)
│  ├─ [ ] Workflow Status (real-time)
│  ├─ [ ] Performance Charts
│  └─ [ ] Recent Activity
│
├─ Reporting
│  ├─ [ ] PDF generation (Puppeteer)
│  ├─ [ ] HTML reports
│  ├─ [ ] Scheduled reports
│  └─ [ ] Report templates
│
├─ Analytics
│  ├─ [ ] Performance metrics
│  ├─ [ ] Bottleneck analysis
│  ├─ [ ] Trend predictions
│  └─ [ ] Data visualization
│
├─ Review Module
│  ├─ [ ] Diff viewer (Monaco)
│  ├─ [ ] Comment threads
│  ├─ [ ] Quality gates
│  └─ [ ] Approval workflow
│
└─ Accessibility
   ├─ [ ] WCAG 2.1 AA compliance
   ├─ [ ] Keyboard navigation
   └─ [ ] Screen reader support
```

---

## 6. PHASE 4: MULTI-ROLE & SCALE

> **Thờigian**: 4-6 tuần  
> **Mục tiêu**: Multi-role modules (BE/QC/BA/PM), Admin Panel, Production

### 6.1 Week 1: BE Module

```bash
# AI Agent: ANALYZE → SOLUTION → ANGULAR (L2) → CODE

# 1. Analysis
/analyze-task "Design BE Module: API Design tools, Database Schema visualization, Microservice Architecture, NestJS workflows" --full

# 2. Solution Design
/solution-task "Design BE Module: API designer, Schema visualizer, Microservice diagrams, NestJS patterns" --full

# 3. L2 Component Generation
generate-component modules/be-module --type=feature-module
generate-component modules/be-module/components/api-designer --type=smart
generate-component modules/be-module/components/schema-visualizer --type=smart

# 4. Implementation
/execute-task "Implement BE Module with API design tools, schema visualization, architecture diagrams" --solution=solution-designs/be-module-design.md
```

### 6.2 Week 2: QC & BA Modules

```bash
# AI Agent: ANALYZE → SOLUTION → ANGULAR (L2) → CODE

# QC Module
/analyze-task "Design QC Module: Test scenario analysis, Coverage reports, Test strategy, E2E generation" --full
/solution-task "Design QC Module: Test analyzer, Coverage dashboard, Strategy designer, E2E generator" --full
generate-component modules/qc-module --type=feature-module
/execute-task "Implement QC Module with test generation" --solution=solution-designs/qc-module-design.md

# BA Module
/analyze-task "Design BA Module: Requirements parser, User story generator, BPMN flows, Documentation export" --full
/solution-task "Design BA Module: Requirements input, User stories, BPMN editor, Documentation export" --full
generate-component modules/ba-module --type=feature-module
/execute-task "Implement BA Module with requirements tools" --solution=solution-designs/ba-module-design.md
```

### 6.3 Week 3: PM Module & Menu Configuration

```bash
# AI Agent: ANALYZE → SOLUTION → ANGULAR (L2) → CODE

# PM Module
/analyze-task "Design PM Module: Sprint planning, Capacity planning, Velocity tracking, Risk assessment" --full
/solution-task "Design PM Module: Sprint board, Velocity charts, Burndown, Risk dashboard" --full
generate-component modules/pm-module --type=feature-module
/execute-task "Implement PM Module with planning tools" --solution=solution-designs/pm-module-design.md

# Menu Configuration
/analyze-task "Design Menu Configuration: Role-based menus, Custom config, Dynamic rendering" --full
/solution-task "Design MenuConfigService with role defaults, custom editor, dynamic sidebar" --full
generate-component features/menu-config --type=smart
/execute-task "Implement Menu Configuration system" --solution=solution-designs/menu-config-design.md
```

### 6.4 Week 4: Admin Panel

```bash
# AI Agent: ANALYZE → SOLUTION → ANGULAR (L2) → CODE

# 1. Analysis
/analyze-task "Design Admin Panel: User management, Role management, Permission matrix, System config, Audit logs, Monitoring" --full

# 2. Solution Design
/solution-task "Design Admin Panel: User CRUD, Role assignment, RBAC permissions, System settings, Audit viewer" --full

# 3. L2 Component Generation
generate-component features/admin-panel --type=feature-module
generate-component admin-panel/components/user-management --type=smart --table=material
generate-component admin-panel/components/role-management --type=smart

# 4. Implementation
/execute-task "Implement Admin Panel with user/role management, RBAC, audit logs" --solution=solution-designs/admin-panel-design.md
/execute-task "Implement RBAC permission system with PermissionGuard" --solution=solution-designs/rbac-design.md
```

### 6.5 Week 5: Security Hardening

```bash
# AI Agent: security-auditor (L2) → CODE

# 1. Security Audit
security-auditor audit --scope=full --level=production
security-sast scan --severity=high
security-dependencies audit

# 2. Hardening
security-hardening apply --level=production

# 3. Implementation
/execute-task "Implement security hardening: input validation, CSRF, rate limiting, Helmet headers" --solution=solution-designs/security-hardening.md
```

### 6.6 Week 6: Deployment & Monitoring

```bash
# AI Agent: SOLUTION → CODE

# 1. Solution Design
/solution-task "Design Production Deployment: Docker, Nginx, SSL, Health checks, Backups" --full

# 2. Implementation
/execute-task "Create Docker Compose production with multi-service, Nginx SSL" --solution=solution-designs/deployment-design.md
/execute-task "Implement health checks, Prometheus metrics, monitoring" --solution=solution-designs/monitoring-design.md

# 3. DevOps Commands
docker-compose -f docker-compose.prod.yml up -d
```

### 6.7 Phase 4 Deliverables

```markdown
✅ PHASE 4 COMPLETION CHECKLIST:
├─ Multi-Role Modules
│  ├─ [ ] BE Module (API, DB schema, microservices)
│  ├─ [ ] QC Module (tests, coverage, E2E)
│  ├─ [ ] BA Module (requirements, stories, BPMN)
│  └─ [ ] PM Module (planning, velocity, risks)
│
├─ Menu Configuration
│  ├─ [ ] Role-based menus
│  ├─ [ ] Custom configuration
│  └─ [ ] Dynamic rendering
│
├─ Admin Panel
│  ├─ [ ] User management
│  ├─ [ ] Role management
│  ├─ [ ] Permission matrix (RBAC)
│  ├─ [ ] System configuration
│  ├─ [ ] Audit logs
│  └─ [ ] Monitoring dashboard
│
├─ Security
│  ├─ [ ] Security audit passed
│  ├─ [ ] Vulnerabilities fixed
│  ├─ [ ] Rate limiting
│  └─ [ ] Security headers
│
└─ Production
   ├─ [ ] Docker deployment
   ├─ [ ] SSL/HTTPS
   ├─ [ ] Health monitoring
   └─ [ ] Backup strategy
```

---

## 7. DAILY EXECUTION WORKFLOW

### 7.1 Morning Routine (15 mins)

```bash
#!/bin/bash
# morning-routine.sh

# 1. Check Jira tasks (L1)
jira my-issues

# 2. Select today's task (L1)
analyze-task EMSPRO2-XXXX --smart-auto

# 3. Review context
# Load analysis report if continuing task
```

### 7.2 Development Session (6-8 hours)

```bash
#!/bin/bash
# development-session.sh

# 4. Design solution (if new feature) (L1)
solution-task "Design [specific feature]" --full

# 5. Generate Angular components (L2)
generate-component [path] --type=smart

# 6. TDD cycle (if applicable) (L2)
tdd-red "[test description]"
tdd-green
tdd-refactor

# 7. Implement business logic (L1)
execute-task "Implement [feature]" --solution=solution-designs/xxx.md

# 8. Generate tests (L2)
test-generate --coverage=80
```

### 7.3 Evening Review (30 mins)

```bash
#!/bin/bash
# evening-review.sh

# 9. Code review (L1 + L2)
review-code --mode=self --task=EMSPRO2-XXXX --show-code
code-reviewer review --strictness=high

# 10. Visual validation (L2)
ui-visual-validator check --component=[component]

# 11. Security check (weekly) (L2)
security-dependencies audit

# 12. Git commit (manual after review)
# User reviews changes and commits manually
```

---

## 8. QUICK REFERENCE

### 8.1 Layer 1 (Global) Commands

```markdown
| Command | Agent | Purpose |
|---------|-------|---------|
| /analyze-task | ANALYZE | Phân tích requirements |
| /solution-task | SOLUTION | Thiết kế kiến trúc |
| /execute-task | CODE | Implementation |
| /review-code | REVIEW | Code review |
| /integration-api | INTEGRATION | API specs |
| /integration-design | INTEGRATION | UI/UX specs |
| /jira | JIRA | Jira integration |
| /upgrade | SYSTEM-ARCHITECT | System maintenance |
```

### 8.2 Layer 2 (Project) Commands

```markdown
| Command | Agent | Purpose |
|---------|-------|---------|
| /angular-init | ANGULAR | Khởi tạo project |
| /generate-component | ANGULAR | Tạo component |
| /generate-service | ANGULAR | Tạo service |
| /tdd-cycle | ANGULAR | TDD workflow |
| /tdd-red | ANGULAR | Viết test failing |
| /tdd-green | ANGULAR | Pass tests |
| /tdd-refactor | ANGULAR | Refactor code |
| /test-generate | test-automator | Generate tests |
| /design-system-setup | ANGULAR | Setup design system |
| /security-hardening | security-auditor | Security hardening |
| /security-sast | security-auditor | Static analysis |
| /accessibility-audit | accessibility-expert | WCAG audit |
| /design-review | ui-ux-designer | Review design |
| /full-review | code-reviewer | Comprehensive review |
```

### 8.3 Critical Quality Gates

```markdown
Every implementation must pass:

✓ Lint check (npm run lint)
✓ TypeScript compile (no errors)
✓ Unit tests (80%+ coverage)
✓ Build successful (ng build / nest build)
✓ Code review approved
✓ Visual validation (if UI)
✓ Accessibility (WCAG AA for Phase 3+)
```

### 8.4 File Structure Conventions

```markdown
Documentation:
- analysis-reports/[TASK-ID]-analysis.md
- solution-designs/[TASK-ID]-solution.md
- integrations/api/[TASK-ID]-api.md
- integrations/design/[TASK-ID]-design.md
- review-reports/[TASK-ID]-[DATE]-review.md

Implementation:
- apps/web/src/app/features/[feature]/
- apps/api/src/[module]/
```

---

## 9. ESTIMATED TIMELINE

| Phase | Duration | Agents Used | Est. Hours |
|-------|----------|-------------|------------|
| Phase 0 | 1-2 weeks | 6 | 80-100 |
| Phase 1 | 4-5 weeks | 8 | 160-200 |
| Phase 2 | 4-6 weeks | 6 | 160-240 |
| Phase 3 | 4-6 weeks | 8 | 160-240 |
| Phase 4 | 4-6 weeks | 6 | 160-240 |
| **TOTAL** | **17-25 weeks** | **12+** | **720-1020** |

---

## 10. NEXT STEPS

1. **Review** this blueprint thoroughly
2. **Start Phase 0** with the morning routine commands
3. **Track progress** using the checklists in each phase
4. **Iterate** based on actual development learnings
5. **Update** this document as the project evolves

---

**Document Status**: READY FOR EXECUTION  
**Last Updated**: March 2026  
**Maintainer**: SYSTEM-ARCHITECT Agent
