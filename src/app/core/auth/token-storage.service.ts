import { Injectable, signal, computed, inject, NgZone } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subscription, throwError, timer, of, Subject } from 'rxjs';
import {
  catchError,
  filter,
  map,
  retry,
  switchMap,
  take,
  takeUntil,
  tap,
  finalize,
  delayWhen
} from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * User interface for authentication state
 */
export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  roles: string[];
}

/**
 * Token refresh response from backend
 */
export interface TokenRefreshResponse {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
}

/**
 * Configuration options for token storage
 */
export interface TokenStorageConfig {
  /** Buffer time in seconds before expiry to trigger refresh (default: 120 = 2 minutes) */
  refreshBufferSeconds: number;
  /** Maximum retry attempts for token refresh (default: 3) */
  maxRetryAttempts: number;
  /** Exponential backoff delay in ms (default: 1000) */
  retryDelayMs: number;
  /** Enable debug logging (default: false) */
  debugLogging: boolean;
}

/**
 * Token storage error types
 */
export enum TokenStorageErrorType {
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  REFRESH_FAILED = 'REFRESH_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_TOKEN = 'INVALID_TOKEN',
  STORAGE_ERROR = 'STORAGE_ERROR'
}

/**
 * Custom error class for token storage operations
 */
export class TokenStorageError extends Error {
  constructor(
    public type: TokenStorageErrorType,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'TokenStorageError';
  }
}

/**
 * TokenStorageService - Manages JWT tokens with automatic refresh
 *
 * Features:
 * - Angular Signals for reactive state management
 * - Access token stored in memory (BehaviorSubject)
 * - Refresh token handled via httpOnly cookie (backend managed)
 * - Automatic token refresh before expiry
 * - Request queuing during refresh
 * - Exponential backoff retry logic
 */
@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  // Dependencies
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);

  // Configuration
  private readonly config: TokenStorageConfig = {
    refreshBufferSeconds: 120, // 2 minutes before expiry
    maxRetryAttempts: 3,
    retryDelayMs: 1000,
    debugLogging: false
  };

  // API URL
  private readonly API_URL = environment.apiUrl;

  // In-memory token storage (never persisted to localStorage for security)
  private readonly _accessToken$ = new BehaviorSubject<string | null>(null);
  private readonly _refreshTokenInProgress$ = new BehaviorSubject<boolean>(false);

  // Token refresh completion notifier
  private readonly _tokenRefreshCompleted$ = new Subject<string>();

  // Pending requests queue (subjects waiting for token refresh)
  private readonly _pendingRequests: Array<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
  }> = [];

  // Token expiry tracking
  private _tokenExpiryTimestamp: number | null = null;
  private _refreshTimerSubscription: Subscription | null = null;

  // Destroy notifier for cleanup
  private readonly _destroy$ = new Subject<void>();

  // Angular Signals for reactive state
  private readonly _isAuthenticated = signal<boolean>(false);
  private readonly _currentUser = signal<User | null>(null);
  private readonly _tokenExpiry = signal<Date | null>(null);
  private readonly _isRefreshing = signal<boolean>(false);
  private readonly _refreshError = signal<string | null>(null);

  // Public readonly signals
  /** Signal indicating if user is authenticated */
  readonly isAuthenticated = this._isAuthenticated.asReadonly();

  /** Signal containing current user data */
  readonly currentUser = this._currentUser.asReadonly();

  /** Signal containing token expiry date */
  readonly tokenExpiry = this._tokenExpiry.asReadonly();

  /** Signal indicating if token refresh is in progress */
  readonly isRefreshing = this._isRefreshing.asReadonly();

  /** Signal containing refresh error message */
  readonly refreshError = this._refreshError.asReadonly();

  // Computed signals
  /** Computed signal: time until token expires in milliseconds */
  readonly timeUntilExpiry = computed(() => {
    const expiry = this._tokenExpiry();
    if (!expiry) return null;
    return Math.max(0, expiry.getTime() - Date.now());
  });

  /** Computed signal: is token about to expire (within buffer time) */
  readonly isTokenExpiringSoon = computed(() => {
    const timeUntil = this.timeUntilExpiry();
    if (timeUntil === null) return false;
    return timeUntil <= this.config.refreshBufferSeconds * 1000;
  });

  /**
   * Observable of access token changes
   */
  get accessToken$(): Observable<string | null> {
    return this._accessToken$.asObservable();
  }

  /**
   * Observable of token refresh completion
   */
  get tokenRefreshCompleted$(): Observable<string> {
    return this._tokenRefreshCompleted$.asObservable();
  }

  constructor() {
    this.initializeFromStorage();
  }

  /**
   * Initialize service state from storage (localStorage or sessionStorage)
   * Attempts to restore session from JiraAuthService storage (access_token, user)
   * Also checks sessionStorage for user data
   */
  private initializeFromStorage(): void {
    try {
      // Try to load from localStorage first (Remember Me = true)
      let token = localStorage.getItem('access_token');
      let userStr = localStorage.getItem('user');
      let storageType = 'localStorage';

      // If not in localStorage, check sessionStorage (Remember Me = false)
      if (!token) {
        token = sessionStorage.getItem('access_token');
        userStr = sessionStorage.getItem('user');
        storageType = 'sessionStorage';
      }

      if (token && userStr) {
        const user = JSON.parse(userStr) as User;

        // Store in memory (BehaviorSubject)
        this._accessToken$.next(token);
        this._currentUser.set(user);
        this._isAuthenticated.set(true);

        // Set expiry (8 hours from initialization, assuming session is fresh)
        // Note: For more accurate expiry, JWT should be decoded
        const expiry = new Date(Date.now() + 8 * 60 * 60 * 1000);
        this._tokenExpiry.set(expiry);
        this._tokenExpiryTimestamp = expiry.getTime();

        // Also sync to sessionStorage for this service's own tracking
        sessionStorage.setItem('current_user', userStr);

        // Schedule refresh before expiry (8 hours - 2 min buffer = 7h58m)
        this.scheduleTokenRefresh(8 * 60 * 60 - 120);

        console.log(`[TokenStorageService] Session restored from ${storageType}`);
        return;
      }

      // Fallback: Check sessionStorage for user info (non-sensitive data only)
      const sessionUserStr = sessionStorage.getItem('current_user');
      if (sessionUserStr) {
        const user = JSON.parse(sessionUserStr) as User;
        this._currentUser.set(user);
        console.log('[TokenStorageService] User loaded from sessionStorage (no token)');
      }
    } catch (error) {
      console.error('[TokenStorageService] Failed to restore session:', error);
      this.log('Failed to restore session', error);
    }
  }

  /**
   * Store access token and schedule automatic refresh
   * @param accessToken - JWT access token
   * @param expiresIn - Token expiry time in seconds
   * @param user - Optional user data
   * @param rememberMe - Whether to persist across browser sessions (localStorage vs sessionStorage)
   */
  storeTokens(accessToken: string, expiresIn: number, user?: User, rememberMe: boolean = false): void {
    this.ngZone.run(() => {
      // Store in memory only
      this._accessToken$.next(accessToken);

      // Calculate and store expiry timestamp
      const expiryTimestamp = Date.now() + (expiresIn * 1000);
      this._tokenExpiryTimestamp = expiryTimestamp;
      this._tokenExpiry.set(new Date(expiryTimestamp));

      // Update authentication state
      this._isAuthenticated.set(true);

      // Store user info if provided
      if (user) {
        this._currentUser.set(user);
        try {
          // Store user in appropriate storage based on rememberMe
          if (rememberMe) {
            localStorage.setItem('current_user', JSON.stringify(user));
            // Also backup to sessionStorage for redundancy
            sessionStorage.setItem('current_user', JSON.stringify(user));
          } else {
            // Only store in sessionStorage (clears when browser closes)
            sessionStorage.setItem('current_user', JSON.stringify(user));
            localStorage.removeItem('current_user');
          }
        } catch (error) {
          this.log('Failed to store user in storage', error);
        }
      }

      // Schedule automatic token refresh
      this.scheduleTokenRefresh(expiresIn);

      this.log('Tokens stored successfully, expires in:', expiresIn, 'seconds, rememberMe:', rememberMe);
    });
  }

  /**
   * Get current access token
   * @returns Access token string or null if not authenticated
   */
  getAccessToken(): string | null {
    return this._accessToken$.getValue();
  }

  /**
   * Check if access token exists
   * @returns True if token exists
   */
  hasAccessToken(): boolean {
    return !!this._accessToken$.getValue();
  }

  /**
   * Schedule automatic token refresh before expiry
   * @param expiresIn - Token expiry time in seconds
   */
  scheduleTokenRefresh(expiresIn: number): void {
    // Clear any existing timer
    this.clearRefreshTimer();

    // Calculate when to refresh (expiry time - buffer)
    const refreshDelayMs = Math.max(0, (expiresIn - this.config.refreshBufferSeconds) * 1000);

    this.log('Scheduling token refresh in:', refreshDelayMs, 'ms');

    // Schedule refresh using RxJS timer
    this._refreshTimerSubscription = timer(refreshDelayMs)
      .pipe(
        takeUntil(this._destroy$),
        switchMap(() => this.performTokenRefresh()),
        catchError((error) => {
          this.log('Scheduled token refresh failed:', error);
          this._refreshError.set('Automatic token refresh failed. Please login again.');
          this.clearTokens();
          return of(null);
        })
      )
      .subscribe();
  }

  /**
   * Perform token refresh with retry logic
   * @returns Observable of new access token
   */
  refreshAccessToken(): Observable<string> {
    // If refresh is already in progress, wait for it to complete
    if (this._refreshTokenInProgress$.getValue()) {
      return this.waitForRefreshCompletion();
    }

    return this.performTokenRefresh();
  }

  /**
   * Internal method to perform token refresh with retry logic
   */
  private performTokenRefresh(): Observable<string> {
    this._refreshTokenInProgress$.next(true);
    this._isRefreshing.set(true);
    this._refreshError.set(null);

    this.log('Starting token refresh...');

    return this.http.post<TokenRefreshResponse>(
      `${this.API_URL}/auth/refresh`,
      {},
      { withCredentials: true } // Include httpOnly cookie with refresh token
    ).pipe(
      // Exponential backoff retry
      retry({
        count: this.config.maxRetryAttempts,
        delay: (error: HttpErrorResponse, retryCount: number) => {
          const delayMs = this.config.retryDelayMs * Math.pow(2, retryCount - 1);
          this.log(`Retry attempt ${retryCount} after ${delayMs}ms`);
          return timer(delayMs);
        }
      }),
      tap((response) => {
        this.log('Token refresh successful');

        // Store new tokens
        this.storeTokens(response.accessToken, response.expiresIn);

        // Notify pending requests
        this._tokenRefreshCompleted$.next(response.accessToken);

        // Resolve all pending requests with new token
        this.resolvePendingRequests(response.accessToken);
      }),
      map((response) => response.accessToken),
      catchError((error: HttpErrorResponse) => {
        this.log('Token refresh failed after retries:', error);

        // Determine error type
        let errorType = TokenStorageErrorType.REFRESH_FAILED;
        if (error.status === 401) {
          errorType = TokenStorageErrorType.TOKEN_EXPIRED;
        } else if (!navigator.onLine) {
          errorType = TokenStorageErrorType.NETWORK_ERROR;
        }

        const tokenError = new TokenStorageError(
          errorType,
          this.getErrorMessage(error),
          error
        );

        // Reject all pending requests
        this.rejectPendingRequests(tokenError);

        // Clear tokens on refresh failure
        this.clearTokens();

        // Navigate to login on auth errors
        if (errorType === TokenStorageErrorType.TOKEN_EXPIRED) {
          this.router.navigate(['/auth/login'], {
            queryParams: { sessionExpired: true }
          });
        }

        return throwError(() => tokenError);
      }),
      finalize(() => {
        this._refreshTokenInProgress$.next(false);
        this._isRefreshing.set(false);
      })
    );
  }

  /**
   * Wait for an ongoing token refresh to complete
   * @returns Observable of new access token
   */
  private waitForRefreshCompletion(): Observable<string> {
    return this._tokenRefreshCompleted$.pipe(
      take(1),
      catchError((error) => throwError(() => error))
    );
  }

  /**
   * Queue a request to wait for token refresh
   * @returns Promise that resolves with new token or rejects on error
   */
  queueRequestForRefresh(): Promise<string> {
    return new Promise((resolve, reject) => {
      this._pendingRequests.push({ resolve, reject });
    });
  }

  /**
   * Resolve all pending requests with new token
   */
  private resolvePendingRequests(token: string): void {
    while (this._pendingRequests.length > 0) {
      const request = this._pendingRequests.shift();
      request?.resolve(token);
    }
  }

  /**
   * Reject all pending requests with error
   */
  private rejectPendingRequests(error: Error): void {
    while (this._pendingRequests.length > 0) {
      const request = this._pendingRequests.shift();
      request?.reject(error);
    }
  }

  /**
   * Check if token is expiring soon (within buffer time)
   * Method version - can be called programmatically
   * @returns Boolean indicating if token needs refresh
   */
  checkIsTokenExpiringSoon(): boolean {
    if (!this._tokenExpiryTimestamp) return true;

    const bufferMs = this.config.refreshBufferSeconds * 1000;
    const timeUntilExpiry = this._tokenExpiryTimestamp - Date.now();

    return timeUntilExpiry <= bufferMs;
  }

  /**
   * Get time until token expires
   * @returns Time in milliseconds until expiry, or null if no token
   */
  getTimeUntilExpiry(): number | null {
    if (!this._tokenExpiryTimestamp) return null;
    return Math.max(0, this._tokenExpiryTimestamp - Date.now());
  }

  /**
   * Clear all tokens and authentication state
   */
  clearTokens(): void {
    this.ngZone.run(() => {
      // Clear in-memory tokens
      this._accessToken$.next(null);
      this._tokenExpiryTimestamp = null;

      // Clear signals
      this._isAuthenticated.set(false);
      this._currentUser.set(null);
      this._tokenExpiry.set(null);
      this._refreshError.set(null);

      // Clear timer
      this.clearRefreshTimer();

      // Clear both sessionStorage and localStorage
      try {
        sessionStorage.removeItem('current_user');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('user');
        localStorage.removeItem('current_user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        localStorage.removeItem('remember_me');
      } catch (error) {
        this.log('Failed to clear storage', error);
      }

      // Reject any pending requests
      this.rejectPendingRequests(
        new TokenStorageError(
          TokenStorageErrorType.TOKEN_EXPIRED,
          'Tokens cleared'
        )
      );

      this.log('Tokens cleared from all storage');
    });
  }

  /**
   * Logout user - clears tokens and navigates to login
   */
  logout(): void {
    // Call backend logout to clear httpOnly cookie
    this.http.post(`${this.API_URL}/auth/logout`, {}, {
      withCredentials: true
    }).pipe(
      catchError(() => of(null)) // Ignore logout errors
    ).subscribe();

    this.clearTokens();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Clear the refresh timer
   */
  private clearRefreshTimer(): void {
    if (this._refreshTimerSubscription) {
      // Note: RxJS timer returns a Subscription, not a number
      // We handle cleanup through takeUntil and unsubscribe
      this._refreshTimerSubscription = null;
    }
  }

  /**
   * Update configuration options
   * @param config - Partial configuration to merge
   */
  updateConfig(config: Partial<TokenStorageConfig>): void {
    Object.assign(this.config, config);
    this.log('Configuration updated:', this.config);
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<TokenStorageConfig> {
    return { ...this.config };
  }

  /**
   * Get error message from HTTP error
   */
  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.error?.message) {
      return error.error.message;
    }
    switch (error.status) {
      case 401:
        return 'Session expired. Please login again.';
      case 403:
        return 'Access denied. Please login again.';
      case 0:
        return 'Network error. Please check your connection.';
      default:
        return `Server error (${error.status}). Please try again.`;
    }
  }

  /**
   * Debug logging
   */
  private log(...args: unknown[]): void {
    if (this.config.debugLogging) {
      console.log('[TokenStorageService]', ...args);
    }
  }

  /**
   * Cleanup on service destruction
   */
  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this._tokenRefreshCompleted$.complete();
    this.clearRefreshTimer();
  }
}

/**
 * TokenRefreshQueue - Manages request queuing during token refresh
 *
 * This class provides an alternative approach to request queuing
 * using RxJS subjects for better composability.
 */
@Injectable({
  providedIn: 'root'
})
export class TokenRefreshQueue {
  private readonly tokenStorage = inject(TokenStorageService);

  private readonly _queueLocked$ = new BehaviorSubject<boolean>(false);
  private readonly _queueProcessor$ = new Subject<() => void>();

  /**
   * Queue a function to execute when token refresh completes
   * @param operation - Function to execute
   * @returns Promise that resolves when operation can proceed
   */
  async queue<T>(operation: () => Promise<T> | Observable<T>): Promise<T> {
    // If no refresh in progress, execute immediately
    if (!this._queueLocked$.getValue()) {
      return this.executeOperation(operation);
    }

    // Wait for queue to unlock
    return new Promise((resolve, reject) => {
      const subscription = this._queueLocked$.pipe(
        filter(locked => !locked),
        take(1)
      ).subscribe({
        next: () => {
          this.executeOperation(operation)
            .then(resolve)
            .catch(reject);
        },
        error: reject
      });

      // Cleanup subscription after completion
      setTimeout(() => subscription.unsubscribe(), 30000); // 30s timeout
    });
  }

  /**
   * Lock the queue (called when refresh starts)
   */
  lock(): void {
    this._queueLocked$.next(true);
  }

  /**
   * Unlock the queue (called when refresh completes)
   */
  unlock(): void {
    this._queueLocked$.next(false);
  }

  /**
   * Execute an operation (handles both Promise and Observable)
   */
  private async executeOperation<T>(
    operation: () => Promise<T> | Observable<T>
  ): Promise<T> {
    const result = operation();

    if (result instanceof Observable) {
      return result.toPromise() as Promise<T>;
    }

    return result;
  }
}

/**
 * Factory function to create TokenStorageService with custom config
 */
export function createTokenStorageService(
  config: Partial<TokenStorageConfig>
): TokenStorageService {
  const service = new TokenStorageService();
  service.updateConfig(config);
  return service;
}
