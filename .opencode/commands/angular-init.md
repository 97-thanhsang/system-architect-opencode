---
description: "Initialize Angular 17+ project with Angular Material, Tailwind CSS v4, Jira OAuth PKCE setup, lazy routing, ESLint, and folder structure"
argument-hint: "[project-name] [--style scss|css] [--routing hash|path] [--tailwind]"
---

# Angular Project Initialization

Initialize a new Angular 17+ workspace configured for the Jira Workspace application with Angular Material, Tailwind CSS, lazy-loaded routing, and Jira OAuth 2.0 (PKCE).

## Usage

```
/angular-init [project-name]
```

If `project-name` is omitted, uses the current directory name.

---

## Step 1: Prerequisites Check

Before generating anything, verify the environment:

```bash
# Check Node.js version (requires 18+)
node --version

# Check Angular CLI version (requires 17+)
ng version

# If Angular CLI not installed or outdated:
npm install -g @angular/cli@latest
```

If `ng version` shows below 17, stop and instruct the user to upgrade Angular CLI first.

---

## Step 2: Create Angular Project

```bash
ng new $PROJECT_NAME \
  --style=scss \
  --routing=true \
  --standalone \
  --ssr=false \
  --skip-tests=false

cd $PROJECT_NAME
```

**Key flags explained:**
- `--standalone`: Uses standalone components (Angular 17+ default, no NgModules)
- `--ssr=false`: No server-side rendering (SPA only for Jira workspace)
- `--routing=true`: Generates `app.routes.ts`

---

## Step 3: Install Angular Material

```bash
ng add @angular/material
```

When prompted, select:
- **Theme**: Custom (we'll configure M3 manually)
- **Typography**: Yes
- **Animations**: Include and enable animations

Then update `src/styles.scss` to use Material Design 3:

```scss
// src/styles.scss
@use '@angular/material' as mat;

// M3 Color scheme — Indigo/Pink (matches design system)
$theme: mat.define-theme((
  color: (
    theme-type: light,
    primary: mat.$indigo-palette,
    tertiary: mat.$pink-palette,
  ),
  density: (
    scale: 0,
  )
));

html {
  @include mat.all-component-themes($theme);
}

// Reset
*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Roboto, 'Helvetica Neue', sans-serif;
  background-color: #fafafa;
}
```

---

## Step 4: Install Tailwind CSS v4

```bash
npm install -D tailwindcss @tailwindcss/vite
```

For Angular with Webpack (default for Angular 17 without Vite):

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

Update `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1976d2',
        accent: '#e91e63',
      },
      fontFamily: {
        sans: ['Roboto', 'Helvetica Neue', 'sans-serif'],
      },
    },
  },
  plugins: [],
  // Prevent conflicts with Angular Material
  corePlugins: {
    preflight: false, // Disable Tailwind reset (Material handles its own)
  },
}
```

Add Tailwind directives to `src/styles.scss` (after Material import):

```scss
// After @use '@angular/material'...
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Step 5: Configure Environments (Jira OAuth)

Create environment files:

**`src/environments/environment.ts`** (development):

```typescript
export const environment = {
  production: false,
  // Jira OAuth 2.0 (PKCE) — get from https://developer.atlassian.com/
  jiraClientId: 'YOUR_JIRA_CLIENT_ID',
  jiraAuthUrl: 'https://auth.atlassian.com/authorize',
  jiraTokenUrl: 'https://auth.atlassian.com/oauth/token',
  jiraApiBaseUrl: 'https://api.atlassian.com',
  jiraRedirectUri: 'http://localhost:4200/auth/callback',
  jiraScopes: 'read:me read:jira-user read:jira-work',
};
```

**`src/environments/environment.prod.ts`** (production):

```typescript
export const environment = {
  production: true,
  jiraClientId: 'YOUR_JIRA_CLIENT_ID', // Same — OAuth client IDs are public
  jiraAuthUrl: 'https://auth.atlassian.com/authorize',
  jiraTokenUrl: 'https://auth.atlassian.com/oauth/token',
  jiraApiBaseUrl: 'https://api.atlassian.com',
  jiraRedirectUri: 'https://YOUR_PRODUCTION_DOMAIN/auth/callback',
  jiraScopes: 'read:me read:jira-user read:jira-work',
};
```

Update `angular.json` to include file replacements for production:

```json
"configurations": {
  "production": {
    "fileReplacements": [
      {
        "replace": "src/environments/environment.ts",
        "with": "src/environments/environment.prod.ts"
      }
    ]
  }
}
```

---

## Step 6: Generate Core Folder Structure

```bash
# Core module (singletons: auth, guards, interceptors)
mkdir -p src/app/core/auth
mkdir -p src/app/core/guards
mkdir -p src/app/core/interceptors
mkdir -p src/app/core/models

# Feature modules
mkdir -p src/app/features/auth
mkdir -p src/app/features/dashboard
mkdir -p src/app/features/role-selector
mkdir -p src/app/features/modules/fe-module

# Shared components
mkdir -p src/app/shared/components
mkdir -p src/app/shared/pipes
mkdir -p src/app/shared/directives
```

---

## Step 7: Set Up Lazy-Loaded Routes

Replace `src/app/app.routes.ts` with:

```typescript
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        m => m.DashboardComponent
      ),
  },
  {
    path: 'role-selector',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/role-selector/role-selector.component').then(
        m => m.RoleSelectorComponent
      ),
  },
  {
    path: 'modules/fe',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/modules/fe-module/fe-module.routes').then(
        m => m.FE_MODULE_ROUTES
      ),
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
```

---

## Step 8: Generate Auth Guard (Functional Guard)

Create `src/app/core/guards/auth.guard.ts`:

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Store the attempted URL for redirecting after login
  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url },
  });
};
```

---

## Step 9: Generate HTTP Interceptor (Auth Token)

Create `src/app/core/interceptors/auth.interceptor.ts`:

```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  // Only attach token for Jira/Atlassian API calls
  const isJiraApi = req.url.includes('atlassian.net') ||
                    req.url.includes('atlassian.com') ||
                    req.url.includes('api.atlassian.com');

  if (token && isJiraApi) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(authReq);
  }

  return next(req);
};
```

Register in `src/app/app.config.ts`:

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
  ],
};
```

---

## Step 10: Configure ESLint + Prettier

```bash
ng add @angular-eslint/schematics

npm install -D prettier eslint-config-prettier eslint-plugin-prettier
```

Create `.prettierrc`:

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

Update `.eslintrc.json` (root level) — add Prettier integration:

```json
{
  "root": true,
  "ignorePatterns": ["projects/**/*"],
  "overrides": [
    {
      "files": ["*.ts"],
      "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@angular-eslint/recommended",
        "plugin:@angular-eslint/template/process-inline-templates",
        "plugin:prettier/recommended"
      ],
      "rules": {
        "@angular-eslint/directive-selector": ["error", { "type": "attribute", "prefix": "app", "style": "camelCase" }],
        "@angular-eslint/component-selector": ["error", { "type": "element", "prefix": "app", "style": "kebab-case" }]
      }
    },
    {
      "files": ["*.html"],
      "extends": ["plugin:@angular-eslint/template/recommended", "plugin:@angular-eslint/template/accessibility"]
    }
  ]
}
```

Add scripts to `package.json`:

```json
"scripts": {
  "lint": "ng lint",
  "lint:fix": "ng lint --fix",
  "format": "prettier --write \"src/**/*.{ts,html,scss}\"",
  "format:check": "prettier --check \"src/**/*.{ts,html,scss}\""
}
```

---

## Step 11: Configure Angular Budgets

Update `angular.json` budgets for performance monitoring:

```json
"budgets": [
  {
    "type": "initial",
    "maximumWarning": "500kb",
    "maximumError": "1mb"
  },
  {
    "type": "anyComponentStyle",
    "maximumWarning": "4kb",
    "maximumError": "8kb"
  }
]
```

---

## Step 12: Verify Setup

Run the following to verify the project is correctly set up:

```bash
# Install dependencies
npm install

# Verify build compiles without errors
ng build

# Run linting
npm run lint

# Start dev server
ng serve

# Open in browser
# http://localhost:4200
```

---

## Completion Summary

After all steps complete, report:

```
✅ Angular 17+ project initialized: $PROJECT_NAME

## Stack
- Angular: 17+ (standalone components, functional guards)
- Angular Material: M3 theme
- Tailwind CSS v4 (utility classes, no preflight reset)
- Jira OAuth 2.0 PKCE (environment configured)
- ESLint + Prettier

## Folder Structure
src/app/
├── core/          # Auth service, guards, interceptors
├── features/      # Lazy-loaded feature pages
│   ├── auth/
│   ├── dashboard/
│   ├── role-selector/
│   └── modules/fe-module/
└── shared/        # Reusable components, pipes, directives

## Next Steps
1. Get Jira OAuth Client ID from https://developer.atlassian.com/
2. Update src/environments/environment.ts with your jiraClientId
3. Implement AuthService (use /generate-service jira-auth)
4. Implement the Login page (use /generate-component login)
5. Run: ng serve
```
