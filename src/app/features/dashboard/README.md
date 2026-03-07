# Dashboard Component

## Overview

Role selection dashboard for System Architect application. Fully refactored to use Google Design System for consistency with the rest of the application.

## Changes in v2.0 (Full Refactor)

### ✅ Design System Alignment

| Aspect | Before (v1.0) | After (v2.0) |
|--------|---------------|--------------|
| **Component Library** | Angular Material (`mat-card`, `mat-button`, `mat-icon`) | Google Design System (`.g-card`, `.g-btn`, `.material-icons-outlined`) |
| **Colors** | Hard-coded hex values (`#1976d2`, `#333`, `#666`) | CSS variables (`--g-blue`, `--g-text-primary`, `--g-text-secondary`) |
| **Typography** | Custom sizes (`32px`, `20px`) | Design system standard (`18px`, `16px`) |
| **Layout** | Custom classes (`.dashboard-content`) | Utility classes (`.g-page`, `.g-grid--auto`) |
| **Icons** | `mat-icon` component | `material-icons-outlined` class |
| **Change Detection** | Default | `ChangeDetectionStrategy.OnPush` |
| **Shadows** | Custom `rgba()` values | Design system (`--g-shadow-card`, `--g-shadow-card-hover`) |

### 🔧 Technical Improvements

1. **Type Safety**
   - Added strict types: `RoleId`, `RoleColor`, `Role`
   - Type-safe color mapping to CSS variables

2. **Error Handling**
   - Added try-catch for `selectRole()` and `logout()` calls
   - Console error logging for debugging

3. **Accessibility**
   - Added `role="button"` and `tabindex="0"` to role cards
   - Keyboard navigation support (Enter/Space keys)
   - Focus visible styles

4. **Performance**
   - OnPush change detection reduces unnecessary re-renders
   - Signal-based state management from AuthService

5. **Code Quality**
   - Removed unused Angular Material imports
   - Added comprehensive JSDoc comments
   - Proper readonly modifiers for injected services

## Usage

```typescript
import { DashboardComponent } from './features/dashboard';

// In your route configuration
{
  path: 'dashboard',
  loadComponent: () => import('./features/dashboard').then(m => m.DashboardComponent)
}
```

## CSS Variables Used

```css
/* Colors */
--g-blue, --g-green, --g-yellow, --g-purple
--g-text-primary, --g-text-secondary
--g-bg, --g-surface

/* Spacing */
--g-space-2, --g-space-4, --g-space-6

/* Shadows */
--g-shadow-card, --g-shadow-card-hover

/* Border Radius */
--g-radius-lg

/* Transitions */
--g-transition, --g-transition-slow
```

## Utility Classes Used

- `.g-page` - Page container with consistent padding
- `.g-page__header` - Page header with title and actions
- `.g-page__title` - Page title styling
- `.g-page__actions` - Action buttons container
- `.g-card` - Card component with shadow and hover effects
- `.g-btn` - Button base class
- `.g-btn--primary` - Primary button style
- `.g-btn--icon` - Icon button style
- `.g-grid--auto` - Auto-fit grid layout
- `.material-icons-outlined` - Google Material Icons

## File Structure

```
dashboard/
├── dashboard.component.ts      # Main component (refactored)
├── dashboard.component.spec.ts # Unit tests (updated)
├── index.ts                    # Public exports
└── README.md                   # This file
```

## Migration Guide

If you need to update other components to match this pattern:

1. Replace Angular Material imports with `CommonModule` only
2. Add `changeDetection: ChangeDetectionStrategy.OnPush`
3. Use `.g-page` for page layout
4. Use `.g-card` instead of `mat-card`
5. Use `.g-btn` instead of `mat-button`
6. Replace hard-coded colors with CSS variables
7. Use `<span class="material-icons-outlined">` instead of `<mat-icon>`

## Testing

```bash
# Run tests for this component only
ng test --include="src/app/features/dashboard/dashboard.component.spec.ts"

# Run all tests
ng test
```

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2026-03-07 | Full refactor to Google Design System |
| 1.0 | 2026-02-XX | Initial implementation with Angular Material |
