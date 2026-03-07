import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { JiraAuthService } from '../auth/jira-auth.service';

/**
 * Auth Guard - Bảo vệ routes yêu cầu authentication
 * Sử dụng JiraAuthService với JWT tokens
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(JiraAuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirect to login page với returnUrl
  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};
