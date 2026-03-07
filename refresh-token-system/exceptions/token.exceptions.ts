import { HttpException, HttpStatus } from '@nestjs/common';
import type { TokenErrorCode } from '../enums/token.enums.js';

/**
 * Base Token Exception
 * @description Base class for all token-related exceptions
 */
export class TokenException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus,
    public readonly code: TokenErrorCode,
    public readonly details?: Record<string, unknown>
  ) {
    super(
      {
        message,
        code,
        details,
        timestamp: new Date().toISOString(),
      },
      status
    );
  }
}

/**
 * Token Expired Exception
 * @description Thrown when a token has expired
 */
export class TokenExpiredException extends TokenException {
  constructor(expiredAt?: Date) {
    super(
      'Token has expired',
      HttpStatus.UNAUTHORIZED,
      'TOKEN_EXPIRED',
      expiredAt ? { expiredAt: expiredAt.toISOString() } : undefined
    );
  }
}

/**
 * Token Invalid Exception
 * @description Thrown when a token is invalid or malformed
 */
export class TokenInvalidException extends TokenException {
  constructor(reason?: string) {
    super(
      reason ?? 'Token is invalid',
      HttpStatus.UNAUTHORIZED,
      'TOKEN_INVALID'
    );
  }
}

/**
 * Token Revoked Exception
 * @description Thrown when a token has been revoked
 */
export class TokenRevokedException extends TokenException {
  constructor(revokedAt?: Date, reason?: string) {
    super(
      'Token has been revoked',
      HttpStatus.UNAUTHORIZED,
      'TOKEN_REVOKED',
      {
        ...(revokedAt && { revokedAt: revokedAt.toISOString() }),
        ...(reason && { reason }),
      }
    );
  }
}

/**
 * Token Not Found Exception
 * @description Thrown when a token cannot be found
 */
export class TokenNotFoundException extends TokenException {
  constructor() {
    super('Token not found', HttpStatus.NOT_FOUND, 'TOKEN_NOT_FOUND');
  }
}

/**
 * Device Mismatch Exception
 * @description Thrown when device fingerprint doesn't match
 */
export class DeviceMismatchException extends TokenException {
  constructor() {
    super(
      'Device fingerprint mismatch',
      HttpStatus.FORBIDDEN,
      'DEVICE_MISMATCH',
      {
        message: 'Token was issued for a different device',
      }
    );
  }
}

/**
 * Token Rotation Exception
 * @description Thrown when token rotation fails
 */
export class TokenRotationException extends TokenException {
  constructor(reason?: string) {
    super(
      reason ?? 'Token rotation failed',
      HttpStatus.INTERNAL_SERVER_ERROR,
      'ROTATION_FAILED'
    );
  }
}

/**
 * Token Generation Exception
 * @description Thrown when token generation fails
 */
export class TokenGenerationException extends TokenException {
  constructor(reason?: string) {
    super(
      reason ?? 'Failed to generate token',
      HttpStatus.INTERNAL_SERVER_ERROR,
      'GENERATION_FAILED'
    );
  }
}

/**
 * Token Reuse Exception
 * @description Thrown when a revoked token is being reused (potential attack)
 */
export class TokenReuseException extends TokenException {
  constructor() {
    super(
      'Token reuse detected. All tokens for this user have been revoked for security.',
      HttpStatus.FORBIDDEN,
      'TOKEN_REUSE_DETECTED',
      {
        message: 'This may indicate a security breach',
        action: 'Please re-authenticate',
      }
    );
  }
}

/**
 * Max Tokens Exceeded Exception
 * @description Thrown when user has too many active tokens
 */
export class MaxTokensExceededException extends TokenException {
  constructor(maxTokens: number) {
    super(
      'Maximum number of active tokens exceeded',
      HttpStatus.TOO_MANY_REQUESTS,
      'MAX_TOKENS_EXCEEDED',
      { maxTokens }
    );
  }
}

/**
 * Token Family Mismatch Exception
 * @description Thrown when token family doesn't match (potential replay attack)
 */
export class TokenFamilyMismatchException extends TokenException {
  constructor() {
    super(
      'Token family mismatch',
      HttpStatus.FORBIDDEN,
      'FAMILY_MISMATCH',
      {
        message: 'Invalid token sequence detected',
      }
    );
  }
}

/**
 * Wrong Token Type Exception
 * @description Thrown when wrong token type is used
 */
export class WrongTokenTypeException extends TokenException {
  constructor(expected: 'access' | 'refresh', received: string) {
    super(
      `Expected ${expected} token but received ${received} token`,
      HttpStatus.BAD_REQUEST,
      'WRONG_TOKEN_TYPE',
      { expected, received }
    );
  }
}
