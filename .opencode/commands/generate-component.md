---
description: "Generate an Angular 17+ standalone component with signals, Angular Material, and proper typing"
argument-hint: "<component-name> [--type smart|dumb|page|dialog] [--path src/app/features/...]"
---

# Generate Angular Component

Generate an Angular 17+ standalone component following the project's conventions: signals-based inputs/outputs, `ChangeDetectionStrategy.OnPush`, Angular Material, and Tailwind CSS.

## Usage

```
/generate-component <name> [--type smart|dumb|page|dialog] [--path path/to/folder]
```

**Examples:**
```
/generate-component user-profile
/generate-component task-list --type smart
/generate-component confirm-dialog --type dialog
/generate-component login --type page --path src/app/features/auth
```

---

## Step 1: Parse Arguments

Extract from `$ARGUMENTS`:
- `COMPONENT_NAME`: kebab-case name (e.g., `user-profile`)
- `COMPONENT_CLASS`: PascalCase (e.g., `UserProfileComponent`)
- `TYPE`: one of `smart` | `dumb` | `page` | `dialog` (default: `dumb`)
- `TARGET_PATH`: where to create the component (default: `src/app/shared/components/{name}/`)

If `--path` is provided, use that. Otherwise use defaults:
- `--type page` → `src/app/features/{name}/`
- `--type smart` → `src/app/features/{name}/`
- `--type dumb` → `src/app/shared/components/{name}/`
- `--type dialog` → `src/app/shared/components/dialogs/{name}/`

---

## Step 2: Generate Using Angular CLI

```bash
ng generate component $TARGET_PATH/$COMPONENT_NAME \
  --standalone \
  --change-detection OnPush \
  --skip-tests=false \
  --inline-template=false \
  --inline-style=false
```

This creates:
```
$TARGET_PATH/$COMPONENT_NAME/
├── $COMPONENT_NAME.component.ts
├── $COMPONENT_NAME.component.html
├── $COMPONENT_NAME.component.scss
└── $COMPONENT_NAME.component.spec.ts
```

---

## Step 3: Update Component TypeScript

Replace the generated `$COMPONENT_NAME.component.ts` with the appropriate template based on `--type`:

### Template: `dumb` (Presentational Component — default)

```typescript
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

// TODO: Add Angular Material imports as needed
// import { MatCardModule } from '@angular/material/card';
// import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-$COMPONENT_NAME',
  standalone: true,
  imports: [
    CommonModule,
    // Add Material modules here
  ],
  templateUrl: './$COMPONENT_NAME.component.html',
  styleUrl: './$COMPONENT_NAME.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class $COMPONENT_CLASSComponent {
  // --- Inputs (Angular 17+ signal-based) ---
  // data = input<DataType>(); // optional input
  // data = input.required<DataType>(); // required input

  // --- Outputs ---
  // actionClicked = output<void>();
  // itemSelected = output<DataType>();
}
```

### Template: `smart` (Container/Smart Component)

```typescript
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

// TODO: Import your service
// import { SomeService } from '../../core/services/some.service';

@Component({
  selector: 'app-$COMPONENT_NAME',
  standalone: true,
  imports: [
    CommonModule,
    // Add child components and Material modules here
  ],
  templateUrl: './$COMPONENT_NAME.component.html',
  styleUrl: './$COMPONENT_NAME.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class $COMPONENT_CLASSComponent implements OnInit {
  // --- Services ---
  // private someService = inject(SomeService);

  // --- State (use async pipe in template) ---
  // data$: Observable<DataType[]> | undefined;

  ngOnInit(): void {
    // this.data$ = this.someService.getAll();
  }
}
```

### Template: `page` (Routable Page Component)

```typescript
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-$COMPONENT_NAME',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    // Add more Material + child component imports
  ],
  templateUrl: './$COMPONENT_NAME.component.html',
  styleUrl: './$COMPONENT_NAME.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class $COMPONENT_CLASSComponent implements OnInit {
  private router = inject(Router);

  ngOnInit(): void {
    // Initialize page data
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
```

### Template: `dialog` (Angular Material Dialog)

```typescript
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface $COMPONENT_CLASSDialogData {
  title: string;
  message: string;
}

export interface $COMPONENT_CLASSDialogResult {
  confirmed: boolean;
}

@Component({
  selector: 'app-$COMPONENT_NAME',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
  ],
  templateUrl: './$COMPONENT_NAME.component.html',
  styleUrl: './$COMPONENT_NAME.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class $COMPONENT_CLASSComponent {
  private dialogRef = inject(MatDialogRef<$COMPONENT_CLASSComponent, $COMPONENT_CLASSDialogResult>);
  protected data: $COMPONENT_CLASSDialogData = inject(MAT_DIALOG_DATA);

  confirm(): void {
    this.dialogRef.close({ confirmed: true });
  }

  cancel(): void {
    this.dialogRef.close({ confirmed: false });
  }
}
```

---

## Step 4: Generate HTML Template

Based on `--type`, also update the HTML template:

### `dumb` / `smart` template:

```html
<!-- $COMPONENT_NAME.component.html -->
<div class="flex flex-col gap-4 p-4">
  <!-- TODO: Add component content -->
  <p class="text-gray-600">$COMPONENT_CLASS works!</p>
</div>
```

### `page` template:

```html
<!-- $COMPONENT_NAME.component.html -->
<div class="container mx-auto p-6">
  <mat-card>
    <mat-card-header>
      <mat-card-title><!-- Page Title --></mat-card-title>
    </mat-card-header>
    <mat-card-content class="mt-4">
      <!-- TODO: Add page content -->
    </mat-card-content>
  </mat-card>
</div>
```

### `dialog` template:

```html
<!-- $COMPONENT_NAME.component.html -->
<h2 mat-dialog-title>{{ data.title }}</h2>

<mat-dialog-content>
  <p>{{ data.message }}</p>
</mat-dialog-content>

<mat-dialog-actions align="end">
  <button mat-button (click)="cancel()">Cancel</button>
  <button mat-raised-button color="primary" (click)="confirm()">Confirm</button>
</mat-dialog-actions>
```

---

## Step 5: Update Spec File

Replace the generated spec with a proper Angular 17+ test:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { $COMPONENT_CLASSComponent } from './$COMPONENT_NAME.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('$COMPONENT_CLASSComponent', () => {
  let component: $COMPONENT_CLASSComponent;
  let fixture: ComponentFixture<$COMPONENT_CLASSComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        $COMPONENT_CLASSComponent,
        NoopAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent($COMPONENT_CLASSComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // TODO: Add tests for inputs, outputs, and interactions
});
```

---

## Completion

After generating the component, output:

```
✅ Generated: $COMPONENT_NAME ($TYPE component)

## Files Created
- $TARGET_PATH/$COMPONENT_NAME/$COMPONENT_NAME.component.ts
- $TARGET_PATH/$COMPONENT_NAME/$COMPONENT_NAME.component.html
- $TARGET_PATH/$COMPONENT_NAME/$COMPONENT_NAME.component.scss
- $TARGET_PATH/$COMPONENT_NAME/$COMPONENT_NAME.component.spec.ts

## Next Steps

**To use this component in a parent template:**
<app-$COMPONENT_NAME></app-$COMPONENT_NAME>

**To import in another standalone component:**
imports: [$COMPONENT_CLASSComponent]

**To add a route (for page type):**
{
  path: '$COMPONENT_NAME',
  loadComponent: () =>
    import('$TARGET_PATH/$COMPONENT_NAME/$COMPONENT_NAME.component')
      .then(m => m.$COMPONENT_CLASSComponent)
}

**To open as dialog (for dialog type):**
const dialogRef = this.dialog.open($COMPONENT_CLASSComponent, {
  data: { title: 'Confirm', message: 'Are you sure?' } as $COMPONENT_CLASSDialogData,
});
```
