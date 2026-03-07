import type { RefreshToken } from '../entities/refresh-token.entity.js';

/**
 * Refresh Token Repository Interface
 * @description Repository contract for refresh token persistence operations
 */
export interface IRefreshTokenRepository {
  /**
   * Save a new refresh token
   * @param token - Partial refresh token entity
   * @returns Promise resolving to saved entity
   * @throws {RepositoryException} If save operation fails
   */
  save(token: Readonly<Partial<RefreshToken>>): Promise<RefreshToken>;

  /**
   * Find a refresh token by its token string (hashed)
   * @param token - The hashed token string
   * @returns Promise resolving to entity or null if not found
   */
  findByToken(token: string): Promise<RefreshToken | null>;

  /**
   * Find all active refresh tokens for a user
   * @param userId - User UUID
   * @returns Promise resolving to array of entities
   */
  findActiveByUserId(userId: string): Promise<readonly RefreshToken[]>;

  /**
   * Find refresh token by token family identifier
   * @param tokenFamily - Token family UUID
   * @returns Promise resolving to entity or null
   */
  findByTokenFamily(tokenFamily: string): Promise<RefreshToken | null>;

  /**
   * Revoke a specific token by ID
   * @param id - Token UUID
   * @returns Promise resolving to boolean indicating success
   */
  revokeById(id: string): Promise<boolean>;

  /**
   * Revoke a token by its token string
   * @param token - The hashed token string
   * @returns Promise resolving to boolean indicating success
   */
  revokeByToken(token: string): Promise<boolean>;

  /**
   * Revoke all tokens for a specific user
   * @param userId - User UUID
   * @returns Promise resolving to count of revoked tokens
   */
  revokeAllByUserId(userId: string): Promise<number>;

  /**
   * Revoke tokens by device fingerprint
   * @param userId - User UUID
   * @param deviceFingerprint - Device fingerprint to match
   * @returns Promise resolving to count of revoked tokens
   */
  revokeByDeviceFingerprint(
    userId: string,
    deviceFingerprint: string
  ): Promise<number>;

  /**
   * Check if a token exists and is valid
   * @param token - The hashed token string
   * @returns Promise resolving to boolean
   */
  existsAndValid(token: string): Promise<boolean>;

  /**
   * Cleanup expired tokens
   * @param batchSize - Number of tokens to delete per batch
   * @returns Promise resolving to count of deleted tokens
   */
  cleanupExpired(batchSize?: number): Promise<number>;

  /**
   * Cleanup revoked tokens older than specified date
   * @param olderThan - Date threshold
   * @returns Promise resolving to count of deleted tokens
   */
  cleanupRevoked(olderThan: Date): Promise<number>;

  /**
   * Count active tokens for a user
   * @param userId - User UUID
   * @returns Promise resolving to count
   */
  countActiveByUserId(userId: string): Promise<number>;

  /**
   * Get the most recent token for a user
   * @param userId - User UUID
   * @returns Promise resolving to entity or null
   */
  findMostRecentByUserId(userId: string): Promise<RefreshToken | null>;

  /**
   * Update token with rotation information
   * @param tokenId - Token UUID
   * @param rotatedFrom - Previous token reference
   * @returns Promise resolving to updated entity
   */
  markAsRotated(tokenId: string, rotatedFrom: string): Promise<RefreshToken>;

  /**
   * Find tokens created before a specific date
   * @param date - Date threshold
   * @param onlyActive - Whether to include only non-revoked tokens
   * @returns Promise resolving to array of entities
   */
  findCreatedBefore(
    date: Date,
    onlyActive?: boolean
  ): Promise<readonly RefreshToken[]>;

  /**
   * Bulk revoke tokens by IDs
   * @param ids - Array of token UUIDs
   * @returns Promise resolving to count of revoked tokens
   */
  bulkRevoke(ids: readonly string[]): Promise<number>;
}

/**
 * Repository Query Options
 */
export interface IRefreshTokenQueryOptions {
  /** Include revoked tokens in results */
  readonly includeRevoked?: boolean;

  /** Include expired tokens in results */
  readonly includeExpired?: boolean;

  /** Order by field */
  readonly orderBy?: 'createdAt' | 'expiresAt' | 'lastUsedAt';

  /** Order direction */
  readonly orderDirection?: 'ASC' | 'DESC';

  /** Limit results */
  readonly limit?: number;

  /** Offset for pagination */
  readonly offset?: number;
}

/**
 * Repository Statistics
 */
export interface IRefreshTokenStatistics {
  /** Total number of tokens */
  readonly totalCount: number;

  /** Number of active (non-revoked, non-expired) tokens */
  readonly activeCount: number;

  /** Number of revoked tokens */
  readonly revokedCount: number;

  /** Number of expired tokens */
  readonly expiredCount: number;

  /** Tokens created today */
  readonly createdToday: number;

  /** Average tokens per user */
  readonly averagePerUser: number;
}
