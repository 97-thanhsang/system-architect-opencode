# TokenStorageService for Angular 17+

A production-ready JWT token management service for Angular 17+ applications with automatic token refresh, request queuing, and reactive state management using Angular Signals.

## Features

- **Angular Signals** - Reactive state management with `signal()` and `computed()`
- **Memory-Only Storage** - Access tokens stored in memory (never persisted to localStorage)
- **httpOnly Cookies** - Refresh tokens handled securely via httpOnly cookies
- **Automatic Refresh** - Tokens refreshed automatically before expiry (configurable buffer)
- **Request Queuing** - Concurrent requests queued during token refresh
- **Retry Logic** - Exponential backoff retry for failed refresh attempts
- **TypeScript Strict** - Full type safety with strict mode
- **RxJS Integration** - Observable-based async operations
- **Error Handling** - Comprehensive error types and graceful degradation

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         TokenStorageService                      │
├─────────────────────────────────────────────────────────────────┤
│  State (Signals)                                                │
│  ├── isAuthenticated: Signal<boolean>                          │
│  ├── currentUser: Signal<User | null>                          │
│  ├── tokenExpiry: Signal<Date | null>                          │
│  ├── isRefreshing: Signal<boolean>                             │
│  └── refreshError: Signal<string | null>                       │
│                                                                 │
│  In-Memory Storage                                              │
│  ├── _accessToken$: BehaviorSubject<string | null>             │
│  └── _tokenExpiryTimestamp: number | null                      │
│                                                                 │
│  Refresh Management                                             │
│  ├── _refreshTimerSubscription: RxJS timer                     │
│  ├── _pendingRequests: Queue for waiting requests              │
│  └── _refreshTokenInProgress$: boolean state                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    tokenRefreshInterceptor                       │
├─────────────────────────────────────────────────────────────────┤
│  - Adds Bearer token to requests                               │
│  - Handles 401 errors with automatic refresh                   │
│  - Queues requests during refresh                              │
│  - Prevents infinite refresh loops                             │
│  - Graceful degradation on failure                             │
└─────────────────────────────────────────────────────────────────┘
```

## Installation

### 1. Copy Files

Copy the following files to your Angular project:

```
src/app/core/auth/
├── token-storage.service.ts        # Main service
├── token-storage.service.spec.ts   # Unit tests

src/app/core/interceptors/
├── token-refresh.interceptor.ts    # HTTP interceptor

src/app/features/auth/
└── token-usage-examples.ts         # Usage examples
```

### 2. Register Interceptor

Update `app.config.ts`:

```typescript
import { tokenRefreshInterceptor } from './core/interceptors/token-refresh.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        tokenRefreshInterceptor,  // Adds token & handles refresh
        errorInterceptor          // Your existing error handler
      ])
    )
  ]
};
```

### 3. Configure Environment

Add API URL to your environment files:

```typescript
// environments/environment.ts
export const environment = {
  production: false,
  apiUrl: '/api'  // Your API base URL
};
```

## Quick Start

### Basic Usage

```typescript
import { Component, inject } from '@angular/core';
import { TokenStorageService } from './core/auth/token-storage.service';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    @if (isAuthenticated()) {
      <p>Welcome {{ currentUser()?.displayName }}!</p>
      <button (click)="logout()">Logout</button>
    } @else {
      <button (click)="login()">Login</button>
    }
  `
})
export class LoginComponent {
  private tokenStorage = inject(TokenStorageService);

  // Use signals directly in template
  isAuthenticated = this.tokenStorage.isAuthenticated;
  currentUser = this.tokenStorage.currentUser;

  async login() {
    // Call your login API
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    const { accessToken, expiresIn, user } = await response.json();

    // Store tokens
    this.tokenStorage.storeTokens(accessToken, expiresIn, user);
  }

  logout() {
    this.tokenStorage.logout();
  }
}
```

### API Integration

The interceptor automatically:
1. Adds `Authorization: Bearer <token>` header to all API requests
2. Detects 401 responses and attempts token refresh
3. Queues concurrent requests during refresh
4. Retries original request with new token

```typescript
// Your API calls work normally - no token handling needed!
this.http.get('/api/user/profile').subscribe(user => {
  console.log(user);
});
```

## API Reference

### TokenStorageService

#### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `storeTokens` | `(token: string, expiresIn: number, user?: User) => void` | Store tokens and schedule refresh |
| `getAccessToken` | `() => string \| null` | Get current access token |
| `hasAccessToken` | `() => boolean` | Check if token exists |
| `refreshAccessToken` | `() => Observable<string>` | Manually trigger token refresh |
| `scheduleTokenRefresh` | `(expiresIn: number) => void` | Schedule automatic refresh |
| `clearTokens` | `() => void` | Clear all tokens |
| `logout` | `() => void` | Logout and clear session |
| `isTokenExpiringSoon` | `() => boolean` | Check if token needs refresh |
| `getTimeUntilExpiry` | `() => number \| null` | Get milliseconds until expiry |
| `updateConfig` | `(config: Partial<TokenStorageConfig>) => void` | Update service configuration |
| `getConfig` | `() => Readonly<TokenStorageConfig>` | Get current configuration |

#### Signals (Readonly)

| Signal | Type | Description |
|--------|------|-------------|
| `isAuthenticated` | `Signal<boolean>` | Current authentication state |
| `currentUser` | `Signal<User \| null>` | Current user data |
| `tokenExpiry` | `Signal<Date \| null>` | Token expiry timestamp |
| `isRefreshing` | `Signal<boolean>` | Refresh in progress |
| `refreshError` | `Signal<string \| null>` | Last refresh error |

#### Computed Signals

| Signal | Type | Description |
|--------|------|-------------|
| `timeUntilExpiry` | `Signal<number \| null>` | Milliseconds until token expires |
| `isTokenExpiringSoon` | `Signal<boolean>` | True when token expires within buffer |

#### Observables

| Observable | Type | Description |
|------------|------|-------------|
| `accessToken$` | `Observable<string \| null>` | Token changes stream |
| `tokenRefreshCompleted$` | `Observable<string>` | Emits when refresh completes |

### Configuration Options

```typescript
interface TokenStorageConfig {
  refreshBufferSeconds: number;  // Default: 120 (2 minutes)
  maxRetryAttempts: number;      // Default: 3
  retryDelayMs: number;          // Default: 1000
  debugLogging: boolean;         // Default: false
}
```

### Error Types

```typescript
enum TokenStorageErrorType {
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  REFRESH_FAILED = 'REFRESH_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_TOKEN = 'INVALID_TOKEN',
  STORAGE_ERROR = 'STORAGE_ERROR'
}
```

## Interceptor Options

Three interceptor variants are provided:

### 1. `tokenRefreshInterceptor` (Recommended)
- Adds Bearer token to requests
- Handles 401 with automatic refresh
- Queues requests during refresh
- Prevents infinite loops

### 2. `enhancedTokenRefreshInterceptor`
- All features of basic interceptor
- **Proactive refresh**: Refreshes token before 401 occurs
- Best for long-running applications

### 3. `simpleJwtInterceptor`
- Adds Bearer token only
- No refresh logic
- Use with manual token management

## Advanced Usage

### Reactive Effects

```typescript
import { Component, effect, inject } from '@angular/core';
import { TokenStorageService } from './core/auth/token-storage.service';

@Component({...})
export class MyComponent {
  private tokenStorage = inject(TokenStorageService);

  constructor() {
    // React to auth state changes
    effect(() => {
      if (this.tokenStorage.isAuthenticated()) {
        console.log('User logged in:', this.tokenStorage.currentUser());
      }
    });

    // Warn when token expiring
    effect(() => {
      if (this.tokenStorage.isTokenExpiringSoon()) {
        this.showWarning('Your session will expire soon!');
      }
    });
  }
}
```

### Manual Refresh

```typescript
async refreshToken() {
  try {
    const newToken = await firstValueFrom(
      this.tokenStorage.refreshAccessToken()
    );
    console.log('Token refreshed:', newToken);
  } catch (error) {
    if (error instanceof TokenStorageError) {
      console.error('Refresh failed:', error.type, error.message);
    }
  }
}
```

### Request Queuing

```typescript
// If token is refreshing, wait for it to complete
if (this.tokenStorage.isRefreshing()) {
  const token = await this.tokenStorage.queueRequestForRefresh();
  // Use token for sensitive operation
}
```

### Custom Configuration

```typescript
// In app initialization
const tokenStorage = inject(TokenStorageService);

tokenStorage.updateConfig({
  refreshBufferSeconds: 300,  // Refresh 5 min before expiry
  maxRetryAttempts: 5,        // More retries for unstable networks
  retryDelayMs: 2000,         // Longer delay between retries
  debugLogging: true          // Enable for development
});
```

## Backend Integration

### Token Refresh Endpoint

Your backend should provide:

```http
POST /api/auth/refresh
Cookie: refresh_token=<httpOnly cookie>

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600,
  "tokenType": "Bearer"
}
```

### Security Requirements

1. **Access Token**: Short-lived (15-60 minutes), returned in JSON
2. **Refresh Token**: Long-lived (7-30 days), httpOnly, secure, SameSite cookie
3. **CORS**: Enable credentials for cookie transmission

## Security Best Practices

### ✅ Do

- Store access tokens in memory only (not localStorage/sessionStorage)
- Use httpOnly cookies for refresh tokens
- Implement proper CORS with credentials
- Set short token expiry times
- Use HTTPS in production
- Validate tokens on backend

### ❌ Don't

- Store tokens in localStorage (XSS vulnerability)
- Send refresh tokens in request body
- Use tokens without expiration
- Skip HTTPS in production
- Trust client-side token validation only

## Testing

### Unit Tests

Run tests with:

```bash
ng test --include="src/app/core/auth/token-storage.service.spec.ts"
```

### Test Coverage

- Token storage and retrieval
- Automatic refresh scheduling
- Retry logic with exponential backoff
- Request queuing during refresh
- Error handling and edge cases
- Signal reactivity
- Configuration updates

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Migration Guide

### From localStorage-based auth

```typescript
// Old approach
localStorage.setItem('token', token);

// New approach
this.tokenStorage.storeTokens(token, expiresIn, user);
```

### From existing JWT interceptor

Replace your existing interceptor:

```typescript
// app.config.ts
provideHttpClient(
  withInterceptors([
    tokenRefreshInterceptor,  // Replace jwtInterceptor
    errorInterceptor
  ])
)
```

## Troubleshooting

### Token not being added to requests

1. Check interceptor is registered in `app.config.ts`
2. Verify token is stored: `tokenStorage.hasAccessToken()`
3. Check request URL matches API pattern

### Refresh loop on 401

1. Ensure refresh endpoint doesn't return 401
2. Verify refresh token cookie is sent (check Network tab)
3. Check `X-Retry-After-Refresh` header isn't being blocked

### Signals not updating in template

1. Ensure component is using `ChangeDetectionStrategy.OnPush`
2. Use signals directly (not `.getValue()` or `.value`)
3. Check for zone.js issues (use `NgZone.run()`)

## Contributing

When contributing to this service:

1. Maintain TypeScript strict mode compatibility
2. Add unit tests for new features
3. Update this README with API changes
4. Follow Angular style guide
5. Use Angular Signals for state management

## License

MIT License - Feel free to use in commercial and open-source projects.

## Changelog

### v1.0.0 (Initial Release)

- Angular Signals-based state management
- Automatic token refresh with configurable buffer
- HTTP interceptor with request queuing
- Exponential backoff retry logic
- Comprehensive error handling
- Full TypeScript strict mode support
- Unit tests with 90%+ coverage
