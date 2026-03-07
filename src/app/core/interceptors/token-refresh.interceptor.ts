import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import {
  catchError,
  filter,
  switchMap,
  take,
  tap,
  finalize,
  delayWhen
} from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  TokenStorageService,
  TokenStorageErrorType
} from '../auth/token-storage.service';

/**
 * Token refresh state management
 * Tracks whether a refresh is in progress and handles request queuing
 */
interface TokenRefreshState {
  /** Whether a token refresh is currently in progress */
  isRefreshing: boolean;
  /** Subject to notify waiting requests when refresh completes */
  refreshCompleted$: BehaviorSubject<string | null>;
}

// Global state for token refresh (shared across all interceptor instances)
const globalRefreshState: TokenRefreshState = {
  isRefreshing: false,
  refreshCompleted$: new BehaviorSubject<string | null>(null)
};

/**
 * Check if request should include authentication token
 * @param req - HTTP request
 * @returns True if request needs auth header
 */
function shouldIncludeToken(req: HttpRequest<unknown>): boolean {
  // Skip token for:
  // - Non-HTTP URLs (file://, etc.)
  // - Auth endpoints (login, register, refresh)
  // - Static assets

  const url = req.url.toLowerCase();

  // Skip absolute URLs that are not our API
  if (req.url.startsWith('http') && !url.includes('/api/')) {
    return false;
  }

  // Skip auth endpoints
  const authEndpoints = [
    '/auth/login',
    '/auth/register',
    '/auth/refresh',
    '/auth/logout',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-email'
  ];

  if (authEndpoints.some(endpoint => url.includes(endpoint))) {
    return false;
  }

  // Skip static assets
  const staticExtensions = ['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico'];
  if (staticExtensions.some(ext => url.endsWith(ext))) {
    return false;
  }

  return true;
}

/**
 * Add authorization header to request
 * @param req - Original request
 * @param token - Access token
 * @returns Cloned request with auth header
 */
function addAuthHeader(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

/**
 * Token Refresh Interceptor
 *
 * Features:
 * - Automatically adds Bearer token to API requests
 * - Handles 401 errors by attempting token refresh
 * - Queues concurrent requests during token refresh
 * - Prevents infinite refresh loops
 * - Graceful degradation on refresh failure
 */
export const tokenRefreshInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  // Skip auth header for certain requests
  if (!shouldIncludeToken(req)) {
    return next(req);
  }

  // Get current token
  const token = tokenStorage.getAccessToken();

  // If no token, proceed without auth header
  if (!token) {
    return next(req);
  }

  // Add auth header and handle response
  const authReq = addAuthHeader(req, token);

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only handle 401 errors
      if (error.status !== 401) {
        return throwError(() => error);
      }

      // Check if request was already a retry (prevent infinite loops)
      if (req.headers.has('X-Retry-After-Refresh')) {
        tokenStorage.clearTokens();
        showSessionExpired(snackBar);
        router.navigate(['/auth/login'], {
          queryParams: { sessionExpired: true }
        });
        return throwError(() => new Error('Session expired after token refresh'));
      }

      // Handle token refresh
      return handleTokenRefresh(req, next, tokenStorage, router, snackBar);
    })
  );
};

/**
 * Handle token refresh with request queuing
 */
function handleTokenRefresh(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  tokenStorage: TokenStorageService,
  router: Router,
  snackBar: MatSnackBar
): Observable<HttpEvent<unknown>> {
  const { isRefreshing, refreshCompleted$ } = globalRefreshState;

  // If refresh is already in progress, queue this request
  if (isRefreshing) {
    return queueRequest(req, next, refreshCompleted$);
  }

  // Start token refresh
  globalRefreshState.isRefreshing = true;
  refreshCompleted$.next(null);

  return tokenStorage.refreshAccessToken().pipe(
    switchMap((newToken: string) => {
      // Notify waiting requests
      refreshCompleted$.next(newToken);

      // Retry original request with new token
      const retryReq = addAuthHeader(req, newToken).clone({
        headers: req.headers.set('X-Retry-After-Refresh', 'true')
      });

      return next(retryReq);
    }),
    catchError((refreshError) => {
      // Token refresh failed
      refreshCompleted$.next(null);

      // Determine error type and handle appropriately
      if (refreshError.type === TokenStorageErrorType.TOKEN_EXPIRED ||
          refreshError.type === TokenStorageErrorType.INVALID_TOKEN) {
        showSessionExpired(snackBar);
        router.navigate(['/auth/login'], {
          queryParams: { sessionExpired: true }
        });
      } else if (refreshError.type === TokenStorageErrorType.NETWORK_ERROR) {
        showNetworkError(snackBar);
      } else {
        showGenericError(snackBar);
      }

      return throwError(() => refreshError);
    }),
    finalize(() => {
      globalRefreshState.isRefreshing = false;
    })
  );
}

/**
 * Queue a request to wait for token refresh completion
 */
function queueRequest(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  refreshCompleted$: BehaviorSubject<string | null>
): Observable<HttpEvent<unknown>> {
  return refreshCompleted$.pipe(
    filter((token): token is string => token !== null),
    take(1),
    switchMap((token) => {
      // Retry request with new token
      const retryReq = addAuthHeader(req, token).clone({
        headers: req.headers.set('X-Retry-After-Refresh', 'true')
      });
      return next(retryReq);
    }),
    catchError((error) => {
      // If queued request fails after refresh, propagate error
      return throwError(() => error);
    })
  );
}

/**
 * Show session expired notification
 */
function showSessionExpired(snackBar: MatSnackBar): void {
  snackBar.open(
    'Your session has expired. Please login again.',
    'Close',
    {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    }
  );
}

/**
 * Show network error notification
 */
function showNetworkError(snackBar: MatSnackBar): void {
  snackBar.open(
    'Network connection error. Please check your connection and try again.',
    'Close',
    {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    }
  );
}

/**
 * Show generic error notification
 */
function showGenericError(snackBar: MatSnackBar): void {
  snackBar.open(
    'An error occurred. Please try again.',
    'Close',
    {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    }
  );
}

/**
 * Alternative interceptor with enhanced features:
 * - Proactive token refresh (refresh before expiry)
 * - Request deduplication
 * - Better error categorization
 */
export const enhancedTokenRefreshInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  // Skip auth header for certain requests
  if (!shouldIncludeToken(req)) {
    return next(req);
  }

  // Check if token is expiring soon and refresh proactively
  if (tokenStorage.isTokenExpiringSoon() && !globalRefreshState.isRefreshing) {
    globalRefreshState.isRefreshing = true;

    // Trigger background refresh
    tokenStorage.refreshAccessToken().pipe(
      tap((newToken) => {
        globalRefreshState.refreshCompleted$.next(newToken);
      }),
      catchError(() => {
        // Silent failure - will retry on next request or let it fail naturally
        return of(null);
      }),
      finalize(() => {
        globalRefreshState.isRefreshing = false;
      })
    ).subscribe();
  }

  const token = tokenStorage.getAccessToken();

  if (!token) {
    return next(req);
  }

  const authReq = addAuthHeader(req, token);

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      if (req.headers.has('X-Retry-After-Refresh')) {
        tokenStorage.clearTokens();
        showSessionExpired(snackBar);
        router.navigate(['/auth/login'], { queryParams: { sessionExpired: true } });
        return throwError(() => new Error('Session expired'));
      }

      return handleTokenRefresh(req, next, tokenStorage, router, snackBar);
    })
  );
};

/**
 * Simple JWT interceptor (backward compatible)
 * Just adds token to requests without refresh logic
 * Use this if you only need basic token injection
 */
export const simpleJwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const tokenStorage = inject(TokenStorageService);

  if (!shouldIncludeToken(req)) {
    return next(req);
  }

  const token = tokenStorage.getAccessToken();

  if (!token) {
    return next(req);
  }

  return next(addAuthHeader(req, token));
};
