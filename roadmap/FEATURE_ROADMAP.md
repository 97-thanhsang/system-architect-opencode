# 🗺️ OpenCode Workflow Platform - Feature Roadmap

> **Project**: OpenCode Workflow Management Platform  
> **Location**: `E:\SOURCE\system-architect-opencode`  
> **Tech Stack**: Angular 17+, Node.js/NestJS, WebSocket, Redis  
> **Last Updated**: March 7, 2026

---

## 📋 Executive Summary

Roadmap được tổ chức theo **từng Feature** thay vì Phase, giúp dễ dàng:
- Theo dõi tiến độ từng chức năng cụ thể
- Ưu tiên và sắp xếp lại thứ tự phát triển
- Đánh giá hoàn thành từng feature độc lập

---

## ✅ FEATURE 1: Authentication & Authorization

> **Status**: ✅ **COMPLETED + ENHANCED**  
> **Timeline**: Phase 0-1 + Week 1 Day 2 + March 7 Hotfix  
> **Priority**: Critical

### 📝 Description
Hệ thống xác thực và phân quyền ngườ dùng với Jira integration.

### ✅ Completed Items

#### Backend (NestJS)
- [x] NestJS project setup với TypeORM
- [x] User Entity với Jira fields (jiraUsername, jiraDisplayName, avatarUrl)
- [x] JiraClientService - Validate credentials với Jira API
- [x] JWT Module (@nestjs/jwt, passport, passport-jwt)
- [x] JWT Strategy - Token validation
- [x] AuthService.loginWithJira() - Xác thực thực tế
- [x] AuthController endpoints:
  - `POST /api/auth/jira/login` - Jira authentication
  - `POST /api/auth/login` - Legacy login
  - `POST /api/auth/register` - User registration
  - `GET /api/auth/profile` - Get profile (JWT protected)
- [x] Database: SQLite với TypeORM

#### Frontend (Angular)
- [x] LoginTaigaComponent - Modern UI với Taiga UI
- [x] JiraAuthService - Gọi backend API
- [x] JWT Interceptor - Auto-add Bearer token
- [x] Auth Guard - Route protection
- [x] Error handling & validation
- [x] Loading states & user feedback
- [x] **TokenStorageService** - Quản lý token với Angular Signals (NEW)
- [x] **Session Persistence** - Giữ đăng nhập sau refresh (NEW)
- [x] **Auto Token Refresh** - Tự động refresh token trước khi hết hạn (NEW)
- [x] **Logout UI** - Nút đăng xuất trong Header và Sidebar (FIXED)
- [x] **Public Guard** - Chặn user đã login vào trang login (NEW)
- [x] **Remember Me** - "Ghi nhớ đăng nhập" với localStorage/sessionStorage (NEW)

#### Integration
- [x] Kết nối với Jira Server (task.ascvn.com.vn)
- [x] JWT token generation & storage
- [x] Auto-redirect sau login
- [x] Logout functionality

---

## ✅ FEATURE 2: Task Queue & Processing System

> **Status**: ✅ **COMPLETED**  
> **Timeline**: Week 1 Day 3-4  
> **Priority**: High  
> **Dependencies**: Feature 1 (Authentication)

### 📝 Description
Hệ thống queue xử lý các tasks bất đồng bộ với BullMQ và Redis.

### ✅ Completed Items

#### Backend
- [x] Redis setup (Docker)
- [x] BullMQ configuration (@nestjs/bullmq)
- [x] QueueModule setup
- [x] TasksProcessor:
  - [x] Xử lý analyze jobs mô phỏng workflow
  - [x] Tích hợp WebSocket để emit progress/logs
- [x] QueueService - Quản lý queue operations (add, status, pause, resume)
- [x] QueueController endpoints:
  - `GET /api/queue/status` - Queue status
  - `POST /api/queue/add` - Add test job
  - `POST /api/queue/pause` - Pause queue
  - `POST /api/queue/resume` - Resume queue

#### Frontend
- [x] QueueService (Angular core service)
- [x] QueueMonitorComponent - Giao diện theo dõi hàng đợi
- [x] Job progress tracking với Progress Bar
- [x] Real-time updates via WebSocket (thay thế Polling)

### 📁 Files Created
```
apps/api/src/queue/
├── queue.module.ts
├── queue.service.ts
├── queue.controller.ts
└── tasks.processor.ts
```

---

## ✅ FEATURE 3: Real-time Communication (WebSocket)

> **Status**: ✅ **COMPLETED**  
> **Timeline**: Week 1 Day 3-4  
> **Priority**: High  
> **Dependencies**: Feature 1 (Authentication)

### 📝 Description
Hệ thống real-time communication sử dụng Socket.io để cập nhật tiến độ tasks.

### ✅ Completed Items

#### Backend
- [x] WebSocketGateway setup (@nestjs/websockets)
- [x] Socket.io integration (tasks namespace)
- [x] Authentication cho WebSocket connections (JWT handshake)
- [x] Events:
  - [x] `task-progress` - Cập nhật % hoàn thành
  - [x] `task-status` - Thay đổi status (active, completed)
  - [x] `task-log` - Stream log messages từ Agent
  - [x] `queue-status` - Broadcast thống kê hàng đợi
- [x] Rooms:
  - [x] Room per task (`task-${taskId}`)
  - [x] Queue status room (`queue-status`)

#### Frontend
- [x] WebSocketService (core service)
- [x] Real-time progress bars (integrated in Monitor)
- [x] Log stream viewer (integrated in Monitor)
- [x] Live Pulse indicator (UI)
- [x] Auto-reconnect logic với exponential backoff

### 📁 Files Created
```
apps/api/src/websocket/
├── websocket.module.ts
└── tasks.gateway.ts

src/app/core/services/
└── websocket.service.ts
```

---

## ⏭️ FEATURE 4: Analyze Module (3-Board UI)

> **Status**: ⏭️ **PENDING**  
> **Timeline**: Week 2  
> **Priority**: High  
> **Dependencies**: Feature 1, 2, 3

### 📝 Description
Module phân tích tasks với 3-board interface: Input, Progress, Output.

### 📋 Implementation Checklist

#### Board 1: Input Configuration
- [ ] PathSelector component
- [ ] TaskInput component
- [ ] TaskList component
- [ ] Form validation
- [ ] Drag-drop file upload
- [ ] Jira task integration
- [ ] Project selection

#### Board 2: Real-time Progress
- [ ] ProgressMonitor component
- [ ] LogStream component
- [ ] Real-time updates (WebSocket)
- [ ] Status indicators
- [ ] Cancel/Retry buttons
- [ ] Time estimation

#### Board 3: Output Viewer
- [ ] OutputTabs component
- [ ] MarkdownViewer component
- [ ] File browser
- [ ] Download outputs
- [ ] Share results
- [ ] History viewer

#### Shared Components
- [ ] AnalyzeModule routing
- [ ] AnalyzeService (API calls)
- [ ] State management

---

## ⏭️ FEATURE 5: Solution Module

> **Status**: ⏭️ **PENDING**  
> **Timeline**: Week 3  
> **Priority**: Medium  
> **Dependencies**: Feature 4

### 📝 Description
Module thiết kế solution kỹ thuật cho các tasks.

### 📋 Implementation Checklist

#### Components
- [ ] Solution design form
- [ ] Architecture diagram viewer
- [ ] Component hierarchy tree
- [ ] API spec editor
- [ ] Database schema designer
- [ ] File structure generator

#### Features
- [ ] Template selection
- [ ] Design document export
- [ ] Version control integration
- [ ] Collaboration features

---

## ⏭️ FEATURE 6: Execute Module

> **Status**: ⏭️ **PENDING**  
> **Timeline**: Week 3  
> **Priority**: Medium  
> **Dependencies**: Feature 4, 5

### 📝 Description
Module thực thi implementation với OpenCode agents.

### 📋 Implementation Checklist

#### Components
- [ ] Code editor integration
- [ ] File browser
- [ ] Terminal/console view
- [ ] Git operations UI
- [ ] Build/Deploy status

#### Backend
- [ ] OpenCodeService:
  - [ ] spawnOpencodeProcess()
  - [ ] streamProgress()
  - [ ] copyOutputFiles()
- [ ] File upload/download endpoints
- [ ] Process management

---

## ⏭️ FEATURE 7: Review Module

> **Status**: ⏭️ **PENDING**  
> **Timeline**: Week 3-4  
> **Priority**: Medium  
> **Dependencies**: Feature 6

### 📝 Description
Module review code và quality assurance.

### 📋 Implementation Checklist

#### Components
- [ ] Code diff viewer
- [ ] Review comments
- [ ] Quality metrics dashboard
- [ ] Approval workflow
- [ ] Issue tracking

---

## ⏭️ FEATURE 8: Dashboard & Analytics

> **Status**: ⏭️ **PENDING**  
> **Timeline**: Week 4  
> **Priority**: Low  
> **Dependencies**: All previous features

### 📝 Description
Dashboard tổng quan và báo cáo analytics.

### 📋 Implementation Checklist

#### Components
- [ ] Overview dashboard
- [ ] Task statistics
- [ ] Performance metrics
- [ ] Team productivity
- [ ] Project health
- [ ] Reports & exports

---

## 🎯 Development Workflow

Mỗi feature sẽ tuân theo workflow:

```
1. PLAN
   └─ Define scope, requirements, acceptance criteria

2. ANALYZE (Optional - for complex features)
   └─ /analyze-task "Feature requirements analysis"

3. SOLUTION (Optional - for complex features)
   └─ /solution-task "Technical design for feature"

4. EXECUTE
   └─ /execute-task "Implement feature X"
   └─ Code implementation

5. REVIEW
   └─ /review-code "Review feature X implementation"

6. TEST
   └─ Unit tests, integration tests, E2E tests

7. DOCUMENT
   └─ Update documentation, API specs

8. DEPLOY
   └─ Merge to main, deploy to staging/production
```

---

## 📊 Progress Tracker

| Feature | Status | Progress | Priority | Est. Time |
|---------|--------|----------|----------|-----------|
| **1. Authentication** | ✅ Done | 100% | Critical | 3 days |
| **2. Task Queue** | ✅ Done | 100% | High | 3 days |
| **3. WebSocket** | ✅ Done | 100% | High | 2 days |
| **4. Analyze Module** | ⏭️ Pending | 0% | High | 7 days |
| **5. Solution Module** | ⏭️ Pending | 0% | Medium | 5 days |
| **6. Execute Module** | ⏭️ Pending | 0% | Medium | 5 days |
| **7. Review Module** | ⏭️ Pending | 0% | Medium | 4 days |
| **8. Dashboard** | ⏭️ Pending | 0% | Low | 4 days |

---

## 🚀 Next Action

### Next Goal: Feature 4 - Analyze Module (3-Board UI)

Mục tiêu tiếp theo là xây dựng UI 3 cột (Input - Progress - Output) cho Module Analyze, tích hợp với Queue và WebSocket đã hoàn thành.

```bash
/dev "Setup Analyze Module structure với 3-board UI (Input, Progress, Output)" --quick
```

---

## 📚 Related Documents

- [Feature 1 Research](./RESEARCH_LOGIN_FLOW.md)
- [Feature 1 Implementation](./IMPLEMENTATION_REPORT_JIRA_AUTH.md)
- [Feature 2 Detail](./features/02-task-queue.md)
- [Feature 3 Detail](./features/03-websocket.md)

---

**Roadmap Version**: 2.1 (Feature-Based - Updated Foundation)  
**Last Updated**: March 7, 2026  
**Next Review**: After Feature 4 completion
