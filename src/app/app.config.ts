import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import {
  tokenRefreshInterceptor,
  enhancedTokenRefreshInterceptor,
  simpleJwtInterceptor
} from './core/interceptors/token-refresh.interceptor';

/**
 * Angular Application Configuration
 *
 * Interceptor Order (executed sequentially):
 * 1. tokenRefreshInterceptor - Adds Bearer token and handles 401 with refresh
 * 2. errorInterceptor - Global error handling and notifications
 *
 * Alternative options:
 * - Use `enhancedTokenRefreshInterceptor` for proactive token refresh (before expiry)
 * - Use `simpleJwtInterceptor` for basic token injection without refresh logic
 * - Use `jwtInterceptor` (legacy) for backward compatibility with existing auth service
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules)
    ),
    provideHttpClient(
      withInterceptors([
        // Option 1: Token Refresh with 401 handling (recommended)
        tokenRefreshInterceptor,

        // Option 2: Enhanced with proactive refresh (uncomment to use)
        // enhancedTokenRefreshInterceptor,

        // Option 3: Simple JWT only, no refresh (uncomment to use)
        // simpleJwtInterceptor,

        // Option 4: Legacy JWT interceptor (uncomment to use)
        // jwtInterceptor,

        // Global error handler (always last)
        errorInterceptor
      ])
    ),
    provideAnimationsAsync()
  ]
};
