# System Architect OpenCode

## Jira Workspace - Angular Application

A modern web application built with Angular 17+ featuring Jira OAuth authentication, role-based access control, and dynamic layout system.

### ✨ Features

- **Authentication**: Jira OAuth 2.0 integration
- **Role-Based Access**: Support for FE, BE, QC, BA roles
- **Dynamic Layout**: Toggle between sidebar and header menu
- **Responsive Design**: Mobile-friendly interface
- **Modern Stack**: Angular 17, Signals, Standalone Components, Material Design

### 🚀 Quick Start

#### Prerequisites
- Node.js 18+ 
- npm 9+ or pnpm

#### Installation

```bash
# Navigate to project directory
cd E:\SOURCE\system-architect-opencode

# Install dependencies
npm install

# Configure environment variables
# Edit src/environments/environment.ts with your Jira credentials

# Start development server
npm start

# Open browser
http://localhost:4200
```

#### Build for Production

```bash
npm run build
```

### 📁 Project Structure

```
src/
├── app/
│   ├── core/                    # Core services and guards
│   │   ├── auth/               # Authentication service
│   │   ├── guards/             # Route guards
│   │   └── interceptors/       # HTTP interceptors
│   ├── features/               # Feature modules
│   │   ├── auth/              # Login and callback
│   │   ├── dashboard/         # Role selection dashboard
│   │   └── modules/
│   │       └── fe-module/     # Frontend module
│   │           ├── components/
│   │           │   ├── layout/     # Dynamic layout
│   │           │   ├── sidebar/    # Sidebar navigation
│   │           │   └── header/     # Header navigation
│   │           ├── pages/         # Module pages
│   │           └── services/      # Layout service
│   └── shared/                # Shared components
├── assets/                    # Static assets
└── environments/              # Environment configurations
```

### ⚙️ Configuration

#### Jira OAuth Setup

1. Go to [Atlassian Developer Console](https://developer.atlassian.com/)
2. Create a new OAuth 2.0 app
3. Add redirect URI: `http://localhost:4200/auth/callback`
4. Copy Client ID to `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  jiraClientId: 'YOUR_CLIENT_ID_HERE',
  jiraRedirectUri: 'http://localhost:4200/auth/callback',
  jiraScopes: 'read:me read:jira-user'
};
```

### 🎨 Features

#### Authentication Flow
1. User clicks "Sign in with Jira"
2. Redirected to Jira OAuth page
3. After authorization, redirected back to app
4. App stores JWT token and user info
5. User is authenticated and can access dashboard

#### Role Selection
- After login, user sees role selection cards
- Available roles: Frontend, Backend, QC, BA
- User selects a role and is redirected to the module

#### Dynamic Layout
- **Sidebar Mode**: Navigation on the left
- **Header Mode**: Navigation on top
- Toggle button in header to switch modes
- Preferences persisted in localStorage

### 🔧 OpenCode Integration

This project is configured to work with OpenCode AI agents:

```bash
# Available commands
/opencode angular-init          # Initialize Angular project
/opencode generate-component    # Generate new component
/opencode design-ui            # Design UI components
```

#### Skills Used
- `@analogjs/angular-new` - Project scaffolding
- `@analogjs/angular-component` - Component generation
- `@analogjs/angular-signals` - State management
- `@opencode-ai/frontend-design` - UI design

### 📱 Responsive Breakpoints

- **Desktop**: > 1024px - Full layout
- **Tablet**: 768px - 1024px - Adjusted sidebar
- **Mobile**: < 768px - Mobile navigation

### 🛡️ Security

- JWT tokens stored in localStorage
- Route guards protect authenticated routes
- HTTP interceptor adds Authorization header
- XSS protection via Angular's built-in sanitization

### 📝 Development Guidelines

1. **Standalone Components**: All components are standalone
2. **Signals**: Use Angular Signals for state management
3. **Lazy Loading**: Feature modules are lazy loaded
4. **Type Safety**: Strict TypeScript configuration

### 🐛 Troubleshooting

#### Common Issues

**Issue**: `Cannot find module '@angular/...'`
**Solution**: Run `npm install`

**Issue**: Jira login not working
**Solution**: Check your Client ID in environment.ts

**Issue**: Styles not loading
**Solution**: Ensure Angular Material is installed: `ng add @angular/material`

### 📄 License

MIT License - Feel free to use and modify!

### 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

**Built with ❤️ using Angular 17+ and OpenCode**
