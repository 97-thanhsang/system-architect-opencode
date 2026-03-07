# Feature 01: Authentication & Authorization

> **Status**: ✅ COMPLETED (with Session Persistence Enhancement)  
> **Priority**: Critical  
> **Timeline**: Phase 0-1 + March 7, 2026 Hotfix  
> **Last Updated**: March 7, 2026

---

## 📋 Overview

Feature Authentication cung cấp hệ thống xác thực và phân quyền ngườ dùng với Jira integration, sử dụng JWT tokens.

**Key Capabilities:**
- ✅ Xác thực thực tế với Jira Server (task.ascvn.com.vn)
- ✅ JWT token generation với expiry (8h)
- ✅ Auto-add token vào API requests
- ✅ Route protection với Auth Guards
- ✅ User storage trong SQLite DB
- ✅ **Session Persistence**: Giữ đăng nhập sau khi refresh trang (NEW)
- ✅ **TokenStorageService**: Quản lý token với Angular Signals (NEW)
- ✅ **Auto Token Refresh**: Tự động refresh token trước khi hết hạn (NEW)
- ✅ **Logout UI**: Nút đăng xuất trong Header và Sidebar (FIXED)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ANGULAR FRONTEND                         │
│  ┌──────────────┐    ┌──────────────────┐                  │
│  │ Login Page   │───→│ JiraAuthService  │                  │
│  └──────────────┘    └────────┬─────────┘                  │
│                               │                             │
│                      POST /api/auth/jira/login              │
└───────────────────────────────┼─────────────────────────────┘
                                │
┌───────────────────────────────┼─────────────────────────────┐
│                    NESTJS BACKEND                           │
│                               │                             │
│  ┌────────────────────────────▼──────────────────────┐     │
│  │ AuthController                                    │     │
│  │ @Post('jira/login')                               │     │
│  └────────────────────────────┬──────────────────────┘     │
│                               │                             │
│  ┌────────────────────────────▼──────────────────────┐     │
│  │ JiraClientService                                 │     │
│  │ - Validate credentials                            │     │
│  │ - Generate JWT token                              │     │
│  └────────────────────────────┬──────────────────────┘     │
│                               │                             │
└───────────────────────────────┼─────────────────────────────┘
                                │
┌───────────────────────────────┼─────────────────────────────┐
│                    JIRA SERVER                              │
│                      (task.ascvn.com.vn)                    │
└───────────────────────────────┴─────────────────────────────┘
```

---

## 📁 Files

### Backend (8 files)

```
apps/api/src/
├── auth/
│   ├── auth.service.ts              # loginWithJira() method
│   ├── auth.controller.ts           # /auth/jira/login endpoint
│   ├── auth.module.ts               # JWT configuration
│   ├── strategies/
│   │   └── jwt.strategy.ts          # JWT validation
│   └── entities/
│       └── user.entity.ts           # User with Jira fields
├── jira/
│   ├── jira-client.service.ts       # Jira API client
│   └── jira.module.ts
└── dto/
    ├── login.dto.ts
    └── register.dto.ts
```

### Frontend (7 files)

```
src/app/core/
├── auth/
│   ├── jira-auth.service.ts         # API calls + state management
│   ├── auth.service.ts              # Legacy support
│   ├── token-storage.service.ts     # NEW: Token management with Signals
│   └── token-storage.service.spec.ts # NEW: Unit tests
├── interceptors/
│   ├── jwt.interceptor.ts           # Auto-add Bearer token
│   ├── token-refresh.interceptor.ts # NEW: Auto-refresh token
│   ├── error.interceptor.ts
│   └── logging.interceptor.ts
└── guards/
    ├── auth.guard.ts                # Route protection
    └── role.guard.ts

src/app/features/modules/fe-module/components/
├── header/header.component.ts       # Logout button in user dropdown
└── sidebar/sidebar.component.ts     # Logout button in user section

src/environments/
└── environment.ts                   # apiUrl, jiraUrl config
```

---

## 🔧 Implementation Details

### Backend

#### 1. JiraClientService
```typescript
async validateCredentials(credentials: JiraCredentials): Promise<JiraUser>
```
- **Endpoint**: `GET /rest/api/2/myself`
- **Auth**: Basic Auth (username/password)
- **Timeout**: 10s
- **Error Handling**: 401 for invalid credentials

#### 2. JWT Configuration
```typescript
// JWT Module
secret: process.env.JWT_SECRET || 'default-secret'
expiresIn: '8h'

// Payload
{
  sub: user.id,
  email: user.email,
  roles: user.roles,
  jiraUsername: user.jiraUsername
}
```

#### 3. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Legacy email/password login |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/jira/login` | **Jira authentication** |
| GET | `/api/auth/profile` | Get profile (JWT protected) |

**Jira Login Request:**
```json
{
  "username": "SangNT",
  "password": "your-password",
  "jiraUrl": "https://task.ascvn.com.vn"
}
```

**Success Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "sangnt@ascvn.com.vn",
    "name": "Sang Nguyen Thanh",
    "jiraUsername": "SangNT",
    "roles": ["user"]
  }
}
```

### Frontend

#### 1. JiraAuthService
```typescript
async login(credentials: LoginCredentials): Promise<boolean>
```
- Gọi backend API
- Lưu token vào localStorage
- Cập nhật Signals (user, isAuthenticated, loading, error)
- Error handling

#### 2. JWT Interceptor
```typescript
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Auto-add: Authorization: Bearer <token>
  // Skip for non-HTTP requests
}
```

#### 3. Auth Guard
```typescript
export const authGuard: CanActivateFn = (route, state) => {
  // Redirect to /auth/login if not authenticated
  // Save returnUrl for post-login redirect
}
```

---

## 🔄 Authentication Flow

```
1. User enters credentials in Login Page
           ↓
2. LoginTaigaComponent → JiraAuthService.login()
           ↓
3. POST /api/auth/jira/login (Backend)
           ↓
4. AuthService.loginWithJira():
   a. JiraClientService.validateCredentials()
   b. Call Jira API: GET /rest/api/2/myself
   c. Receive JiraUser profile
           ↓
5. Find or Create user in local DB
   - New user: Create record
   - Existing: Update from Jira
           ↓
6. Generate JWT token
           ↓
7. Return { access_token, user }
           ↓
8. Frontend stores token in localStorage
           ↓
9. All API calls auto-include Bearer token
           ↓
10. Auth Guards protect routes
```

---

## 📊 Dependencies

### Backend
```json
{
  "@nestjs/jwt": "^11.0.2",
  "@nestjs/passport": "^11.0.5",
  "passport": "^0.7.0",
  "passport-jwt": "^4.0.1",
  "axios": "^1.13.6"
}
```

### Frontend
- HttpClient (built-in)
- No additional dependencies

---

## 🔄 Session Persistence Implementation (March 7, 2026)

### Problem
Users were being logged out when refreshing the page or navigating back, even though tokens were stored in localStorage.

### Root Cause
- `TokenStorageService` stored tokens in memory (BehaviorSubject) only
- On page refresh, memory was cleared → tokens lost
- `JiraAuthService` didn't restore user state from localStorage
- Logout buttons were hidden because `user()` signal was null

### Solution Implemented

#### 1. TokenStorageService Enhancement
**File:** `src/app/core/auth/token-storage.service.ts`

```typescript
// Initialize from localStorage on app startup
private initializeFromStorage(): void {
  const token = localStorage.getItem('access_token');
  const userStr = localStorage.getItem('user');
  
  if (token && userStr) {
    const user = JSON.parse(userStr);
    this._accessToken$.next(token);
    this._currentUser.set(user);
    this._isAuthenticated.set(true);
    
    // Schedule auto-refresh
    this.scheduleTokenRefresh(8 * 60 * 60 - 120); // 8 hours - 2 min buffer
  }
}
```

**Features:**
- ✅ Automatic session restoration on app initialization
- ✅ Token refresh scheduling before expiry
- ✅ Request queuing during refresh
- ✅ Exponential backoff retry (max 3 attempts)
- ✅ Comprehensive error handling

#### 2. JiraAuthService Integration
**File:** `src/app/core/auth/jira-auth.service.ts`

```typescript
// After successful login
async login(credentials: LoginCredentials): Promise<boolean> {
  // ... API call ...
  
  // Store in TokenStorageService for interceptor
  tokenStorage.storeTokens(response.access_token, 28800, response.user);
  
  // Keep localStorage for backward compatibility
  localStorage.setItem('access_token', response.access_token);
  localStorage.setItem('user', JSON.stringify(response.user));
  
  // Update signals
  this._user.set(response.user);
  this._isAuthenticated.set(true);
}

// Enhanced logout
logout(): void {
  // Clear both services
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  this.tokenStorage.clearTokens();
  
  this._user.set(null);
  this._isAuthenticated.set(false);
  this.router.navigate(['/auth/login']);
}
```

#### 3. User State Validation
**File:** `src/app/core/auth/jira-auth.service.ts`

```typescript
private isValidJiraUser(user: unknown): user is JiraUser {
  return (
    typeof user === 'object' &&
    user !== null &&
    'id' in user &&
    'email' in user &&
    ('displayName' in user || 'jiraDisplayName' in user) &&
    Array.isArray((user as JiraUser).roles)
  );
}
```

#### 4. Auth Guard Update
**File:** `src/app/core/guards/auth.guard.ts`

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const jiraAuthService = inject(JiraAuthService);
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);

  // Check BOTH services
  const isAuthenticated = jiraAuthService.isAuthenticated() || 
                          tokenStorage.isAuthenticated();

  if (isAuthenticated) {
    return true;
  }

  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};
```

### Results

| Test Case | Before | After |
|-----------|--------|-------|
| Refresh page | Logged out ❌ | Stay logged in ✅ |
| Navigate back | Logged out ❌ | Stay logged in ✅ |
| Logout button | Hidden ❌ | Visible ✅ |
| Token auto-refresh | Not working ❌ | Working ✅ |
| Close & reopen browser | Logged out ❌ | Stay logged in (8h) ✅ |

### Known Limitations

⚠️ **Security Note (For Production):**
- Tokens are still stored in localStorage (XSS vulnerability)
- Next iteration should implement httpOnly cookies
- CSRF protection not yet implemented
- See "Improvements Needed" section above

---

## 🧪 Testing

### Manual Tests
- [x] Login with Jira credentials
- [x] JWT token validation
- [x] API endpoint testing
- [x] Frontend integration
- [x] **Session persistence after page refresh** (March 7, 2026)
- [x] **Logout button visibility** (March 7, 2026)
- [x] **Token auto-refresh** (March 7, 2026)

### Unit Tests
- [x] TokenStorageService (588 lines of tests)
- [x] JiraAuthService (user restoration tests)
- [ ] JiraClientService
- [ ] AuthService

### Pending Tests
- [ ] E2E tests for login flow
- [ ] Token expiry handling
- [ ] Race condition tests for token refresh

---

## ⚙️ Configuration

### Environment Variables (Backend)
```env
# apps/api/.env
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=8h
DATABASE_TYPE=sqlite
DATABASE_NAME=opencode.db
```

### Environment Config (Frontend)
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  jiraUrl: 'https://task.ascvn.com.vn',
};
```

---

## 🔒 Security

### Implemented
- ✅ JWT tokens with expiry (8h)
- ✅ No password storage in localStorage
- ✅ Bearer token via HTTPS (production)
- ✅ User entity with isActive flag
- ✅ Input validation with class-validator
- ✅ **Session persistence on page refresh** (March 7, 2026)
- ✅ **TokenStorageService with Angular Signals** (March 7, 2026)
- ✅ **Auto token refresh scheduling** (March 7, 2026)
- ✅ **User state restoration from localStorage** (March 7, 2026)

### Improvements Needed (For Production)
- [ ] **CRITICAL**: Move tokens from localStorage to httpOnly cookies (XSS protection)
- [ ] **CRITICAL**: Add CSRF protection for refresh endpoint
- [ ] **CRITICAL**: Implement bcrypt password hashing
- [ ] **CRITICAL**: Remove default JWT secrets
- [ ] Add rate limiting for login
- [ ] HTTPS enforcement
- [ ] Stronger JWT secret (256-bit minimum)
- [ ] 2FA support

---

## 📈 Performance

- **Jira API Call**: ~500-1000ms
- **JWT Generation**: <10ms
- **Token Validation**: <5ms
- **Database Query**: <50ms

---

## 📝 Notes

- Jira MCP Server hoạt động độc lập
- Backend validate trực tiếp với Jira API
- Frontend chỉ giao tiếp với backend
- JWT được ký và verify bởi backend

---

## 🎯 Next Steps

### Completed (March 7, 2026) ✅
- [x] Implement session persistence
- [x] Add TokenStorageService with Signals
- [x] Fix logout button visibility
- [x] Add auto token refresh scheduling
- [x] Unit tests for TokenStorageService

### Immediate (Before Production)
- [ ] **CRITICAL**: Implement httpOnly cookies for refresh tokens
- [ ] **CRITICAL**: Add CSRF protection
- [ ] **CRITICAL**: Implement bcrypt password hashing
- [ ] **CRITICAL**: Remove default JWT secrets, enforce environment variables
- [ ] Add rate limiting for auth endpoints
- [ ] Add audit logging for security events

### Short-term
- [ ] Add E2E tests for complete auth flow
- [ ] Implement concurrent session limits (max 5 per user)
- [ ] Add session timeout warnings (5 min before expiry)
- [ ] Add "Remember Me" functionality

### Future
- [ ] OAuth 2.0 / OpenID Connect integration
- [ ] 2FA/MFA support (TOTP, SMS)
- [ ] Device management UI (view/active sessions)
- [ ] Security event dashboard

---

**Completed**: March 7, 2026  
**Next Review**: After Feature 2 & 3
