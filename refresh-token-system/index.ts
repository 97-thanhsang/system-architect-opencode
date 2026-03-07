/**
 * Index file for Refresh Token System
 * @description Centralized exports for all refresh token modules
 */

// Config
export { JWT_CONFIG, JWT_API_PROPERTY } from './config/jwt.config.js';
export type { IJwtConfig, JwtAlgorithm, TokenType } from './config/jwt.config.js';

// Entities
export { RefreshToken } from './entities/refresh-token.entity.js';

// Interfaces
export type {
  ITokenPayload,
  IAccessTokenPayload,
  IRefreshTokenPayload,
  IValidatedToken,
  ITokenPair,
  ITokenMetadata,
} from './interfaces/token-payload.interface.js';
export { isTokenPayload } from './interfaces/token-payload.interface.js';

export type {
  IRefreshToken,
  ICreateRefreshTokenData,
  IUpdateRefreshTokenData,
  ITokenRotationResult,
} from './interfaces/refresh-token.interface.js';

export type {
  ITokenService,
  IRefreshTokenService,
  ITokenBlacklistService,
} from './interfaces/token-service.interface.js';

export type {
  IRefreshTokenRepository,
  IRefreshTokenQueryOptions,
  IRefreshTokenStatistics,
} from './interfaces/refresh-token-repository.interface.js';

// DTOs
export {
  RefreshTokenRequestDto,
  RefreshTokenResponseDto,
  TokenPayloadDto,
  TokenValidationRequestDto,
  TokenValidationResponseDto,
  RevokeTokenRequestDto,
  RevokeAllTokensRequestDto,
  TokenMetadataDto,
  TokenListResponseDto,
} from './dto/refresh-token.dto.js';

// Enums
export {
  TokenErrorCode,
  TokenStatus,
  RevocationReason,
  TokenEvent,
  TOKEN_CONSTANTS,
  TOKEN_HTTP_STATUS,
} from './enums/token.enums.js';

// Exceptions
export {
  TokenException,
  TokenExpiredException,
  TokenInvalidException,
  TokenRevokedException,
  TokenNotFoundException,
  DeviceMismatchException,
  TokenRotationException,
  TokenGenerationException,
  TokenReuseException,
  MaxTokensExceededException,
  TokenFamilyMismatchException,
  WrongTokenTypeException,
} from './exceptions/token.exceptions.js';

// Re-export token error code type
export type { TokenErrorCode as TokenErrorCodeType } from './interfaces/token-payload.interface.js';
