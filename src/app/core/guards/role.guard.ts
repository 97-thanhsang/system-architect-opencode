import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../auth/auth.service';

/**
 * Role Guard - Check if user has required role
 * Usage: canActivate: [roleGuard('FE')]
 * Or: canActivate: [roleGuard(['FE', 'BE'])]
 */
export const roleGuard = (allowedRoles: string | string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const userRole = authService.selectedRole();

    if (userRole && roles.includes(userRole)) {
      return true;
    }

    // Redirect to dashboard if user doesn't have required role
    return router.parseUrl('/dashboard');
  };
};

/**
 * Feature Flag Guard - Check if feature is enabled
 * Usage: canActivate: [featureGuard('newDashboard')]
 */
export const featureGuard = (featureName: string): CanActivateFn => {
  return () => {
    const router = inject(Router);
    
    // Check localStorage for feature flag
    const features = JSON.parse(localStorage.getItem('feature_flags') || '{}');
    
    if (features[featureName]) {
      return true;
    }

    return router.parseUrl('/dashboard');
  };
};
