import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { environment } from '../../../environments/environment';

/**
 * Audit Action Types
 */
export type AuditAction = 
  | 'view'
  | 'create'
  | 'update'
  | 'delete'
  | 'export'
  | 'import'
  | 'login'
  | 'logout'
  | 'permission_denied'
  | 'api_call';

/**
 * Audit Log Entry
 */
export interface AuditLog {
  id?: string;
  userId: string;
  userName?: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  module?: string;
  feature?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  status: 'success' | 'failure' | 'warning';
  errorMessage?: string;
}

/**
 * Audit Filter
 */
export interface AuditFilter {
  userId?: string;
  action?: AuditAction;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  module?: string;
  status?: 'success' | 'failure' | 'warning';
}

/**
 * Audit Statistics
 */
export interface AuditStats {
  totalActions: number;
  actionsByType: Record<AuditAction, number>;
  actionsByUser: Record<string, number>;
  actionsByResource: Record<string, number>;
  recentActivity: AuditLog[];
}

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private readonly http = inject(HttpClient);
  private readonly apiService = inject(ApiService);

  // Signal-based state
  private readonly _logs = signal<AuditLog[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Real-time updates
  private readonly auditSubject = new Subject<AuditLog>();

  // Public signals
  readonly logs = this._logs.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Observable for real-time updates
  readonly auditStream$ = this.auditSubject.asObservable();

  /**
   * Log an action
   */
  log(action: AuditAction, resource: string, options?: {
    resourceId?: string;
    module?: string;
    feature?: string;
    details?: Record<string, unknown>;
    status?: 'success' | 'failure' | 'warning';
    errorMessage?: string;
  }): void {
    const logEntry: AuditLog = {
      userId: this.getCurrentUserId(),
      userName: this.getCurrentUserName(),
      action,
      resource,
      resourceId: options?.resourceId,
      module: options?.module,
      feature: options?.feature,
      details: options?.details,
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      timestamp: new Date(),
      status: options?.status || 'success',
      errorMessage: options?.errorMessage
    };

    // Emit to real-time stream
    this.auditSubject.next(logEntry);

    // Send to backend (non-blocking)
    this.sendToBackend(logEntry).pipe(
      catchError(error => {
        console.error('AuditService: Failed to send audit log', error);
        // Store locally as fallback
        this.storeLocally(logEntry);
        return of(null);
      })
    ).subscribe();
  }

  /**
   * Log view action
   */
  logView(resource: string, resourceId?: string, module?: string): void {
    this.log('view', resource, { resourceId, module });
  }

  /**
   * Log create action
   */
  logCreate(resource: string, resourceId?: string, module?: string, details?: Record<string, unknown>): void {
    this.log('create', resource, { resourceId, module, details });
  }

  /**
   * Log update action
   */
  logUpdate(resource: string, resourceId?: string, module?: string, details?: Record<string, unknown>): void {
    this.log('update', resource, { resourceId, module, details });
  }

  /**
   * Log delete action
   */
  logDelete(resource: string, resourceId?: string, module?: string, details?: Record<string, unknown>): void {
    this.log('delete', resource, { resourceId, module, details });
  }

  /**
   * Log permission denied
   */
  logPermissionDenied(resource: string, module?: string): void {
    this.log('permission_denied', resource, { module, status: 'warning' });
  }

  /**
   * Log API call
   */
  logApiCall(endpoint: string, method: string, status: number, duration?: number): void {
    this.log('api_call', endpoint, {
      details: { method, status, duration },
      status: status >= 200 && status < 300 ? 'success' : 'failure'
    });
  }

  /**
   * Log login
   */
  logLogin(success: boolean, method?: string): void {
    this.log('login', 'auth', { 
      details: { method },
      status: success ? 'success' : 'failure'
    });
  }

  /**
   * Log logout
   */
  logLogout(): void {
    this.log('logout', 'auth');
  }

  /**
   * Get audit logs from API
   */
  getLogs(filter?: AuditFilter): Observable<AuditLog[]> {
    this._loading.set(true);
    this._error.set(null);

    const params = this.buildQueryParams(filter);

    return this.apiService.get<AuditLog[]>('/audit', params).pipe(
      tap(logs => {
        this._logs.set(logs);
        this._loading.set(false);
      }),
      catchError(error => {
        this._error.set('Failed to load audit logs');
        this._loading.set(false);
        console.error('AuditService: Failed to load audit logs', error);
        return of([]);
      })
    );
  }

  /**
   * Get audit stats
   */
  getStats(days: number = 7): Observable<AuditStats> {
    return this.apiService.get<AuditStats>(`/audit/stats?days=${days}`).pipe(
      catchError(error => {
        console.error('AuditService: Failed to load audit stats', error);
        return of(this.getDefaultStats());
      })
    );
  }

  /**
   * Export audit logs
   */
  exportLogs(filter?: AuditFilter, format: 'csv' | 'json' = 'csv'): Observable<Blob> {
    const params = this.buildQueryParams(filter);
    params.set('format', format);

    return this.http.get(`${environment.apiUrl}/audit/export`, {
      params,
      responseType: 'blob'
    });
  }

  /**
   * Clear local audit cache
   */
  clearCache(): void {
    this._logs.set([]);
  }

  /**
   * Send audit log to backend
   */
  private sendToBackend(log: AuditLog): Observable<AuditLog> {
    return this.apiService.post<AuditLog>('/audit', log);
  }

  /**
   * Store audit log locally as fallback
   */
  private storeLocally(log: AuditLog): void {
    const stored = JSON.parse(localStorage.getItem('audit_offline') || '[]');
    stored.push(log);
    
    // Keep only last 50 offline logs
    if (stored.length > 50) {
      stored.splice(0, stored.length - 50);
    }
    
    localStorage.setItem('audit_offline', JSON.stringify(stored));
  }

  /**
   * Sync offline logs
   */
  syncOfflineLogs(): void {
    const stored = JSON.parse(localStorage.getItem('audit_offline') || '[]');
    if (stored.length === 0) return;

    // Send each offline log
    stored.forEach((log: AuditLog) => {
      this.sendToBackend(log).subscribe({
        next: () => {
          // Remove from local storage on success
          const idx = stored.indexOf(log);
          if (idx > -1) stored.splice(idx, 1);
          localStorage.setItem('audit_offline', JSON.stringify(stored));
        },
        error: () => {
          // Keep in local storage on failure
        }
      });
    });
  }

  /**
   * Build query params from filter
   */
  private buildQueryParams(filter?: AuditFilter): HttpParams {
    let params = new HttpParams();
    
    if (!filter) return params;

    if (filter.userId) params = params.set('userId', filter.userId);
    if (filter.action) params = params.set('action', filter.action);
    if (filter.resource) params = params.set('resource', filter.resource);
    if (filter.module) params = params.set('module', filter.module);
    if (filter.status) params = params.set('status', filter.status);
    if (filter.startDate) params = params.set('startDate', filter.startDate.toISOString());
    if (filter.endDate) params = params.set('endDate', filter.endDate.toISOString());

    return params;
  }

  /**
   * Get current user ID
   */
  private getCurrentUserId(): string {
    try {
      const user = JSON.parse(localStorage.getItem('current_user') || '{}');
      return user.id || 'anonymous';
    } catch {
      return 'anonymous';
    }
  }

  /**
   * Get current user name
   */
  private getCurrentUserName(): string {
    try {
      const user = JSON.parse(localStorage.getItem('current_user') || '{}');
      return user.displayName || user.email || 'Anonymous';
    } catch {
      return 'Anonymous';
    }
  }

  /**
   * Get client IP (approximation)
   */
  private getClientIP(): string {
    // This is a placeholder - in real app, you'd get this from the server
    return 'client-ip';
  }

  /**
   * Get default stats
   */
  private getDefaultStats(): AuditStats {
    return {
      totalActions: 0,
      actionsByType: {
        view: 0,
        create: 0,
        update: 0,
        delete: 0,
        export: 0,
        import: 0,
        login: 0,
        logout: 0,
        permission_denied: 0,
        api_call: 0
      },
      actionsByUser: {},
      actionsByResource: {},
      recentActivity: []
    };
  }
}
