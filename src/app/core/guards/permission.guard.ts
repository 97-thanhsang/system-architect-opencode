import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionService } from '../auth/permission.service';
import { PermissionCheck, ModuleType } from '../models/permission.model';

/**
 * Permission Guard - Granular route protection
 * 
 * Usage in routes:
 * 
 * // Simple module access
 * { 
 *   path: 'analyze', 
 *   loadComponent: () => import('./analyze.component'),
 *   canActivate: [permissionGuard],
 *   data: { permission: { module: 'fe' } }
 * }
 * 
 * // Module + Feature + Action
 * {
 *   path: 'tasks',
 *   loadComponent: () => import('./tasks.component'),
 *   canActivate: [permissionGuard],
 *   data: { permission: { module: 'fe', feature: 'tasks', action: 'view' } }
 * }
 * 
 * // Multiple permissions (any)
 * {
 *   path: 'admin',
 *   loadComponent: () => import('./admin.component'),
 *   canActivate: [permissionGuard],
 *   data: { 
 *     permission: { module: 'admin' },
 *     permissionMode: 'any'
 *   }
 * }
 */
export const permissionGuard: CanActivateFn = (route, state) => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  // Get permission config from route data
  const permissionData = route.data?.['permission'] as PermissionCheck | undefined;
  const permissionMode = route.data?.['permissionMode'] as 'any' | 'all' | undefined;
  const redirectTo = route.data?.['permissionRedirect'] as string | undefined;

  // If no permission config, allow access
  if (!permissionData) {
    return true;
  }

  // Build permission checks
  const checks: PermissionCheck[] = Array.isArray(permissionData) 
    ? permissionData 
    : [permissionData];

  // Check permissions based on mode
  let hasAccess = false;
  if (permissionMode === 'all') {
    hasAccess = permissionService.hasAllPermissions(checks);
  } else {
    // Default: any mode
    hasAccess = permissionService.hasAnyPermission(checks);
  }

  if (!hasAccess) {
    // Redirect to configured route or deny access
    if (redirectTo) {
      return router.createUrlTree([redirectTo]);
    }
    
    // Default: redirect to unauthorized page
    return router.createUrlTree(['/unauthorized']);
  }

  return true;
};

/**
 * Helper function to create permission guard with pre-configured permissions
 */
export function createPermissionGuard(
  module: ModuleType,
  feature?: string,
  action?: PermissionCheck['action']
): CanActivateFn {
  return (route, state) => {
    const permissionService = inject(PermissionService);
    const router = inject(Router);

    const hasAccess = permissionService.hasPermission({
      module,
      feature,
      action
    });

    if (!hasAccess) {
      return router.createUrlTree(['/unauthorized']);
    }

    return true;
  };
}

/**
 * Module-specific guards for common use cases
 */

// FE Module Guards
export const feModuleGuard: CanActivateFn = createPermissionGuard('fe');
export const feAnalyzeGuard: CanActivateFn = createPermissionGuard('fe', 'analyze', 'view');
export const feCodeGuard: CanActivateFn = createPermissionGuard('fe', 'code', 'view');
export const feReviewGuard: CanActivateFn = createPermissionGuard('fe', 'review', 'view');

// BE Module Guards
export const beModuleGuard: CanActivateFn = createPermissionGuard('be');
export const beDatabaseGuard: CanActivateFn = createPermissionGuard('be', 'database', 'view');
export const beApiGuard: CanActivateFn = createPermissionGuard('be', 'api', 'view');

// QC Module Guards
export const qcModuleGuard: CanActivateFn = createPermissionGuard('qc');
export const qcTestGuard: CanActivateFn = createPermissionGuard('qc', 'test', 'view');

// BA Module Guards
export const baModuleGuard: CanActivateFn = createPermissionGuard('ba');
export const baAnalysisGuard: CanActivateFn = createPermissionGuard('ba', 'analysis', 'view');

// Admin Guards
export const adminGuard: CanActivateFn = createPermissionGuard('admin');
export const adminUserGuard: CanActivateFn = createPermissionGuard('admin', 'users', 'view');
export const adminRoleGuard: CanActivateFn = createPermissionGuard('admin', 'roles', 'view');
