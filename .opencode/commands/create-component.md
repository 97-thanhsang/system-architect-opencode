---
description: "Guided Angular 17+ component creation with standalone, signals, and Angular Material"
argument-hint: "[component-name]"
---

# Create Angular Component

Guided workflow for creating Angular 17+ components following standalone, signals, and Angular Material best practices.

## Pre-flight Checks

1. Detect project structure:
   - Scan for `angular.json` to confirm Angular project
   - Check Angular version (target: 17+)
   - Detect existing component patterns in `src/app/`
   - Check if Angular Material is installed (`@angular/material` in package.json)
   - Detect if Tailwind CSS is configured (`tailwind.config.js`)

2. If not an Angular project:
   ```
   ❌ This command is designed for Angular 17+ projects.
   No angular.json found. Please run /angular-init first.
   ```

## Component Specification

**CRITICAL RULES:**
- Ask ONE question per turn
- Wait for user response before proceeding
- Build complete specification before generating code

### Q1: Component Name (if not provided)

```
What should this component be called?

Guidelines:
- Use kebab-case for selector (e.g., user-card, data-table)
- File will be named: {name}.component.ts
- Class will be: {Name}Component

Enter component name:
```

### Q2: Component Type

```
What type of component is this?

1. Smart (Container) - Handles data fetching, state, business logic
                       Injects services, dispatches actions
2. Dumb (Presentational) - Pure UI, receives data via @Input()
                           No service injections, emits events via @Output()
3. Page - Routed component, top-level for a route
4. Dialog - Angular Material dialog component (MatDialogRef)
5. Shared - Reusable across features (goes in shared/ folder)

Enter number:
```

### Q3: Location

```
Where should this component be created?

Suggested locations based on type:
1. src/app/features/{feature-name}/      (Feature components)
2. src/app/shared/components/            (Shared/Dumb components)
3. src/app/core/                         (Core singletons)
4. Custom path (specify)

Enter number or path:
```

### Q4: Inputs & Outputs

```
What data does this component receive/emit?

For Inputs (data flowing IN), provide:
  name: type (e.g., user: User, isLoading: boolean)

For Outputs (events flowing OUT), provide:
  name: type (e.g., userSelected: User, formSubmitted: void)

Enter props (empty line when done):
```

### Q5: Angular Material Components

```
Which Angular Material components are needed?

1. None - Custom styling only
2. MatCard + MatButton
3. MatTable + MatPaginator + MatSort
4. MatForm (MatFormField, MatInput, MatSelect)
5. MatDialog
6. MatToolbar + MatSidenav
7. Multiple (describe what you need)

Enter number or description:
```

### Q6: Routing

```
Should this component have a route?

1. No routing needed
2. Yes - add to existing routes
3. Yes - create new lazy-loaded route

If adding route, what path? (e.g., /users, /dashboard/profile)
```

## State Management

Create component tracking in `.component-registry.json` if needed.

## Component Generation

### 1. Create Component File

**Angular 17+ Standalone Component:**

```typescript
// {name}.component.ts
import { Component, input, output, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Angular Material imports (based on Q5)
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

// Project imports
// import { {Service} } from '../services/{service}.service';
// import { {Model} } from '../models/{model}.model';

@Component({
  selector: 'app-{name}',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    // Material modules based on Q5
    MatCardModule,
    MatButtonModule,
  ],
  templateUrl: './{name}.component.html',
  styleUrls: ['./{name}.component.scss'],
})
export class {Name}Component implements OnInit {
  // Signal-based inputs (Angular 17+)
  // {inputName} = input<{Type}>();                  // optional
  // {inputName} = input.required<{Type}>();         // required

  // Signal-based outputs (Angular 17+)
  // {outputName} = output<{Type}>();

  // Internal state with signals
  // isLoading = signal(false);
  // data = signal<{Type}[]>([]);

  // Computed values
  // someComputed = computed(() => this.data().length);

  // Service injection (Smart components only)
  // private {service} = inject({Service});

  ngOnInit(): void {
    // Initialization logic
  }
}
```

**For Dumb (Presentational) Component:**

```typescript
// {name}.component.ts
import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { {Model} } from '../models/{model}.model';

@Component({
  selector: 'app-{name}',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './{name}.component.html',
  styleUrls: ['./{name}.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, // Always OnPush for dumb components
})
export class {Name}Component {
  // Signal-based inputs
  data = input.required<{Model}>();
  isLoading = input(false);

  // Signal-based outputs
  selected = output<{Model}>();
  deleted = output<string>(); // id

  onSelect(item: {Model}): void {
    this.selected.emit(item);
  }
}
```

### 2. Create Template File

```html
<!-- {name}.component.html -->
<!-- Angular 17+ control flow syntax -->

@if (isLoading()) {
  <div class="loading-container">
    <mat-spinner />
  </div>
} @else {
  <mat-card>
    <mat-card-header>
      <mat-card-title>{Name}</mat-card-title>
    </mat-card-header>
    <mat-card-content>
      <!-- Component content here -->
    </mat-card-content>
    <mat-card-actions>
      <button mat-button color="primary">Action</button>
    </mat-card-actions>
  </mat-card>
}
```

### 3. Create Stylesheet

```scss
// {name}.component.scss
:host {
  display: block;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}
```

### 4. Create Test File

```typescript
// {name}.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { {Name}Component } from './{name}.component';

describe('{Name}Component', () => {
  let component: {Name}Component;
  let fixture: ComponentFixture<{Name}Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        {Name}Component,
        NoopAnimationsModule,
        // Add mocked services if Smart component:
        // { provide: {Service}, useValue: mock{Service} }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent({Name}Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render content', () => {
    const element = fixture.debugElement.query(By.css('mat-card'));
    expect(element).toBeTruthy();
  });

  // For Smart components - test service integration
  // it('should load data on init', () => {
  //   expect(mock{Service}.getData).toHaveBeenCalled();
  // });

  // For Dumb components - test input/output
  // it('should emit selected event on click', () => {
  //   spyOn(component.selected, 'emit');
  //   const item = { id: '1', name: 'Test' };
  //   component.onSelect(item);
  //   expect(component.selected.emit).toHaveBeenCalledWith(item);
  // });
});
```

### 5. Update Routing (if needed)

```typescript
// In your routes file (e.g., app.routes.ts)
export const routes: Routes = [
  // ...existing routes
  {
    path: '{route-path}',
    loadComponent: () =>
      import('./{path}/{name}.component').then(m => m.{Name}Component),
    // title: '{Page Title}',
  },
];
```

### 6. Export from Index (if shared component)

```typescript
// src/app/shared/components/index.ts
export * from './{name}/{name}.component';
```

## ng generate Command

Provide the actual Angular CLI command to scaffold:

```bash
# Generate the component
ng generate component {path}/{name} --standalone --skip-tests

# Or with full path
ng g c features/{feature}/{name} --standalone --skip-tests
```

> Note: We generate the spec file manually above (with proper testing patterns).
> If you prefer CLI-generated spec: remove `--skip-tests`

## User Review

After generating files:

```
✅ Component Created: {Name}Component

Files created:
- {path}/{name}.component.ts
- {path}/{name}.component.html
- {path}/{name}.component.scss
- {path}/{name}.component.spec.ts

Angular CLI command:
  ng g c {path}/{name} --standalone

Would you like to:
1. Add more inputs/outputs
2. Integrate with a service (creates service too)
3. Add Angular Material components
4. Set up routing for this component
5. Done

Enter number:
```

## Error Handling

- If Angular version < 17: Warn about compatibility, offer to adapt (use `@NgModule` instead of standalone)
- If Angular Material not installed: Suggest `ng add @angular/material`
- If component name conflicts: Suggest renaming with suffix (e.g., `UserProfileComponent` vs `UserCardComponent`)
- If path doesn't exist: Create directory structure automatically
