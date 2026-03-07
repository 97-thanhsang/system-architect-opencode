---
name: design-system-patterns
description: Build a scalable design system for Angular 17+ using Angular Material Design 3, CSS custom properties, Tailwind v4 @theme tokens, signal-based theme service, and component theming. Use when setting up Material M3 theming, implementing dark/light mode, or creating consistent token hierarchies.
---

# Design System Patterns — Angular + Material Design 3

Master design system architecture for Angular 17+ apps using Angular Material M3 tokens, CSS custom properties, and Tailwind v4.

## When to Use This Skill

- Setting up Angular Material M3 custom theme with `@angular/material`
- Creating CSS `@theme` tokens for Tailwind v4
- Implementing light/dark mode with a signal-based ThemeService
- Building component variants with consistent token-based APIs
- Establishing spacing, typography, and color design tokens
- Configuring `mat.define-theme()` with custom brand colors

---

## 1. Angular Material M3 Theme Setup

```scss
// styles.scss — Angular Material M3 theming
@use '@angular/material' as mat;

// Include Material core once
@include mat.core();

// Define M3 theme with custom palette
$theme: mat.define-theme((
  color: (
    theme-type: light,
    primary:    mat.$azure-palette,      // Primary brand color
    tertiary:   mat.$blue-palette,
  ),
  typography: (
    brand-family: 'Roboto, sans-serif',
    plain-family: 'Roboto, sans-serif',
  ),
  density: (
    scale: 0,        // 0 = default size, -1/-2/-3 = compact
  )
));

// Apply theme to entire app
html {
  @include mat.all-component-themes($theme);
  @include mat.color-variants-backwards-compatibility($theme);
}

// Dark mode override
.dark-theme {
  @include mat.all-component-colors(
    mat.define-theme((
      color: (
        theme-type: dark,
        primary:  mat.$azure-palette,
        tertiary: mat.$blue-palette,
      )
    ))
  );
}
```

---

## 2. Tailwind v4 + Material Token Integration

```css
/* styles.css — CSS-first Tailwind v4 with Material-aligned tokens */
@import "tailwindcss";

@theme {
  /* ── Brand Colors (Material palette references) ── */
  --color-primary:          oklch(45% 0.18 250);    /* Material primary */
  --color-primary-dark:     oklch(35% 0.18 250);    /* hover/active */
  --color-on-primary:       oklch(98% 0 0);          /* text on primary */

  --color-secondary:        oklch(50% 0.12 290);    /* Material secondary */
  --color-on-secondary:     oklch(98% 0 0);

  --color-error:            oklch(50% 0.22 27);      /* Material error */
  --color-on-error:         oklch(98% 0 0);

  /* ── Surface Tokens ── */
  --color-surface:          oklch(98% 0.005 264);   /* Card background */
  --color-surface-variant:  oklch(93% 0.01 264);    /* Subtle surface */
  --color-on-surface:       oklch(15% 0.02 264);    /* Text on surface */
  --color-on-surface-variant: oklch(45% 0.02 264);  /* Secondary text */
  --color-outline:          oklch(60% 0.015 264);   /* Borders */
  --color-outline-variant:  oklch(85% 0.01 264);    /* Subtle borders */

  /* ── Background ── */
  --color-background:       oklch(99% 0.002 264);
  --color-on-background:    oklch(15% 0.02 264);

  /* ── Spacing (8pt grid) ── */
  --spacing-1:  0.25rem;   /* 4px */
  --spacing-2:  0.5rem;    /* 8px */
  --spacing-3:  0.75rem;   /* 12px */
  --spacing-4:  1rem;      /* 16px */
  --spacing-6:  1.5rem;    /* 24px */
  --spacing-8:  2rem;      /* 32px */
  --spacing-12: 3rem;      /* 48px */
  --spacing-16: 4rem;      /* 64px */

  /* ── Border Radius (Material M3) ── */
  --radius-xs:  0.25rem;   /* 4px  — chips */
  --radius-sm:  0.5rem;    /* 8px  — cards */
  --radius-md:  0.75rem;   /* 12px — dialogs */
  --radius-lg:  1rem;      /* 16px — large panels */
  --radius-full: 9999px;   /* full pill */

  /* ── Typography ── */
  --font-sans: 'Roboto', system-ui, sans-serif;
  --text-body-sm:   0.875rem;    /* 14px */
  --text-body-md:   1rem;        /* 16px */
  --text-title-sm:  0.875rem;    /* 14px semibold */
  --text-title-md:  1rem;        /* 16px semibold */
  --text-title-lg:  1.375rem;    /* 22px */
  --text-headline:  1.5rem;      /* 24px */
  --text-display:   2.8125rem;   /* 45px */

  /* ── Elevation shadows (Material M3) ── */
  --shadow-1: 0 1px 2px oklch(0% 0 0 / 0.3), 0 1px 3px 1px oklch(0% 0 0 / 0.15);
  --shadow-2: 0 1px 2px oklch(0% 0 0 / 0.3), 0 2px 6px 2px oklch(0% 0 0 / 0.15);
  --shadow-3: 0 4px 8px 3px oklch(0% 0 0 / 0.15), 0 1px 3px oklch(0% 0 0 / 0.3);
}

/* Dark mode via class on <html> */
@custom-variant dark (&:where(.dark-theme, .dark-theme *));

.dark-theme {
  --color-surface:          oklch(18% 0.02 264);
  --color-surface-variant:  oklch(25% 0.02 264);
  --color-on-surface:       oklch(90% 0.01 264);
  --color-on-surface-variant: oklch(75% 0.015 264);
  --color-background:       oklch(12% 0.015 264);
  --color-on-background:    oklch(90% 0.01 264);
  --color-outline:          oklch(50% 0.015 264);
  --color-outline-variant:  oklch(35% 0.015 264);
}
```

---

## 3. Signal-Based Theme Service

```typescript
// theme.service.ts
import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal, computed, effect } from '@angular/core';

export type ColorScheme = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private doc = inject(DOCUMENT);

  // Persisted user preference
  readonly preference = signal<ColorScheme>(
    (localStorage.getItem('theme') as ColorScheme) ?? 'system'
  );

  // System OS preference
  private readonly systemDark = signal(
    this.doc.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches ?? false
  );

  // Resolved actual theme
  readonly isDark = computed(() => {
    const pref = this.preference();
    return pref === 'dark' || (pref === 'system' && this.systemDark());
  });

  constructor() {
    // Watch OS-level preference changes
    this.doc.defaultView
      ?.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', e => this.systemDark.set(e.matches));

    // Apply theme class to <html> reactively
    effect(() => {
      const html = this.doc.documentElement;
      html.classList.toggle('dark-theme', this.isDark());
      localStorage.setItem('theme', this.preference());
    });
  }

  setPreference(scheme: ColorScheme): void {
    this.preference.set(scheme);
  }

  toggle(): void {
    this.preference.update(p =>
      p === 'dark' ? 'light' : 'dark'
    );
  }
}
```

```typescript
// theme-toggle.component.ts
@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <button
      mat-icon-button
      [matTooltip]="isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
      [attr.aria-label]="isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
      (click)="theme.toggle()"
    >
      <mat-icon>{{ isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
    </button>
  `
})
export class ThemeToggleComponent {
  theme = inject(ThemeService);
  isDark = this.theme.isDark;
}
```

---

## 4. Design Token Hierarchy

```
Primitive tokens (raw values)
    ↓ referenced by
Semantic tokens (purpose: --color-primary, --color-surface)
    ↓ referenced by
Component tokens (usage: mat-primary, bg-surface)
```

```css
/* Layer 1: Primitive (defined in Tailwind @theme) */
--color-blue-600: oklch(45% 0.18 250);

/* Layer 2: Semantic (maps to purpose) */
--color-primary: var(--color-blue-600);

/* Layer 3: Component usage in templates */
/* bg-primary → var(--color-primary) */
```

---

## 5. Typography System

```scss
// typography.scss
// Material M3 type scale — use @include in component styles

// Display
.mat-display-large   { font: var(--mat-sys-display-large); }   // 57px
.mat-display-medium  { font: var(--mat-sys-display-medium); }  // 45px
.mat-display-small   { font: var(--mat-sys-display-small); }   // 36px

// Headline
.mat-headline-large  { font: var(--mat-sys-headline-large); }  // 32px
.mat-headline-medium { font: var(--mat-sys-headline-medium); } // 28px
.mat-headline-small  { font: var(--mat-sys-headline-small); }  // 24px

// Title
.mat-title-large  { font: var(--mat-sys-title-large); }   // 22px
.mat-title-medium { font: var(--mat-sys-title-medium); }  // 16px semibold
.mat-title-small  { font: var(--mat-sys-title-small); }   // 14px semibold

// Body
.mat-body-large  { font: var(--mat-sys-body-large); }    // 16px
.mat-body-medium { font: var(--mat-sys-body-medium); }   // 14px
.mat-body-small  { font: var(--mat-sys-body-small); }    // 12px

// Label
.mat-label-large  { font: var(--mat-sys-label-large); }  // 14px medium
.mat-label-medium { font: var(--mat-sys-label-medium); } // 12px medium
.mat-label-small  { font: var(--mat-sys-label-small); }  // 11px medium
```

---

## 6. Component Variants with CSS Custom Properties

```typescript
// status-chip.component.ts — semantic color variants
@Component({
  selector: 'app-status-chip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatChipsModule],
  template: `
    <mat-chip
      [class]="statusClass()"
      [highlighted]="highlighted()"
    >
      {{ status() }}
    </mat-chip>
  `
})
export class StatusChipComponent {
  status      = input.required<'To Do' | 'In Progress' | 'Done' | 'Blocked'>();
  highlighted = input(false);

  statusClass = computed(() => {
    const map: Record<string, string> = {
      'To Do':       'chip-neutral',
      'In Progress': 'chip-info',
      'Done':        'chip-success',
      'Blocked':     'chip-error',
    };
    return map[this.status()] ?? 'chip-neutral';
  });
}
```

```css
/* In styles.scss — semantic chip variants */
.chip-neutral { --mdc-chip-elevated-container-color: oklch(93% 0.01 264); }
.chip-info    { --mdc-chip-elevated-container-color: oklch(88% 0.08 250); }
.chip-success { --mdc-chip-elevated-container-color: oklch(88% 0.1 150); }
.chip-error   { --mdc-chip-elevated-container-color: oklch(88% 0.1 27); }
```

---

## 7. Spacing & Layout Utilities

```html
<!-- Use Tailwind spacing tokens for consistent layouts -->

<!-- Card with Material-aligned spacing -->
<mat-card class="p-4 md:p-6">
  <mat-card-header class="mb-4">
    <mat-card-title>Title</mat-card-title>
  </mat-card-header>
  <mat-card-content class="flex flex-col gap-3">
    <!-- content -->
  </mat-card-content>
  <mat-card-actions class="px-4 pb-4 gap-2">
    <button mat-button>Cancel</button>
    <button mat-raised-button color="primary">Save</button>
  </mat-card-actions>
</mat-card>

<!-- Page layout with sidebar -->
<div class="flex h-screen overflow-hidden">
  <aside class="w-64 shrink-0 border-r bg-surface overflow-y-auto">
    <!-- sidebar -->
  </aside>
  <main class="flex-1 overflow-y-auto p-6 bg-background">
    <!-- main content -->
  </main>
</div>
```

---

## Best Practices

1. **`mat.define-theme()`** — always use M3 API, never legacy `mat.define-light-theme()`
2. **CSS custom properties** — all tokens via `--color-*`, never hardcode OKLCH values
3. **Tailwind `@theme`** — CSS-first configuration, no `tailwind.config.ts`
4. **Signal-based `ThemeService`** — reactive, persisted, OS-aware
5. **Semantic token names** — `--color-primary` not `--color-blue-600`
6. **Material type scale** — use `var(--mat-sys-*)` for typography
7. **8pt spacing grid** — always use Tailwind spacing tokens (`p-4` = 16px)
8. **Dark mode via class** — toggle `.dark-theme` on `<html>` element
9. **`@custom-variant dark`** — Tailwind v4 dark mode with class strategy
10. **Test all themes** — verify every component in light + dark + high contrast

---

*Design System Patterns — Angular 17+ with Material Design 3 and Tailwind CSS v4*
