# System Architect OpenCode — Agent Guide

> **Stack**: Angular 17 · TypeScript 5.2 · Taiga UI v3 · Angular Material v17 · Tailwind CSS v3 · RxJS 7.8  
> **Test runner**: Karma + Jasmine  
> **Location**: `E:\SOURCE\system-architect-opencode`

---

## 🔧 Commands

```bash
# Dev server  →  http://localhost:4200
npm start            # ng serve

# Production build  →  dist/system-architect-opencode/
npm run build        # ng build

# Watch build (development config)
npm run watch        # ng build --watch --configuration development

# Run ALL tests (headless Chrome)
npm test             # ng test

# Run a SINGLE spec file
ng test --include="src/app/core/auth/auth.service.spec.ts"

# Run tests matching a description string
ng test --grep="AuthService"

# Lint
npm run lint         # ng lint
```

---

## 📁 Project Structure

```
src/app/
├── core/
│   ├── auth/           # AuthService, JiraAuthService (Signals-based)
│   ├── guards/         # authGuard, roleGuard  (functional CanActivateFn)
│   ├── interceptors/   # jwtInterceptor, errorInterceptor (functional)
│   └── services/       # ApiService — generic HTTP wrapper
├── features/
│   ├── auth/           # Login (Taiga UI), auth-callback
│   ├── dashboard/      # Dashboard + spec
│   └── modules/
│       └── fe-module/  # Shell layout, sidebar, header, pages, LayoutService
└── shared/
    └── directives/     # PermissionDirective
```

---

## ✅ Angular 17 Patterns (REQUIRED)

### Standalone components — always `standalone: true`
```typescript
@Component({ selector: 'app-foo', standalone: true, imports: [...], template: `...` })
export class FooComponent { ... }
```

### Dependency injection — use `inject()`, not constructor params
```typescript
private authService = inject(AuthService);  // ✅
constructor(private authService: AuthService) {}  // ❌ avoid
```

### Signals for state management
```typescript
private readonly _count = signal<number>(0);
readonly count = this._count.asReadonly();          // expose read-only public API
// mutate: this._count.set(1)  /  this._count.update(n => n + 1)
```

### New control flow — `@if / @for / @switch` (NOT `*ngIf / *ngFor`)
```html
@if (isLoading()) { <app-spinner /> }
@for (item of items(); track item.id) { <li>{{ item.label }}</li> }
```

### Functional guards & interceptors
```typescript
export const authGuard: CanActivateFn = (route, state) => { ... };
export const jwtInterceptor: HttpInterceptorFn = (req, next) => { ... };
```

### Lazy routing
```typescript
loadComponent: () => import('./foo/foo.component').then(c => c.FooComponent)
loadChildren:  () => import('./foo/foo.routes').then(m => m.FOO_ROUTES)
```

---

## 🎨 Code Style

### TypeScript
- **Strict mode** (`tsconfig.json`) — no implicit `any`, no missing returns, no fallthrough.
- Private signal fields prefixed with `_`: `_user`, `_isAuthenticated`, `_menuPosition`.
- Use `type` for union primitives: `type MenuPosition = 'sidebar' | 'header'`.
- Use `interface` for object shapes: `interface User { id: string; email: string; }`.
- JSDoc (`/** */`) on every public method.
- Async one-shot Observables: `await firstValueFrom(obs$)`; use `pipe()` for streams.
- Error handling: `catchError` in RxJS pipe or `try/catch` with `finally` for async blocks.

### Import order (enforce in every file)
```typescript
// 1. Angular core & platform
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
// 2. Third-party  (Taiga UI, Material, RxJS, jwt-decode…)
import { TuiRootModule } from '@taiga-ui/core';
import { Observable, catchError } from 'rxjs';
// 3. Project-internal (relative paths, shallow → deep)
import { AuthService } from '../../core/auth/auth.service';
```

### Naming conventions
| Artefact | Pattern | Example |
|---|---|---|
| Component class | PascalCase + `Component` | `LoginTaigaComponent` |
| Service class | PascalCase + `Service` | `LayoutService` |
| Guard (fn export) | camelCase + `Guard` | `authGuard` |
| Interceptor (fn export) | camelCase + `Interceptor` | `jwtInterceptor` |
| Routes const | SCREAMING_SNAKE | `FE_MODULE_ROUTES` |
| Files | kebab-case | `login-taiga.component.ts` |
| CSS classes | BEM or `g-` prefix | `.g-card__header`, `.shell__main--collapsed` |

### Templates & styles
- Inline templates (`template: \`...\``) and inline SCSS (`styles: [\`...\`]`) are standard.
- Component selector prefix: **`app-`** (set in `angular.json`).
- Scoped component CSS uses BEM: `.shell`, `.shell__main`, `.shell__main--collapsed`.
- Global design tokens in `src/styles.scss` as CSS custom properties:
  - Colors: `--g-blue`, `--g-red`, `--g-text-primary`, …
  - Shadows: `--g-shadow-1` … `--g-shadow-card`
  - Spacing (8 px grid): `--g-space-1` (4 px) … `--g-space-12` (48 px)
  - Layout: `--sidebar-width: 256px`, `--header-height: 64px`
- Use global utility classes (`.g-card`, `.g-btn`, `.g-chip`, `.g-page`, `.g-grid--{2,3,4}`) before writing new CSS.
- Responsive breakpoints: **1024 px** (tablet) · **768 px** (mobile) · **640 px** (small).

---

## 🧪 Testing Patterns

```typescript
describe('FooService', () => {
  let service: FooService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [FooService]
    });
    service = TestBed.inject(FooService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();   // always reset storage
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => expect(service).toBeTruthy());
});
```

- Spec files: `*.spec.ts` co-located beside the source file.
- Use `TestBed.inject()` — never `new Service()`.
- Access private methods for testing via `service['privateMethod']()`.
- Signals are called as functions: `expect(service.isAuthenticated()).toBe(false)`.

---

## 🔐 Auth & API

- State: `JiraAuthService` (primary, Signals) + `AuthService` (legacy wrapper).
- JWT stored in `localStorage['auth_token']`; injected by `jwtInterceptor`.
- HTTP errors → `errorInterceptor` → `MatSnackBar` toast notification.
- `ApiService.get<T>() / .post<T>()` unwrap `ApiResponse<T>.data` automatically.
- Environment config: `src/environments/environment.ts` — **never commit real credentials**.
- Roles are uppercase strings: `'FE' | 'BE' | 'QC' | 'BA'`.

---

## ⚠️ Constraints

- **No NgModules** — standalone only; register providers in `app.config.ts`.
- **No `*ngIf` / `*ngFor`** — use `@if` / `@for` control flow.
- **No `any`** — use generics or explicit union types.
- Prefer **Taiga UI** for forms, modals, and inputs; use **Angular Material** for icons and snackbars.
- Do not hard-code colors — reference `--g-*` CSS custom properties.
- Keep components small; extract business logic into injectable services.
