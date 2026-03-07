import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  type Relation,
} from 'typeorm';
import type { IRefreshToken } from '../interfaces/refresh-token.interface.js';

/**
 * Refresh Token Entity
 * @description TypeORM entity for storing refresh tokens with security features
 * @entity refresh_tokens
 */
@Entity('refresh_tokens')
@Index(['userId', 'isRevoked'])
@Index(['token'], { unique: true })
@Index(['expiresAt'])
@Index(['deviceFingerprint'])
export class RefreshToken implements IRefreshToken {
  /**
   * Primary key - UUID
   */
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  /**
   * Hashed token string
   * @description Stored as hash for security, never store raw tokens
   */
  @Column({
    type: 'varchar',
    length: 512,
    unique: true,
    nullable: false,
    comment: 'Hashed refresh token value',
  })
  token!: string;

  /**
   * User ID - foreign key to users table
   */
  @Column({
    type: 'uuid',
    nullable: false,
    comment: 'Reference to user who owns this token',
  })
  userId!: string;

  /**
   * Token expiration timestamp
   */
  @Column({
    type: 'timestamptz',
    nullable: false,
    comment: 'When this token expires',
  })
  expiresAt!: Date;

  /**
   * Token revocation status
   */
  @Column({
    type: 'boolean',
    default: false,
    nullable: false,
    comment: 'Whether this token has been revoked',
  })
  isRevoked!: boolean;

  /**
   * Creation timestamp
   */
  @CreateDateColumn({
    type: 'timestamptz',
    comment: 'When this token was created',
  })
  readonly createdAt!: Date;

  /**
   * Last update timestamp
   */
  @UpdateDateColumn({
    type: 'timestamptz',
    comment: 'When this token was last updated',
  })
  readonly updatedAt!: Date;

  /**
   * Reference to previous token in rotation chain
   */
  @Column({
    type: 'uuid',
    nullable: true,
    comment: 'Reference to previous token in rotation chain',
  })
  rotatedFrom?: string;

  /**
   * Device fingerprint for token binding
   * @description Used to detect token theft by validating device context
   */
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Device fingerprint for additional security',
  })
  deviceFingerprint?: string;

  /**
   * Token family identifier for rotation tracking
   * @description Groups tokens that are part of the same rotation chain
   */
  @Column({
    type: 'uuid',
    nullable: true,
    comment: 'Token family for rotation tracking',
  })
  tokenFamily?: string;

  /**
   * IP address that created the token
   */
  @Column({
    type: 'inet',
    nullable: true,
    comment: 'IP address when token was created',
  })
  ipAddress?: string;

  /**
   * User agent that created the token
   */
  @Column({
    type: 'varchar',
    length: 512,
    nullable: true,
    comment: 'User agent when token was created',
  })
  userAgent?: string;

  /**
   * Last used timestamp
   */
  @Column({
    type: 'timestamptz',
    nullable: true,
    comment: 'When this token was last used',
  })
  lastUsedAt?: Date;

  /**
   * Revocation reason
   */
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Reason for revocation',
  })
  revocationReason?: string;

  /**
   * Revocation timestamp
   */
  @Column({
    type: 'timestamptz',
    nullable: true,
    comment: 'When this token was revoked',
  })
  revokedAt?: Date;

  // Relations

  /**
   * User relation (optional, for eager loading)
   */
  @ManyToOne('User', 'refreshTokens', { lazy: true })
  @JoinColumn({ name: 'userId' })
  user?: Relation<unknown>;

  /**
   * Check if token is expired
   */
  get isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  /**
   * Check if token is active (not revoked and not expired)
   */
  get isActive(): boolean {
    return !this.isRevoked && !this.isExpired;
  }

  /**
   * Get remaining time in seconds
   */
  get remainingTime(): number {
    const now = new Date().getTime();
    const expiry = this.expiresAt.getTime();
    return Math.max(0, Math.floor((expiry - now) / 1000));
  }

  /**
   * Revoke the token with optional reason
   */
  revoke(reason?: string): void {
    this.isRevoked = true;
    this.revokedAt = new Date();
    this.revocationReason = reason ?? 'Manual revocation';
  }

  /**
   * Update last used timestamp
   */
  markAsUsed(): void {
    this.lastUsedAt = new Date();
  }
}
