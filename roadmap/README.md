# 🗺️ OpenCode Workflow Platform - Development Roadmap

> **Project**: OpenCode Workflow Management Platform  
> **Location**: `E:\SOURCE\system-architect-opencode`  
> **Tech Stack**: Angular 17+, Node.js/NestJS, WebSocket, Redis  
> **Integration**: OpenCode Agents (ANALYZE, SOLUTION, EXECUTE, REVIEW)  
> **Timeline**: Long-term, iterative development  
> **Team**: Solo Developer

---

## 📋 Executive Summary

Xây dựng **SaaS Platform** giúp developers (FE/BE/QC/BA/PM) thực thi workflow chuẩn **Analyze → Solution → Execute → Review** thông qua giao diện Angular, tích hợp trực tiếp với Jira và OpenCode agents.

**Core Value Proposition**:
- 🎯 **No-code/Low-code** workflow execution cho OpenCode
- ⚡ **Real-time** monitoring và progress tracking
- 🔗 **Seamless Jira** integration
- 📊 **Visual dashboard** cho task management
- 🎨 **Configurable** workflow modules

---

## 🎯 Phases Overview

| Phase | Name | Duration | Focus | Status |
|-------|------|----------|-------|--------|
| **0** | Foundation & Architecture | 1-2 weeks | Setup, architecture, integration design | 📋 Planned |
| **1** | MVP - Analyze Module | 4-5 weeks | Core analyze workflow, 3-board UI, real-time | 📋 Planned |
| **2** | Workflow Expansion | 4-6 weeks | Solution + Execute modules, pipeline | 📋 Planned |
| **3** | Advanced Features | 4-6 weeks | Dashboard, reporting, multi-task, analytics | 📋 Planned |
| **4** | Multi-Role & Scale | 4-6 weeks | All roles (BE/QC/BA/PM), admin panel | 📋 Planned |
| **5** | Polish & Production | Ongoing | Performance, testing, deployment | 📋 Planned |

**Total Estimated Timeline**: 5-6 tháng cho MVP đầy đủ

---

## 🏗️ Architecture Highlights

### Integration Pattern: **Backend-for-Frontend (BFF) với Event-Driven Queue**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           ANGULAR FRONTEND                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Dashboard   │  │  Board 1     │  │  Board 2     │  │  Board 3     │ │
│  │  (Overview)  │  │  (Input)     │  │  (Progress)  │  │  (Output)    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
│                              WebSocket                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         NESTJS BACKEND (BFF)                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Auth        │  │  Task        │  │  Queue       │  │  File        │ │
│  │  Controller  │  │  Controller  │  │  Processor   │  │  Service     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │  Jira        │  │  OpenCode    │  │  WebSocket   │                   │
│  │  Integration │  │  Agent       │  │  Gateway     │                   │
│  │  Service     │  │  Service     │  │  Service     │                   │
│  └──────────────┘  └──────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌──────────┐    ┌──────────┐    ┌──────────┐
            │  Redis   │    │  OpenCode│    │   Jira   │
            │  Queue   │    │  Agents  │    │   API    │
            └──────────┘    └──────────┘    └──────────┘
```

### Key Technical Decisions

1. **Queue System**: BullMQ + Redis cho task processing
2. **Real-time**: Socket.IO cho bidirectional communication
3. **File Handling**: Multer + local filesystem (Phase 1), có thể mở rộng S3 sau
4. **Authentication**: Jira OAuth 2.0
5. **State Management**: RxJS BehaviorSubjects (đủ cho solo dev, có thể thêm NgRx sau nếu cần)
6. **UI Components**: Angular Material + Custom components

---

## 📁 Roadmap Files

- [Phase 0 - Foundation & Architecture](./phase-0-foundation.md)
- [Phase 1 - MVP Analyze Module](./phase-1-mvp-analyze.md)
- [Phase 2 - Workflow Expansion](./phase-2-workflow-expansion.md)
- [Phase 3 - Advanced Features](./phase-3-advanced-features.md)
- [Phase 4 - Multi-Role & Scale](./phase-4-multi-role.md)
- [Architecture & Integration Guide](./architecture-integration.md)
- [Project Setup Guide](./project-setup-guide.md)

---

## 🚀 Quick Start

1. **Đọc Phase 0** để hiểu architecture
2. **Setup project** theo [Project Setup Guide](./project-setup-guide.md)
3. **Bắt đầu Phase 1** - MVP Analyze Module
4. **Sử dụng agents OpenCode** để hỗ trợ development:
   - `/analyze-task` cho requirement analysis
   - `/solution-task` cho technical design
   - `/execute-task` cho implementation
   - `/review-code` cho code review

---

## 📊 Success Metrics

### Phase 1 (MVP)
- [ ] User có thể login qua Jira OAuth
- [ ] User có thể input Jira task và run analyze
- [ ] Real-time progress hiển thị đúng
- [ ] Output files được generate và copy đúng location
- [ ] UI responsive, không lỗi console

### Phase 2-5
- [ ] All 4 workflow modules hoạt động (Analyze/Solution/Execute/Review)
- [ ] Pipeline execution (chạy liên tiếp nhiều tasks)
- [ ] Dashboard Jira đầy đủ features
- [ ] Multi-role support
- [ ] Production deployment

---

## 🔄 Development Workflow với OpenCode

Mỗi phase sẽ sử dụng OpenCode workflow:

```
Requirements (User Story)
    ↓
/analyze-task → Analysis Report
    ↓
/solution-task → Technical Design
    ↓
/execute-task → Implementation
    ↓
/review-code → Quality Check
    ↓
Integration Test
    ↓
Next Phase / Deploy
```

---

*Roadmap Version: 1.0.0*  
*Last Updated: March 2026*  
*Next Review: After Phase 1 completion*
