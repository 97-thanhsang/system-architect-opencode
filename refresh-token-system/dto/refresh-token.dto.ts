import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JWT_API_PROPERTY } from '../config/jwt.config.js';

/**
 * Refresh Token Request DTO
 * @description Request body for token refresh operations
 */
export class RefreshTokenRequestDto {
  /**
   * Refresh token string
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  @ApiProperty({
    ...JWT_API_PROPERTY['refreshToken'],
    description: 'Valid refresh token to exchange for new tokens',
  })
  @IsString({ message: 'Refresh token must be a string' })
  @IsNotEmpty({ message: 'Refresh token is required' })
  @Length(100, 2048, {
    message: 'Refresh token must be between 100 and 2048 characters',
  })
  @Matches(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/, {
    message: 'Invalid JWT format',
  })
  readonly refreshToken!: string;

  /**
   * Device fingerprint for additional security validation
   * @example "a1b2c3d4e5f6..."
   */
  @ApiProperty({
    description: 'Device fingerprint for token binding validation',
    required: false,
    example: 'a1b2c3d4e5f6g7h8i9j0',
    type: 'string',
  })
  @IsString({ message: 'Device fingerprint must be a string' })
  @IsNotEmpty({ message: 'Device fingerprint cannot be empty' })
  readonly deviceFingerprint?: string;
}

/**
 * Refresh Token Response DTO
 * @description Response body containing new token pair
 */
export class RefreshTokenResponseDto {
  /**
   * New access token
   */
  @ApiProperty(JWT_API_PROPERTY['accessToken'])
  readonly accessToken!: string;

  /**
   * New refresh token
   */
  @ApiProperty(JWT_API_PROPERTY['refreshToken'])
  readonly refreshToken!: string;

  /**
   * Token type (always 'Bearer')
   */
  @ApiProperty({
    description: 'Token type',
    example: 'Bearer',
    enum: ['Bearer'],
  })
  readonly tokenType!: 'Bearer';

  /**
   * Access token expiration time in seconds
   */
  @ApiProperty(JWT_API_PROPERTY['expiresIn'])
  readonly expiresIn!: number;

  /**
   * Refresh token expiration time in seconds
   */
  @ApiProperty({
    description: 'Refresh token expiration time in seconds',
    example: 604800,
    type: 'number',
  })
  readonly refreshExpiresIn!: number;

  constructor(data: Readonly<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    refreshExpiresIn: number;
  }>) {
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;
    this.tokenType = 'Bearer';
    this.expiresIn = data.expiresIn;
    this.refreshExpiresIn = data.refreshExpiresIn;
  }
}

/**
 * Token Payload DTO
 * @description JWT token payload structure
 */
export class TokenPayloadDto {
  /**
   * Subject - User ID
   */
  @ApiProperty({
    description: 'User ID (subject)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: 'string',
  })
  readonly sub!: string;

  /**
   * User email
   */
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    type: 'string',
  })
  readonly email!: string;

  /**
   * User roles
   */
  @ApiProperty({
    description: 'User roles array',
    example: ['user', 'admin'],
    type: [String],
    isArray: true,
  })
  readonly roles!: readonly string[];

  /**
   * Token type
   */
  @ApiProperty(JWT_API_PROPERTY['tokenType'])
  readonly type!: 'access' | 'refresh';

  /**
   * Issued at timestamp
   */
  @ApiProperty({
    description: 'Token issued at timestamp',
    example: 1704067200,
    type: 'number',
  })
  readonly iat?: number;

  /**
   * Expiration timestamp
   */
  @ApiProperty({
    description: 'Token expiration timestamp',
    example: 1704068100,
    type: 'number',
  })
  readonly exp?: number;

  /**
   * JWT ID
   */
  @ApiProperty({
    description: 'Unique token identifier',
    example: 'unique-jwt-id-123',
    type: 'string',
  })
  readonly jti?: string;
}

/**
 * Token Validation Request DTO
 */
export class TokenValidationRequestDto {
  /**
   * Token to validate
   */
  @ApiProperty({
    description: 'JWT token to validate',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: 'string',
  })
  @IsString({ message: 'Token must be a string' })
  @IsNotEmpty({ message: 'Token is required' })
  readonly token!: string;

  /**
   * Expected token type
   */
  @ApiProperty({
    description: 'Expected token type',
    enum: ['access', 'refresh'],
    example: 'access',
    required: false,
  })
  readonly type?: 'access' | 'refresh';
}

/**
 * Token Validation Response DTO
 */
export class TokenValidationResponseDto {
  /**
   * Whether the token is valid
   */
  @ApiProperty({
    description: 'Whether the token is valid',
    example: true,
    type: 'boolean',
  })
  readonly isValid!: boolean;

  /**
   * Decoded payload (if valid)
   */
  @ApiProperty({
    description: 'Decoded token payload',
    type: TokenPayloadDto,
    required: false,
  })
  readonly payload?: TokenPayloadDto;

  /**
   * Error message (if invalid)
   */
  @ApiProperty({
    description: 'Error message if token is invalid',
    example: 'Token expired',
    type: 'string',
    required: false,
  })
  readonly error?: string;

  /**
   * Error code
   */
  @ApiProperty({
    description: 'Error code for programmatic handling',
    example: 'TOKEN_EXPIRED',
    enum: ['TOKEN_EXPIRED', 'TOKEN_INVALID', 'TOKEN_REVOKED', 'TOKEN_BLACKLISTED'],
    required: false,
  })
  readonly errorCode?: string;
}

/**
 * Revoke Token Request DTO
 */
export class RevokeTokenRequestDto {
  /**
   * Refresh token to revoke
   */
  @ApiProperty({
    description: 'Refresh token to revoke',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: 'string',
  })
  @IsString({ message: 'Token must be a string' })
  @IsNotEmpty({ message: 'Token is required' })
  readonly refreshToken!: string;

  /**
   * Revocation reason
   */
  @ApiProperty({
    description: 'Reason for revocation',
    example: 'User logout',
    type: 'string',
    required: false,
  })
  readonly reason?: string;
}

/**
 * Revoke All Tokens Request DTO
 */
export class RevokeAllTokensRequestDto {
  /**
   * User ID to revoke all tokens for
   */
  @ApiProperty({
    description: 'User ID to revoke all tokens for',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: 'string',
  })
  @IsString({ message: 'User ID must be a string' })
  @IsNotEmpty({ message: 'User ID is required' })
  readonly userId!: string;

  /**
   * Revocation reason
   */
  @ApiProperty({
    description: 'Reason for revocation',
    example: 'Security breach',
    type: 'string',
    required: false,
  })
  readonly reason?: string;

  /**
   * Whether to exclude current token
   */
  @ApiProperty({
    description: 'Whether to exclude the current token from revocation',
    example: true,
    type: 'boolean',
    required: false,
  })
  readonly excludeCurrent?: boolean;
}

/**
 * Token Metadata DTO
 */
export class TokenMetadataDto {
  /**
   * Token ID
   */
  @ApiProperty({
    description: 'Token unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: 'string',
  })
  readonly id!: string;

  /**
   * User ID
   */
  @ApiProperty({
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
    type: 'string',
  })
  readonly userId!: string;

  /**
   * Whether token is revoked
   */
  @ApiProperty({
    description: 'Whether token has been revoked',
    example: false,
    type: 'boolean',
  })
  readonly isRevoked!: boolean;

  /**
   * Whether token is expired
   */
  @ApiProperty({
    description: 'Whether token has expired',
    example: false,
    type: 'boolean',
  })
  readonly isExpired!: boolean;

  /**
   * Creation date
   */
  @ApiProperty({
    description: 'Token creation date',
    example: '2024-01-01T00:00:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  readonly createdAt!: string;

  /**
   * Expiration date
   */
  @ApiProperty({
    description: 'Token expiration date',
    example: '2024-01-08T00:00:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  readonly expiresAt!: string;

  /**
   * Device fingerprint
   */
  @ApiProperty({
    description: 'Device fingerprint',
    example: 'a1b2c3d4e5f6...',
    type: 'string',
  })
  readonly deviceFingerprint?: string;

  /**
   * Last used date
   */
  @ApiProperty({
    description: 'Last used date',
    example: '2024-01-01T12:00:00.000Z',
    type: 'string',
    format: 'date-time',
    required: false,
  })
  readonly lastUsedAt?: string;
}

/**
 * Token List Response DTO
 */
export class TokenListResponseDto {
  /**
   * Array of token metadata
   */
  @ApiProperty({
    description: 'List of tokens',
    type: [TokenMetadataDto],
    isArray: true,
  })
  readonly tokens!: readonly TokenMetadataDto[];

  /**
   * Total count
   */
  @ApiProperty({
    description: 'Total number of tokens',
    example: 5,
    type: 'number',
  })
  readonly total!: number;

  /**
   * Active count
   */
  @ApiProperty({
    description: 'Number of active tokens',
    example: 3,
    type: 'number',
  })
  readonly active!: number;

  /**
   * Revoked count
   */
  @ApiProperty({
    description: 'Number of revoked tokens',
    example: 2,
    type: 'number',
  })
  readonly revoked!: number;
}
