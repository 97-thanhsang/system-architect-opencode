# Skill: angular-ssr

> **Source**: analogjs/angular-skills/angular-ssr  
> **Version**: 1.0.0  
> **Description**: Angular Server-Side Rendering with AnalogJS

---

## Overview

This skill provides guidance for Angular SSR (Server-Side Rendering) including:
- AnalogJS SSR setup
- Server-side rendering configuration
- Hydration and transfer state
- SEO optimization
- Performance improvements

---

## Quick Start

### Install AnalogJS

```bash
npm install @analogjs/platform
```

### Configure vite.config.ts

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import analog from '@analogjs/platform';

export default defineConfig({
  plugins: [
    analog({
      ssr: true,
      prerender: {
        routes: ['/', '/about', '/blog']
      }
    })
  ]
});
```

### Server Entry Point

```typescript
// src/main.server.ts
import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config';

if (process.env['NODE_ENV'] === 'production') {
  enableProdMode();
}

const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;
```

---

## Transfer State

```typescript
// Using TransferState for API data
import { TransferState, makeStateKey } from '@angular/platform-browser';

const USER_KEY = makeStateKey<User>('user');

@Injectable()
export class UserService {
  private transferState = inject(TransferState);
  private http = inject(HttpClient);

  getUser(id: string) {
    // Check if data exists in transfer state
    if (this.transferState.hasKey(USER_KEY)) {
      return of(this.transferState.get(USER_KEY, null));
    }

    // Fetch from API and store in transfer state
    return this.http.get<User>(`/api/users/${id}`).pipe(
      tap(user => {
        this.transferState.set(USER_KEY, user);
      })
    );
  }
}
```

---

## Best Practices

1. **Use TransferState** to avoid duplicate API calls
2. **Implement proper hydration** strategies
3. **Handle platform-specific code** with isPlatformBrowser
4. **Optimize for Core Web Vitals**
5. **Test SSR behavior** in development

---

## Build for Production

```bash
# Build with SSR
npm run build

# Serve SSR application
npm run serve:ssr
```

---

*Part of AnalogJS Angular Skills Collection*
