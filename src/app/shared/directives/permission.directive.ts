import { Directive, Input, TemplateRef, ViewContainerRef, inject, OnInit, OnDestroy, effect, EffectRef } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { PermissionService } from '../../core/auth/permission.service';
import { PermissionCheck, ModuleType, ActionType } from '../../core/models/permission.model';

/**
 * Enhanced Permission Directive
 * 
 * Supports 3 modes:
 * 1. Role-based (legacy): *appHasPermission="'admin'"
 * 2. Granular permission: *appHasPermission="{ module: 'fe', feature: 'analyze', action: 'view' }"
 * 3. Permission string: *appHasPermission="'fe:analyze:view'"
 * 
 * Usage Examples:
 * 
 * // Role-based (legacy)
 * <div *appHasPermission="'admin'">Admin content</div>
 * <div *appHasPermission="['admin', 'moderator'">Admin or moderator</div>
 * 
 * // Granular permission object
 * <button *appHasPermission="{ module: 'fe', feature: 'tasks', action: 'create' }">
 *   Create Task
 * </button>
 * 
 * // Permission string
 * <div *appHasPermission="'fe:analyze:view'">View Analyze</div>
 * 
 * // Multiple permissions (any)
 * <div *appHasPermission="['fe:analyze:view', 'be:database:view']">Any permission</div>
 */
@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private authService = inject(AuthService);
  private permissionService = inject(PermissionService);

  private hasView = false;
  private currentCheck: PermissionCheck | null = null;
  private permissionEffect: EffectRef | null = null;

  @Input() set appHasPermission(permissions: string | string[] | PermissionCheck | PermissionCheck[]) {
    this.checkPermission(permissions);
  }

  ngOnInit(): void {
    // Set up effect to re-check permission when permissions change
    this.permissionEffect = effect(() => {
      // Access the permissions signal to create dependency
      const _ = this.permissionService.permissions();
      // Re-check if we have a current check
      if (this.currentCheck) {
        this.checkPermission(this.currentCheck);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.permissionEffect) {
      this.permissionEffect.destroy();
    }
  }

  private checkPermission(permissions: string | string[] | PermissionCheck | PermissionCheck[]): void {
    let hasPermission = false;

    // Normalize to array
    const permArray = Array.isArray(permissions) ? permissions : [permissions];

    for (const perm of permArray) {
      if (this.isPermissionCheck(perm)) {
        // Granular permission object
        hasPermission = this.permissionService.hasPermission(perm as PermissionCheck);
      } else if (this.isPermissionString(perm as string)) {
        // Permission string like "fe:analyze:view"
        hasPermission = this.permissionService.hasPermissionString(perm as string);
      } else {
        // Role-based (legacy)
        hasPermission = this.checkRolePermission(perm as string);
      }

      // If any permission matches, grant access
      if (hasPermission) break;
    }

    this.updateView(hasPermission);
  }

  private isPermissionCheck(value: string | PermissionCheck): value is PermissionCheck {
    return typeof value === 'object' && 'module' in value;
  }

  private isPermissionString(value: string): boolean {
    return value.includes(':');
  }

  private checkRolePermission(role: string): boolean {
    const userRole = this.authService.selectedRole() as string;
    return userRole ? userRole === role || userRole === 'admin' : false;
  }

  private updateView(hasPermission: boolean): void {
    if (hasPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}

/**
 * Permission mode enum for clarity
 */
export enum PermissionMode {
  ANY = 'any',    // User needs any of the permissions
  ALL = 'all'     // User needs all permissions
}

/**
 * Extended permission directive with mode support
 * 
 * Usage:
 * <div *appHasPermissionEx="{ permissions: ['admin', 'fe:analyze:view'], mode: 'any' }">
 *   Content
 * </div>
 */
@Directive({
  selector: '[appHasPermissionEx]',
  standalone: true
})
export class HasPermissionExDirective implements OnInit, OnDestroy {
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private permissionService = inject(PermissionService);

  private hasView = false;
  private permissionEffect: EffectRef | null = null;

  @Input() set appHasPermissionEx(config: { 
    permissions: (string | PermissionCheck)[]; 
    mode?: PermissionMode 
  }) {
    this.checkPermission(config.permissions, config.mode || PermissionMode.ANY);
  }

  ngOnInit(): void {
    this.permissionEffect = effect(() => {
      const _ = this.permissionService.permissions();
      // Re-check when permissions change
    });
  }

  ngOnDestroy(): void {
    if (this.permissionEffect) {
      this.permissionEffect.destroy();
    }
  }

  private checkPermission(permissions: (string | PermissionCheck)[], mode: PermissionMode): void {
    const results: boolean[] = [];

    for (const perm of permissions) {
      let hasPermission = false;
      
      if (this.isPermissionCheck(perm)) {
        hasPermission = this.permissionService.hasPermission(perm as PermissionCheck);
      } else if (this.isPermissionString(perm)) {
        hasPermission = this.permissionService.hasPermissionString(perm);
      } else {
        // Role-based - treat as string
        hasPermission = this.permissionService.hasPermissionString(perm);
      }
      
      results.push(hasPermission);
    }

    const hasAccess = mode === PermissionMode.ALL 
      ? results.every(r => r) 
      : results.some(r => r);

    this.updateView(hasAccess);
  }

  private isPermissionCheck(value: string | PermissionCheck): value is PermissionCheck {
    return typeof value === 'object' && 'module' in value;
  }

  private isPermissionString(value: string): boolean {
    return value.includes(':');
  }

  private updateView(hasPermission: boolean): void {
    if (hasPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}

/**
 * Feature-specific directive for cleaner templates
 * Usage: *appCanCreate="'tasks'" → checks fe:tasks:create
 */
@Directive({
  selector: '[appCanCreate]',
  standalone: true
})
export class CanCreateDirective {
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private permissionService = inject(PermissionService);

  private hasView = false;

  @Input() set appCanCreate(feature: string) {
    const module = this.getCurrentModule();
    const hasPermission = this.permissionService.canPerformAction(module, feature, 'create');
    this.updateView(hasPermission);
  }

  private getCurrentModule(): ModuleType {
    // Try to get from current route or default to 'fe'
    return 'fe'; // Default - can be enhanced to detect from route
  }

  private updateView(hasPermission: boolean): void {
    if (hasPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}

/**
 * Directive for action buttons
 * Usage: *appHasAction="'delete'" → checks currentModule:currentFeature:delete
 */
@Directive({
  selector: '[appHasAction]',
  standalone: true
})
export class HasActionDirective {
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private permissionService = inject(PermissionService);

  private hasView = false;
  private currentFeature = '';

  @Input() set appHasAction(action: ActionType) {
    const module = 'fe'; // Default
    const hasPermission = this.permissionService.canPerformAction(
      module, 
      this.currentFeature, 
      action
    );
    this.updateView(hasPermission);
  }

  @Input() set appHasActionFeature(feature: string) {
    this.currentFeature = feature;
  }

  private updateView(hasPermission: boolean): void {
    if (hasPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
