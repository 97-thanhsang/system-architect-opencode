# Skill: angular-routing

> **Source**: analogjs/angular-skills/angular-routing  
> **Version**: 1.0.0  
> **Description**: Angular Routing best practices and patterns

---

## Overview

This skill provides guidance for Angular Routing including:
- Route configuration and lazy loading
- Route guards (CanActivate, CanDeactivate, Resolve)
- Route parameters and query parameters
- Nested routes and outlet management
- Route animations

---

## Quick Start

### Basic Route Configuration

```typescript
// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component')
      .then(c => c.DashboardComponent)
  },
  {
    path: 'users',
    loadChildren: () => import('./users/users.routes')
      .then(m => m.USERS_ROUTES)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
```

### Route with Parameters

```typescript
{
  path: 'user/:id',
  component: UserDetailComponent,
  resolve: { user: UserResolver }
}

// In component
constructor(private route: ActivatedRoute) {
  this.route.params.subscribe(params => {
    const userId = params['id'];
  });
}
```

---

## Route Guards

### Auth Guard (Functional Approach)

```typescript
// guards/auth.guard.ts
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.parseUrl('/login');
};
```

---

## Best Practices

1. **Use lazy loading** for feature modules
2. **Use functional guards** (Angular 15+)
3. **Preload lazy modules** with PreloadAllModules strategy
4. **Use resolvers** for route data fetching
5. **Handle 404s** with wildcard routes

---

## Common Patterns

### Role-Based Routing

```typescript
{
  path: 'admin',
  canActivate: [authGuard, roleGuard('admin')],
  loadChildren: () => import('./admin/admin.routes')
}
```

### Nested Routes

```typescript
{
  path: 'module/:role',
  component: ModuleLayoutComponent,
  children: [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'settings', component: SettingsComponent }
  ]
}
```

---

*Part of AnalogJS Angular Skills Collection*
