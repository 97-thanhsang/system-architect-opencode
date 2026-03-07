---
name: visual-design-foundations
description: Apply typography, color theory, spacing systems, and iconography principles to create cohesive visual designs for Angular 17+ apps. Use when establishing Tailwind v4 design tokens with @theme, building style guides, or improving visual hierarchy and consistency with Angular Material M3.
---

# Visual Design Foundations — Angular + Tailwind v4

Build cohesive, accessible visual systems using typography, color, spacing, and iconography for Angular 17+ apps with Tailwind v4 and Angular Material M3.

## When to Use This Skill

- Establishing design tokens for a new project
- Creating or refining a spacing and sizing system
- Selecting and pairing typefaces
- Building accessible color palettes
- Designing icon systems and visual assets
- Improving visual hierarchy and readability
- Auditing designs for visual consistency
- Implementing dark mode or theming

## Core Systems

### 1. Typography Scale

**Modular Scale** (ratio-based sizing):

```css
:root {
  --font-size-xs: 0.75rem; /* 12px */
  --font-size-sm: 0.875rem; /* 14px */
  --font-size-base: 1rem; /* 16px */
  --font-size-lg: 1.125rem; /* 18px */
  --font-size-xl: 1.25rem; /* 20px */
  --font-size-2xl: 1.5rem; /* 24px */
  --font-size-3xl: 1.875rem; /* 30px */
  --font-size-4xl: 2.25rem; /* 36px */
  --font-size-5xl: 3rem; /* 48px */
}
```

**Line Height Guidelines**:
| Text Type | Line Height |
|-----------|-------------|
| Headings | 1.1 - 1.3 |
| Body text | 1.5 - 1.7 |
| UI labels | 1.2 - 1.4 |

### 2. Spacing System

**8-point grid** (industry standard):

```css
:root {
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem; /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem; /* 16px */
  --space-5: 1.25rem; /* 20px */
  --space-6: 1.5rem; /* 24px */
  --space-8: 2rem; /* 32px */
  --space-10: 2.5rem; /* 40px */
  --space-12: 3rem; /* 48px */
  --space-16: 4rem; /* 64px */
}
```

### 3. Color System

**Semantic color tokens**:

```css
:root {
  /* Brand */
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-primary-active: #1e40af;

  /* Semantic */
  --color-success: #16a34a;
  --color-warning: #ca8a04;
  --color-error: #dc2626;
  --color-info: #0891b2;

  /* Neutral */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
}
```

## Quick Start: Design Tokens with Tailwind v4 CSS @theme

```css
/* styles.css — Tailwind v4 CSS-first configuration (no tailwind.config.ts needed) */
@import "tailwindcss";

@theme {
  /* ── Typography ── */
  --font-sans: 'Roboto', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Type scale — Material M3 aligned */
  --text-xs:   0.75rem;    /* 12px */
  --text-sm:   0.875rem;   /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg:   1.125rem;   /* 18px */
  --text-xl:   1.25rem;    /* 20px */
  --text-2xl:  1.375rem;   /* 22px — Title Large */
  --text-3xl:  1.75rem;    /* 28px — Headline Medium */
  --text-4xl:  2.25rem;    /* 36px — Display Small */

  /* ── Colors (OKLCH for perceptual uniformity) ── */
  /* Brand */
  --color-primary:      oklch(45% 0.18 250);
  --color-primary-dark: oklch(35% 0.18 250);
  --color-on-primary:   oklch(98% 0 0);

  /* Semantic */
  --color-success:      oklch(48% 0.16 150);
  --color-warning:      oklch(72% 0.18 85);
  --color-error:        oklch(50% 0.22 27);
  --color-info:         oklch(55% 0.15 230);

  /* Surface */
  --color-surface:         oklch(98% 0.005 264);
  --color-surface-variant: oklch(93% 0.01 264);
  --color-on-surface:      oklch(15% 0.02 264);
  --color-outline:         oklch(60% 0.015 264);
  --color-background:      oklch(99% 0.002 264);

  /* ── Spacing (8pt grid) ── */
  --spacing-1:  0.25rem;   /* 4px */
  --spacing-2:  0.5rem;    /* 8px */
  --spacing-3:  0.75rem;   /* 12px */
  --spacing-4:  1rem;      /* 16px */
  --spacing-6:  1.5rem;    /* 24px */
  --spacing-8:  2rem;      /* 32px */
  --spacing-12: 3rem;      /* 48px */
  --spacing-16: 4rem;      /* 64px */

  /* ── Border radius (Material M3) ── */
  --radius-xs:   0.25rem;   /* 4px  — chips */
  --radius-sm:   0.5rem;    /* 8px  — small cards */
  --radius-md:   0.75rem;   /* 12px — dialogs */
  --radius-lg:   1rem;      /* 16px — large panels */
  --radius-full: 9999px;    /* pills and avatars */
}
```

> **Note**: In Tailwind v4 there is no `tailwind.config.ts`. All configuration is CSS-first in `@theme {}` blocks.

## Typography Best Practices

### Font Pairing

**Safe combinations**:

- Heading: **Inter** / Body: **Inter** (single family)
- Heading: **Playfair Display** / Body: **Source Sans Pro** (contrast)
- Heading: **Space Grotesk** / Body: **IBM Plex Sans** (geometric)

### Responsive Typography

```css
/* Fluid typography using clamp() */
h1 {
  font-size: clamp(2rem, 5vw + 1rem, 3.5rem);
  line-height: 1.1;
}

p {
  font-size: clamp(1rem, 2vw + 0.5rem, 1.125rem);
  line-height: 1.6;
  max-width: 65ch; /* Optimal reading width */
}
```

### Font Loading

```css
/* Prevent layout shift */
@font-face {
  font-family: "Inter";
  src: url("/fonts/Inter.woff2") format("woff2");
  font-display: swap;
  font-weight: 400 700;
}
```

## Color Theory

### Contrast Requirements (WCAG)

| Element            | Minimum Ratio |
| ------------------ | ------------- |
| Body text          | 4.5:1 (AA)    |
| Large text (18px+) | 3:1 (AA)      |
| UI components      | 3:1 (AA)      |
| Enhanced           | 7:1 (AAA)     |

### Dark Mode Strategy (Tailwind v4 + Angular)

```css
/* styles.css — Tailwind v4 dark mode */
@import "tailwindcss";

/* Dark mode via .dark-theme class on <html> */
@custom-variant dark (&:where(.dark-theme, .dark-theme *));

.dark-theme {
  /* Surface overrides for dark mode */
  --color-surface:          oklch(18% 0.02 264);
  --color-surface-variant:  oklch(25% 0.02 264);
  --color-on-surface:       oklch(90% 0.01 264);
  --color-background:       oklch(12% 0.015 264);
  --color-on-background:    oklch(90% 0.01 264);
  --color-outline:          oklch(50% 0.015 264);
}
```

```typescript
// Angular ThemeService applies .dark-theme class to <html>
// See design-system-patterns skill for full implementation
```

### Color Accessibility

```tsx
// Check contrast programmatically
function getContrastRatio(foreground: string, background: string): number {
  const getLuminance = (hex: string) => {
    const rgb = hexToRgb(hex);
    const [r, g, b] = rgb.map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}
```

## Spacing Guidelines

### Component Spacing

```
Card padding:      16-24px (--space-4 to --space-6)
Section gap:       32-64px (--space-8 to --space-16)
Form field gap:    16-24px (--space-4 to --space-6)
Button padding:    8-16px vertical, 16-24px horizontal
Icon-text gap:     8px (--space-2)
```

### Visual Rhythm

```css
/* Consistent vertical rhythm */
.prose > * + * {
  margin-top: var(--space-4);
}

.prose > h2 + * {
  margin-top: var(--space-2);
}

.prose > * + h2 {
  margin-top: var(--space-8);
}
```

## Iconography

### Icon Sizing System

```css
:root {
  --icon-xs: 12px;
  --icon-sm: 16px;
  --icon-md: 20px;
  --icon-lg: 24px;
  --icon-xl: 32px;
}
```

### Icon Component (Angular + Material Icons)

```typescript
// Use Angular Material's MatIcon — no custom SVG sprite needed
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-icon-example',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <!-- Material icons — always aria-hidden on decorative icons -->
    <mat-icon aria-hidden="true">favorite</mat-icon>

    <!-- With size via font-size override -->
    <mat-icon style="font-size: 32px; width: 32px; height: 32px;">star</mat-icon>

    <!-- Icon button — always needs aria-label -->
    <button mat-icon-button aria-label="Add to favorites">
      <mat-icon>favorite</mat-icon>
    </button>
  `
})
export class IconExampleComponent {}
```

## Best Practices

1. **Establish Constraints**: Limit choices to maintain consistency
2. **Document Decisions**: Create a living style guide
3. **Test Accessibility**: Verify contrast, sizing, touch targets
4. **Use Semantic Tokens**: Name by purpose, not appearance
5. **Design Mobile-First**: Start with constraints, add complexity
6. **Maintain Vertical Rhythm**: Consistent spacing creates harmony
7. **Limit Font Weights**: 2-3 weights per family is sufficient

## Common Issues

- **Inconsistent Spacing**: Not using a defined scale
- **Poor Contrast**: Failing WCAG requirements
- **Font Overload**: Too many families or weights
- **Magic Numbers**: Arbitrary values instead of tokens
- **Missing States**: Forgetting hover, focus, disabled
- **No Dark Mode Plan**: Retrofitting is harder than planning

## Resources

- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs) — CSS-first `@theme`
- [Angular Material M3 Theming](https://material.angular.io/guide/theming)
- [Material Design Color System](https://m3.material.io/styles/color/overview)
- [OKLCH Color Space](https://oklch.com/) — perceptually uniform color picker
- [Type Scale Calculator](https://typescale.com/)
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Material Design Type Scale](https://m3.material.io/styles/typography/type-scale-tokens)

---

*Visual Design Foundations — Angular 17+ with Tailwind v4 @theme and Material Design 3*
