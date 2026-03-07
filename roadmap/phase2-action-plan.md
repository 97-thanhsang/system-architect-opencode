# 🎯 PHASE 2 ACTION PLAN - WORKFLOW EXPANSION

> **Current Date**: March 2026  
> **Status**: Phase 0 ✅ Done | Phase 1 🟡 Partial | Phase 2 🚀 Starting  
> **Next Milestone**: 3-Board Analyze Module + Backend API

---

## 📋 TÌNH HÌNH HIỆN TẠI

### ✅ Đã có (Completed)
```
system-architect-opencode/
├── src/app/
│   ├── core/
│   │   ├── auth/              ✅ JiraAuthService, AuthService
│   │   ├── guards/            ✅ authGuard, roleGuard
│   │   ├── interceptors/      ✅ jwt, error, logging
│   │   └── services/          ✅ ApiService
│   ├── features/
│   │   ├── auth/              ✅ Login, Callback components
│   │   ├── dashboard/         ✅ DashboardComponent
│   │   └── modules/fe-module/ ✅ FE Module với 5 pages
│   │       ├── components/
│   │       │   ├── layout/    ✅ DynamicLayoutComponent
│   │       │   ├── sidebar/   ✅ SidebarComponent
│   │       │   └── header/    ✅ HeaderComponent
│   │       ├── pages/
│   │       │   ├── fe-dashboard/  ✅
│   │       │   ├── fe-tasks/      ✅
│   │       │   ├── fe-projects/   ✅
│   │       │   ├── fe-team/       ✅
│   │       │   └── fe-settings/   ✅
│   │       └── services/
│   │           └── layout.service.ts  ✅ (Signals)
│   └── shared/
│       └── directives/
│           └── permission.directive.ts  ✅
├── package.json               ✅ Angular 17, Material, Taiga UI, Tailwind
├── angular.json               ✅ Configured
└── environments/              ✅ environment.ts, environment.prod.ts
```

### ⏭️ Cần xây dựng (Pending)
```
apps/
├── web/ (current src/)
│   └── app/
│       └── features/
│           └── modules/
│               └── fe-module/
│                   └── analyze/     ⏭️ Board 1, 2, 3
│                   └── solution/    ⏭️ Solution Module
│                   └── execute/     ⏭️ Execute Module
│
└── api/ (NestJS)                    ⏭️ NEW - cần tạo
    ├── src/
    │   ├── auth/
    │   ├── tasks/
    │   ├── queue/
    │   ├── opencode/
    │   ├── jira/
    │   └── websocket/
    └── docker-compose.yml           ⏭️ Redis, PostgreSQL
```

---

## 🚀 KẾ HOẠCH 4 TUẦN PHASE 2

### **TUẦN 1: Backend Foundation (NestJS)**

#### **Day 1-2: NestJS Setup**
```bash
# Tạo folder structure
mkdir -p apps/api

cd apps/api

# Khởi tạo NestJS
nest new . --strict

# Install dependencies
npm install @nestjs/websockets @nestjs/platform-socket.io
npm install @nestjs/bull bull @nestjs/bullmq
npm install @nestjs/passport passport passport-jwt
npm install @nestjs/config
npm install ioredis
npm install @nestjs/typeorm typeorm sqlite3
npm install @nestjs/axios axios
npm install class-validator class-transformer

# Generate modules
nest generate module auth
nest generate module tasks
nest generate module queue
nest generate module opencode
nest generate module jira
nest generate module websocket
```

**AI Agent Tasks:**
- Agent: `SOLUTION` | Command: `/solution-task "Design NestJS architecture with modular structure" --full`
- Agent: `CODE` | Command: `/execute-task "Setup NestJS project structure with 6 modules" --solution=solution-designs/backend-architecture.md`

#### **Day 3-4: Database & Entities**
```typescript
// Tạo entities
nest generate class tasks/entities/task --flat

// Cần có:
// - TaskEntity (id, jiraKey, status, input, output, createdAt, updatedAt)
// - UserEntity (id, email, roles, jiraToken)
// - PipelineEntity (id, steps, currentStep, status)
```

**AI Agent Tasks:**
- Agent: `SOLUTION` | Command: `/solution-task "Design database schema for Task, User, Pipeline entities" --full`
- Agent: `CODE` | Command: `/execute-task "Implement TypeORM entities with relations" --solution=solution-designs/database-schema.md`

#### **Day 5-7: Queue & WebSocket**
```bash
# Redis setup
docker run -d --name opencode-redis -p 6379:6379 redis:7-alpine

# Tạo queue processor
nest generate class queue/tasks.processor --flat
nest generate class queue/queue.service --flat

# Tạo WebSocket gateway
nest generate class websocket/tasks.gateway --flat
```

**AI Agent Tasks:**
- Agent: `INTEGRATION` | Command: `/integration-api "Design WebSocket events for task progress updates" --full`
- Agent: `CODE` | Command: `/execute-task "Implement BullMQ queue processor and WebSocket gateway" --solution=solution-designs/queue-websocket.md`

---

### **TUẦN 2: Analyze Module 3-Board UI**

#### **Day 8-10: Board 1 - Input Configuration**
```bash
# Generate components
cd apps/web/src/app/features/modules/fe-module

ng generate component analyze/components/board1-input --standalone
ng generate component analyze/components/path-selector --standalone
ng generate component analyze/components/task-input --standalone
ng generate component analyze/components/task-list --standalone

# Tạo services
ng generate service analyze/services/task-input
```

**AI Agent Tasks:**
- Agent: `ANALYZE` | Command: `/analyze-task "Design Board 1: Input Configuration with path selection, task types, validation" --full`
- Agent: `SOLUTION` | Command: `/solution-task "Design Board 1 components: PathSelector, TaskInput, TaskList" --full`
- Agent: `ANGULAR` (L2) | Command: `/generate-component analyze/components/path-selector --type=smart --form=reactive`
- Agent: `CODE` | Command: `/execute-task "Implement Board 1 with validation and drag-drop" --solution=solution-designs/board1-design.md`

#### **Day 11-12: Board 2 - Real-time Progress**
```bash
# Generate components
ng generate component analyze/components/board2-progress --standalone
ng generate component analyze/components/progress-monitor --standalone
ng generate component analyze/components/log-stream --standalone

# Services
ng generate service analyze/services/queue-status
```

**AI Agent Tasks:**
- Agent: `ANALYZE` | Command: `/analyze-task "Design Board 2: Real-time Progress with WebSocket integration" --full`
- Agent: `INTEGRATION` | Command: `/integration-design "Design real-time UI components with WebSocket events" --full`
- Agent: `ANGULAR` (L2) | Command: `/generate-component analyze/components/progress-monitor --type=smart --signals=true`
- Agent: `CODE` | Command: `/execute-task "Implement Board 2 with WebSocket real-time updates" --solution=solution-designs/board2-design.md`

#### **Day 13-14: Board 3 - Output Viewer**
```bash
# Generate components
ng generate component analyze/components/board3-output --standalone
ng generate component analyze/components/output-tabs --standalone
ng generate component analyze/components/markdown-viewer --standalone

# Install markdown library
npm install marked highlight.js
npm install -D @types/marked
```

**AI Agent Tasks:**
- Agent: `SOLUTION` | Command: `/solution-task "Design Board 3: Output Viewer with markdown rendering" --full`
- Agent: `ANGULAR` (L2) | Command: `/generate-component analyze/components/output-tabs --type=smart`
- Agent: `CODE` | Command: `/execute-task "Implement Board 3 with file browser and markdown viewer" --solution=solution-designs/board3-design.md`

---

### **TUẦN 3: OpenCode Integration**

#### **Day 15-17: OpenCode Service**
```typescript
// apps/api/src/opencode/
// - opencode.service.ts (spawn CLI processes)
// - opencode.controller.ts
// - opencode.module.ts

// Cần implement:
// - spawnOpencodeProcess(command, args, options)
// - streamProgress(taskId, process)
// - copyOutputFiles(taskId, outputPath)
```

**AI Agent Tasks:**
- Agent: `SOLUTION` | Command: `/solution-task "Design OpenCode service for CLI process spawning and progress streaming" --full`
- Agent: `CODE` | Command: `/execute-task "Implement OpenCode service with process management" --solution=solution-designs/opencode-service.md`

#### **Day 18-19: Queue Processor Implementation**
```typescript
// apps/api/src/queue/tasks.processor.ts

// Implement:
// - handleAnalyze(job: Job<AnalyzeJobData>)
// - streamProgress via WebSocket
// - copy output files
// - update task status
```

**AI Agent Tasks:**
- Agent: `CODE` | Command: `/execute-task "Implement queue processor for analyze jobs with WebSocket progress updates" --solution=solution-designs/queue-processor.md`

#### **Day 20-21: Integration Frontend-Backend**
```bash
# Connect Angular to NestJS API
# - Update environment.ts with API URL
# - Create ApiService methods
# - Connect QueueStatusService to WebSocket
```

**AI Agent Tasks:**
- Agent: `INTEGRATION` | Command: `/integration-api "Integrate Angular frontend with NestJS backend API" --full`
- Agent: `CODE` | Command: `/execute-task "Connect Analyze Module to backend API and WebSocket" --solution=solution-designs/frontend-backend-integration.md`

---

### **TUẦN 4: Testing & Polish**

#### **Day 22-24: Testing**
```bash
# Frontend tests
npm test -- --coverage

# Backend tests
cd apps/api
npm test

# E2E tests (if applicable)
```

**AI Agent Tasks:**
- Agent: `test-automator` (L2) | Command: `/test-generate --scope=integration --coverage=80`
- Agent: `CODE` | Command: `/execute-task "Write unit tests for Analyze Module components" --solution=solution-designs/analyze-tests.md`

#### **Day 25-26: Code Review**
```bash
# Review all changes
```

**AI Agent Tasks:**
- Agent: `REVIEW` | Command: `/review-code --mode=self --task=phase2-analyze-module --show-code`
- Agent: `code-reviewer` (L2) | Command: `/full-review --scope=phase2 --strictness=high`

#### **Day 27-28: Documentation & Bug Fixes**
```bash
# Fix any issues found
# Update documentation
```

---

## 📊 COMMANDS SUMMARY

### **Tuần 1 (Backend)**
```bash
# NestJS Setup
nest new apps/api --strict
cd apps/api && npm install [dependencies]
nest generate module [auth|tasks|queue|opencode|jira|websocket]

# Database
# Setup TypeORM entities

# Redis
docker run -d --name opencode-redis -p 6379:6379 redis:7-alpine
```

### **Tuần 2 (Frontend 3-Board)**
```bash
# Board 1
cd apps/web/src/app/features/modules/fe-module
gg c analyze/components/board1-input --standalone
gg c analyze/components/path-selector --standalone --flat
gg c analyze/components/task-input --standalone --flat
gg c analyze/components/task-list --standalone --flat
gg s analyze/services/task-input

# Board 2
gg c analyze/components/board2-progress --standalone
gg c analyze/components/progress-monitor --standalone
gg c analyze/components/log-stream --standalone
gg s analyze/services/queue-status

# Board 3
gg c analyze/components/board3-output --standalone
gg c analyze/components/output-tabs --standalone
gg c analyze/components/markdown-viewer --standalone

# Routing
gg c analyze/analyze --standalone
```

### **Tuần 3 (Integration)**
```bash
# OpenCode service
nest generate class opencode/opencode.service --flat
nest generate class opencode/opencode.controller --flat

# Queue processor
nest generate class queue/tasks.processor --flat

# Dependencies
npm install marked highlight.js
npm install -D @types/marked
```

### **Tuần 4 (Testing)**
```bash
# Frontend
npm test -- --coverage --watch=false

# Backend
cd apps/api && npm test -- --coverage
```

---

## 🎯 MILESTONES

| Tuần | Milestone | Kiểm tra |
|------|-----------|----------|
| **Week 1** | Backend API chạy được | `npm run start:dev` → API responds |
| **Week 2** | 3 Board UI hoàn chỉnh | Navigate to `/module/fe/analyze` → 3 boards visible |
| **Week 3** | End-to-end flow | Add task → Start → See progress → View output |
| **Week 4** | Tests pass | `npm test` → 80%+ coverage |

---

## 🐛 RISK MITIGATION

| Risk | Mitigation |
|------|------------|
| Redis connection issues | Use Docker, test with `redis-cli ping` |
| WebSocket not working | Check CORS, test with Postman/Socket.IO client |
| OpenCode CLI not spawning | Verify opencode CLI installed globally, check PATH |
| Build failures | Run `npm ci` instead of `npm install` |
| File permission errors | Use proper temp directories, check write permissions |

---

## ✅ CHECKLIST TUẦN 1-4

### Week 1 (Đang thực hiện)

#### Day 1 ✅ COMPLETED (March 2026)
- [x] Prerequisites checked (Node.js v22, npm v10)
- [x] NestJS CLI installed globally (@nestjs/cli@10)
- [x] NestJS project created in apps/api/ (strict mode)
- [x] Dependencies installed (201 packages)
  - @nestjs/websockets, @nestjs/platform-socket.io
  - @nestjs/bull, bull, ioredis
  - @nestjs/passport, passport, passport-jwt
  - @nestjs/typeorm, typeorm, sqlite3
  - @nestjs/config, @nestjs/axios, axios
  - class-validator, class-transformer
- [x] 6 modules generated (auth, tasks, queue, opencode, jira, websocket)
- [x] Docker Compose file created (Redis + PostgreSQL)
- [x] DatabaseModule created with TypeORM config
- [x] 3 Entities created:
  - Task (id, jiraKey, status, type, input, output, metadata, timestamps)
  - User (id, email, name, roles, jiraToken, timestamps)
  - Pipeline (id, name, status, currentStep, steps, checkpoint, timestamps)
- [x] TasksModule updated with entities
- [x] AuthModule updated with User entity
- [x] AppModule updated to import DatabaseModule
- [x] Main.ts updated with CORS, ValidationPipe, global prefix
- [x] start-redis.bat script created for Windows

#### Day 2 ⏭️ NEXT
- [ ] Generate services and controllers
- [ ] Create DTOs with validation
- [ ] Setup Queue processor
- [ ] Create WebSocket gateway

#### Day 3-4 ⏭️ PENDING
- [ ] Redis running (user cần start Docker Desktop và chạy start-redis.bat)
- [ ] Queue processor implementation
- [ ] WebSocket gateway implementation
- [ ] Test API endpoints

### Week 2 ✅
- [ ] Board 1 components (PathSelector, TaskInput, TaskList)
- [ ] Board 2 components (ProgressMonitor, LogStream)
- [ ] Board 3 components (OutputTabs, MarkdownViewer)
- [ ] Routing configured
- [ ] Services created

### Week 3 ✅
- [ ] OpenCode service implemented
- [ ] Queue processor complete
- [ ] WebSocket events working
- [ ] Frontend connected to backend
- [ ] End-to-end test successful

### Week 4 ✅
- [ ] Unit tests 80%+
- [ ] Integration tests pass
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Bugs fixed

---

## 🚀 BẮT ĐẦU NGAY

**Ngay bây giờ, hãy chạy:**

```bash
# 1. Mở terminal
cd E:\SOURCE\system-architect-opencode

# 2. Kiểm tra prerequisites
node --version  # v18+
npm --version   # v9+

# 3. Cài NestJS CLI (nếu chưa có)
npm install -g @nestjs/cli

# 4. Tạo backend folder
mkdir -p apps/api
cd apps/api

# 5. Khởi tạo NestJS
nest new . --strict --skip-git

# 6. Chọn package manager: npm
# 7. Chờ setup hoàn tất...

# 8. Test
npm run start:dev
# Mở http://localhost:3000
# Expected: "Hello World!" hoặc API health check
```

**Sau khi hoàn thành Week 1 Day 1:**
- [ ] Chụp màn hình API chạy thành công
- [ ] Update checklist trong `execution-blueprint.md`
- [ ] Tiếp tục Week 1 Day 2

---

**Ready to start?** Chọn 1 trong các option:
1. 🚀 **Bắt đầu Week 1 Day 1 ngay** - Tôi sẽ hướng dẫn step-by-step
2. 📋 **Xem chi tiết Day 2** - Tôi sẽ giải thích trước khi làm
3. 🔧 **Troubleshooting** - Giải quyết vấn đề nếu có
4. 📊 **Review lại Phase 0-1** - Kiểm tra lại những gì đã làm
