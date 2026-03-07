# Feature 01: Authentication & Authorization

> **Status**: ✅ COMPLETED  
> **Priority**: Critical  
> **Timeline**: Phase 0-1  
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

### Frontend (4 files)

```
src/app/core/
├── auth/
│   ├── jira-auth.service.ts         # API calls + state management
│   └── auth.service.ts              # Legacy support
├── interceptors/
│   ├── jwt.interceptor.ts           # Auto-add Bearer token
│   ├── error.interceptor.ts
│   └── logging.interceptor.ts
└── guards/
    ├── auth.guard.ts                # Route protection
    └── role.guard.ts

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

## 🧪 Testing

### Manual Tests
- [x] Login with Jira credentials
- [x] JWT token validation
- [x] API endpoint testing
- [x] Frontend integration

### Pending Tests
- [ ] Unit tests for JiraClientService
- [ ] Unit tests for AuthService
- [ ] E2E tests for login flow
- [ ] Token expiry handling

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

### Improvements Needed
- [ ] Refresh token mechanism
- [ ] Rate limiting for login
- [ ] HTTPS enforcement
- [ ] CSRF protection
- [ ] Stronger JWT secret
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

### Immediate
- [ ] Implement unit tests
- [ ] Add refresh token mechanism
- [ ] Improve error handling

### Future
- [ ] OAuth 2.0 integration
- [ ] 2FA/MFA support
- [ ] Session management UI

---

**Completed**: March 7, 2026  
**Next Review**: After Feature 2 & 3
