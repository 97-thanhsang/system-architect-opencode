# System Architect OpenCode - Project Guide

> **Project**: Jira Workspace  
> **Stack**: Angular 17+ + Angular Material  
> **Location**: E:\SOURCE\system-architect-opencode  
> **Version**: 1.0.0 (Phase 1)

---

## 🎯 Project Overview

Web application với Jira authentication, role-based modules (FE/BE/QC/BA), và dynamic layout system.

### Core Features (Phase 1)
- ✅ Jira OAuth Login
- ✅ Role Selection Dashboard
- ✅ Module FE với Sidebar/Header toggle
- ✅ Menu Configuration
- ✅ Responsive Layout

---

## 📁 Project Structure

```
src/
├── app/
│   ├── core/                          # Core singleton services
│   │   ├── auth/                      # Jira OAuth
│   │   ├── guards/                    # Route guards
│   │   └── interceptors/              # HTTP interceptors
│   ├── features/                      # Feature modules
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── role-selector/
│   │   └── modules/
│   │       └── fe-module/
│   └── shared/                        # Shared components
├── assets/
├── environments/
└── styles/
```

---

## 🛠️ Available Agents

### ANGULAR
**Role**: Frontend Developer  
**Skills**: Angular, TypeScript, Signals, Material Design  
**Commands**:
- `/angular-init` - Khởi tạo project
- `/generate-component [name]` - Tạo component
- `/generate-service [name]` - Tạo service

### DESIGN  
**Role**: UI/UX Designer  
**Skills**: Frontend Design, Solution Design  
**Commands**:
- `/design-ui` - Design UI components
- `/review-design` - Review UI/UX

---

## 📋 Phase 1 Tasks

### Task 1: Project Setup
- [ ] Initialize Angular 17+ project
- [ ] Install Angular Material
- [ ] Setup routing with lazy loading
- [ ] Configure Tailwind CSS

### Task 2: Authentication
- [ ] Jira OAuth integration
- [ ] Auth Guard implementation
- [ ] JWT Interceptor
- [ ] Login page

### Task 3: Dashboard & Role Selection
- [ ] Dashboard layout
- [ ] Role cards (FE/BE/QC/BA)
- [ ] Role selection logic
- [ ] Navigation to modules

### Task 4: Module FE
- [ ] Dynamic layout (sidebar/header toggle)
- [ ] Sidebar component
- [ ] Header component
- [ ] Menu configuration system
- [ ] Main content area

---

## 🚀 Quick Start

```bash
# Navigate to project
cd E:\SOURCE\system-architect-opencode

# Install dependencies
npm install

# Run development server
ng serve

# Open browser
http://localhost:4200
```

---

## 🔧 Configuration

### Jira OAuth Setup
1. Go to https://developer.atlassian.com/
2. Create OAuth 2.0 app
3. Add redirect URI: `http://localhost:4200/auth/callback`
4. Copy Client ID/Secret to `src/environments/environment.ts`

### Environment Variables
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  jiraClientId: 'YOUR_JIRA_CLIENT_ID',
  jiraRedirectUri: 'http://localhost:4200/auth/callback',
  jiraScopes: 'read:me read:jira-user'
};
```

---

## 📝 Available Skills

- `angular-di` - Angular Dependency Injection patterns
- `angular-directives` - Angular Directives and custom directives
- `angular-forms` - Angular Forms best practices
- `angular-http` - Angular HTTP Client best practices
- `angular-routing` - Angular Routing patterns
- `angular-signals` - Angular Signals (signal, computed, effect, input/output, toSignal)
- `angular-testing` - Angular Testing (Unit & Integration)
- `angular-tooling` - Angular Development Tools
- `tailwind-design-system` - Tailwind CSS v4 Design System

---

## 🎨 Design System

### Colors
- **Primary**: #1976d2 (Material Indigo)
- **Accent**: #e91e63 (Material Pink)
- **Background**: #fafafa (Light gray)
- **Surface**: #ffffff (White)

### Typography
- **Font**: Roboto
- **Headings**: 24px, 20px, 18px
- **Body**: 14px, 16px

### Spacing
- **Small**: 8px
- **Medium**: 16px
- **Large**: 24px
- **XLarge**: 32px

---

## 🔐 Security Notes

- Store JWT tokens in `HttpOnly` cookies (production)
- Use Angular's built-in XSS protection
- Validate all user inputs
- Implement CSRF protection

---

## 📚 References

- [Angular Documentation](https://angular.io/docs)
- [Angular Material](https://material.angular.io/)
- [Jira REST API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- [OpenCode Documentation](https://opencode.ai/docs)
