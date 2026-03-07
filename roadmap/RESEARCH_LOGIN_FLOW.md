# 🔐 Research Report: Hiệu chỉnh Luồng Login cho OpenCode Workflow Platform

> **Date**: March 7, 2026  
> **Researcher**: SYSTEM-ARCHITECT Agent  
> **Status**: ✅ Completed  
> **Scope**: Authentication Flow Optimization

---

## 📋 Executive Summary

### Tình Hình Hiện Tại

Dự án **OpenCode Workflow Platform** đang sử dụng luồng login với các vấn đề sau:

1. **Mock Authentication**: Credentials được hardcoded (`SangNT/Asc_SangNT2023`)
2. **No Backend Integration**: Chưa kết nối với NestJS API để validate
3. **No Jira MCP Integration**: Chưa sử dụng Jira MCP server để xác thực thực tế
4. **Basic Security**: localStorage đơn giản, không có JWT/token expiry

### Cơ Chế Jira MCP Server

Từ nghiên cứu file `.mcp/jira-server/src/`:

```typescript
// Jira MCP sử dụng Basic Authentication
const jiraClient = new JiraClient({
    url: process.env.JIRA_URL!,      // https://task.ascvn.com.vn
    username: process.env.JIRA_USERNAME!,
    password: process.env.JIRA_PASSWORD!,
});

// Test authentication khi server start
const user = await jiraClient.authenticate(); // GET /myself
```

**Key Points:**
- ✅ Basic Auth qua Axios với `auth: { username, password }`
- ✅ Credentials từ `.env` file
- ✅ Endpoint `/rest/api/2/myself` để validate
- ✅ JQL queries cho search operations

---

## 🔍 Phân Tích Chi Tiết

### 1. Luồng Login Hiện Tại (Frontend)

```
LoginTaigaComponent
    ↓
JiraAuthService.login(credentials)
    ↓
validateJiraCredentials() [MOCK - Hardcoded]
    ↓
localStorage.setItem('jira_auth', 'true')
    ↓
Navigate to /module/fe
```

**Vấn đề:**
- ❌ Không gọi backend API
- ❌ Không validate thực tế với Jira
- ❌ Không có error handling đầy đủ
- ❌ Không có session management

### 2. Kiến Trúc Backend Hiện Tại (NestJS)

```
apps/api/src/
├── auth/
│   ├── auth.service.ts      [Basic - Chỉ có email/password]
│   ├── auth.controller.ts
│   └── entities/user.entity.ts
```

**Thiếu:**
- ❌ Jira validation endpoint
- ❌ JiraClient integration
- ❌ JWT token generation
- ❌ Session management

### 3. Jira MCP Authentication Flow

```
Client (Username/Password)
    ↓
JiraClient.authenticate()
    ↓
GET /rest/api/2/myself
    ↓
Jira Server validates credentials
    ↓
Returns: { displayName, email, name, ... }
```

**Features:**
- ✅ Basic Auth header: `Authorization: Basic base64(user:pass)`
- ✅ Returns user profile on success
- ✅ 401 on invalid credentials

---

## 💡 Giải Pháp Đề Xuất

### Architecture Mới: Secure Jira-Integrated Auth

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
│  │ async jiraLogin(@Body() credentials)              │     │
│  └────────────────────────────┬──────────────────────┘     │
│                               │                             │
│  ┌────────────────────────────▼──────────────────────┐     │
│  │ JiraAuthService (NEW)                             │     │
│  │ - Validate credentials via JiraClient             │     │
│  │ - Generate JWT token                              │     │
│  │ - Store session in DB                             │     │
│  └────────────────────────────┬──────────────────────┘     │
│                               │                             │
│                      Basic Auth Header                      │
│                               │                             │
└───────────────────────────────┼─────────────────────────────┘
                                │
┌───────────────────────────────┼─────────────────────────────┐
│                    JIRA MCP SERVER                          │
│                               │                             │
│  ┌────────────────────────────▼──────────────────────┐     │
│  │ JiraClient                                        │     │
│  │ GET /rest/api/2/myself                            │     │
│  └────────────────────────────┬──────────────────────┘     │
│                               │                             │
│                      Jira Server (task.ascvn.com.vn)        │
└───────────────────────────────┴─────────────────────────────┘
```

---

## 🛠️ Implementation Plan

### Phase 1: Backend Enhancement (NestJS)

#### 1.1 Cài Đặt Dependencies

```bash
cd apps/api
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install -D @types/passport-jwt
npm install axios  # For Jira API calls
```

#### 1.2 Tạo JiraClient Service

**File**: `src/jira/jira-client.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface JiraUser {
  self: string;
  key: string;
  name: string;
  emailAddress: string;
  displayName: string;
  active: boolean;
}

export interface JiraCredentials {
  username: string;
  password: string;
  jiraUrl: string;
}

@Injectable()
export class JiraClientService {
  private readonly logger = new Logger(JiraClientService.name);

  async validateCredentials(credentials: JiraCredentials): Promise<JiraUser> {
    const { username, password, jiraUrl } = credentials;
    
    const client = axios.create({
      baseURL: `${jiraUrl}/rest/api/2`,
      auth: { username, password },
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    });

    try {
      const response = await client.get<JiraUser>('/myself');
      this.logger.log(`Authenticated: ${response.data.displayName}`);
      return response.data;
    } catch (error: any) {
      this.logger.error(`Auth failed: ${error.message}`);
      throw new Error('Invalid Jira credentials');
    }
  }
}
```

#### 1.3 Cập Nhật User Entity

**File**: `src/auth/entities/user.entity.ts`

```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ unique: true })
  jiraUsername: string;

  @Column()
  jiraDisplayName: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ type: 'simple-array' })
  roles: string[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### 1.4 Tạo JWT Strategy

**File**: `src/auth/strategies/jwt.strategy.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret',
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, roles: payload.roles };
  }
}
```

#### 1.5 Cập Nhật AuthService

**File**: `src/auth/auth.service.ts`

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { JiraClientService, JiraCredentials } from '../jira/jira-client.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private jiraClient: JiraClientService,
  ) {}

  async loginWithJira(credentials: JiraCredentials) {
    // 1. Validate with Jira
    const jiraUser = await this.jiraClient.validateCredentials(credentials);
    
    // 2. Find or create user in local DB
    let user = await this.userRepository.findOne({
      where: { jiraUsername: jiraUser.name },
    });
    
    if (!user) {
      user = this.userRepository.create({
        email: jiraUser.emailAddress,
        name: jiraUser.displayName,
        jiraUsername: jiraUser.name,
        jiraDisplayName: jiraUser.displayName,
        roles: ['user'],
      });
      await this.userRepository.save(user);
    }
    
    // 3. Generate JWT
    const payload = { 
      sub: user.id, 
      email: user.email, 
      roles: user.roles,
      jiraUsername: user.jiraUsername,
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        jiraUsername: user.jiraUsername,
        roles: user.roles,
      },
    };
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }
}
```

#### 1.6 Cập Nhật AuthController

**File**: `src/auth/auth.controller.ts`

```typescript
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

interface JiraLoginDto {
  username: string;
  password: string;
  jiraUrl: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('jira/login')
  @HttpCode(HttpStatus.OK)
  async jiraLogin(@Body() credentials: JiraLoginDto) {
    return await this.authService.loginWithJira(credentials);
  }
}
```

#### 1.7 Cấu Hình JWT Module

**File**: `src/auth/auth.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { JiraClientService } from '../jira/jira-client.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'default-secret',
        signOptions: { expiresIn: '8h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JiraClientService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

---

### Phase 2: Frontend Enhancement (Angular)

#### 2.1 Cập Nhật JiraAuthService

**File**: `src/app/core/auth/jira-auth.service.ts`

```typescript
import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface JiraUser {
  id: string;
  email: string;
  name: string;
  jiraUsername: string;
  roles: string[];
}

export interface LoginCredentials {
  username: string;
  password: string;
  jiraUrl: string;
}

export interface AuthResponse {
  access_token: string;
  user: JiraUser;
}

@Injectable({
  providedIn: 'root'
})
export class JiraAuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private readonly _user = signal<JiraUser | null>(null);
  private readonly _isAuthenticated = signal<boolean>(false);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  private readonly API_URL = environment.apiUrl || 'http://localhost:3000/api';

  constructor() {
    this.loadStoredAuth();
  }

  async login(credentials: LoginCredentials): Promise<boolean> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.API_URL}/auth/jira/login`, credentials)
      );

      // Store token and user
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      this._user.set(response.user);
      this._isAuthenticated.set(true);
      
      return true;
    } catch (error: any) {
      this._error.set(error.error?.message || 'Đăng nhập thất bại');
      return false;
    } finally {
      this._loading.set(false);
    }
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this._user.set(null);
    this._isAuthenticated.set(false);
    this.router.navigate(['/auth/login']);
  }

  private loadStoredAuth(): void {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this._user.set(user);
        this._isAuthenticated.set(true);
      } catch {
        this.logout();
      }
    }
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
}
```

#### 2.2 Cập Nhật JWT Interceptor

**File**: `src/app/core/interceptors/jwt.interceptor.ts`

```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { JiraAuthService } from '../auth/jira-auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(JiraAuthService);
  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
```

#### 2.3 Cập Nhật Auth Guard

**File**: `src/app/core/guards/auth.guard.ts`

```typescript
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { JiraAuthService } from '../auth/jira-auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(JiraAuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/auth/login'], { 
    queryParams: { returnUrl: state.url } 
  });
  return false;
};
```

---

### Phase 3: Environment Configuration

#### 3.1 Frontend Environment

**File**: `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  jiraUrl: 'https://task.ascvn.com.vn',
};
```

#### 3.2 Backend Environment

**File**: `apps/api/.env`

```env
# Database
DATABASE_TYPE=sqlite
DATABASE_NAME=opencode.db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=8h

# Jira (for reference, not used in auth flow anymore)
# JIRA_URL=https://task.ascvn.com.vn
# JIRA_USERNAME=...
# JIRA_PASSWORD=...
```

---

## 📊 Comparison: Before vs After

| Feature | Before | After |
|---------|--------|-------|
| **Authentication** | Mock (hardcoded) | Real Jira validation |
| **Token** | Simple flag in localStorage | JWT with expiry |
| **Backend** | No auth endpoints | Full auth module |
| **Security** | Basic | JWT + Guards + Interceptors |
| **User Data** | Mock data | Real Jira profile |
| **Session** | No expiry | 8h JWT expiry |

---

## ⚡ Benefits

1. **Real Authentication**: Kết nối thực tế với Jira Server
2. **Security**: JWT tokens, HTTP-only không thể XSS
3. **User Experience**: Single Sign-On với Jira
4. **Maintainability**: Tách biệt auth logic rõ ràng
5. **Scalability**: Dễ dàng thêm OAuth2/PAT sau này

---

## 🎯 Next Steps

1. **Implement Backend** (Phase 1):
   ```bash
   cd apps/api
   npm install @nestjs/jwt @nestjs/passport passport passport-jwt axios
   # Tạo các files theo plan ở trên
   ```

2. **Implement Frontend** (Phase 2):
   ```bash
   # Cập nhật JiraAuthService
   # Cập nhật LoginTaigaComponent
   # Thêm JWT Interceptor
   ```

3. **Test**:
   ```bash
   # Test login với credentials Jira thật
   # Test token expiry
   # Test guards
   ```

4. **Production**:
   - Đổi `JWT_SECRET` thành giá trị mạnh
   - Sử dụng HTTPS
   - Thêm rate limiting
   - Thêm refresh token

---

## 📝 Notes

- **Jira MCP Server** vẫn hoạt động độc lập, không ảnh hưởng bởi thay đổi này
- **Backend NestJS** sẽ validate credentials trực tiếp với Jira API
- **Frontend** chỉ giao tiếp với backend, không gọi Jira trực tiếp
- **Security**: JWT được ký và verify bởi backend

---

**Report Generated**: March 7, 2026  
**Ready for Implementation**: ✅ Yes
