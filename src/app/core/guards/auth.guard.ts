import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { JiraAuthService } from '../auth/jira-auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const jiraAuth = inject(JiraAuthService);
  const router = inject(Router);

  // Check both legacy auth and Jira auth
  if (authService.isAuthenticated() || jiraAuth.isAuthenticated()) {
    return true;
  }

  // Redirect to login page
  router.navigate(['/auth/login'], { 
    queryParams: { returnUrl: state.url }
  });
  return false;
};
