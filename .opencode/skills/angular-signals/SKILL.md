# Skill: angular-signals

> **Source**: project/angular-skills/angular-signals
> **Version**: 1.0.0
> **Description**: Angular Signals — reactive state management with signal(), computed(), effect(), and input() for Angular 17+

---

## Overview

This skill provides comprehensive guidance for **Angular Signals** — the reactive primitives introduced in Angular 16 and stabilized in Angular 17+. Signals replace many use cases for `BehaviorSubject` and `Observable` for local/component state.

**Covers:**
- `signal()` — writable reactive state
- `computed()` — derived reactive values
- `effect()` — reactive side effects
- `input()` / `output()` — signal-based component APIs (Angular 17.1+)
- `toSignal()` / `toObservable()` — RxJS interop
- Signal-based state service pattern

---

## Core Primitives

### `signal()` — Writable State

```typescript
import { signal } from '@angular/core';

// Create a writable signal
const count = signal(0);

// Read (call it like a function)
console.log(count()); // 0

// Write (set new value)
count.set(5);

// Update (based on current value)
count.update(n => n + 1);

// Mutate (for objects/arrays — use sparingly)
const items = signal<string[]>([]);
items.mutate(arr => arr.push('new item'));
```

### `computed()` — Derived State

```typescript
import { signal, computed } from '@angular/core';

const firstName = signal('John');
const lastName = signal('Doe');

// Computed values are read-only and lazily evaluated
const fullName = computed(() => `${firstName()} ${lastName()}`);

console.log(fullName()); // 'John Doe'
firstName.set('Jane');
console.log(fullName()); // 'Jane Doe' — auto-updated
```

### `effect()` — Reactive Side Effects

```typescript
import { signal, effect, Component, OnInit } from '@angular/core';

@Component({ standalone: true, template: '' })
export class MyComponent implements OnInit {
  count = signal(0);

  ngOnInit(): void {
    // effect() runs immediately and re-runs whenever signals change
    effect(() => {
      console.log('Count changed:', this.count());
      // Auto-tracks any signal read inside the function
    });
  }
}
```

> ⚠️ **Important**: `effect()` must be created in an injection context (constructor, `ngOnInit` with `inject()`, or inside `runInInjectionContext`). Use `DestroyRef` or `takeUntilDestroyed` to clean up.

---

## Signal-Based Component Inputs (Angular 17.1+)

### `input()` — Required and Optional Inputs

```typescript
import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-user-card',
  standalone: true,
  template: `
    <div class="card">
      <h2>{{ displayName() }}</h2>
      <p>{{ user().email }}</p>
    </div>
  `
})
export class UserCardComponent {
  // Required signal input
  user = input.required<{ name: string; email: string }>();

  // Optional signal input with default
  highlight = input(false);

  // Computed from input signal
  displayName = computed(() => this.user().name.toUpperCase());
}
```

**Usage in parent template:**
```html
<!-- Angular 17+ signal input syntax — same as regular property binding -->
<app-user-card [user]="currentUser" [highlight]="true" />
```

### `output()` — Signal-Based Outputs

```typescript
import { Component, output } from '@angular/core';

@Component({
  selector: 'app-counter',
  standalone: true,
  template: `
    <button (click)="increment()">+</button>
    <span>{{ count() }}</span>
    <button (click)="decrement()">-</button>
  `
})
export class CounterComponent {
  count = signal(0);

  // Signal-based output
  countChanged = output<number>();

  increment(): void {
    this.count.update(n => n + 1);
    this.countChanged.emit(this.count());
  }

  decrement(): void {
    this.count.update(n => n - 1);
    this.countChanged.emit(this.count());
  }
}
```

---

## State Service Pattern (Replacing BehaviorSubject)

```typescript
import { Injectable, computed, signal } from '@angular/core';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  // Private writable signal
  private state = signal<AuthState>({
    user: null,
    isLoading: false,
    error: null,
  });

  // Public computed selectors (read-only)
  readonly user = computed(() => this.state().user);
  readonly isAuthenticated = computed(() => this.state().user !== null);
  readonly isLoading = computed(() => this.state().isLoading);
  readonly error = computed(() => this.state().error);

  // State mutations
  setUser(user: User): void {
    this.state.update(s => ({ ...s, user, isLoading: false, error: null }));
  }

  setLoading(isLoading: boolean): void {
    this.state.update(s => ({ ...s, isLoading }));
  }

  setError(error: string): void {
    this.state.update(s => ({ ...s, error, isLoading: false }));
  }

  logout(): void {
    this.state.set({ user: null, isLoading: false, error: null });
  }
}
```

**Using in a component:**
```typescript
@Component({
  standalone: true,
  template: `
    @if (auth.isLoading()) {
      <mat-spinner />
    } @else if (auth.isAuthenticated()) {
      <p>Welcome, {{ auth.user()?.name }}!</p>
    } @else {
      <app-login />
    }
  `
})
export class AppShellComponent {
  auth = inject(AuthStateService);
}
```

---

## RxJS Interop

### `toSignal()` — Observable → Signal

```typescript
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { JiraService } from '../services/jira.service';

@Component({
  standalone: true,
  template: `
    @if (issues()) {
      @for (issue of issues(); track issue.id) {
        <div>{{ issue.summary }}</div>
      }
    }
  `
})
export class IssueListComponent {
  private jiraService = inject(JiraService);

  // Convert Observable to Signal
  // The signal is null initially, then updates when observable emits
  issues = toSignal(this.jiraService.getIssues(), { initialValue: [] });

  // With error handling
  issuesResource = toSignal(
    this.jiraService.getIssues().pipe(
      catchError(err => {
        console.error(err);
        return of([]);
      })
    ),
    { initialValue: [] }
  );
}
```

### `toObservable()` — Signal → Observable

```typescript
import { signal, effect } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';

@Component({ standalone: true, template: '' })
export class SearchComponent {
  searchQuery = signal('');

  // Convert signal to Observable for RxJS operators
  private searchQuery$ = toObservable(this.searchQuery);

  results$ = this.searchQuery$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(query => this.searchService.search(query))
  );
}
```

---

## Signals in Templates (Angular 17+)

```html
<!-- Signals in templates — just call them like functions -->
<div>Count: {{ count() }}</div>

<!-- In @if control flow -->
@if (isAuthenticated()) {
  <app-dashboard />
} @else {
  <app-login />
}

<!-- In @for with signal array -->
@for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
}

<!-- With computed signals -->
<span [class.active]="isActive()">{{ displayText() }}</span>

<!-- Two-way binding with signal (Angular 17.2+) -->
<input [(ngModel)]="searchQuery" />
<!-- or manually: -->
<input [value]="searchQuery()" (input)="searchQuery.set($event.target.value)" />
```

---

## Best Practices

1. **Prefer `signal()` for local component state** — simpler than Subject/Observable
2. **Use `computed()` for derived values** — avoids stale data
3. **Signal inputs over `@Input()`** — enables better OnPush optimization
4. **Use state service pattern** — `signal()` + `computed()` in an injectable service
5. **`toSignal()` for async data** — bridges HTTP observables to template signals
6. **Avoid `effect()` for state sync** — use `computed()` instead; `effect()` is for side effects only
7. **Keep `effect()` in constructor** — or use `inject(DestroyRef)` for cleanup
8. **`OnPush` + signals = best performance** — signals auto-track changes without zone.js

---

## Common Patterns for this Project

### Jira Auth State with Signals
```typescript
// Tracks Jira OAuth state reactively
@Injectable({ providedIn: 'root' })
export class JiraAuthService {
  private accessToken = signal<string | null>(null);
  private cloudId = signal<string | null>(null);

  readonly isAuthenticated = computed(
    () => this.accessToken() !== null && this.cloudId() !== null
  );

  setTokens(token: string, cloud: string): void {
    this.accessToken.set(token);
    this.cloudId.set(cloud);
  }

  clearTokens(): void {
    this.accessToken.set(null);
    this.cloudId.set(null);
  }

  getAccessToken(): string | null {
    return this.accessToken();
  }
}
```

### Role Selection State
```typescript
export type Role = 'FE' | 'BE' | 'QC' | 'BA';

@Injectable({ providedIn: 'root' })
export class RoleStateService {
  readonly selectedRole = signal<Role | null>(null);
  readonly hasRole = computed(() => this.selectedRole() !== null);

  selectRole(role: Role): void {
    this.selectedRole.set(role);
  }

  clearRole(): void {
    this.selectedRole.set(null);
  }
}
```

---

*Angular Signals — Angular 17+ Reactive Primitives*
