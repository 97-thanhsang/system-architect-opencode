# Refresh Token System

A comprehensive TypeScript implementation of a secure refresh token system for NestJS applications with strict typing, TypeORM integration, and advanced security features.

## Features

- **Strict TypeScript Types**: Full type safety with interfaces, type guards, and readonly modifiers
- **TypeORM Entity**: Complete entity with indexes, relations, and computed properties
- **JWT Token Management**: Separate secrets for access and refresh tokens
- **Token Rotation**: Automatic rotation with family tracking
- **Device Fingerprinting**: Bind tokens to specific devices
- **Security Features**: Revocation detection, reuse detection, expiration handling
- **DTOs with Validation**: Class-validator decorators for request/response validation
- **Custom Exceptions**: Domain-specific exceptions with proper HTTP status codes
- **Comprehensive Documentation**: JSDoc comments throughout

## Architecture

```
refresh-token-system/
├── config/
│   └── jwt.config.ts              # JWT configuration constants
├── entities/
│   └── refresh-token.entity.ts    # TypeORM entity
├── interfaces/
│   ├── token-payload.interface.ts # JWT payload types
│   ├── token-service.interface.ts # Service contracts
│   ├── refresh-token.interface.ts # Entity interface
│   └── refresh-token-repository.interface.ts # Repository contract
├── dto/
│   └── refresh-token.dto.ts       # Request/Response DTOs
├── enums/
│   └── token.enums.ts             # Enumerations and constants
├── exceptions/
│   └── token.exceptions.ts        # Custom exceptions
└── index.ts                       # Centralized exports
```

## Quick Start

### 1. Install Dependencies

```bash
npm install @nestjs/common @nestjs/swagger class-validator typeorm
npm install jsonwebtoken @types/jsonwebtoken
```

### 2. Configure Environment Variables

```env
JWT_ACCESS_SECRET=your-access-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
```

### 3. Import and Use

```typescript
import {
  RefreshToken,
  ITokenService,
  RefreshTokenRequestDto,
  RefreshTokenResponseDto,
  JWT_CONFIG,
} from './refresh-token-system';

// In your service
export class AuthService implements ITokenService {
  async generateTokens(
    userId: string,
    email: string,
    roles: string[]
  ): Promise<ITokenPair> {
    // Implementation
  }
}
```

## Token Lifecycle

### 1. Token Generation

```typescript
// Generate new token pair
const tokens = await tokenService.generateTokens(
  userId,
  email,
  roles,
  deviceFingerprint
);
// Returns: { accessToken, refreshToken, expiresIn, tokenType: 'Bearer' }
```

### 2. Token Refresh

```typescript
// Refresh using valid refresh token
const newTokens = await tokenService.refreshAccessToken(
  refreshToken,
  deviceFingerprint
);
// Automatically rotates refresh token and revokes old one
```

### 3. Token Revocation

```typescript
// Revoke specific token
await tokenService.revokeRefreshToken(refreshToken);

// Revoke all user tokens
await tokenService.revokeAllUserTokens(userId);
```

## Security Features

### Token Rotation

- Each refresh generates a new token pair
- Old token is immediately revoked
- Token family tracking prevents replay attacks
- Reuse detection triggers security alerts

### Device Fingerprinting

```typescript
// Bind token to device
const tokens = await tokenService.generateTokens(
  userId,
  email,
  roles,
  req.headers['x-device-fingerprint']
);

// Validate on refresh
try {
  const newTokens = await tokenService.refreshAccessToken(
    refreshToken,
    deviceFingerprint
  );
} catch (error) {
  if (error instanceof DeviceMismatchException) {
    // Handle device mismatch - potential token theft
  }
}
```

### Token Expiration

- Access tokens: 15 minutes
- Refresh tokens: 7 days
- Automatic cleanup of expired tokens
- Configurable expiration times

## API Endpoints

### Refresh Token

```typescript
@Post('refresh')
@ApiResponse({ type: RefreshTokenResponseDto })
async refresh(
  @Body() dto: RefreshTokenRequestDto
): Promise<RefreshTokenResponseDto> {
  return this.authService.refreshAccessToken(
    dto.refreshToken,
    dto.deviceFingerprint
  );
}
```

### Revoke Token

```typescript
@Post('revoke')
@ApiResponse({ status: 204 })
async revoke(@Body() dto: RevokeTokenRequestDto): Promise<void> {
  await this.authService.revokeRefreshToken(dto.refreshToken);
}
```

## Database Schema

```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token VARCHAR(512) UNIQUE NOT NULL,
    user_id UUID NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    rotated_from UUID,
    device_fingerprint VARCHAR(255),
    token_family UUID,
    ip_address INET,
    user_agent VARCHAR(512),
    last_used_at TIMESTAMPTZ,
    revocation_reason VARCHAR(100),
    revoked_at TIMESTAMPTZ
);

CREATE INDEX idx_refresh_tokens_user_revoked ON refresh_tokens(user_id, is_revoked);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);
CREATE INDEX idx_refresh_tokens_device ON refresh_tokens(device_fingerprint);
```

## Configuration

### JWT Settings

```typescript
// jwt.config.ts
export const JWT_CONFIG = {
  accessToken: {
    secret: process.env['JWT_ACCESS_SECRET'] ?? 'default-access-secret',
    expiresIn: '15m',
    algorithm: 'HS256' as const,
    expiresInSeconds: 900,
  },
  refreshToken: {
    secret: process.env['JWT_REFRESH_SECRET'] ?? 'default-refresh-secret',
    expiresIn: '7d',
    algorithm: 'HS256' as const,
    expiresInSeconds: 604800,
  },
} as const;
```

### TypeORM Configuration

```typescript
// app.module.ts
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './refresh-token-system';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
  ],
})
export class AppModule {}
```

## Error Handling

```typescript
import {
  TokenExpiredException,
  TokenRevokedException,
  DeviceMismatchException,
  TokenReuseException,
} from './refresh-token-system';

@Catch(TokenException)
export class TokenExceptionFilter implements ExceptionFilter {
  catch(exception: TokenException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(exception.getStatus()).json({
      message: exception.message,
      code: exception.code,
      timestamp: new Date().toISOString(),
    });
  }
}
```

## Best Practices

### 1. Always Use HTTPS

Refresh tokens should only be transmitted over HTTPS in production.

### 2. Store Tokens Securely

- Client: HttpOnly cookies or secure storage
- Server: Hashed in database (never store raw tokens)

### 3. Implement Token Rotation

Always rotate refresh tokens to prevent replay attacks.

### 4. Monitor for Reuse

Detect and respond to token reuse attempts:

```typescript
if (error instanceof TokenReuseException) {
  // Log security event
  // Notify user
  // Require re-authentication
}
```

### 5. Set Reasonable Expiration

- Access tokens: Short-lived (15-30 minutes)
- Refresh tokens: Longer-lived (7-30 days)

### 6. Cleanup Expired Tokens

Run periodic cleanup jobs:

```typescript
@Cron('0 0 * * *') // Daily at midnight
async cleanupExpiredTokens() {
  await this.refreshTokenRepository.cleanupExpired(1000);
}
```

## Type Safety

### Strict Interfaces

```typescript
// All interfaces use readonly modifiers
export interface ITokenPayload {
  readonly sub: string;
  readonly email: string;
  readonly roles: readonly string[];
  readonly type: 'access' | 'refresh';
}
```

### Type Guards

```typescript
import { isTokenPayload } from './refresh-token-system';

const payload = jwt.decode(token);
if (isTokenPayload(payload)) {
  // TypeScript knows payload is ITokenPayload
  console.log(payload.sub);
}
```

### Type-Only Imports

```typescript
import type { ITokenService } from './refresh-token-system';
// Only imports types, no runtime overhead
```

## Testing

```typescript
describe('TokenService', () => {
  let service: TokenService;
  let repository: IRefreshTokenRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: 'REFRESH_TOKEN_REPOSITORY',
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
  });

  describe('generateTokens', () => {
    it('should generate token pair', async () => {
      const result = await service.generateTokens(
        'user-id',
        'user@example.com',
        ['user']
      );

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.expiresIn).toBe(900);
    });
  });
});
```

## License

MIT

## Contributing

Contributions are welcome! Please ensure:
- All code is strictly typed
- JSDoc comments are included
- Tests are provided
- Follow existing code style

## Support

For issues and feature requests, please use the GitHub issue tracker.
