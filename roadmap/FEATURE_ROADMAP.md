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

#### Integration
- [x] Kết nối với Jira Server (task.ascvn.com.vn)
- [x] JWT token generation & storage
- [x] Auto-redirect sau login
- [x] Logout functionality

### 📁 Files Created
```
apps/api/src/
├── auth/
│   ├── auth.service.ts          ✅ loginWithJira()
│   ├── auth.controller.ts       ✅ /auth/jira/login endpoint
│   ├── auth.module.ts           ✅ JWT config
│   ├── strategies/
│   │   └── jwt.strategy.ts      ✅ JWT validation
│   ├── dto/
│   │   ├── login.dto.ts
│   │   └── register.dto.ts
│   └── entities/
│       └── user.entity.ts       ✅ Updated with Jira fields
└── jira/
    ├── jira-client.service.ts   ✅ Jira API client
    └── jira.module.ts

src/app/core/
├── auth/
│   ├── jira-auth.service.ts         ✅ Updated - gọi backend + user restore
│   ├── auth.service.ts              ✅ Legacy support
│   ├── token-storage.service.ts     ✅ NEW: Token management với Signals
│   └── token-storage.service.spec.ts ✅ NEW: Unit tests (588 lines)
├── interceptors/
│   ├── jwt.interceptor.ts           ✅ Auto-add token
│   ├── token-refresh.interceptor.ts ✅ NEW: Auto-refresh + request queuing
│   ├── error.interceptor.ts
│   └── logging.interceptor.ts
└── guards/
    ├── auth.guard.ts                ✅ Route protection (dual check)
    └── role.guard.ts

src/app/features/modules/fe-module/components/
├── header/header.component.ts       ✅ Logout button in user dropdown
└── sidebar/sidebar.component.ts     ✅ Logout button in user section

src/app/features/auth/
└── components/
    └── login-taiga/
        └── login-taiga.component.ts  ✅ Modern login UI
```

### 🧪 Testing
- [x] Manual testing: Login with Jira credentials
- [x] JWT token validation
- [x] API endpoint testing
- [x] **Session persistence testing** - Giữ đăng nhập sau refresh
- [x] **Logout functionality testing** - Nút đăng xuất hoạt động đúng
- [x] **Token auto-refresh testing** - Tự động refresh trước khi hết hạn
- [x] **Unit tests**: TokenStorageService (588 lines)
- [x] **Unit tests**: JiraAuthService (user restoration)
- [ ] E2E tests (pending)

### 📊 Metrics
- **Time**: ~3-4 days (2-3 days core + 1 day session persistence enhancement)
- **Files**: 15+ files (12 core + 3 new)
- **Dependencies**: 5+ packages
- **API Endpoints**: 4 endpoints
- **Test Coverage**: ~65% (588 lines unit tests)
- **Lines of Code**: ~2,500 (new services + tests)

### 📚 Documentation
- [Research Report](./RESEARCH_LOGIN_FLOW.md)
- [Implementation Report](./IMPLEMENTATION_REPORT_JIRA_AUTH.md)

---

## ⏭️ FEATURE 2: Task Queue & Processing System

> **Status**: ⏭️ **PENDING**  
> **Timeline**: Week 1 Day 3-4  
> **Priority**: High  
> **Dependencies**: Feature 1 (Authentication)

### 📝 Description
Hệ thống queue xử lý các tasks bất đồng bộ với BullMQ và Redis.

### 📋 Implementation Checklist

#### Backend
- [ ] Redis setup (Docker)
- [ ] BullMQ configuration
- [ ] QueueModule setup
- [ ] TasksProcessor:
  - [ ] handleAnalyze() - Xử lý analyze jobs
  - [ ] handleSolution() - Xử lý solution jobs
  - [ ] handleExecute() - Xử lý execute jobs
  - [ ] handleReview() - Xử lý review jobs
- [ ] QueueService - Quản lý queue operations
- [ ] QueueController endpoints:
  - [ ] `GET /api/queue/status` - Queue status
  - [ ] `POST /api/queue/jobs` - Add job
  - [ ] `GET /api/queue/jobs/:id` - Job status
  - [ ] `POST /api/queue/pause` - Pause queue
  - [ ] `POST /api/queue/resume` - Resume queue

#### Frontend
- [ ] QueueStatusService
- [ ] Queue monitor UI components
- [ ] Job progress tracking
- [ ] Real-time updates via WebSocket

### 📁 Expected Files
```
apps/api/src/
├── queue/
│   ├── queue.module.ts
│   ├── queue.service.ts
│   ├── queue.controller.ts
│   └── tasks.processor.ts
```

### ⏱️ Estimation
- **Time**: 2-3 days
- **Complexity**: Medium
- **Dependencies**: Redis, BullMQ

---

## ⏭️ FEATURE 3: Real-time Communication (WebSocket)

> **Status**: ⏭️ **PENDING**  
> **Timeline**: Week 1 Day 3-4 (song song với Feature 2)  
> **Priority**: High  
> **Dependencies**: Feature 1 (Authentication)

### 📝 Description
Hệ thống real-time communication để cập nhật tiến độ tasks.

### 📋 Implementation Checklist

#### Backend
- [ ] WebSocketGateway setup (@nestjs/websockets)
- [ ] Socket.io integration
- [ ] Authentication cho WebSocket connections
- [ ] Events:
  - [ ] `task-progress` - Cập nhật % hoàn thành
  - [ ] `task-status` - Thay đổi status (running, completed, failed)
  - [ ] `task-log` - Stream log messages
  - [ ] `queue-status` - Queue statistics
- [ ] Rooms:
  - [ ] Room per task (`task-${taskId}`)
  - [ ] Queue status room (`queue-status`)

#### Frontend
- [ ] WebSocketService
- [ ] Real-time progress bars
- [ ] Log stream viewer
- [ ] Connection status indicator
- [ ] Auto-reconnect logic

### 📁 Expected Files
```
apps/api/src/
└── websocket/
    ├── websocket.module.ts
    └── tasks.gateway.ts

src/app/core/
└── services/
    └── websocket.service.ts
```

### ⏱️ Estimation
- **Time**: 1-2 days
- **Complexity**: Medium
- **Dependencies**: Socket.io, WebSocket

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

### 📁 Expected Files
```
src/app/features/modules/fe-module/
└── analyze/
    ├── analyze.routes.ts
    ├── analyze.component.ts
    ├── services/
    │   └── analyze.service.ts
    └── components/
        ├── board1-input/
        │   ├── path-selector/
        │   ├── task-input/
        │   └── task-list/
        ├── board2-progress/
        │   ├── progress-monitor/
        │   └── log-stream/
        └── board3-output/
            ├── output-tabs/
            └── markdown-viewer/
```

### ⏱️ Estimation
- **Time**: 5-7 days
- **Complexity**: High
- **Components**: 10+ components

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
| **2. Task Queue** | ⏭️ Pending | 0% | High | 3 days |
| **3. WebSocket** | ⏭️ Pending | 0% | High | 2 days |
| **4. Analyze Module** | ⏭️ Pending | 0% | High | 7 days |
| **5. Solution Module** | ⏭️ Pending | 0% | Medium | 5 days |
| **6. Execute Module** | ⏭️ Pending | 0% | Medium | 5 days |
| **7. Review Module** | ⏭️ Pending | 0% | Medium | 4 days |
| **8. Dashboard** | ⏭️ Pending | 0% | Low | 4 days |

---

## 🚀 Next Action

### Immediate Priority: Feature 2 + 3 (Song song)

```bash
/dev "Implement Task Queue system với BullMQ và Redis cho xử lý background jobs" --quick
```

Hoặc

```bash
/dev "Implement WebSocket Gateway cho real-time task progress updates" --quick
```

---

## 📚 Related Documents

- [Feature 1 Research](./RESEARCH_LOGIN_FLOW.md)
- [Feature 1 Implementation](./IMPLEMENTATION_REPORT_JIRA_AUTH.md)
- [Legacy Phase Plan](./phase2-action-plan.md)

---

**Roadmap Version**: 2.0 (Feature-Based)  
**Last Updated**: March 7, 2026  
**Next Review**: After Feature 2 & 3 completion
