---
description: "Generate comprehensive Angular test suites with TestBed, Jasmine/Jest, and coverage validation"
---

# Angular Test Generation

Generate comprehensive, maintainable test suites for Angular 17+ components, services, directives, and pipes. Uses Angular's TestBed, Jasmine/Jest, and Angular Material testing utilities.

## Context

Analyze Angular code structure, identify test scenarios, and create high-quality tests with proper mocking, assertions, and edge case coverage.

## Requirements

$ARGUMENTS

## Instructions

### 1. Analyze Angular Code for Test Generation

Detect what needs to be tested:

```typescript
// Detect file type from Angular decorators
function detectAngularEntityType(filePath: string): string {
  const content = readFile(filePath);
  if (content.includes('@Component')) return 'component';
  if (content.includes('@Injectable')) return 'service';
  if (content.includes('@Directive')) return 'directive';
  if (content.includes('@Pipe')) return 'pipe';
  if (content.includes('@NgModule')) return 'module';
  return 'class';
}
```

### 2. Angular Component Tests (TestBed)

**Smart Component Test (with services):**

```typescript
// {name}.component.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { signal } from '@angular/core';

import { {Name}Component } from './{name}.component';
import { {FeatureService} } from '../services/{feature}.service';
import { {Model} } from '../models/{model}.model';

describe('{Name}Component', () => {
  let component: {Name}Component;
  let fixture: ComponentFixture<{Name}Component>;
  let mockService: jasmine.SpyObj<{FeatureService}>;

  const mockData: {Model}[] = [
    { id: '1', name: 'Test Item 1' },
    { id: '2', name: 'Test Item 2' },
  ];

  beforeEach(async () => {
    // Create spy object for service
    mockService = jasmine.createSpyObj('{FeatureService}', [
      'getAll', 'create', 'update', 'delete'
    ]);
    mockService.getAll.and.returnValue(of(mockData));

    await TestBed.configureTestingModule({
      imports: [
        {Name}Component,          // Standalone component
        NoopAnimationsModule,     // Disable animations in tests
        RouterTestingModule,      // Mock router
      ],
      providers: [
        { provide: {FeatureService}, useValue: mockService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent({Name}Component);
    component = fixture.componentInstance;
    fixture.detectChanges();     // ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should load data on init', () => {
      expect(mockService.getAll).toHaveBeenCalledOnce();
    });

    it('should display loaded data', () => {
      const rows = fixture.debugElement.queryAll(By.css('mat-row, tr'));
      expect(rows.length).toBe(mockData.length);
    });

    it('should show loading state while fetching', fakeAsync(() => {
      // Reset and test loading state
      fixture.detectChanges();
      const loadingEl = fixture.debugElement.query(By.css('[data-testid="loading"]'));
      expect(loadingEl).toBeTruthy();
      tick();
      fixture.detectChanges();
    }));
  });

  describe('user interactions', () => {
    it('should call delete service when delete button clicked', () => {
      mockService.delete.and.returnValue(of(void 0));
      const deleteBtn = fixture.debugElement.query(By.css('[data-testid="delete-btn"]'));
      deleteBtn.triggerEventHandler('click', null);
      expect(mockService.delete).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should show error message on service failure', fakeAsync(() => {
      mockService.getAll.and.returnValue(throwError(() => new Error('API Error')));
      fixture = TestBed.createComponent({Name}Component);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      const errorEl = fixture.debugElement.query(By.css('.error-message'));
      expect(errorEl).toBeTruthy();
    }));
  });
});
```

**Dumb (Presentational) Component Test:**

```typescript
// {name}.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { {Name}Component } from './{name}.component';
import { {Model} } from '../models/{model}.model';

describe('{Name}Component', () => {
  let component: {Name}Component;
  let fixture: ComponentFixture<{Name}Component>;

  const mockItem: {Model} = { id: '1', name: 'Test Item' };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [{Name}Component, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent({Name}Component);
    component = fixture.componentInstance;

    // Set signal-based inputs
    fixture.componentRef.setInput('data', mockItem);
    fixture.componentRef.setInput('isLoading', false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display item name', () => {
    const nameEl = fixture.debugElement.query(By.css('[data-testid="item-name"]'));
    expect(nameEl.nativeElement.textContent).toContain('Test Item');
  });

  it('should show loading spinner when isLoading is true', () => {
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();
    const spinner = fixture.debugElement.query(By.css('mat-spinner, mat-progress-spinner'));
    expect(spinner).toBeTruthy();
  });

  describe('events', () => {
    it('should emit selected event when item clicked', () => {
      const spy = jasmine.createSpy();
      component.selected.subscribe(spy);

      const card = fixture.debugElement.query(By.css('[data-testid="item-card"]'));
      card.triggerEventHandler('click', null);

      expect(spy).toHaveBeenCalledWith(mockItem);
    });

    it('should emit deleted event with correct id', () => {
      const spy = jasmine.createSpy();
      component.deleted.subscribe(spy);

      component.onDelete(mockItem.id);

      expect(spy).toHaveBeenCalledWith('1');
    });
  });

  describe('input validation', () => {
    it('should handle null data gracefully', () => {
      fixture.componentRef.setInput('data', null);
      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });
});
```

### 3. Angular Service Tests

```typescript
// {name}.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { {Name}Service } from './{name}.service';
import { {Model} } from '../models/{model}.model';

describe('{Name}Service', () => {
  let service: {Name}Service;
  let httpMock: HttpTestingController;

  const apiUrl = '/api/{resource}';
  const mockItems: {Model}[] = [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{Name}Service],
    });

    service = TestBed.inject({Name}Service);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // No outstanding HTTP requests
  });

  describe('getAll()', () => {
    it('should return all items', (done) => {
      service.getAll().subscribe(items => {
        expect(items).toEqual(mockItems);
        expect(items.length).toBe(2);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockItems);
    });

    it('should handle HTTP error', (done) => {
      service.getAll().subscribe({
        error: (err) => {
          expect(err.status).toBe(500);
          done();
        }
      });

      httpMock.expectOne(apiUrl).flush('Server Error', {
        status: 500,
        statusText: 'Internal Server Error',
      });
    });
  });

  describe('create()', () => {
    it('should POST and return new item', (done) => {
      const newItem = { name: 'New Item' };
      const created = { id: '3', ...newItem };

      service.create(newItem).subscribe(item => {
        expect(item).toEqual(created);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newItem);
      req.flush(created);
    });
  });

  describe('delete()', () => {
    it('should DELETE by id', (done) => {
      service.delete('1').subscribe(() => done());

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
```

### 4. Angular Pipe Tests

```typescript
// {name}.pipe.spec.ts
import { {Name}Pipe } from './{name}.pipe';

describe('{Name}Pipe', () => {
  let pipe: {Name}Pipe;

  beforeEach(() => {
    pipe = new {Name}Pipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform value correctly', () => {
    expect(pipe.transform('test')).toBe('EXPECTED_OUTPUT');
  });

  it('should return empty string for null input', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('should handle edge cases', () => {
    expect(pipe.transform('')).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });
});
```

### 5. Angular Directive Tests

```typescript
// {name}.directive.spec.ts
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { {Name}Directive } from './{name}.directive';

// Host component for testing the directive
@Component({
  template: `<div app{Name} [value]="testValue">Content</div>`,
  standalone: true,
  imports: [{Name}Directive],
})
class TestHostComponent {
  testValue = 'test';
}

describe('{Name}Directive', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let directiveEl: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    directiveEl = fixture.debugElement.query(By.directive({Name}Directive));
    fixture.detectChanges();
  });

  it('should create directive', () => {
    expect(directiveEl).toBeTruthy();
  });

  it('should apply styling when value is set', () => {
    expect(directiveEl.nativeElement.classList).toContain('expected-class');
  });
});
```

### 6. Coverage Analysis for Angular

```bash
# Run tests with coverage
ng test --code-coverage --watch=false

# Coverage report location: coverage/lcov-report/index.html

# Or with Jest (if configured)
jest --coverage --coverageDirectory=coverage
```

**Coverage thresholds in `angular.json`:**

```json
{
  "test": {
    "options": {
      "codeCoverage": true,
      "codeCoverageExclude": [
        "src/environments/**",
        "src/main.ts",
        "**/*.module.ts",
        "**/*.mock.ts"
      ]
    }
  }
}
```

### 7. Angular Testing Utilities Quick Reference

```typescript
// Common imports
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

// Set signal input:
fixture.componentRef.setInput('inputName', value);

// Trigger DOM events:
element.triggerEventHandler('click', { target: element.nativeElement });
element.nativeElement.dispatchEvent(new Event('input'));

// Query DOM:
fixture.debugElement.query(By.css('.class-name'));
fixture.debugElement.queryAll(By.directive(SomeDirective));
fixture.nativeElement.querySelector('[data-testid="name"]');

// Async testing:
fakeAsync(() => { tick(1000); fixture.detectChanges(); });
waitForAsync(() => { fixture.whenStable().then(() => { ... }); });
```

### 8. Mock Generation for Angular

```typescript
// Generate service mock
function createServiceMock<T>(service: Type<T>, methods: string[]): jasmine.SpyObj<T> {
  return jasmine.createSpyObj<T>(service.name, methods);
}

// Example usage:
const mockUserService = jasmine.createSpyObj('UserService', [
  'getCurrentUser',
  'updateUser',
  'logout',
]);
mockUserService.getCurrentUser.and.returnValue(of({ id: '1', name: 'Test' }));
```

## Output Format

1. **Component Spec Files** - With TestBed setup for standalone components
2. **Service Spec Files** - With HttpClientTestingModule and HTTP mocking
3. **Pipe/Directive Specs** - Simple unit test patterns
4. **Coverage Report** - Current gaps with `ng test --code-coverage`
5. **ng test command** - Run instructions

Focus on testing **behavior** (what the component does) not **implementation** (how it does it).
