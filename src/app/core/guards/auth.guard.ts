import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { JiraAuthService } from '../auth/jira-auth.service';
import { TokenStorageService } from '../auth/token-storage.service';

/**
 * Auth Guard - Bảo vệ routes yêu cầu authentication
 * Kiểm tra cả JiraAuthService và TokenStorageService để đảm bảo session persistence
 */
export const authGuard: CanActivateFn = (route, state) => {
  const jiraAuthService = inject(JiraAuthService);
  const tokenStorageService = inject(TokenStorageService);
  const router = inject(Router);

  // Check both services for authentication
  const isJiraAuth = jiraAuthService.isAuthenticated();
  const isTokenStorageAuth = tokenStorageService.isAuthenticated();

  if (isJiraAuth || isTokenStorageAuth) {
    console.log('[AuthGuard] User authenticated:', { jiraAuth: isJiraAuth, tokenStorage: isTokenStorageAuth });
    return true;
  }

  // Redirect to login page với returnUrl
  console.log('[AuthGuard] User not authenticated, redirecting to login');
  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};
