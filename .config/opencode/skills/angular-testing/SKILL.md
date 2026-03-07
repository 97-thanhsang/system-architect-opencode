# Skill: angular-testing

> **Source**: analogjs/angular-skills/angular-testing  
> **Version**: 1.0.0  
> **Description**: Angular Testing best practices (Unit & Integration)

---

## Overview

This skill provides guidance for Angular Testing including:
- Component testing with TestBed
- Service testing with mocks
- HTTP testing with HttpTestingController
- Testing with Signals
- Coverage best practices

---

## Quick Start

### Component Test

```typescript
// user-form.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { UserFormComponent } from './user-form.component';

describe('UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserFormComponent, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate form', () => {
    component.userForm.patchValue({
      name: 'John',
      email: 'invalid-email'
    });
    expect(component.userForm.valid).toBeFalsy();
  });
});
```

### Service Test

```typescript
// api.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should fetch users', () => {
    const mockUsers = [{ id: 1, name: 'John' }];

    service.getUsers().subscribe(users => {
      expect(users).toEqual(mockUsers);
    });

    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });

  afterEach(() => {
    httpMock.verify();
  });
});
```

---

## Testing with Signals

```typescript
it('should update signal value', () => {
  const count = signal(0);
  
  count.update(n => n + 1);
  
  expect(count()).toBe(1);
});
```

---

## Best Practices

1. **Test behavior, not implementation**
2. **Use ComponentHarness** for complex component testing
3. **Mock external dependencies**
4. **Test edge cases** (empty states, errors)
5. **Maintain >80% coverage** for critical paths

---

## Running Tests

```bash
ng test              # Run unit tests
ng test --coverage   # Run with coverage report
ng test --watch      # Run in watch mode
```

---

*Part of AnalogJS Angular Skills Collection*
