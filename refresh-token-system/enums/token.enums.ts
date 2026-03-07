/**
 * Token Error Codes
 * @description Enumerated error codes for token operations
 */
export enum TokenErrorCode {
  /** Token has expired */
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  /** Token is malformed or invalid */
  TOKEN_INVALID = 'TOKEN_INVALID',

  /** Token has been revoked */
  TOKEN_REVOKED = 'TOKEN_REVOKED',

  /** Token is on the blacklist */
  TOKEN_BLACKLISTED = 'TOKEN_BLACKLISTED',

  /** Token format is incorrect */
  TOKEN_MALFORMED = 'TOKEN_MALFORMED',

  /** Token signature verification failed */
  TOKEN_SIGNATURE_INVALID = 'TOKEN_SIGNATURE_INVALID',

  /** Wrong token type used (e.g., refresh instead of access) */
  WRONG_TOKEN_TYPE = 'WRONG_TOKEN_TYPE',

  /** Token not found in database */
  TOKEN_NOT_FOUND = 'TOKEN_NOT_FOUND',

  /** Device fingerprint mismatch */
  DEVICE_MISMATCH = 'DEVICE_MISMATCH',

  /** Token rotation failed */
  ROTATION_FAILED = 'ROTATION_FAILED',

  /** Token generation failed */
  GENERATION_FAILED = 'GENERATION_FAILED',

  /** Token family mismatch (potential replay attack) */
  FAMILY_MISMATCH = 'FAMILY_MISMATCH',

  /** Reuse of revoked token detected */
  TOKEN_REUSE_DETECTED = 'TOKEN_REUSE_DETECTED',

  /** Maximum active tokens exceeded */
  MAX_TOKENS_EXCEEDED = 'MAX_TOKENS_EXCEEDED',
}

/**
 * Token Status
 * @description Current status of a token
 */
export enum TokenStatus {
  /** Token is active and valid */
  ACTIVE = 'ACTIVE',

  /** Token has expired */
  EXPIRED = 'EXPIRED',

  /** Token has been revoked */
  REVOKED = 'REVOKED',

  /** Token has been rotated (replaced by new token) */
  ROTATED = 'ROTATED',

  /** Token is pending (not yet activated) */
  PENDING = 'PENDING',
}

/**
 * Revocation Reason
 * @description Reasons for token revocation
 */
export enum RevocationReason {
  /** User logged out */
  USER_LOGOUT = 'USER_LOGOUT',

  /** User requested revocation */
  USER_REQUESTED = 'USER_REQUESTED',

  /** Security breach detected */
  SECURITY_BREACH = 'SECURITY_BREACH',

  /** Token rotation */
  TOKEN_ROTATION = 'TOKEN_ROTATION',

  /** Admin action */
  ADMIN_ACTION = 'ADMIN_ACTION',

  /** Password changed */
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',

  /** Account disabled */
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',

  /** Suspicious activity detected */
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',

  /** Device not recognized */
  DEVICE_NOT_RECOGNIZED = 'DEVICE_NOT_RECOGNIZED',

  /** Manual revocation */
  MANUAL = 'MANUAL',
}

/**
 * Token Events
 * @description Events emitted during token lifecycle
 */
export enum TokenEvent {
  /** Token created */
  TOKEN_CREATED = 'token.created',

  /** Token refreshed */
  TOKEN_REFRESHED = 'token.refreshed',

  /** Token revoked */
  TOKEN_REVOKED = 'token.revoked',

  /** Token expired */
  TOKEN_EXPIRED = 'token.expired',

  /** Token rotation detected */
  TOKEN_ROTATED = 'token.rotated',

  /** Suspicious token usage */
  SUSPICIOUS_USAGE = 'token.suspicious',

  /** Token reuse detected */
  TOKEN_REUSE = 'token.reuse',

  /** All tokens revoked for user */
  ALL_TOKENS_REVOKED = 'token.all_revoked',
}

/**
 * Token Configuration Constants
 */
export const TOKEN_CONSTANTS = {
  /** Maximum number of active refresh tokens per user */
  MAX_ACTIVE_TOKENS_PER_USER: 10,

  /** Token family identifier length */
  TOKEN_FAMILY_LENGTH: 36,

  /** Minimum token length */
  MIN_TOKEN_LENGTH: 100,

  /** Maximum token length */
  MAX_TOKEN_LENGTH: 2048,

  /** Hash algorithm for storing tokens */
  HASH_ALGORITHM: 'sha256',

  /** Number of hash rounds (if using bcrypt) */
  HASH_ROUNDS: 10,

  /** Cleanup batch size */
  CLEANUP_BATCH_SIZE: 1000,

  /** Token reuse detection window (seconds) */
  REUSE_DETECTION_WINDOW: 60,

  /** Default token family TTL extension (days) */
  FAMILY_TTL_EXTENSION_DAYS: 30,
} as const;

/**
 * HTTP Status Codes for Token Errors
 */
export const TOKEN_HTTP_STATUS: Record<TokenErrorCode, number> = {
  [TokenErrorCode.TOKEN_EXPIRED]: 401,
  [TokenErrorCode.TOKEN_INVALID]: 401,
  [TokenErrorCode.TOKEN_REVOKED]: 401,
  [TokenErrorCode.TOKEN_BLACKLISTED]: 401,
  [TokenErrorCode.TOKEN_MALFORMED]: 400,
  [TokenErrorCode.TOKEN_SIGNATURE_INVALID]: 401,
  [TokenErrorCode.WRONG_TOKEN_TYPE]: 400,
  [TokenErrorCode.TOKEN_NOT_FOUND]: 404,
  [TokenErrorCode.DEVICE_MISMATCH]: 403,
  [TokenErrorCode.ROTATION_FAILED]: 500,
  [TokenErrorCode.GENERATION_FAILED]: 500,
  [TokenErrorCode.FAMILY_MISMATCH]: 403,
  [TokenErrorCode.TOKEN_REUSE_DETECTED]: 403,
  [TokenErrorCode.MAX_TOKENS_EXCEEDED]: 429,
} as const;
