# Skill: angular-forms

> **Source**: project/angular-skills/angular-forms
> **Version**: 2.0.0
> **Description**: Angular Reactive Forms with inject(), typed FormGroup, custom validators, and Angular Material form fields

---

## Overview

This skill provides guidance for Angular Reactive Forms in Angular 17+, including:
- `inject(FormBuilder)` pattern (no constructor injection)
- **Typed Reactive Forms** (`FormGroup<{}>`, `FormControl<T>`)
- Angular Material form field integration
- Built-in and custom validators
- Async validators (e.g., Jira API validation)
- Dynamic forms and `FormArray`
- Form state with signals

---

## Quick Start — Typed Reactive Form

```typescript
import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
      <mat-form-field appearance="outline">
        <mat-label>Email</mat-label>
        <input matInput formControlName="email" type="email" placeholder="you@example.com" />
        @if (loginForm.controls.email.hasError('required')) {
          <mat-error>Email is required</mat-error>
        }
        @if (loginForm.controls.email.hasError('email')) {
          <mat-error>Enter a valid email address</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Password</mat-label>
        <input matInput formControlName="password" type="password" />
        @if (loginForm.controls.password.hasError('minlength')) {
          <mat-error>Password must be at least 8 characters</mat-error>
        }
      </mat-form-field>

      <button
        mat-raised-button
        color="primary"
        type="submit"
        [disabled]="loginForm.invalid || isSubmitting"
      >
        Log In
      </button>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginFormComponent {
  // ✅ inject() instead of constructor injection
  private fb = inject(NonNullableFormBuilder);

  isSubmitting = false;

  // ✅ Typed FormGroup — TypeScript knows the exact types
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.getRawValue();
      // email: string, password: string — fully typed!
      console.log(email, password);
    }
  }
}
```

---

## Typed Form Controls

### `NonNullableFormBuilder` (Angular 14+)

```typescript
// NonNullableFormBuilder ensures controls never return null
private fb = inject(NonNullableFormBuilder);

// Equivalent to: new FormControl('', { nonNullable: true })
const emailControl = this.fb.control('', Validators.required);
// Type: FormControl<string>  ✅ (not FormControl<string | null>)
```

### Explicit Typed `FormGroup`

```typescript
import { FormGroup, FormControl } from '@angular/forms';

interface ProfileFormValue {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  bio: FormControl<string | null>;
}

const profileForm = new FormGroup<ProfileFormValue>({
  firstName: new FormControl('', { nonNullable: true }),
  lastName: new FormControl('', { nonNullable: true }),
  bio: new FormControl(null),
});

// TypeScript-safe access:
const firstName = profileForm.controls.firstName.value; // type: string
const bio = profileForm.controls.bio.value;             // type: string | null
```

---

## Custom Validators

### Sync Validator

```typescript
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Jira-style issue key validator (e.g., "PROJ-123")
export function jiraKeyValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null; // Let Validators.required handle empty

    const isValid = /^[A-Z]+-\d+$/.test(control.value);
    return isValid ? null : { invalidJiraKey: { value: control.value } };
  };
}

// Usage
taskKey = this.fb.control('', [Validators.required, jiraKeyValidator()]);
```

### Cross-Field Validator

```typescript
import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;

  if (password && confirm && password !== confirm) {
    return { passwordMismatch: true };
  }
  return null;
}

// Usage — applied to the group, not individual controls
resetForm = this.fb.group(
  {
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  },
  { validators: passwordMatchValidator }
);
```

### Async Validator (API-based)

```typescript
import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError, debounceTime, switchMap, first } from 'rxjs/operators';

export function uniqueEmailValidator(authService: AuthService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) return of(null);

    return of(control.value).pipe(
      debounceTime(400),
      switchMap(email => authService.checkEmailExists(email)),
      map(exists => (exists ? { emailTaken: true } : null)),
      catchError(() => of(null)), // Don't block form on network error
      first() // Complete the observable
    );
  };
}
```

---

## Angular Material Form Fields

```typescript
// Required imports for Material forms
imports: [
  ReactiveFormsModule,
  MatFormFieldModule,   // <mat-form-field>
  MatInputModule,       // matInput directive
  MatSelectModule,      // <mat-select>
  MatCheckboxModule,    // <mat-checkbox>
  MatDatepickerModule,  // <mat-datepicker>
  MatAutocompleteModule // <mat-autocomplete>
]
```

### Select with Options

```html
<mat-form-field appearance="outline">
  <mat-label>Role</mat-label>
  <mat-select formControlName="role">
    @for (role of roles; track role.value) {
      <mat-option [value]="role.value">{{ role.label }}</mat-option>
    }
  </mat-select>
  @if (form.controls.role.hasError('required')) {
    <mat-error>Please select a role</mat-error>
  }
</mat-form-field>
```

### Autocomplete (Jira-style search)

```typescript
@Component({
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule],
  template: `
    <mat-form-field appearance="outline">
      <mat-label>Assignee</mat-label>
      <input matInput [formControl]="assigneeControl" [matAutocomplete]="auto" />
      <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayFn">
        @for (user of filteredUsers(); track user.id) {
          <mat-option [value]="user">{{ user.displayName }}</mat-option>
        }
      </mat-autocomplete>
    </mat-form-field>
  `
})
export class AssigneePickerComponent {
  private jiraService = inject(JiraService);

  assigneeControl = inject(NonNullableFormBuilder).control('');

  filteredUsers = toSignal(
    this.assigneeControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      switchMap(query => this.jiraService.searchUsers(query))
    ),
    { initialValue: [] }
  );

  displayFn(user: JiraUser): string {
    return user?.displayName ?? '';
  }
}
```

---

## FormArray — Dynamic Fields

```typescript
@Component({
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <form [formGroup]="form">
      <div formArrayName="labels">
        @for (label of labelsArray.controls; track i; let i = $index) {
          <div class="flex gap-2 items-center">
            <mat-form-field appearance="outline">
              <mat-label>Label {{ i + 1 }}</mat-label>
              <input matInput [formControlName]="i" />
            </mat-form-field>
            <button mat-icon-button type="button" (click)="removeLabel(i)">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        }
      </div>
      <button mat-stroked-button type="button" (click)="addLabel()">
        <mat-icon>add</mat-icon> Add Label
      </button>
    </form>
  `
})
export class LabelFormComponent {
  private fb = inject(NonNullableFormBuilder);

  form = this.fb.group({
    labels: this.fb.array<string>([]),
  });

  get labelsArray() {
    return this.form.controls.labels;
  }

  addLabel(): void {
    this.labelsArray.push(this.fb.control('', Validators.required));
  }

  removeLabel(index: number): void {
    this.labelsArray.removeAt(index);
  }
}
```

---

## Form State with Signals

```typescript
@Component({ standalone: true })
export class IssueFormComponent {
  private fb = inject(NonNullableFormBuilder);

  // Signal for submit state
  isSubmitting = signal(false);
  submitError = signal<string | null>(null);
  submitSuccess = signal(false);

  issueForm = this.fb.group({
    summary: ['', [Validators.required, Validators.maxLength(255)]],
    description: [''],
    priority: ['Medium', Validators.required],
  });

  async onSubmit(): Promise<void> {
    if (this.issueForm.invalid) return;

    this.isSubmitting.set(true);
    this.submitError.set(null);

    try {
      await firstValueFrom(this.jiraService.createIssue(this.issueForm.getRawValue()));
      this.submitSuccess.set(true);
      this.issueForm.reset();
    } catch (err) {
      this.submitError.set('Failed to create issue. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
```

---

## Best Practices

1. **Use `inject(NonNullableFormBuilder)`** — never constructor injection, never `new FormBuilder()`
2. **Typed FormGroup** — always specify types for compile-time safety
3. **`getRawValue()` over `value`** — returns typed object even with disabled controls
4. **Angular Material form fields** — use `appearance="outline"` consistently
5. **`@if` for error messages** — cleaner than `*ngIf` in Angular 17+
6. **Debounce async validators** — prevent excessive API calls
7. **Separate validator functions** — export as standalone functions, not inline
8. **`OnPush` + `signal()`** for submit state — avoids zone.js polling

---

*Angular Reactive Forms v2.0.0 — Angular 17+ with inject() and typed FormGroup*
