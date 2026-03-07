# Skill: angular-http

> **Source**: analogjs/angular-skills/angular-http  
> **Version**: 1.0.0  
> **Description**: Angular HTTP Client best practices

---

## Overview

This skill provides guidance for Angular HTTP Client including:
- HTTP service patterns
- Interceptors (JWT, error handling, logging)
- Request/response transformation
- Error handling strategies
- Retry logic and cancellation

---

## Quick Start

### HTTP Service

```typescript
// services/api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = '/api';

  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, { params })
      .pipe(catchError(this.handleError));
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('API Error:', error);
    return throwError(() => error);
  }
}
```

---

## HTTP Interceptors

### JWT Interceptor

```typescript
// interceptors/jwt.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
```

### Error Interceptor

```typescript
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError(error => {
      if (error.status === 401) {
        // Handle unauthorized
      }
      return throwError(() => error);
    })
  );
};
```

---

## Best Practices

1. **Create base API service** for common HTTP operations
2. **Use interceptors** for cross-cutting concerns
3. **Handle errors globally** in interceptor, specifically in service
4. **Use strongly-typed responses** with generics
5. **Unsubscribe** from HTTP observables (use async pipe or takeUntil)

---

## Common Patterns

### With Signals

```typescript
export class UserService {
  private http = inject(HttpClient);
  users = signal<User[]>([]);

  loadUsers() {
    this.http.get<User[]>('/api/users')
      .subscribe(users => this.users.set(users));
  }
}
```

---

*Part of AnalogJS Angular Skills Collection*
