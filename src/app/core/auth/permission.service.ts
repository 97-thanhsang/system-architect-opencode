import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import {
  Permission,
  PermissionCheck,
  CachedPermissions,
  ModuleType,
  hasPermission as hasPermissionUtil,
  buildPermissionString
} from '../models/permission.model';
import { ApiService } from '../services/api.service';

const PERMISSION_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private readonly http = inject(HttpClient);
  private readonly apiService = inject(ApiService);

  // Signal-based state
  private readonly _permissions = signal<Permission[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _lastUpdated = signal<Date | null>(null);

  // Cache
  private permissionCache: CachedPermissions | null = null;

  // Public readonly signals
  readonly permissions = this._permissions.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly lastUpdated = this._lastUpdated.asReadonly();

  // Computed signals
  readonly permissionStrings = computed(() => 
    this._permissions().map(p => buildPermissionString({
      module: p.module,
      feature: p.feature,
      action: p.action,
      resource: p.resource
    }))
  );

  readonly modules = computed(() => {
    const perms = this._permissions();
    const moduleSet = new Set(perms.map(p => p.module));
    return Array.from(moduleSet);
  });

  readonly features = computed(() => {
    const perms = this._permissions();
    const featureSet = new Set(perms.filter(p => p.feature).map(p => p.feature!));
    return Array.from(featureSet);
  });

  /**
   * Check if user has a specific permission
   */
  hasPermission(check: PermissionCheck): boolean {
    const permissions = this._permissions();
    return hasPermissionUtil(permissions, check);
  }

  /**
   * Check if user has permission by string (e.g., "fe:analyze:view")
   */
  hasPermissionString(permissionString: string): boolean {
    const permissions = this._permissions();
    const check = this.parsePermissionString(permissionString);
    return hasPermissionUtil(permissions, check);
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(checks: PermissionCheck[]): boolean {
    return checks.some(check => this.hasPermission(check));
  }

  /**
   * Check if user has all of the specified permissions
   */
  hasAllPermissions(checks: PermissionCheck[]): boolean {
    return checks.every(check => this.hasPermission(check));
  }

  /**
   * Load permissions from API
   */
  loadPermissions(): Observable<Permission[]> {
    // Check cache first
    if (this.isCacheValid()) {
      return of(this.permissionCache!.permissions);
    }

    this._loading.set(true);
    this._error.set(null);

    return this.apiService.get<Permission[]>('/permissions').pipe(
      map((permissions: Permission[]) => {
        this._permissions.set(permissions);
        this._loading.set(false);
        this._lastUpdated.set(new Date());
        this.updateCache(permissions);
        return permissions;
      }),
      catchError((error: Error) => {
        this._error.set('Failed to load permissions');
        this._loading.set(false);
        console.error('PermissionService: Failed to load permissions', error);
        // Return cached permissions if available, otherwise empty array
        const fallback = this.permissionCache?.permissions || [];
        return of(fallback);
      })
    );
  }

  /**
   * Load permissions for a specific module
   */
  loadModulePermissions(moduleType: ModuleType): Observable<Permission[]> {
    return this.apiService.get<Permission[]>(`/permissions/module/${moduleType}`).pipe(
      map((permissions: Permission[]) => {
        const currentPerms = this._permissions();
        const filteredPerms = currentPerms.filter(p => p.module !== moduleType);
        this._permissions.set([...filteredPerms, ...permissions]);
        return permissions;
      }),
      catchError((error: Error) => {
        console.error('PermissionService: Failed to load module permissions', error);
        return of([]);
      })
    );
  }

  /**
   * Refresh permissions (force reload)
   */
  refreshPermissions(): Observable<Permission[]> {
    this.clearCache();
    return this.loadPermissions();
  }

  /**
   * Clear all permissions
   */
  clearPermissions(): void {
    this._permissions.set([]);
    this._lastUpdated.set(null);
    this.clearCache();
  }

  /**
   * Get cached permissions
   */
  getCachedPermissions(): Permission[] {
    return this.permissionCache?.permissions || [];
  }

  /**
   * Check if cache is valid
   */
  private isCacheValid(): boolean {
    if (!this.permissionCache) return false;
    const now = new Date().getTime();
    return now < this.permissionCache.expiresAt.getTime();
  }

  /**
   * Update cache
   */
  private updateCache(permissions: Permission[]): void {
    const now = new Date();
    this.permissionCache = {
      userId: this.getCurrentUserId(),
      permissions,
      lastUpdated: now,
      expiresAt: new Date(now.getTime() + PERMISSION_CACHE_TTL)
    };
  }

  /**
   * Clear cache
   */
  private clearCache(): void {
    this.permissionCache = null;
  }

  /**
   * Get current user ID
   */
  private getCurrentUserId(): string {
    const user = JSON.parse(localStorage.getItem('current_user') || '{}');
    return user.id || 'anonymous';
  }

  /**
   * Parse permission string to PermissionCheck
   */
  private parsePermissionString(permString: string): PermissionCheck {
    const parts = permString.split(':');
    return {
      module: parts[0] as ModuleType,
      feature: parts[1],
      action: parts[2] as Permission['action'],
      resource: parts[3]
    };
  }

  /**
   * Get permissions for a specific module
   */
  getModulePermissions(moduleType: ModuleType): Permission[] {
    return this._permissions().filter(p => p.module === moduleType);
  }

  /**
   * Get permissions for a specific feature
   */
  getFeaturePermissions(moduleType: ModuleType, feature: string): Permission[] {
    return this._permissions().filter(
      p => p.module === moduleType && p.feature === feature
    );
  }

  /**
   * Check if user has module access
   */
  hasModuleAccess(moduleType: ModuleType): boolean {
    return this.hasPermission({ module: moduleType });
  }

  /**
   * Check if user can perform action on feature
   */
  canPerformAction(
    moduleType: ModuleType, 
    feature: string, 
    action: Permission['action']
  ): boolean {
    return this.hasPermission({ 
      module: moduleType, 
      feature, 
      action 
    });
  }
}
