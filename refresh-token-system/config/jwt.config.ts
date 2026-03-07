import type { ApiPropertyOptions } from '@nestjs/swagger';

/**
 * JWT Configuration Constants
 * @description Centralized configuration for JWT token settings
 */
export const JWT_CONFIG = {
  /**
   * Access token configuration
   */
  accessToken: {
    /** Secret key for signing access tokens */
    secret: process.env['JWT_ACCESS_SECRET'] ?? 'access-secret-key',
    /** Token expiration time (15 minutes) */
    expiresIn: '15m',
    /** Algorithm for signing */
    algorithm: 'HS256' as const,
    /** Expiration time in seconds */
    expiresInSeconds: 900, // 15 * 60
  },

  /**
   * Refresh token configuration
   */
  refreshToken: {
    /** Secret key for signing refresh tokens (different from access) */
    secret: process.env['JWT_REFRESH_SECRET'] ?? 'refresh-secret-key',
    /** Token expiration time (7 days) */
    expiresIn: '7d',
    /** Algorithm for signing */
    algorithm: 'HS256' as const,
    /** Expiration time in seconds */
    expiresInSeconds: 604800, // 7 * 24 * 60 * 60
  },

  /**
   * Token type identifiers
   */
  tokenTypes: {
    access: 'access' as const,
    refresh: 'refresh' as const,
  },
} as const;

/**
 * Type for JWT algorithms
 */
export type JwtAlgorithm = 'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512';

/**
 * Type for token types
 */
export type TokenType = 'access' | 'refresh';

/**
 * JWT Configuration interface
 */
export interface IJwtConfig {
  readonly accessToken: {
    readonly secret: string;
    readonly expiresIn: string;
    readonly algorithm: JwtAlgorithm;
    readonly expiresInSeconds: number;
  };
  readonly refreshToken: {
    readonly secret: string;
    readonly expiresIn: string;
    readonly algorithm: JwtAlgorithm;
    readonly expiresInSeconds: number;
  };
}

/**
 * Swagger documentation for JWT DTOs
 */
export const JWT_API_PROPERTY: Record<string, ApiPropertyOptions> = {
  accessToken: {
    description: 'JWT access token for authenticated requests',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: 'string',
  },
  refreshToken: {
    description: 'JWT refresh token for obtaining new access tokens',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: 'string',
  },
  expiresIn: {
    description: 'Token expiration time in seconds',
    example: 900,
    type: 'number',
  },
  tokenType: {
    description: 'Type of token',
    enum: ['access', 'refresh'],
    example: 'access',
  },
} as const;
