# Skill: angular-di

> **Source**: analogjs/angular-skills/angular-di  
> **Version**: 1.0.0  
> **Description**: Angular Dependency Injection patterns

---

## Overview

This skill provides guidance for Angular Dependency Injection including:
- inject() function patterns
- Service providers and tokens
- Factory providers
- Multi-providers
- Injection hierarchy

---

## Quick Start

### Using inject() (Angular 14+)

```typescript
// Modern approach with inject()
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  getUsers() {
    return this.http.get(`${this.apiUrl}/users`);
  }
}
```

### Injection Token

```typescript
// tokens.ts
import { InjectionToken } from '@angular/core';

export const API_URL = new InjectionToken<string>('api.url', {
  factory: () => 'http://localhost:3000/api'
});
```

---

## Provider Patterns

### Factory Provider

```typescript
{
  provide: LoggerService,
  useFactory: (config: ConfigService) => {
    return config.isProduction 
      ? new ProductionLogger() 
      : new DevelopmentLogger();
  },
  deps: [ConfigService]
}
```

### Multi-Provider

```typescript
// Adding multiple interceptors
{
  provide: HTTP_INTERCEPTORS,
  useClass: AuthInterceptor,
  multi: true
}
```

---

## Best Practices

1. **Use inject()** instead of constructor injection (cleaner code)
2. **Use providedIn: 'root'** for singleton services
3. **Use InjectionToken** for configuration values
4. **Use factory providers** for conditional instantiation
5. **Avoid circular dependencies**

---

*Part of AnalogJS Angular Skills Collection*
