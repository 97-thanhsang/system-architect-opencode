/**
 * Refresh Token Interface
 * @description Core contract for refresh token entity
 */
export interface IRefreshToken {
  /** Unique identifier (UUID) */
  readonly id: string;

  /** Hashed token value */
  token: string;

  /** User ID reference */
  userId: string;

  /** Token expiration date */
  expiresAt: Date;

  /** Revocation status */
  isRevoked: boolean;

  /** Creation timestamp */
  readonly createdAt: Date;

  /** Last update timestamp */
  readonly updatedAt: Date;

  /** Reference to previous token in rotation chain */
  rotatedFrom?: string;

  /** Device fingerprint for security */
  deviceFingerprint?: string;

  /** Token family identifier */
  tokenFamily?: string;

  /** IP address of token creation */
  ipAddress?: string;

  /** User agent of token creation */
  userAgent?: string;

  /** Last usage timestamp */
  lastUsedAt?: Date;

  /** Revocation reason */
  revocationReason?: string;

  /** Revocation timestamp */
  revokedAt?: Date;

  /** Computed: Whether token is expired */
  readonly isExpired: boolean;

  /** Computed: Whether token is active */
  readonly isActive: boolean;

  /** Computed: Remaining time in seconds */
  readonly remainingTime: number;
}

/**
 * Refresh Token Creation Data
 */
export interface ICreateRefreshTokenData {
  /** Hashed token value */
  readonly token: string;

  /** User ID */
  readonly userId: string;

  /** Expiration date */
  readonly expiresAt: Date;

  /** Device fingerprint (optional) */
  readonly deviceFingerprint?: string;

  /** Token family (optional) */
  readonly tokenFamily?: string;

  /** IP address (optional) */
  readonly ipAddress?: string;

  /** User agent (optional) */
  readonly userAgent?: string;

  /** Previous token reference (optional) */
  readonly rotatedFrom?: string;
}

/**
 * Refresh Token Update Data
 */
export interface IUpdateRefreshTokenData {
  /** Revocation status */
  readonly isRevoked?: boolean;

  /** Revocation reason */
  readonly revocationReason?: string;

  /** Revocation timestamp */
  readonly revokedAt?: Date;

  /** Last used timestamp */
  readonly lastUsedAt?: Date;
}

/**
 * Token Rotation Result
 */
export interface ITokenRotationResult {
  /** New refresh token */
  readonly newToken: string;

  /** New access token */
  readonly newAccessToken: string;

  /** Token family identifier */
  readonly tokenFamily: string;

  /** Expiration timestamp */
  readonly expiresAt: Date;
}
