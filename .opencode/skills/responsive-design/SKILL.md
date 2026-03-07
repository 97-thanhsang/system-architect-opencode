---
name: responsive-design
description: Implement modern responsive layouts for Angular 17+ using container queries, fluid typography, CSS Grid, Tailwind v4, and mobile-first breakpoint strategies. Use when building adaptive Angular interfaces, implementing fluid layouts, or creating component-level responsive behavior.
---

# Responsive Design — Angular

Master modern responsive design techniques for Angular 17+ apps using Tailwind v4, container queries, and Angular Material responsive utilities.

## When to Use This Skill

- Implementing mobile-first responsive layouts in Angular
- Using container queries for Angular component responsiveness
- Creating fluid typography and spacing scales with Tailwind v4
- Building complex layouts with CSS Grid and Flexbox
- Designing breakpoint strategies for Angular Material components
- Implementing responsive Angular Material sidenav and toolbar
- Creating responsive data tables and lists in Angular

## Core Capabilities

### 1. Container Queries

- Component-level responsiveness independent of viewport
- Container query units (cqi, cqw, cqh)
- Style queries for conditional styling
- Fallbacks for browser support

### 2. Fluid Typography & Spacing

- CSS clamp() for fluid scaling
- Viewport-relative units (vw, vh, dvh)
- Fluid type scales with min/max bounds
- Responsive spacing systems

### 3. Layout Patterns

- CSS Grid for 2D layouts
- Flexbox for 1D distribution
- Intrinsic layouts (content-based sizing)
- Subgrid for nested grid alignment

### 4. Breakpoint Strategy

- Mobile-first media queries
- Content-based breakpoints
- Design token integration
- Feature queries (@supports)

## Quick Reference

### Modern Breakpoint Scale

```css
/* Mobile-first breakpoints */
/* Base: Mobile (< 640px) */
@media (min-width: 640px) {
  /* sm: Landscape phones, small tablets */
}
@media (min-width: 768px) {
  /* md: Tablets */
}
@media (min-width: 1024px) {
  /* lg: Laptops, small desktops */
}
@media (min-width: 1280px) {
  /* xl: Desktops */
}
@media (min-width: 1536px) {
  /* 2xl: Large desktops */
}

/* Tailwind CSS equivalent */
/* sm:  @media (min-width: 640px) */
/* md:  @media (min-width: 768px) */
/* lg:  @media (min-width: 1024px) */
/* xl:  @media (min-width: 1280px) */
/* 2xl: @media (min-width: 1536px) */
```

## Key Patterns

### Pattern 1: Container Queries

```css
/* Define a containment context */
.card-container {
  container-type: inline-size;
  container-name: card;
}

/* Query the container, not the viewport */
@container card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 1rem;
  }

  .card-image {
    aspect-ratio: 1;
  }
}

@container card (min-width: 600px) {
  .card {
    grid-template-columns: 250px 1fr;
  }

  .card-title {
    font-size: 1.5rem;
  }
}

/* Container query units */
.card-title {
  /* 5% of container width, clamped between 1rem and 2rem */
  font-size: clamp(1rem, 5cqi, 2rem);
}
```

```typescript
// Angular component with container queries using @HostBinding
@Component({
  selector: 'app-responsive-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- @container applied via Tailwind class -->
    <div class="@container">
      <article class="flex flex-col @md:flex-row @md:gap-4">
        <img
          [src]="image()"
          [alt]="title()"
          class="w-full @md:w-48 @lg:w-64 aspect-video @md:aspect-square object-cover rounded-lg"
        />
        <div class="p-4 @md:p-0">
          <h2 class="text-lg @md:text-xl @lg:text-2xl font-semibold">{{ title() }}</h2>
          <p class="mt-2 text-gray-500 @md:line-clamp-3">{{ description() }}</p>
        </div>
      </article>
    </div>
  `
})
export class ResponsiveCardComponent {
  title       = input.required<string>();
  image       = input.required<string>();
  description = input('');
}
```

### Pattern 2: Fluid Typography

```css
/* Fluid type scale using clamp() */
:root {
  /* Min size, preferred (fluid), max size */
  --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
  --text-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
  --text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --text-lg: clamp(1.125rem, 1rem + 0.625vw, 1.25rem);
  --text-xl: clamp(1.25rem, 1rem + 1.25vw, 1.5rem);
  --text-2xl: clamp(1.5rem, 1.25rem + 1.25vw, 2rem);
  --text-3xl: clamp(1.875rem, 1.5rem + 1.875vw, 2.5rem);
  --text-4xl: clamp(2.25rem, 1.75rem + 2.5vw, 3.5rem);
}

/* Usage */
h1 {
  font-size: var(--text-4xl);
}
h2 {
  font-size: var(--text-3xl);
}
h3 {
  font-size: var(--text-2xl);
}
p {
  font-size: var(--text-base);
}

/* Fluid spacing scale */
:root {
  --space-xs: clamp(0.25rem, 0.2rem + 0.25vw, 0.5rem);
  --space-sm: clamp(0.5rem, 0.4rem + 0.5vw, 0.75rem);
  --space-md: clamp(1rem, 0.8rem + 1vw, 1.5rem);
  --space-lg: clamp(1.5rem, 1.2rem + 1.5vw, 2.5rem);
  --space-xl: clamp(2rem, 1.5rem + 2.5vw, 4rem);
}
```

```tsx
// Utility function for fluid values
function fluidValue(
  minSize: number,
  maxSize: number,
  minWidth = 320,
  maxWidth = 1280,
) {
  const slope = (maxSize - minSize) / (maxWidth - minWidth);
  const yAxisIntersection = -minWidth * slope + minSize;

  return `clamp(${minSize}rem, ${yAxisIntersection.toFixed(4)}rem + ${(slope * 100).toFixed(4)}vw, ${maxSize}rem)`;
}

// Generate fluid type scale
const fluidTypeScale = {
  sm: fluidValue(0.875, 1),
  base: fluidValue(1, 1.125),
  lg: fluidValue(1.25, 1.5),
  xl: fluidValue(1.5, 2),
  "2xl": fluidValue(2, 3),
};
```

### Pattern 3: CSS Grid Responsive Layout

```css
/* Auto-fit grid - items wrap automatically */
.grid-auto {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: 1.5rem;
}

/* Auto-fill grid - maintains empty columns */
.grid-auto-fill {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

/* Responsive grid with named areas */
.page-layout {
  display: grid;
  grid-template-areas:
    "header"
    "main"
    "sidebar"
    "footer";
  gap: 1rem;
}

@media (min-width: 768px) {
  .page-layout {
    grid-template-columns: 1fr 300px;
    grid-template-areas:
      "header header"
      "main sidebar"
      "footer footer";
  }
}

@media (min-width: 1024px) {
  .page-layout {
    grid-template-columns: 250px 1fr 300px;
    grid-template-areas:
      "header header header"
      "nav main sidebar"
      "footer footer footer";
  }
}

.header {
  grid-area: header;
}
.main {
  grid-area: main;
}
.sidebar {
  grid-area: sidebar;
}
.footer {
  grid-area: footer;
}
```

```typescript
// Angular responsive grid component
@Component({
  selector: 'app-responsive-grid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="grid"
      [style.grid-template-columns]="gridCols()"
      [style.gap]="gap()"
    >
      <ng-content />
    </div>
  `
})
export class ResponsiveGridComponent {
  minItemWidth = input('250px');
  gap          = input('1.5rem');

  gridCols = computed(() =>
    `repeat(auto-fit, minmax(min(${this.minItemWidth()}, 100%), 1fr))`
  );
}

// Usage with Tailwind
@Component({
  template: `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      @for (issue of issues(); track issue.id) {
        <app-issue-card [issue]="issue" />
      }
    </div>
  `
})
```

### Pattern 4: Responsive Navigation (Angular Material)

```typescript
// Angular Material responsive sidenav
@Component({
  selector: 'app-nav-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatSidenavModule, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-sidenav-container class="h-screen">
      <!-- Responsive sidenav: over on mobile, side on desktop -->
      <mat-sidenav
        #sidenav
        [mode]="isDesktop() ? 'side' : 'over'"
        [opened]="isDesktop() || sidenavOpen()"
        class="w-64"
      >
        <nav aria-label="Main navigation" class="p-4">
          <ng-content select="[nav-items]" />
        </nav>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="sticky top-0 z-10">
          <!-- Show menu button only on mobile -->
          @if (!isDesktop()) {
            <button
              mat-icon-button
              aria-label="Toggle navigation"
              (click)="sidenavOpen.update(v => !v)"
            >
              <mat-icon>menu</mat-icon>
            </button>
          }
          <span class="flex-1">{{ title() }}</span>
          <ng-content select="[toolbar-actions]" />
        </mat-toolbar>

        <main class="p-4 md:p-6">
          <ng-content />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `
})
export class NavLayoutComponent implements OnInit {
  title = input('App');

  sidenavOpen = signal(false);
  isDesktop   = signal(false);

  private breakpointObserver = inject(BreakpointObserver);

  ngOnInit(): void {
    this.breakpointObserver
      .observe([Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
      .pipe(takeUntilDestroyed())
      .subscribe(state => this.isDesktop.set(state.matches));
  }
}
```

### Pattern 5: Responsive Images in Angular

```typescript
@Component({
  selector: 'app-responsive-image',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage],    // ✅ Use NgOptimizedImage for performance
  template: `
    <!-- NgOptimizedImage: automatic srcset, lazy loading, LCP optimization -->
    <img
      ngSrc="{{ src() }}"
      [width]="width()"
      [height]="height()"
      [alt]="alt()"
      [priority]="priority()"
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      class="w-full h-auto object-cover rounded-lg"
    />
  `
})
export class ResponsiveImageComponent {
  src      = input.required<string>();
  alt      = input.required<string>();
  width    = input.required<number>();
  height   = input.required<number>();
  priority = input(false);    // Set true for LCP images (above fold)
}
```

### Pattern 6: Responsive Angular Material Table

```typescript
// Angular Material table — responsive with horizontal scroll on mobile
@Component({
  selector: 'app-issues-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatTableModule, MatSortModule, MatPaginatorModule],
  template: `
    <!-- Horizontal scroll wrapper for mobile -->
    <div class="w-full overflow-x-auto">
      <table mat-table [dataSource]="issues()" matSort class="w-full min-w-[600px]">
        <ng-container matColumnDef="key">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Key</th>
          <td mat-cell *matCellDef="let issue">{{ issue.key }}</td>
        </ng-container>

        <ng-container matColumnDef="summary">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Summary</th>
          <td mat-cell *matCellDef="let issue" class="max-w-xs truncate">{{ issue.summary }}</td>
        </ng-container>

        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let issue">
            <app-status-chip [status]="issue.status" />
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </div>

    <!-- Card layout for mobile — hidden on md+ -->
    <div class="md:hidden space-y-3 mt-4">
      @for (issue of issues(); track issue.id) {
        <mat-card class="p-4">
          <div class="flex justify-between items-start">
            <span class="text-sm text-gray-500">{{ issue.key }}</span>
            <app-status-chip [status]="issue.status" />
          </div>
          <p class="mt-2 font-medium">{{ issue.summary }}</p>
        </mat-card>
      }
    </div>
  `
})
export class IssuesTableComponent {
  issues           = input.required<JiraIssue[]>();
  displayedColumns = ['key', 'summary', 'status'];
}
```

## Angular Material Breakpoint Observer

```typescript
import { inject, Injectable, signal } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class BreakpointService {
  private observer = inject(BreakpointObserver);

  readonly isMobile  = signal(false);
  readonly isTablet  = signal(false);
  readonly isDesktop = signal(false);

  constructor() {
    this.observer.observe([Breakpoints.Handset]).pipe(
      takeUntilDestroyed()
    ).subscribe(s => this.isMobile.set(s.matches));

    this.observer.observe([Breakpoints.Tablet]).pipe(
      takeUntilDestroyed()
    ).subscribe(s => this.isTablet.set(s.matches));

    this.observer.observe([Breakpoints.Web]).pipe(
      takeUntilDestroyed()
    ).subscribe(s => this.isDesktop.set(s.matches));
  }
}

// Usage in component
@Component({ standalone: true, changeDetection: ChangeDetectionStrategy.OnPush })
export class MyComponent {
  breakpoints = inject(BreakpointService);
  // this.breakpoints.isMobile() / isTablet() / isDesktop()
}
```

## Best Practices

1. **Mobile-First**: Start with mobile styles, enhance for larger screens
2. **Content Breakpoints**: Set breakpoints based on content, not devices
3. **Fluid Over Fixed**: Use fluid values for typography and spacing
4. **Container Queries**: Use `@container` for Angular component responsiveness
5. **`BreakpointObserver`**: Use CDK `BreakpointObserver` for JS-side breakpoints
6. **`NgOptimizedImage`**: Always use for Angular images (automatic srcset, lazy, LCP)
7. **`mat-sidenav`**: Use Angular Material sidenav for responsive navigation
8. **`dvh` units**: Use `100dvh` instead of `100vh` for mobile browser bars
9. **Touch Targets**: Maintain 44×44px minimum on mobile (Material buttons default)
10. **Test Real Devices**: Simulators don't catch all mobile rendering issues

## Common Issues

- **Horizontal Overflow**: Content breaking out of viewport
- **Fixed Widths**: Using px instead of relative units
- **Viewport Height**: 100vh issues on mobile browsers
- **Font Size**: Text too small on mobile
- **Touch Targets**: Buttons too small to tap accurately
- **Aspect Ratio**: Images squishing or stretching
- **Z-Index Stacking**: Overlays breaking on different screens

## Resources

- [Angular CDK BreakpointObserver](https://material.angular.io/cdk/layout/overview)
- [Angular Material Sidenav](https://material.angular.io/components/sidenav/overview)
- [NgOptimizedImage](https://angular.io/api/common/NgOptimizedImage)
- [CSS Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_container_queries)
- [Utopia Fluid Type Calculator](https://utopia.fyi/type/calculator/)
- [Every Layout](https://every-layout.dev/)

---

*Responsive Design — Angular 17+ with Tailwind v4, Angular Material, and CDK BreakpointObserver*
