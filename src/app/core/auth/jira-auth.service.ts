import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';

export interface JiraUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  active: boolean;
}

export interface JiraAuthState {
  user: JiraUser | null;
  isAuthenticated: boolean;
  jiraUrl: string;
  error: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
  jiraUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class JiraAuthService {
  // Signals for state management
  private readonly _user = signal<JiraUser | null>(null);
  private readonly _isAuthenticated = signal<boolean>(false);
  private readonly _jiraUrl = signal<string>('https://task.ascvn.com.vn');
  private readonly _error = signal<string | null>(null);
  private readonly _loading = signal<boolean>(false);

  // Read-only signals
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  readonly jiraUrl = this._jiraUrl.asReadonly();
  readonly error = this._error.asReadonly();
  readonly loading = this._loading.asReadonly();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredAuth();
  }

  /**
   * Authenticate with Jira using username/password
   */
  login(credentials: LoginCredentials): Observable<boolean> {
    this._loading.set(true);
    this._error.set(null);

    const jiraUrl = credentials.jiraUrl || this._jiraUrl();

    // Store credentials temporarily for MCP server communication
    const authData = {
      username: credentials.username,
      password: credentials.password,
      jiraUrl: jiraUrl
    };

    // In a real implementation, you would:
    // 1. Call your backend API that communicates with Jira MCP server
    // 2. Validate credentials against Jira
    // 3. Get user info and store session

    // For demo, simulate successful authentication
    return this.validateJiraCredentials(authData).pipe(
      tap(result => {
        if (result.success && result.user) {
          this.setAuth(result.user, authData);
        } else {
          this._error.set(result.error || 'Invalid credentials');
        }
      }),
      map(result => result.success),
      catchError(error => {
        this._error.set(error.message || 'Authentication failed');
        this._loading.set(false);
        return of(false);
      }),
      tap(() => this._loading.set(false))
    );
  }

  /**
   * Validate credentials against Jira
   * In production, this should call your backend API
   */
  private validateJiraCredentials(authData: any): Observable<{success: boolean; user?: JiraUser; error?: string}> {
    // Simulate API call - Replace with actual Jira MCP integration
    // This would typically call: POST /api/auth/jira/login
    // Which then uses the MCP server to validate
    
    return new Observable(observer => {
      setTimeout(() => {
        // Demo: Accept SangNT/Asc_SangNT2023 as valid
        if (authData.username === 'SangNT' && authData.password === 'Asc_SangNT2023') {
          const mockUser: JiraUser = {
            id: 'user-001',
            username: authData.username,
            email: 'sangnt@ascvn.com.vn',
            displayName: 'Sang Nguyen',
            avatarUrl: undefined,
            active: true
          };
          observer.next({ success: true, user: mockUser });
        } else {
          observer.next({ success: false, error: 'Invalid username or password' });
        }
        observer.complete();
      }, 1000);
    });
  }

  /**
   * Set authentication state
   */
  private setAuth(user: JiraUser, authData: any): void {
    this._user.set(user);
    this._isAuthenticated.set(true);
    this._jiraUrl.set(authData.jiraUrl);
    this._error.set(null);
    
    // Store in localStorage (exclude password)
    localStorage.setItem('jira_user', JSON.stringify(user));
    localStorage.setItem('jira_url', authData.jiraUrl);
    localStorage.setItem('jira_username', authData.username);
    localStorage.setItem('jira_auth', 'true');
  }

  /**
   * Load stored auth from localStorage
   */
  private loadStoredAuth(): void {
    const isAuth = localStorage.getItem('jira_auth');
    const userStr = localStorage.getItem('jira_user');
    const jiraUrl = localStorage.getItem('jira_url');

    if (isAuth === 'true' && userStr) {
      try {
        const user = JSON.parse(userStr);
        this._user.set(user);
        this._isAuthenticated.set(true);
        if (jiraUrl) {
          this._jiraUrl.set(jiraUrl);
        }
      } catch (e) {
        this.logout();
      }
    }
  }

  /**
   * Logout
   */
  logout(): void {
    this._user.set(null);
    this._isAuthenticated.set(false);
    this._error.set(null);
    
    localStorage.removeItem('jira_user');
    localStorage.removeItem('jira_url');
    localStorage.removeItem('jira_username');
    localStorage.removeItem('jira_auth');
    
    this.router.navigate(['/auth/login']);
  }

  /**
   * Clear error message
   */
  clearError(): void {
    this._error.set(null);
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: string): boolean {
    // Implement permission checking logic
    return this._isAuthenticated();
  }

  /**
   * Get current user's Jira issues
   */
  getMyIssues(): Observable<any[]> {
    if (!this._isAuthenticated()) {
      return throwError(() => new Error('Not authenticated'));
    }
    
    // This would call your backend which uses MCP tools
    // jira_get_my_issues
    return of([]);
  }

  /**
   * Get specific issue details
   */
  getIssue(issueKey: string): Observable<any> {
    if (!this._isAuthenticated()) {
      return throwError(() => new Error('Not authenticated'));
    }
    
    // This would call your backend which uses MCP tools
    // jira_get_issue
    return of({});
  }
}
