---
name: interaction-design
description: Design and implement microinteractions, motion design, transitions, and user feedback patterns using Angular Animations (@angular/animations), Angular Material ripple, and CSS animations. Use when adding polish to Angular UI interactions, implementing loading states, or creating smooth transitions.
---

# Interaction Design — Angular

Create engaging, intuitive Angular interactions through `@angular/animations`, Angular Material motion, and CSS transitions.

## When to Use This Skill

- Adding Angular route transitions and page animations
- Implementing loading skeletons and state transitions
- Using Angular Animations `trigger`, `state`, `transition`, `animate`
- Creating micro-interactions with Angular Material Ripple
- Building notification/snackbar systems with MatSnackBar
- Applying CSS keyframe animations with reduced-motion support
- Implementing expand/collapse with `@angular/animations`

---

## Setup: Enable Angular Animations

```typescript
// main.ts (standalone bootstrap)
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimationsAsync(),   // ✅ Async animations (tree-shakeable)
  ]
});
```

---

## Core Animation Timing Guidelines

| Duration | Use Case |
|----------|----------|
| 100–150ms | Micro-feedback (hover states, ripples) |
| 200–300ms | Small transitions (dropdowns, tooltips) |
| 300–500ms | Medium transitions (modals, sidenav) |
| 500ms+ | Complex choreographed sequences |

---

## Pattern 1: Fade-In Animation

```typescript
import {
  Component,
  ChangeDetectionStrategy,
  signal
} from '@angular/core';
import {
  trigger,
  transition,
  style,
  animate,
  state
} from '@angular/animations';

export const fadeIn = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(8px)' }),
    animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
  ]),
  transition(':leave', [
    animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(-8px)' }))
  ])
]);

@Component({
  selector: 'app-issue-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeIn],
  template: `
    @if (issue()) {
      <div @fadeIn class="p-4 rounded-lg bg-white shadow">
        <h2>{{ issue()!.summary }}</h2>
      </div>
    }
  `
})
export class IssueDetailComponent {
  issue = signal<{ summary: string } | null>(null);
}
```

---

## Pattern 2: Expand/Collapse (Accordion)

```typescript
import { trigger, state, style, transition, animate } from '@angular/animations';

export const expandCollapse = trigger('expandCollapse', [
  state('collapsed', style({ height: '0px', opacity: 0, overflow: 'hidden' })),
  state('expanded', style({ height: '*', opacity: 1, overflow: 'hidden' })),
  transition('collapsed <=> expanded', animate('250ms cubic-bezier(0.4, 0, 0.2, 1)'))
]);

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [expandCollapse],
  template: `
    <div class="border rounded-lg">
      <button
        class="w-full flex justify-between items-center p-4 font-medium"
        (click)="toggle()"
        [attr.aria-expanded]="isOpen()"
        aria-controls="filter-content"
      >
        <span>Filters</span>
        <mat-icon [class.rotate-180]="isOpen()" class="transition-transform duration-200">
          expand_more
        </mat-icon>
      </button>

      <div
        id="filter-content"
        [@expandCollapse]="isOpen() ? 'expanded' : 'collapsed'"
      >
        <div class="p-4 pt-0">
          <ng-content />
        </div>
      </div>
    </div>
  `
})
export class FilterPanelComponent {
  isOpen = signal(false);
  toggle() { this.isOpen.update(v => !v); }
}
```

---

## Pattern 3: Loading States (Skeleton + Spinner)

```typescript
// skeleton.component.ts — preserve layout while loading
import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [class]="'animate-pulse bg-gray-200 rounded ' + cssClass()"
      [style.height]="height()"
      [style.width]="width()"
      aria-hidden="true"
    ></div>
  `
})
export class SkeletonComponent {
  cssClass = input('');
  height   = input('1rem');
  width    = input('100%');
}

// issue-card-skeleton.component.ts
@Component({
  selector: 'app-issue-card-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, SkeletonComponent],
  template: `
    <mat-card role="status" aria-label="Loading issue">
      <mat-card-content class="flex flex-col gap-3 py-4">
        <app-skeleton height="1.25rem" width="30%" />
        <app-skeleton height="1rem" width="80%" />
        <app-skeleton height="1rem" width="60%" />
        <div class="flex gap-2 mt-2">
          <app-skeleton height="1.5rem" width="4rem" cssClass="rounded-full" />
          <app-skeleton height="1.5rem" width="5rem" cssClass="rounded-full" />
        </div>
      </mat-card-content>
    </mat-card>
  `
})
export class IssueCardSkeletonComponent {}
```

```typescript
// Usage — show skeletons while loading
@Component({
  template: `
    @if (isLoading()) {
      @for (i of [1, 2, 3]; track i) {
        <app-issue-card-skeleton />
      }
    } @else {
      @for (issue of issues(); track issue.id) {
        <app-issue-card [issue]="issue" />
      }
    }
  `
})
```

---

## Pattern 4: Route Transition Animation

```typescript
// app.routes.ts — attach animation data to routes
export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component')
      .then(c => c.DashboardComponent),
    data: { animation: 'DashboardPage' }
  },
  {
    path: 'module/:role',
    loadComponent: () => import('./module/module.component')
      .then(c => c.ModuleComponent),
    data: { animation: 'ModulePage' }
  }
];

// router-animations.ts
import { trigger, transition, style, animate, query, group } from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    query(':enter, :leave', [
      style({ position: 'absolute', width: '100%' })
    ], { optional: true }),
    group([
      query(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateX(-20px)' }))
      ], { optional: true }),
      query(':enter', [
        style({ opacity: 0, transform: 'translateX(20px)' }),
        animate('200ms 100ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ], { optional: true })
    ])
  ])
]);

// app.component.ts
@Component({
  selector: 'app-root',
  standalone: true,
  animations: [routeAnimations],
  template: `
    <div
      class="relative overflow-hidden"
      [@routeAnimations]="getRouteAnimationData()"
    >
      <router-outlet />
    </div>
  `
})
export class AppComponent {
  private router = inject(Router);

  getRouteAnimationData() {
    // Read animation data from active route
    return this.router.routerState.snapshot.root
      .firstChild?.data['animation'];
  }
}
```

---

## Pattern 5: Angular Material Snackbar (Toast)

```typescript
import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private snackBar = inject(MatSnackBar);

  private defaults: MatSnackBarConfig = {
    duration: 4000,
    horizontalPosition: 'end',
    verticalPosition: 'top',
  };

  success(message: string): void {
    this.snackBar.open(message, 'Close', {
      ...this.defaults,
      panelClass: ['bg-green-600', 'text-white'],
    });
  }

  error(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      ...this.defaults,
      duration: 6000,
      panelClass: ['bg-red-600', 'text-white'],
    });
  }

  info(message: string): void {
    this.snackBar.open(message, 'Close', {
      ...this.defaults,
      panelClass: ['bg-blue-600', 'text-white'],
    });
  }
}

// Usage in component
@Component({ standalone: true })
export class IssueFormComponent {
  private toast = inject(ToastService);
  private jira = inject(JiraService);

  async submit(): Promise<void> {
    try {
      await firstValueFrom(this.jira.createIssue(this.form.getRawValue()));
      this.toast.success('Issue created successfully!');
    } catch {
      this.toast.error('Failed to create issue. Please try again.');
    }
  }
}
```

---

## Pattern 6: Button Ripple + Hover State

```typescript
// Angular Material buttons have built-in ripple
// For custom elements, use MatRipple directive from CDK

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'app-role-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatRippleModule],
  template: `
    <div
      matRipple
      [matRippleColor]="'rgba(25, 118, 210, 0.1)'"
      class="role-card cursor-pointer rounded-xl p-6 border-2
             transition-all duration-200 ease-out
             hover:-translate-y-1 hover:shadow-lg hover:border-blue-500
             active:translate-y-0 active:shadow-md"
      role="button"
      tabindex="0"
      [attr.aria-label]="'Select ' + role"
    >
      <ng-content />
    </div>
  `,
  styles: [`
    .role-card {
      /* will-change improves transform performance */
      will-change: transform;
    }
  `]
})
export class RoleCardComponent {
  role = input.required<string>();
}
```

---

## CSS Animation Patterns

```scss
// In component styles or global styles.scss

// Skeleton loading pulse
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.animate-pulse {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

// Smooth fade in
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 200ms ease-out;
}

// Spin for loading indicators
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
```

---

## Reduced Motion Support

```scss
// global styles.scss — always respect prefers-reduced-motion
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

```typescript
// Angular Animations — check reduced motion at runtime
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AnimationService {
  private doc = inject(DOCUMENT);

  readonly prefersReducedMotion = signal(
    this.doc.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches ?? false
  );

  getDuration(normal: number): number {
    return this.prefersReducedMotion() ? 0 : normal;
  }
}
```

---

## Easing Reference

```css
/* Material Design 3 standard easings */
--md-sys-motion-easing-standard:          cubic-bezier(0.2, 0, 0, 1);
--md-sys-motion-easing-standard-decelerate: cubic-bezier(0, 0, 0, 1);
--md-sys-motion-easing-standard-accelerate: cubic-bezier(0.3, 0, 1, 1);

/* For Angular Animations */
/* Entering elements (decelerate) */
animate('300ms cubic-bezier(0, 0, 0.2, 1)')

/* Exiting elements (accelerate) */
animate('200ms cubic-bezier(0.4, 0, 1, 1)')

/* Persistent elements (standard) */
animate('200ms cubic-bezier(0.4, 0, 0.2, 1)')
```

---

## Best Practices

1. **`provideAnimationsAsync()`** — tree-shakeable async animations
2. **`trigger()` in `animations: []`** — define in component, not globally
3. **`@angular/animations` over CSS** for state-driven transitions
4. **CSS `transition` for simple hover/focus** — no Angular overhead
5. **`will-change: transform`** — hint GPU for complex animations
6. **`prefers-reduced-motion`** — always provide reduced-motion fallback
7. **Angular Material built-in** — ripple, snackbar, dialog animations are free
8. **Performance**: Only animate `transform` and `opacity` for 60fps
9. **No `width`/`height` animation** — causes layout reflow, use `scale()`
10. **`MatSnackBar`** for all toasts — never custom toast implementations

---

*Interaction Design — Angular 17+ with @angular/animations and Angular Material*
