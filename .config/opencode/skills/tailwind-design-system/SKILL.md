# Skill: tailwind-design-system

> **Source**: wshobson/agents/tailwind-design-system  
> **Version**: 4.0.0  
> **Installs**: 14.8K  
> **Description**: Build production-ready design systems with Tailwind CSS v4

---

## Overview

This skill provides guidance for building design systems with **Tailwind CSS v4** including:
- CSS-first configuration with `@theme`
- Design tokens and theming
- Component variants with CVA (Class Variance Authority)
- Responsive patterns
- Accessibility best practices
- Dark mode with native CSS
- Animation and transitions

---

## Quick Start

### 1. Install Tailwind CSS v4

```bash
npm install tailwindcss@next
```

### 2. Create CSS Configuration

```css
/* styles.css - Tailwind v4 CSS-first configuration */
@import "tailwindcss";

/* Define your theme with @theme */
@theme {
  /* Semantic color tokens using OKLCH */
  --color-background: oklch(100% 0 0);
  --color-foreground: oklch(14.5% 0.025 264);
  
  --color-primary: oklch(14.5% 0.025 264);
  --color-primary-foreground: oklch(98% 0.01 264);
  
  --color-secondary: oklch(96% 0.01 264);
  --color-secondary-foreground: oklch(14.5% 0.025 264);
  
  --color-muted: oklch(96% 0.01 264);
  --color-muted-foreground: oklch(46% 0.02 264);
  
  --color-accent: oklch(96% 0.01 264);
  --color-accent-foreground: oklch(14.5% 0.025 264);
  
  --color-destructive: oklch(53% 0.22 27);
  --color-destructive-foreground: oklch(98% 0.01 264);
  
  --color-border: oklch(91% 0.01 264);
  --color-ring: oklch(14.5% 0.025 264);
  
  --color-card: oklch(100% 0 0);
  --color-card-foreground: oklch(14.5% 0.025 264);
  
  /* Radius tokens */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  
  /* Animation tokens */
  --animate-fade-in: fade-in 0.2s ease-out;
  --animate-fade-out: fade-out 0.2s ease-in;
  
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fade-out {
    from { opacity: 1; }
    to { opacity: 0; }
  }
}

/* Dark mode variant */
@custom-variant dark (&:where(.dark, .dark *));

/* Dark mode theme overrides */
.dark {
  --color-background: oklch(14.5% 0.025 264);
  --color-foreground: oklch(98% 0.01 264);
  --color-primary: oklch(98% 0.01 264);
  --color-primary-foreground: oklch(14.5% 0.025 264);
}

/* Base styles */
@layer base {
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-background text-foreground antialiased;
  }
}
```

---

## Design Tokens

### Token Hierarchy

```
Brand Tokens (abstract)
    └── Semantic Tokens (purpose)
        └── Component Tokens (specific)

Example:
    oklch(45% 0.2 260) → --color-primary → bg-primary
```

### Color System

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--color-background` | white | dark gray | Page background |
| `--color-foreground` | dark gray | white | Text color |
| `--color-primary` | dark | light | Primary actions |
| `--color-secondary` | light gray | dark gray | Secondary elements |
| `--color-muted` | light gray | dark gray | Subdued content |
| `--color-accent` | light gray | dark gray | Highlighted elements |
| `--color-destructive` | red | dark red | Errors, delete |
| `--color-border` | light gray | dark gray | Borders |
| `--color-ring` | dark | light | Focus rings |

---

## Component Patterns

### Button with Variants

```typescript
// button.component.ts
import { Component, Input } from '@angular/core';
import { cn } from '@/lib/utils';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button
      [class]="buttonClasses()"
      [disabled]="disabled"
      [type]="type"
    >
      <ng-content></ng-content>
    </button>
  `
})
export class ButtonComponent {
  @Input() variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' = 'default';
  @Input() size: 'default' | 'sm' | 'lg' | 'icon' = 'default';
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  
  buttonClasses() {
    return cn(
      // Base styles
      'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium',
      'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      'focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      
      // Variants
      {
        'bg-primary text-primary-foreground hover:bg-primary/90': this.variant === 'default',
        'bg-destructive text-destructive-foreground hover:bg-destructive/90': this.variant === 'destructive',
        'border border-border bg-background hover:bg-accent hover:text-accent-foreground': this.variant === 'outline',
        'bg-secondary text-secondary-foreground hover:bg-secondary/80': this.variant === 'secondary',
        'hover:bg-accent hover:text-accent-foreground': this.variant === 'ghost',
        'text-primary underline-offset-4 hover:underline': this.variant === 'link',
      },
      
      // Sizes
      {
        'h-10 px-4 py-2': this.size === 'default',
        'h-9 rounded-md px-3': this.size === 'sm',
        'h-11 rounded-md px-8': this.size === 'lg',
        'h-10 w-10': this.size === 'icon',
      }
    );
  }
}
```

### Card Component

```typescript
// card.component.ts
import { Component } from '@angular/core';
import { cn } from '@/lib/utils';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div [class]="cn('rounded-lg border border-border bg-card text-card-foreground shadow-sm', className)">
      <ng-content></ng-content>
    </div>
  `
})
export class CardComponent {
  className = '';
}

@Component({
  selector: 'app-card-header',
  standalone: true,
  template: `
    <div [class]="cn('flex flex-col space-y-1.5 p-6', className)">
      <ng-content></ng-content>
    </div>
  `
})
export class CardHeaderComponent {
  className = '';
}

@Component({
  selector: 'app-card-title',
  standalone: true,
  template: `
    <h3 [class]="cn('text-2xl font-semibold leading-none tracking-tight', className)">
      <ng-content></ng-content>
    </h3>
  `
})
export class CardTitleComponent {
  className = '';
}

@Component({
  selector: 'app-card-content',
  standalone: true,
  template: `
    <div [class]="cn('p-6 pt-0', className)">
      <ng-content></ng-content>
    </div>
  `
})
export class CardContentComponent {
  className = '';
}
```

---

## Responsive Patterns

### Grid System

```typescript
// grid.component.ts
import { Component, Input } from '@angular/core';
import { cn } from '@/lib/utils';

@Component({
  selector: 'app-grid',
  standalone: true,
  template: `
    <div [class]="gridClasses()">
      <ng-content></ng-content>
    </div>
  `
})
export class GridComponent {
  @Input() cols: 1 | 2 | 3 | 4 | 5 | 6 = 3;
  @Input() gap: 'none' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() className = '';
  
  gridClasses() {
    return cn(
      'grid',
      {
        'grid-cols-1': this.cols === 1,
        'grid-cols-1 sm:grid-cols-2': this.cols === 2,
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3': this.cols === 3,
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4': this.cols === 4,
        'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5': this.cols === 5,
        'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6': this.cols === 6,
      },
      {
        'gap-0': this.gap === 'none',
        'gap-2': this.gap === 'sm',
        'gap-4': this.gap === 'md',
        'gap-6': this.gap === 'lg',
        'gap-8': this.gap === 'xl',
      },
      this.className
    );
  }
}

@Component({
  selector: 'app-container',
  standalone: true,
  template: `
    <div [class]="containerClasses()">
      <ng-content></ng-content>
    </div>
  `
})
export class ContainerComponent {
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' = 'xl';
  @Input() className = '';
  
  containerClasses() {
    return cn(
      'mx-auto w-full px-4 sm:px-6 lg:px-8',
      {
        'max-w-screen-sm': this.size === 'sm',
        'max-w-screen-md': this.size === 'md',
        'max-w-screen-lg': this.size === 'lg',
        'max-w-screen-xl': this.size === 'xl',
        'max-w-screen-2xl': this.size === '2xl',
        'max-w-full': this.size === 'full',
      },
      this.className
    );
  }
}
```

---

## Dark Mode

### Theme Provider Service

```typescript
// theme.service.ts
import { Injectable, signal, effect } from '@angular/core';

type Theme = 'dark' | 'light' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  theme = signal<Theme>('system');
  resolvedTheme = signal<'dark' | 'light'>('light');
  
  constructor() {
    // Load saved theme
    const saved = localStorage.getItem('theme') as Theme;
    if (saved) this.theme.set(saved);
    
    // Apply theme effect
    effect(() => {
      const current = this.theme();
      const resolved = current === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : current;
      
      this.resolvedTheme.set(resolved);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(resolved);
      localStorage.setItem('theme', current);
    });
  }
  
  setTheme(theme: Theme) {
    this.theme.set(theme);
  }
  
  toggle() {
    this.theme.update(t => t === 'dark' ? 'light' : 'dark');
  }
}
```

### Theme Toggle Component

```typescript
// theme-toggle.component.ts
import { Component, inject } from '@angular/core';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  template: `
    <button
      (click)="themeService.toggle()"
      class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-10 w-10"
    >
      @if (themeService.resolvedTheme() === 'dark') {
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      } @else {
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      }
      <span class="sr-only">Toggle theme</span>
    </button>
  `
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);
}
```

---

## Utility Functions

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Focus ring utility
export const focusRing = cn(
  'focus-visible:outline-none focus-visible:ring-2',
  'focus-visible:ring-ring focus-visible:ring-offset-2'
);

// Disabled utility
export const disabledStyles = 'disabled:pointer-events-none disabled:opacity-50';
```

---

## Best Practices

### Do's ✅

- **Use `@theme` blocks** - CSS-first configuration is v4's core pattern
- **Use OKLCH colors** - Better perceptual uniformity than HSL
- **Use semantic tokens** - `bg-primary` not `bg-blue-500`
- **Use `size-*`** - New shorthand for `w-* h-*`
- **Add accessibility** - ARIA attributes, focus states
- **Compose variants** - Type-safe with proper interfaces
- **Test dark mode** - Ensure both themes work correctly

### Don'ts ❌

- **Don't use `tailwind.config.ts`** - Use CSS `@theme` instead
- **Don't use `@tailwind` directives** - Use `@import "tailwindcss"`
- **Don't hardcode colors** - Always use semantic tokens
- **Don't forget focus states** - Accessibility is crucial
- **Don't use arbitrary values** - Extend `@theme` instead

---

## Migration from v3 to v4

| v3 Pattern | v4 Pattern |
|------------|------------|
| `tailwind.config.ts` | `@theme` in CSS |
| `@tailwind base/components/utilities` | `@import "tailwindcss"` |
| `darkMode: "class"` | `@custom-variant dark` |
| `theme.extend.colors` | `@theme { --color-*: value }` |
| `h-10 w-10` | `size-10` |

---

## Resources

- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Tailwind v4 Beta Announcement](https://tailwindcss.com/blog/tailwindcss-v4-beta)
- [CVA Documentation](https://cva.style/docs)
- [shadcn/ui](https://ui.shadcn.com/)

---

*Part of wshobson/agents collection - 14.8K installs*
