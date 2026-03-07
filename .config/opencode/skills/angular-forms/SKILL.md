# Skill: angular-forms

> **Source**: analogjs/angular-skills/angular-forms  
> **Version**: 1.0.0  
> **Description**: Angular Forms best practices and generators

---

## Overview

This skill provides guidance and code generation for Angular Forms including:
- Template-driven forms
- Reactive forms (FormGroup, FormControl, FormArray)
- Form validation (built-in and custom validators)
- Dynamic forms
- Form arrays and nested forms

---

## Quick Start

### Generate a Reactive Form

```typescript
// user-form.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
      <input formControlName="name" placeholder="Name" />
      <input formControlName="email" placeholder="Email" type="email" />
      <button type="submit" [disabled]="userForm.invalid">Submit</button>
    </form>
  `
})
export class UserFormComponent {
  userForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      console.log(this.userForm.value);
    }
  }
}
```

---

## Best Practices

1. **Use Reactive Forms** for complex forms with validation
2. **Use FormBuilder** for cleaner form initialization
3. **Separate validators** into reusable functions
4. **Handle async validators** separately from sync validators
5. **Unsubscribe** from valueChanges to prevent memory leaks

---

## Common Patterns

### Custom Validator

```typescript
export function forbiddenNameValidator(nameRe: RegExp): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const forbidden = nameRe.test(control.value);
    return forbidden ? { forbiddenName: { value: control.value } } : null;
  };
}
```

### Form Array

```typescript
this.form = this.fb.group({
  items: this.fb.array([
    this.fb.control('')
  ])
});

get items() {
  return this.form.get('items') as FormArray;
}
```

---

## Integration

Compatible with:
- Angular Material Form Controls
- Custom form components
- State management (Signals, NgRx)

---

*Part of AnalogJS Angular Skills Collection*
