---
description: "Generate an Angular 17+ injectable service with HTTP client, error handling, and proper typing"
argument-hint: "<service-name> [--type http|state|utility] [--path src/app/core/...]"
---

# Generate Angular Service

Generate an Angular 17+ injectable service using the `inject()` function pattern, with HTTP client, RxJS error handling, and TypeScript interfaces.

## Usage

```
/generate-service <name> [--type http|state|utility] [--path path/to/folder]
```

**Examples:**
```
/generate-service jira-auth
/generate-service issue --type http
/generate-service user-preferences --type state
/generate-service date-format --type utility
/generate-service jira-board --type http --path src/app/features/dashboard
```

---

## Step 1: Parse Arguments

Extract from `$ARGUMENTS`:
- `SERVICE_NAME`: kebab-case name (e.g., `jira-auth`)
- `SERVICE_CLASS`: PascalCase (e.g., `JiraAuthService`)
- `TYPE`: one of `http` | `state` | `utility` (default: `http`)
- `TARGET_PATH`: where to create the service

Defaults by type:
- `--type http` → `src/app/core/services/{name}.service.ts`
- `--type state` → `src/app/core/services/{name}.service.ts`
- `--type utility` → `src/app/shared/services/{name}.service.ts`
- `--path` provided → use that path

---

## Step 2: Generate Using Angular CLI

```bash
ng generate service $TARGET_PATH/$SERVICE_NAME \
  --skip-tests=false
```

This creates:
```
$TARGET_PATH/
├── $SERVICE_NAME.service.ts
└── $SERVICE_NAME.service.spec.ts
```

---

## Step 3: Update Service TypeScript

Replace the generated service with the appropriate template based on `--type`:

### Template: `http` (Jira API Service)

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// TODO: Define your response interfaces
export interface $SERVICE_CLASSItem {
  id: string;
  // Add fields based on Jira API response
}

export interface $SERVICE_CLASSListResponse {
  values: $SERVICE_CLASSItem[];
  total: number;
  maxResults: number;
  startAt: number;
}

@Injectable({
  providedIn: 'root',
})
export class $SERVICE_CLASSService {
  private http = inject(HttpClient);
  private apiBaseUrl = environment.jiraApiBaseUrl;

  /**
   * Get all items
   */
  getAll(cloudId: string): Observable<$SERVICE_CLASSItem[]> {
    return this.http
      .get<$SERVICE_CLASSListResponse>(
        `${this.apiBaseUrl}/ex/jira/${cloudId}/rest/api/3/$SERVICE_NAME`
      )
      .pipe(
        map(response => response.values),
        catchError(this.handleError)
      );
  }

  /**
   * Get a single item by ID
   */
  getById(cloudId: string, id: string): Observable<$SERVICE_CLASSItem> {
    return this.http
      .get<$SERVICE_CLASSItem>(
        `${this.apiBaseUrl}/ex/jira/${cloudId}/rest/api/3/$SERVICE_NAME/${id}`
      )
      .pipe(catchError(this.handleError));
  }

  /**
   * Error handler for HTTP requests
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.status === 401) {
      errorMessage = 'Unauthorized — please log in again';
    } else if (error.status === 403) {
      errorMessage = 'Forbidden — insufficient permissions';
    } else if (error.status === 404) {
      errorMessage = 'Resource not found';
    } else if (error.status === 429) {
      errorMessage = 'Rate limit exceeded — please try again later';
    } else if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = `Server error ${error.status}: ${error.message}`;
    }

    console.error('[JiraService] Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
```

### Template: `state` (State Management Service with Signals)

```typescript
import { Injectable, computed, signal } from '@angular/core';

// TODO: Define your state interface
export interface $SERVICE_CLASSState {
  items: $SERVICE_CLASSItem[];
  selectedItem: $SERVICE_CLASSItem | null;
  isLoading: boolean;
  error: string | null;
}

export interface $SERVICE_CLASSItem {
  id: string;
  // Add your fields
}

const INITIAL_STATE: $SERVICE_CLASSState = {
  items: [],
  selectedItem: null,
  isLoading: false,
  error: null,
};

@Injectable({
  providedIn: 'root',
})
export class $SERVICE_CLASSService {
  // --- Private state signal ---
  private state = signal<$SERVICE_CLASSState>(INITIAL_STATE);

  // --- Public computed selectors ---
  readonly items = computed(() => this.state().items);
  readonly selectedItem = computed(() => this.state().selectedItem);
  readonly isLoading = computed(() => this.state().isLoading);
  readonly error = computed(() => this.state().error);
  readonly hasItems = computed(() => this.state().items.length > 0);

  // --- State mutations ---
  setItems(items: $SERVICE_CLASSItem[]): void {
    this.state.update(s => ({ ...s, items, isLoading: false, error: null }));
  }

  selectItem(item: $SERVICE_CLASSItem | null): void {
    this.state.update(s => ({ ...s, selectedItem: item }));
  }

  setLoading(isLoading: boolean): void {
    this.state.update(s => ({ ...s, isLoading }));
  }

  setError(error: string | null): void {
    this.state.update(s => ({ ...s, error, isLoading: false }));
  }

  reset(): void {
    this.state.set(INITIAL_STATE);
  }
}
```

### Template: `utility` (Pure Utility / Helper Service)

```typescript
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class $SERVICE_CLASSService {
  /**
   * TODO: Add utility methods
   * Utility services contain pure functions with no side effects.
   * They typically don't inject other services.
   */

  // Example:
  // formatDate(date: Date): string {
  //   return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  // }

  // isValidJiraKey(key: string): boolean {
  //   return /^[A-Z]+-\d+$/.test(key);
  // }
}
```

---

## Step 4: Generate Spec File

Replace the generated spec with a proper Angular 17+ test:

### For `http` type:

```typescript
import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { $SERVICE_CLASSService } from './$SERVICE_NAME.service';
import { environment } from '../../../environments/environment';

describe('$SERVICE_CLASSService', () => {
  let service: $SERVICE_CLASSService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject($SERVICE_CLASSService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verify no outstanding requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all items', () => {
    const mockCloudId = 'test-cloud-id';
    const mockResponse = {
      values: [{ id: '1' }],
      total: 1,
      maxResults: 50,
      startAt: 0,
    };

    service.getAll(mockCloudId).subscribe(items => {
      expect(items.length).toBe(1);
      expect(items[0].id).toBe('1');
    });

    const req = httpMock.expectOne(
      `${environment.jiraApiBaseUrl}/ex/jira/${mockCloudId}/rest/api/3/$SERVICE_NAME`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should handle 401 error', () => {
    const mockCloudId = 'test-cloud-id';

    service.getAll(mockCloudId).subscribe({
      error: err => {
        expect(err.message).toContain('Unauthorized');
      },
    });

    const req = httpMock.expectOne(
      `${environment.jiraApiBaseUrl}/ex/jira/${mockCloudId}/rest/api/3/$SERVICE_NAME`
    );
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });
});
```

### For `state` type:

```typescript
import { TestBed } from '@angular/core/testing';
import { $SERVICE_CLASSService, $SERVICE_CLASSItem } from './$SERVICE_NAME.service';

describe('$SERVICE_CLASSService', () => {
  let service: $SERVICE_CLASSService;

  const mockItem: $SERVICE_CLASSItem = { id: '1' };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject($SERVICE_CLASSService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have empty initial state', () => {
    expect(service.items()).toEqual([]);
    expect(service.isLoading()).toBeFalse();
    expect(service.error()).toBeNull();
  });

  it('should set items', () => {
    service.setItems([mockItem]);
    expect(service.items()).toEqual([mockItem]);
    expect(service.hasItems()).toBeTrue();
  });

  it('should select item', () => {
    service.selectItem(mockItem);
    expect(service.selectedItem()).toEqual(mockItem);
  });

  it('should reset state', () => {
    service.setItems([mockItem]);
    service.reset();
    expect(service.items()).toEqual([]);
  });
});
```

### For `utility` type:

```typescript
import { TestBed } from '@angular/core/testing';
import { $SERVICE_CLASSService } from './$SERVICE_NAME.service';

describe('$SERVICE_CLASSService', () => {
  let service: $SERVICE_CLASSService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject($SERVICE_CLASSService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // TODO: Add unit tests for each utility method
});
```

---

## Completion

After generating the service, output:

```
✅ Generated: $SERVICE_NAME ($TYPE service)

## Files Created
- $TARGET_PATH/$SERVICE_NAME.service.ts
- $TARGET_PATH/$SERVICE_NAME.service.spec.ts

## Usage

**Inject in a component:**
import { $SERVICE_CLASSService } from '$IMPORT_PATH';

// Inside component class:
private $SERVICE_NAME = inject($SERVICE_CLASSService);

**Inject in another service:**
@Injectable({ providedIn: 'root' })
export class MyService {
  private $SERVICE_NAME = inject($SERVICE_CLASSService);
}

**For HTTP service — use in component:**
ngOnInit(): void {
  this.$SERVICE_NAME.getAll(this.cloudId).subscribe(items => {
    // handle items
  });
}

// Or with async pipe (preferred with OnPush):
items$ = this.$SERVICE_NAME.getAll(this.cloudId);
// Template: *ngFor="let item of items$ | async"

**For state service — use signals in template:**
// Component:
items = this.$SERVICE_NAME.items; // computed signal

// Template (Angular 17+):
@for (item of items(); track item.id) {
  <div>{{ item.id }}</div>
}

## Next Steps
1. Define the actual data interfaces (replace TODO comments)
2. Update API endpoint URLs to match Jira REST API v3
3. Run: ng test --include $TARGET_PATH/$SERVICE_NAME.service.spec.ts
```
