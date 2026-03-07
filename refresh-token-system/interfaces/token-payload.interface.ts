/**
 * Token Payload Interface
 * @description Standard JWT payload structure for both access and refresh tokens
 */
export interface ITokenPayload {
  /** Subject - User ID (UUID) */
  readonly sub: string;

  /** User email address */
  readonly email: string;

  /** User roles array */
  readonly roles: readonly string[];

  /** Token type identifier */
  readonly type: 'access' | 'refresh';

  /** Issued at timestamp (Unix epoch) */
  readonly iat?: number;

  /** Expiration timestamp (Unix epoch) */
  readonly exp?: number;

  /** JWT ID - unique token identifier */
  readonly jti?: string;
}

/**
 * Type guard to check if payload is a valid token payload
 */
export function isTokenPayload(payload: unknown): payload is ITokenPayload {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }

  const p = payload as Record<string, unknown>;

  return (
    typeof p['sub'] === 'string' &&
    typeof p['email'] === 'string' &&
    Array.isArray(p['roles']) &&
    (p['type'] === 'access' || p['type'] === 'refresh')
  );
}

/**
 * Access Token Payload
 * @description Specific payload for access tokens
 */
export interface IAccessTokenPayload extends ITokenPayload {
  readonly type: 'access';
}

/**
 * Refresh Token Payload
 * @description Specific payload for refresh tokens
 */
export interface IRefreshTokenPayload extends ITokenPayload {
  readonly type: 'refresh';

  /** Device fingerprint for token binding */
  readonly deviceFingerprint?: string;

  /** Token family identifier for rotation tracking */
  readonly tokenFamily?: string;
}

/**
 * Validated Token Result
 * @description Result of token validation
 */
export interface IValidatedToken {
  /** Whether the token is valid */
  readonly isValid: boolean;

  /** The decoded payload (if valid) */
  readonly payload?: ITokenPayload;

  /** Error message (if invalid) */
  readonly error?: string;

  /** Error code for programmatic handling */
  readonly errorCode?: TokenErrorCode;
}

/**
 * Token Error Codes
 */
export type TokenErrorCode =
  | 'TOKEN_EXPIRED'
  | 'TOKEN_INVALID'
  | 'TOKEN_REVOKED'
  | 'TOKEN_BLACKLISTED'
  | 'TOKEN_MALFORMED'
  | 'TOKEN_SIGNATURE_INVALID'
  | 'WRONG_TOKEN_TYPE';

/**
 * Token Pair
 * @description Container for both access and refresh tokens
 */
export interface ITokenPair {
  /** JWT access token */
  readonly accessToken: string;

  /** JWT refresh token */
  readonly refreshToken: string;

  /** Access token expiration time in seconds */
  readonly expiresIn: number;

  /** Token type (Bearer) */
  readonly tokenType: 'Bearer';
}

/**
 * Token Metadata
 * @description Additional information about a token
 */
export interface ITokenMetadata {
  /** Token ID (JTI) */
  readonly tokenId: string;

  /** User ID associated with the token */
  readonly userId: string;

  /** Token creation timestamp */
  readonly createdAt: Date;

  /** Token expiration timestamp */
  readonly expiresAt: Date;

  /** Whether the token has been revoked */
  readonly isRevoked: boolean;

  /** Device fingerprint (if available) */
  readonly deviceFingerprint?: string;

  /** IP address that created the token */
  readonly ipAddress?: string;

  /** User agent that created the token */
  readonly userAgent?: string;
}
