---
name: accessibility-compliance
description: Implement WCAG 2.2 compliant Angular interfaces using Angular Material, CDK a11y, ARIA patterns, and keyboard navigation. Use when auditing accessibility, building accessible Angular Material components, or ensuring inclusive user experiences.
---

# Accessibility Compliance — Angular

Master accessibility implementation for Angular 17+ apps using Angular Material and CDK a11y.

## When to Use This Skill

- Implementing WCAG 2.2 Level AA/AAA compliance in Angular
- Building accessible Angular Material forms and dialogs
- Adding keyboard navigation and focus management with CDK
- Implementing focus trapping in modals and overlays
- Supporting screen readers with proper ARIA attributes
- Implementing skip navigation and landmark regions
- Conducting a11y audits with `@angular-eslint/template-accessibility-*`

## Core Angular A11y Tools

| Tool | Purpose |
|------|---------|
| `@angular/cdk/a11y` | FocusTrap, LiveAnnouncer, AriaDescriber, ActiveDescendantKeyManager |
| Angular Material | Built-in ARIA on all Material components |
| `LiveAnnouncer` | Polite/assertive screen reader announcements |
| `FocusTrapFactory` | Trap focus within overlays and panels |
| `@angular-eslint/template-accessibility-*` | Lint-time ARIA checks |

---

## Pattern 1: Accessible Angular Material Button

```typescript
import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-submit-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatProgressSpinnerModule],
  template: `
    <button
      mat-raised-button
      color="primary"
      type="submit"
      [disabled]="isLoading()"
      [attr.aria-busy]="isLoading()"
      [attr.aria-label]="isLoading() ? 'Submitting, please wait' : label()"
    >
      @if (isLoading()) {
        <mat-spinner diameter="18" class="inline-block mr-2" aria-hidden="true" />
        <span>Submitting...</span>
      } @else {
        <span>{{ label() }}</span>
      }
    </button>
  `
})
export class SubmitButtonComponent {
  isLoading = signal(false);
  label = input('Submit');
}
```

---

## Pattern 2: Accessible Angular Material Dialog

```typescript
// ✅ MatDialog automatically: traps focus, sets role="dialog",
//    aria-modal="true", aria-labelledby, and restores focus on close

import { Component, inject } from '@angular/core';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

interface DialogData { title: string; message: string; }

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <!-- mat-dialog-title sets role="heading" + aria-labelledby automatically -->
    <h2 mat-dialog-title>{{ data.title }}</h2>

    <!-- mat-dialog-content sets aria-describedby automatically -->
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Cancel</button>
      <!-- cdkFocusInitial: first focused element when dialog opens -->
      <button mat-raised-button color="warn" [mat-dialog-close]="true" cdkFocusInitial>
        Confirm
      </button>
    </mat-dialog-actions>
  `
})
export class ConfirmDialogComponent {
  data = inject<DialogData>(MAT_DIALOG_DATA);
}

// Opening — always set restoreFocus: true
@Component({ standalone: true, imports: [MatButtonModule] })
export class ParentComponent {
  private dialog = inject(MatDialog);

  openConfirm(): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Issue?', message: 'This cannot be undone.' },
      restoreFocus: true,           // Returns focus to trigger on close
      ariaLabel: 'Confirm delete',
    }).afterClosed().subscribe(confirmed => {
      if (confirmed) { /* handle */ }
    });
  }
}
```

---

## Pattern 3: Accessible Reactive Form with Angular Material

```typescript
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-accessible-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <!-- Error summary — role="alert" announces immediately to screen readers -->
    @if (showErrors() && form.invalid) {
      <div
        role="alert"
        class="bg-red-50 border border-red-300 p-4 rounded-md mb-4"
      >
        <h3 class="font-semibold text-red-800">Please fix the following errors:</h3>
        <ul class="list-disc list-inside mt-2 text-red-700">
          @if (form.controls.email.invalid) {
            <li>Email: {{ getEmailError() }}</li>
          }
        </ul>
      </div>
    }

    <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Email address</mat-label>
        <input
          matInput
          formControlName="email"
          type="email"
          autocomplete="email"
          aria-required="true"
        />
        <!-- mat-error automatically has aria-live="polite" -->
        @if (form.controls.email.touched) {
          @if (form.controls.email.hasError('required')) {
            <mat-error>Email is required</mat-error>
          }
          @if (form.controls.email.hasError('email')) {
            <mat-error>Enter a valid email address</mat-error>
          }
        }
        <mat-hint>We'll never share your email</mat-hint>
      </mat-form-field>

      <button mat-raised-button color="primary" type="submit">Submit</button>
    </form>
  `
})
export class AccessibleFormComponent {
  private fb = inject(NonNullableFormBuilder);
  private announcer = inject(LiveAnnouncer);

  showErrors = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  getEmailError(): string {
    const ctrl = this.form.controls.email;
    if (ctrl.hasError('required')) return 'Email is required';
    if (ctrl.hasError('email')) return 'Must be a valid email';
    return '';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.showErrors.set(true);
      this.announcer.announce('Form has errors. Please check the highlighted fields.');
      return;
    }
    // submit logic
  }
}
```

---

## Pattern 4: Skip Navigation Link

```typescript
// app.component.ts
@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <!-- Skip link — visually hidden until focused -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
             focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded
             focus:ring-2 focus:ring-blue-600 focus:text-blue-900"
    >
      Skip to main content
    </a>

    <app-header />

    <nav aria-label="Main navigation">
      <!-- navigation items -->
    </nav>

    <!-- tabindex="-1" allows programmatic focus via skip link -->
    <main id="main-content" tabindex="-1">
      <router-outlet />
    </main>

    <footer role="contentinfo">
      <!-- footer content -->
    </footer>
  `
})
export class AppComponent {}
```

---

## Pattern 5: Live Announcements with CDK

```typescript
import { Component, inject, signal } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';

@Component({
  selector: 'app-search-results',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isLoading()) {
      <mat-spinner diameter="32" aria-label="Loading search results" />
    } @else {
      <!-- Polite announcement region -->
      <p aria-live="polite" aria-atomic="true" class="sr-only">
        {{ results().length }} results found
      </p>

      @for (issue of results(); track issue.id) {
        <div>{{ issue.summary }}</div>
      }
    }
  `
})
export class SearchResultsComponent {
  private announcer = inject(LiveAnnouncer);

  isLoading = signal(false);
  results = signal<{ id: string; summary: string }[]>([]);

  async search(query: string): Promise<void> {
    this.isLoading.set(true);
    // ...fetch results...
    this.isLoading.set(false);

    // Announce result count to screen readers
    await this.announcer.announce(
      `${this.results().length} results found for "${query}"`,
      'polite'
    );
  }
}
```

---

## Pattern 6: Focus Trap for Custom Overlays (CDK)

```typescript
import { Component, ElementRef, inject, OnDestroy, ViewChild } from '@angular/core';
import { FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';

@Component({
  selector: 'app-custom-panel',
  standalone: true,
  template: `
    <div
      #panelRef
      role="dialog"
      aria-modal="true"
      aria-labelledby="panel-title"
      class="panel"
    >
      <h2 id="panel-title">Panel Title</h2>
      <button cdkFocusInitial>First Focusable Item</button>
      <button>Action</button>
      <button (click)="close()">Close</button>
    </div>
  `
})
export class CustomPanelComponent implements OnDestroy {
  @ViewChild('panelRef') panelRef!: ElementRef<HTMLElement>;

  private focusTrapFactory = inject(FocusTrapFactory);
  private focusTrap?: FocusTrap;

  ngAfterViewInit(): void {
    // ✅ Use CDK FocusTrap — never implement manually
    this.focusTrap = this.focusTrapFactory.create(this.panelRef.nativeElement);
    this.focusTrap.focusInitialElementWhenReady();
  }

  ngOnDestroy(): void {
    this.focusTrap?.destroy();
  }

  close(): void { /* return focus to trigger */ }
}
```

---

## Icon Buttons — Always Add aria-label

```html
<!-- ❌ WRONG — screen reader reads "favorite" or nothing -->
<button mat-icon-button>
  <mat-icon>favorite</mat-icon>
</button>

<!-- ✅ CORRECT — aria-label describes the action -->
<button mat-icon-button aria-label="Add to favorites">
  <mat-icon>favorite</mat-icon>
</button>

<!-- ✅ CORRECT — matTooltip also sets aria-describedby -->
<button mat-icon-button matTooltip="Add to favorites" aria-label="Add to favorites">
  <mat-icon aria-hidden="true">favorite</mat-icon>
</button>
```

---

## WCAG 2.2 Checklist for Angular + Material

| Level | Criterion | Angular Material Implementation |
|-------|-----------|----------------------------------|
| A | 1.1.1 Non-text content | `alt=""` on `<img>`, `aria-label` on icon buttons |
| A | 2.1.1 Keyboard accessible | All Material components keyboard-accessible by default |
| A | 2.4.1 Skip blocks | Skip link to `#main-content` |
| AA | 1.4.3 Contrast 4.5:1 | Material M3 palette meets WCAG AA |
| AA | 2.4.7 Focus visible | Material focus rings visible by default |
| AA | 2.5.8 Target size ≥24×24px | Material buttons are 36–48px minimum |
| AA | 4.1.3 Status messages | `LiveAnnouncer` from CDK |

---

## Keyboard Navigation

Angular Material components have built-in keyboard support:

| Component | Keys |
|-----------|------|
| `MatButtonModule` | `Enter` / `Space` to activate |
| `MatMenuModule` | `Arrow` keys, `Esc` to close |
| `MatDialogModule` | `Esc` to close, `Tab` cycles focus |
| `MatSelectModule` | `Arrow` keys + `Enter`, `Esc` to close |
| `MatTabsModule` | `Arrow` keys to switch tabs |
| `MatAutocomplete` | `Arrow` + `Enter`, `Esc` to close |

```typescript
// Custom keyboard handling with HostListener
@Component({ standalone: true, template: `...` })
export class KeyboardNavComponent {
  @HostListener('keydown.escape') onEscape() { this.close(); }
  @HostListener('keydown.arrowdown') onDown() { this.focusNext(); }
  @HostListener('keydown.arrowup') onUp() { this.focusPrev(); }

  close(): void { /* ... */ }
  focusNext(): void { /* ... */ }
  focusPrev(): void { /* ... */ }
}
```

---

## Reduced Motion Support

```scss
// styles.scss — global
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
// In Angular component
@Injectable({ providedIn: 'root' })
export class MotionService {
  readonly prefersReducedMotion = signal(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
```

---

## ESLint Rules for Angular A11y

```json
// .eslintrc.json — add to template rules
{
  "rules": {
    "@angular-eslint/template/alt-text": "error",
    "@angular-eslint/template/elements-content": "error",
    "@angular-eslint/template/label-has-associated-control": "error",
    "@angular-eslint/template/no-autofocus": "warn",
    "@angular-eslint/template/role-has-required-aria-props": "error",
    "@angular-eslint/template/valid-aria": "error"
  }
}
```

---

## Best Practices

1. **Angular Material first** — built-in ARIA on all components
2. **`LiveAnnouncer`** for dynamic content (search results, toasts, errors)
3. **`FocusTrap` from CDK** — never manually implement focus trapping
4. **Skip navigation** — always add skip link before header
5. **`MatDialog` `restoreFocus: true`** — always set this option
6. **Semantic landmarks** — `<main>`, `<nav>`, `<header>`, `<footer>`
7. **Error announcements** — `role="alert"` or `LiveAnnouncer`
8. **Icon buttons** — always add `aria-label` or `matTooltip`
9. **Never remove `outline`** without providing a visible focus replacement
10. **Test with screen readers** — NVDA + Chrome (Win), VoiceOver + Safari (Mac)

---

## Testing Tools

- **Lint**: `@angular-eslint/template-accessibility-*` rules (compile-time)
- **Automated**: axe DevTools (Chrome), WAVE, Lighthouse
- **Screen readers**: NVDA + Chrome (Windows), VoiceOver + Safari (macOS)
- **Keyboard testing**: Tab, Shift+Tab, Arrow keys, Enter, Escape, Space

---

*Accessibility Compliance — Angular 17+ with Angular Material & CDK a11y*
