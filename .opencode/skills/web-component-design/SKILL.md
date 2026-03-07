---
name: web-component-design
description: Master Angular 17+ standalone component patterns including signal inputs/outputs, OnPush change detection, composition with content projection, and Angular Material integration. Use when building reusable components, designing component APIs, or implementing feature modules.
---

# Angular Component Design

Build reusable, performant Angular 17+ components using standalone architecture, signals, OnPush change detection, and Angular Material.

## When to Use This Skill

- Designing reusable standalone components with clean APIs
- Implementing signal-based inputs/outputs (Angular 17.1+)
- Building presentational vs smart component patterns
- Using content projection (`ng-content`) for flexible composition
- Creating accessible Angular Material component wrappers
- Applying `ChangeDetectionStrategy.OnPush` for performance
- Refactoring NgModule-based components to standalone

---

## Core Pattern: Smart vs Presentational Components

```
Smart (Container) Component          Presentational Component
─────────────────────────────        ──────────────────────────
- Injects services                   - Only input() / output()
- Handles business logic             - Renders UI based on data
- Manages state (signals)            - No service injection
- Delegates to presentational        - ChangeDetectionStrategy.OnPush
```

---

## Pattern 1: Presentational Component with Signal Inputs

```typescript
// issue-card.component.ts — purely presentational
import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

export interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'Done';
  assignee: string | null;
}

@Component({
  selector: 'app-issue-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,    // ✅ Always OnPush for presentational
  imports: [MatCardModule, MatButtonModule, MatChipsModule, MatIconModule],
  template: `
    <mat-card [class]="cardClass()">
      <mat-card-header>
        <mat-card-title>
          <span class="text-sm text-gray-500 mr-2">{{ issue().key }}</span>
          {{ issue().summary }}
        </mat-card-title>
      </mat-card-header>

      <mat-card-content class="flex gap-2 mt-3">
        <mat-chip [highlighted]="issue().priority === 'High'">
          {{ issue().priority }}
        </mat-chip>
        <mat-chip>{{ issue().status }}</mat-chip>
      </mat-card-content>

      <mat-card-actions>
        <button mat-button color="primary" (click)="view.emit(issue())">
          View
        </button>
        @if (canEdit()) {
          <button mat-button (click)="edit.emit(issue())">Edit</button>
        }
      </mat-card-actions>
    </mat-card>
  `
})
export class IssueCardComponent {
  // ✅ Signal inputs (Angular 17.1+) — type-safe, no @Input decorator
  issue   = input.required<JiraIssue>();
  canEdit = input(false);           // Optional with default

  // ✅ Signal outputs — no @Output / EventEmitter decorator
  view = output<JiraIssue>();
  edit = output<JiraIssue>();

  // ✅ Computed from signal input
  cardClass = computed(() =>
    this.issue().priority === 'High'
      ? 'border-l-4 border-red-500'
      : 'border-l-4 border-gray-200'
  );
}
```

---

## Pattern 2: Smart Component

```typescript
// issue-list.component.ts — smart container
import { Component, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IssueCardComponent, JiraIssue } from './issue-card.component';
import { JiraService } from '../services/jira.service';
import { AuthStateService } from '../services/auth-state.service';

@Component({
  selector: 'app-issue-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IssueCardComponent, MatProgressSpinnerModule],
  template: `
    @if (isLoading()) {
      <div class="flex justify-center p-8">
        <mat-spinner diameter="40" />
      </div>
    } @else if (error()) {
      <p class="text-red-600 p-4">{{ error() }}</p>
    } @else {
      <div class="grid gap-4">
        @for (issue of issues(); track issue.id) {
          <app-issue-card
            [issue]="issue"
            [canEdit]="canEdit()"
            (view)="onView($event)"
            (edit)="onEdit($event)"
          />
        }
        @empty {
          <p class="text-gray-500 text-center p-8">No issues found.</p>
        }
      </div>
    }
  `
})
export class IssueListComponent {
  private jira = inject(JiraService);
  private auth = inject(AuthStateService);

  // State signals
  isLoading = signal(false);
  error = signal<string | null>(null);
  issues = signal<JiraIssue[]>([]);

  // Derived from auth state
  canEdit = computed(() => this.auth.role() === 'FE' || this.auth.role() === 'BE');

  onView(issue: JiraIssue): void {
    // navigate or open dialog
  }

  onEdit(issue: JiraIssue): void {
    // open edit dialog
  }
}
```

---

## Pattern 3: Content Projection

```typescript
// card-layout.component.ts — flexible layout via ng-content
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-card-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatDividerModule],
  template: `
    <mat-card class="h-full flex flex-col">
      <!-- Named slot: header -->
      <mat-card-header>
        <ng-content select="[card-header]" />
      </mat-card-header>

      <mat-divider />

      <!-- Default slot: main content -->
      <mat-card-content class="flex-1 overflow-auto p-4">
        <ng-content />
      </mat-card-content>

      <!-- Named slot: footer actions -->
      @if (hasFooter()) {
        <mat-divider />
        <mat-card-actions align="end">
          <ng-content select="[card-footer]" />
        </mat-card-actions>
      }
    </mat-card>
  `
})
export class CardLayoutComponent {
  hasFooter = input(true);
}
```

```html
<!-- Usage -->
<app-card-layout>
  <h2 card-header>Issue Details</h2>

  <app-issue-detail [issue]="selectedIssue()" />

  <div card-footer>
    <button mat-button (click)="close()">Cancel</button>
    <button mat-raised-button color="primary" (click)="save()">Save</button>
  </div>
</app-card-layout>
```

---

## Pattern 4: Component with Two-Way Binding (Model Signal)

```typescript
// search-bar.component.ts
import {
  Component,
  ChangeDetectionStrategy,
  model,          // Angular 17.2+ two-way binding
  output,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule],
  template: `
    <mat-form-field appearance="outline" class="w-full">
      <mat-label>Search issues</mat-label>
      <mat-icon matPrefix>search</mat-icon>
      <input
        matInput
        type="search"
        [ngModel]="query()"
        (ngModelChange)="onInput($event)"
        [placeholder]="placeholder()"
        aria-label="Search issues"
      />
      @if (query()) {
        <button matSuffix mat-icon-button aria-label="Clear search" (click)="clear()">
          <mat-icon>close</mat-icon>
        </button>
      }
    </mat-form-field>
  `
})
export class SearchBarComponent {
  // model() = two-way binding signal (Angular 17.2+)
  query       = model('');
  placeholder = input('Search...');
  search      = output<string>();    // Debounced search event

  private input$ = new Subject<string>();

  constructor() {
    this.input$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed()
    ).subscribe(q => this.search.emit(q));
  }

  onInput(value: string): void {
    this.query.set(value);          // Update two-way bound value
    this.input$.next(value);        // Trigger debounced search
  }

  clear(): void {
    this.query.set('');
    this.search.emit('');
  }
}

// Parent usage:
// <app-search-bar [(query)]="searchQuery" (search)="loadIssues($event)" />
```

---

## Pattern 5: Reusable Dialog Service Pattern

```typescript
// confirmation-dialog.service.ts — wraps MatDialog for reuse
import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';

@Injectable({ providedIn: 'root' })
export class ConfirmationDialogService {
  private dialog = inject(MatDialog);

  confirm(data: ConfirmDialogData): Observable<boolean> {
    return this.dialog.open(ConfirmDialogComponent, {
      data,
      width: '400px',
      restoreFocus: true,
      disableClose: true,
    }).afterClosed();
  }

  delete(itemName: string): Observable<boolean> {
    return this.confirm({
      title: `Delete ${itemName}?`,
      message: 'This action cannot be undone.',
      confirmLabel: 'Delete',
      confirmColor: 'warn',
    });
  }
}
```

---

## Component API Design Principles

```typescript
// ✅ Good component API
@Component({ selector: 'app-user-avatar', standalone: true, ... })
export class UserAvatarComponent {
  user    = input.required<{ name: string; avatarUrl?: string }>();  // Required
  size    = input<'sm' | 'md' | 'lg'>('md');                         // Optional with default
  showName = input(false);                                            // Boolean flag
  click   = output<void>();                                           // Event
}

// ❌ Avoid prop explosion — use an object instead
export class BadComponent {
  firstName = input.required<string>();
  lastName = input.required<string>();
  avatarUrl = input<string>();
  size = input<string>();
  showFirstName = input<boolean>();
  showLastName = input<boolean>();
  // ... 10 more inputs
}
```

---

## Change Detection Strategy

```typescript
// ✅ ALWAYS use OnPush for standalone components
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  // OnPush re-renders only when:
  // 1. A signal() value changes
  // 2. An input() reference changes
  // 3. An async pipe emits a new value
  // 4. markForCheck() is called manually
})

// With signals — OnPush + signals = best performance
export class OptimalComponent {
  count = signal(0);      // ✅ Changing signal triggers CD automatically
  items = input<Item[]>(); // ✅ New array reference triggers CD
}
```

---

## Best Practices

1. **Always `ChangeDetectionStrategy.OnPush`** — on every component
2. **`input()` / `output()` over `@Input()` / `@Output()`** — Angular 17.1+
3. **`input.required<T>()`** — for non-optional props (compile-time check)
4. **`computed()`** for derived values** — never recompute in templates
5. **Smart/Presentational split** — smart components inject services, presentational don't
6. **`ng-content` with selectors** — for flexible composition
7. **`model()`** for two-way binding — Angular 17.2+
8. **Keep templates declarative** — no logic, only interpolation and directives
9. **`@empty` block** — always handle empty state in `@for`
10. **Single responsibility** — one component, one purpose

---

*Angular Component Design — Angular 17+ Standalone, Signals, OnPush*
