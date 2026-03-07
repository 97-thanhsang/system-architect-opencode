import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { JiraAuthService } from '../auth/jira-auth.service';
import { TokenStorageService } from '../auth/token-storage.service';

/**
 * Public Guard - Prevents authenticated users from accessing public pages (login, register, etc.)
 * Redirects authenticated users to the dashboard or home page
 * 
 * Usage: Apply to routes that should only be accessible to non-authenticated users
 * Example: login, register, forgot-password pages
 * 
 * @example
 * {
 *   path: 'login',
 *   component: LoginComponent,
 *   canActivate: [publicGuard]
 * }
 */
export const publicGuard: CanActivateFn = (route, state) => {
  const jiraAuthService = inject(JiraAuthService);
  const tokenStorageService = inject(TokenStorageService);
  const router = inject(Router);

  console.log('[PublicGuard] Checking if user is authenticated...');
  console.log('[PublicGuard] Route:', state.url);

  // Check both services for authentication
  // Use the signal values (function calls) to get current state
  const isJiraAuth = jiraAuthService.isAuthenticated();
  const isTokenStorageAuth = tokenStorageService.isAuthenticated();

  console.log('[PublicGuard] JiraAuthService.isAuthenticated():', isJiraAuth);
  console.log('[PublicGuard] TokenStorageService.isAuthenticated():', isTokenStorageAuth);

  // If user is authenticated in either service, redirect to dashboard
  if (isJiraAuth || isTokenStorageAuth) {
    console.log('[PublicGuard] ✅ User is already authenticated, redirecting to dashboard');
    
    // Get returnUrl from query params if available, otherwise go to dashboard
    const returnUrl = route.queryParams['returnUrl'] || '/module/fe';
    
    router.navigate([returnUrl]);
    return false;
  }

  // User is not authenticated, allow access to public route
  console.log('[PublicGuard] ✅ User not authenticated, allowing access to public route');
  return true;
};
