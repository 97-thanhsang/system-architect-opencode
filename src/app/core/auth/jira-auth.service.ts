import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface JiraUser {
  id: string;
  email: string;
  name: string;
  username: string;  // Alias for jiraUsername (backward compatibility)
  jiraUsername: string;
  jiraDisplayName: string;
  displayName: string;  // Alias for jiraDisplayName (backward compatibility)
  avatarUrl: string | null;
  roles: string[];
}

export interface LoginCredentials {
  username: string;
  password: string;
  jiraUrl?: string;
}

export interface AuthResponse {
  access_token: string;
  user: JiraUser;
}

@Injectable({
  providedIn: 'root'
})
export class JiraAuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Private signal fields (prefix with _)
  private readonly _user = signal<JiraUser | null>(null);
  private readonly _isAuthenticated = signal<boolean>(false);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Public readonly signals
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  private readonly API_URL = environment.apiUrl;
  private readonly DEFAULT_JIRA_URL = environment.jiraUrl;

  constructor() {
    this.loadStoredAuth();
  }

  /**
   * Authenticate with Jira credentials via backend API
   */
  async login(credentials: LoginCredentials): Promise<boolean> {
    this._loading.set(true);
    this._error.set(null);

    // Use default Jira URL if not provided
    const jiraUrl = credentials.jiraUrl || this.DEFAULT_JIRA_URL;

    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.API_URL}/auth/jira/login`, {
          username: credentials.username,
          password: credentials.password,
          jiraUrl: jiraUrl,
        })
      );

      // Store token and user in localStorage
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Update signals
      this._user.set(response.user);
      this._isAuthenticated.set(true);

      this._loading.set(false);
      return true;
    } catch (error: any) {
      this._error.set(error.error?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      this._loading.set(false);
      return false;
    }
  }

  /**
   * Logout and clear stored auth
   */
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');

    this._user.set(null);
    this._isAuthenticated.set(false);
    this._error.set(null);

    this.router.navigate(['/auth/login']);
  }

  /**
   * Get stored JWT token
   */
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Load authentication state from localStorage
   */
  private loadStoredAuth(): void {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this._user.set(user);
        this._isAuthenticated.set(true);
      } catch {
        this.logout();
      }
    }
  }

  /**
   * Clear error message
   */
  clearError(): void {
    this._error.set(null);
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this._user();
    return user?.roles?.includes(role) || false;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this._user();
    if (!user?.roles) return false;
    return roles.some(role => user.roles.includes(role));
  }
}
