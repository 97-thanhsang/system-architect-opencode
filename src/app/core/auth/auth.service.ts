import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { JiraAuthService, JiraUser } from './jira-auth.service';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  selectedRole: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Inject JiraAuthService
  private jiraAuth = inject(JiraAuthService);
  
  // Signals for state management
  private readonly _user = signal<User | null>(null);
  private readonly _token = signal<string | null>(null);
  private readonly _isAuthenticated = signal<boolean>(false);
  private readonly _selectedRole = signal<string | null>(null);

  // Read-only signals
  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  readonly selectedRole = this._selectedRole.asReadonly();
  
  // Expose Jira auth state
  readonly jiraUser = this.jiraAuth.user;
  readonly jiraIsAuthenticated = this.jiraAuth.isAuthenticated;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredAuth();
    
    // Sync with JiraAuthService
    if (this.jiraAuth.isAuthenticated()) {
      this.syncWithJiraAuth();
    }
  }

  /**
   * Sync state with JiraAuthService
   */
  private syncWithJiraAuth(): void {
    const jiraUser = this.jiraAuth.user();
    if (jiraUser) {
      const user: User = {
        id: jiraUser.id,
        email: jiraUser.email,
        displayName: jiraUser.displayName,
        avatarUrl: jiraUser.avatarUrl || undefined
      };
      this._user.set(user);
      this._isAuthenticated.set(true);
    }
  }

  /**
   * Legacy method - redirects to new login system
   * @deprecated Use JiraAuthService.login() instead
   */
  loginWithJira(): void {
    this.router.navigate(['/auth/login']);
  }

  /**
   * Handle OAuth callback (legacy support)
   */
  handleAuthCallback(code: string, state: string): Observable<boolean> {
    // Delegate to JiraAuthService or handle legacy
    return of(true);
  }

  /**
   * Set authentication state
   * @param user - User data
   * @param token - JWT token
   * @param rememberMe - Whether to persist across browser sessions
   */
  private setAuth(user: User, token: string, rememberMe: boolean = false): void {
    this._user.set(user);
    this._token.set(token);
    this._isAuthenticated.set(true);
    
    // Store based on rememberMe preference
    if (rememberMe) {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_remember_me', 'true');
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_user');
    } else {
      sessionStorage.setItem('auth_token', token);
      sessionStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_remember_me', 'false');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  }

  /**
   * Load stored auth from storage (localStorage or sessionStorage)
   */
  private loadStoredAuth(): void {
    // Try localStorage first (Remember Me = true)
    let token = localStorage.getItem('auth_token');
    let userStr = localStorage.getItem('auth_user');
    let storageType = 'localStorage';

    // If not in localStorage, check sessionStorage (Remember Me = false)
    if (!token) {
      token = sessionStorage.getItem('auth_token');
      userStr = sessionStorage.getItem('auth_user');
      storageType = 'sessionStorage';
    }

    const role = localStorage.getItem('selected_role') || sessionStorage.getItem('selected_role');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this._user.set(user);
        this._token.set(token);
        this._isAuthenticated.set(true);
        if (role) {
          this._selectedRole.set(role);
        }
        console.log(`[AuthService] Auth restored from ${storageType}`);
      } catch (e) {
        this.logout();
      }
    }
  }

  /**
   * Select a role
   */
  selectRole(role: string): void {
    this._selectedRole.set(role);
    // Store in both localStorage and sessionStorage for consistency
    localStorage.setItem('selected_role', role);
    sessionStorage.setItem('selected_role', role);
    this.router.navigate(['/module', role.toLowerCase()]);
  }

  /**
   * Logout - clears both AuthService and JiraAuthService
   */
  logout(): void {
    this._user.set(null);
    this._token.set(null);
    this._isAuthenticated.set(false);
    this._selectedRole.set(null);
    
    // Clear from localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('selected_role');
    localStorage.removeItem('auth_remember_me');
    localStorage.removeItem('oauth_state');
    
    // Clear from sessionStorage
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
    sessionStorage.removeItem('selected_role');
    
    // Also logout from Jira
    this.jiraAuth.logout();
    
    this.router.navigate(['/auth/login']);
  }

  /**
   * Check if user is authenticated (either through legacy or Jira)
   */
  checkAuth(): boolean {
    return this._isAuthenticated() || this.jiraAuth.isAuthenticated();
  }
}
