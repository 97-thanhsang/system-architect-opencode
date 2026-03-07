import type { ITokenPair } from './token-payload.interface.js';

/**
 * Token Service Interface
 * @description Core contract for token generation and validation operations
 */
export interface ITokenService {
  /**
   * Generate a new pair of access and refresh tokens
   * @param userId - User UUID
   * @param email - User email address
   * @param roles - Array of user roles
   * @param deviceFingerprint - Optional device fingerprint for binding
   * @returns Promise resolving to token pair
   * @throws {TokenGenerationException} If token generation fails
   */
  generateTokens(
    userId: string,
    email: string,
    roles: readonly string[],
    deviceFingerprint?: string
  ): Promise<ITokenPair>;

  /**
   * Refresh access token using a valid refresh token
   * @param refreshToken - The refresh token string
   * @param deviceFingerprint - Optional device fingerprint for validation
   * @returns Promise resolving to new token pair
   * @throws {TokenExpiredException} If refresh token is expired
   * @throws {TokenRevokedException} If refresh token has been revoked
   * @throws {TokenInvalidException} If refresh token is invalid
   * @throws {DeviceMismatchException} If device fingerprint doesn't match
   */
  refreshAccessToken(
    refreshToken: string,
    deviceFingerprint?: string
  ): Promise<ITokenPair>;

  /**
   * Revoke a specific refresh token
   * @param token - The refresh token to revoke
   * @returns Promise resolving when revocation is complete
   * @throws {TokenNotFoundException} If token is not found
   */
  revokeRefreshToken(token: string): Promise<void>;

  /**
   * Revoke all refresh tokens for a user
   * @param userId - User UUID
   * @returns Promise resolving to count of revoked tokens
   */
  revokeAllUserTokens(userId: string): Promise<number>;

  /**
   * Validate an access token
   * @param token - The access token to validate
   * @returns Promise resolving to validation result
   */
  validateAccessToken(token: string): Promise<boolean>;

  /**
   * Decode token payload without validation
   * @param token - The JWT token
   * @returns Decoded payload or null if malformed
   */
  decodeToken<T extends Record<string, unknown>>(token: string): T | null;

  /**
   * Get token expiration date
   * @param token - The JWT token
   * @returns Expiration date or null if not found
   */
  getTokenExpiration(token: string): Date | null;

  /**
   * Check if token is expired
   * @param token - The JWT token
   * @returns True if expired, false otherwise
   */
  isTokenExpired(token: string): boolean;
}

/**
 * Refresh Token Service Interface
 * @description Specialized service for refresh token lifecycle management
 */
export interface IRefreshTokenService {
  /**
   * Create and store a new refresh token
   * @param userId - User UUID
   * @param tokenFamily - Token family identifier for rotation
   * @param deviceFingerprint - Optional device fingerprint
   * @param metadata - Optional additional metadata
   * @returns Promise resolving to the token string
   */
  createRefreshToken(
    userId: string,
    tokenFamily: string,
    deviceFingerprint?: string,
    metadata?: Readonly<Record<string, unknown>>
  ): Promise<string>;

  /**
   * Rotate a refresh token (invalidate old, create new)
   * @param oldToken - The current refresh token
   * @param deviceFingerprint - Device fingerprint for validation
   * @returns Promise resolving to new token pair
   * @throws {TokenRotationException} If rotation fails
   */
  rotateRefreshToken(
    oldToken: string,
    deviceFingerprint?: string
  ): Promise<ITokenPair>;

  /**
   * Validate refresh token and return associated user info
   * @param token - The refresh token
   * @returns Promise resolving to user ID if valid
   * @throws {TokenInvalidException} If token is invalid
   */
  validateRefreshToken(token: string): Promise<string>;

  /**
   * Cleanup expired and revoked tokens
   * @param batchSize - Number of tokens to process per batch
   * @returns Promise resolving to count of cleaned tokens
   */
  cleanupExpiredTokens(batchSize?: number): Promise<number>;

  /**
   * Get active token count for a user
   * @param userId - User UUID
   * @returns Promise resolving to count of active tokens
   */
  getActiveTokenCount(userId: string): Promise<number>;

  /**
   * Revoke tokens by device fingerprint
   * @param userId - User UUID
   * @param deviceFingerprint - Device fingerprint to match
   * @returns Promise resolving to count of revoked tokens
   */
  revokeTokensByDevice(
    userId: string,
    deviceFingerprint: string
  ): Promise<number>;
}

/**
 * Token Blacklist Service Interface
 * @description Service for managing token blacklist
 */
export interface ITokenBlacklistService {
  /**
   * Add token to blacklist
   * @param token - Token to blacklist
   * @param expiresAt - When the token naturally expires
   * @returns Promise resolving when added
   */
  blacklistToken(token: string, expiresAt: Date): Promise<void>;

  /**
   * Check if token is blacklisted
   * @param token - Token to check
   * @returns Promise resolving to boolean
   */
  isBlacklisted(token: string): Promise<boolean>;

  /**
   * Cleanup expired entries from blacklist
   * @returns Promise resolving to count of cleaned entries
   */
  cleanupBlacklist(): Promise<number>;
}
