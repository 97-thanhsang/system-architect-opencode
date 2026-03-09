/**
 * Permission Models for Granular Access Control
 * 
 * 4-Level Permission System:
 * - Level 1: Module (fe, be, qc, ba)
 * - Level 2: Feature (analyze, code, review, etc.)
 * - Level 3: Action (view, create, edit, delete)
 * - Level 4: Resource (specific resource IDs)
 */

export type PermissionLevel = 'module' | 'feature' | 'action' | 'resource';

export type ModuleType = 'fe' | 'be' | 'qc' | 'ba' | 'pm' | 'admin';

export type ActionType = 'view' | 'create' | 'edit' | 'delete' | 'execute' | 'export' | 'import';

export interface Permission {
  id: string;
  level: PermissionLevel;
  module: ModuleType;
  feature?: string;
  action?: ActionType;
  resource?: string;
  resourceId?: string;
}

export interface UserPermission {
  userId: string;
  permissions: Permission[];
  grantedAt: Date;
  expiresAt?: Date;
}

export interface CachedPermissions {
  userId: string;
  permissions: Permission[];
  lastUpdated: Date;
  expiresAt: Date;
}

export interface PermissionCheck {
  module: ModuleType;
  feature?: string;
  action?: ActionType;
  resource?: string;
}

/**
 * Permission string format: "module:feature:action:resource"
 * Example: "fe:analyze:view", "be:database:delete"
 */
export const PERMISSION_SEPARATOR = ':';

export function buildPermissionString(permission: PermissionCheck): string {
  const parts: string[] = [permission.module];
  if (permission.feature) parts.push(permission.feature);
  if (permission.action) parts.push(permission.action);
  if (permission.resource) parts.push(permission.resource);
  return parts.join(PERMISSION_SEPARATOR);
}

export function parsePermissionString(permString: string): PermissionCheck {
  const parts = permString.split(PERMISSION_SEPARATOR);
  return {
    module: parts[0] as ModuleType,
    feature: parts[1],
    action: parts[2] as ActionType,
    resource: parts[3]
  };
}

export function hasPermission(
  userPermissions: Permission[], 
  required: PermissionCheck
): boolean {
  return userPermissions.some(perm => {
    // Exact match
    if (perm.module === required.module &&
        perm.feature === required.feature &&
        perm.action === required.action &&
        perm.resource === required.resource) {
      return true;
    }
    
    // Wildcard: module only
    if (!perm.feature && !perm.action && !perm.resource &&
        perm.module === required.module) {
      return true;
    }
    
    // Wildcard: module + feature
    if (perm.feature && !perm.action && !perm.resource &&
        perm.module === required.module && 
        perm.feature === required.feature) {
      return true;
    }
    
    // Wildcard: module + feature + action
    if (perm.feature && perm.action && !perm.resource &&
        perm.module === required.module &&
        perm.feature === required.feature &&
        perm.action === required.action) {
      return true;
    }
    
    return false;
  });
}
