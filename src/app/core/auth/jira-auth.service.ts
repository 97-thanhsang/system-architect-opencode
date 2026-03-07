import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from './token-storage.service';

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
  remember?: boolean;
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
  private tokenStorage = inject(TokenStorageService);

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
    
    // Store remember preference for session persistence logic
    const rememberMe = credentials.remember ?? false;
    console.log('[JiraAuthService] Login with rememberMe:', rememberMe);

    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.API_URL}/auth/jira/login`, {
          username: credentials.username,
          password: credentials.password,
          jiraUrl: jiraUrl,
        })
      );

      // Store token and user based on remember me preference
      if (rememberMe) {
        // Remember Me = true: Use localStorage (persists across browser sessions)
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('remember_me', 'true');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('user');
        console.log('[JiraAuthService] Token stored in localStorage (Remember Me enabled)');
      } else {
        // Remember Me = false: Use sessionStorage (clears when browser closes)
        sessionStorage.setItem('access_token', response.access_token);
        sessionStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('remember_me', 'false');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        console.log('[JiraAuthService] Token stored in sessionStorage (Remember Me disabled)');
      }

      // Also store in TokenStorageService for automatic refresh
      // Convert JiraUser to User interface
      const userForStorage = {
        id: response.user.id,
        email: response.user.email,
        displayName: response.user.displayName || response.user.jiraDisplayName || response.user.name,
        avatarUrl: response.user.avatarUrl || undefined,
        roles: response.user.roles
      };
      this.tokenStorage.storeTokens(response.access_token, 8 * 60 * 60, userForStorage, rememberMe);

      // Update signals
      this._user.set(response.user);
      this._isAuthenticated.set(true);

      this._loading.set(false);
      console.log('[JiraAuthService] Login successful, tokens stored');
      return true;
    } catch (error: any) {
      this._error.set(error.error?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      this._loading.set(false);
      return false;
    }
  }

  /**
   * Logout and clear stored auth from both services
   */
  logout(): void {
    // Clear from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('remember_me');

    // Clear from sessionStorage
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user');

    // Clear from TokenStorageService
    this.tokenStorage.clearTokens();

    this._user.set(null);
    this._isAuthenticated.set(false);
    this._error.set(null);

    console.log('[JiraAuthService] Logout completed, tokens cleared from all storage');
    this.router.navigate(['/auth/login']);
  }

  /**
   * Get stored JWT token
   * Checks both localStorage and sessionStorage
   */
  getToken(): string | null {
    // Check localStorage first (Remember Me = true)
    const tokenFromLocal = localStorage.getItem('access_token');
    if (tokenFromLocal) {
      return tokenFromLocal;
    }
    
    // Fallback to sessionStorage (Remember Me = false)
    return sessionStorage.getItem('access_token');
  }

  /**
   * Load authentication state from storage (localStorage or sessionStorage)
   * Restores user session after page refresh
   */
  private loadStoredAuth(): void {
    console.log('[JiraAuthService] Initializing auth state from storage...');

    // First check localStorage (Remember Me = true)
    let token = localStorage.getItem('access_token');
    let userStr = localStorage.getItem('user');
    let storageType = 'localStorage';

    // If not in localStorage, check sessionStorage (Remember Me = false)
    if (!token) {
      token = sessionStorage.getItem('access_token');
      userStr = sessionStorage.getItem('user');
      storageType = 'sessionStorage';
    }

    console.log(`[JiraAuthService] Token exists in ${storageType}:`, !!token);
    console.log(`[JiraAuthService] User data exists in ${storageType}:`, !!userStr);

    if (!token) {
      console.log('[JiraAuthService] No token found in any storage, skipping user restoration');
      return;
    }

    if (!userStr) {
      console.log('[JiraAuthService] No user data found, skipping user restoration');
      return;
    }

    try {
      const parsedUser = JSON.parse(userStr) as JiraUser;

      // Validate required fields to ensure data integrity
      if (!this.isValidJiraUser(parsedUser)) {
        console.error('[JiraAuthService] Invalid user data structure in storage');
        this.logout();
        return;
      }

      // Restore user signal
      this._user.set(parsedUser);
      this._isAuthenticated.set(true);

      console.log('[JiraAuthService] ✅ User state restored successfully from', storageType, ':', {
        id: parsedUser.id,
        email: parsedUser.email,
        displayName: parsedUser.displayName || parsedUser.jiraDisplayName,
        roles: parsedUser.roles
      });
    } catch (error) {
      console.error('[JiraAuthService] ❌ Failed to parse stored user data:', error);
      console.log('[JiraAuthService] Clearing corrupted auth data...');
      this.logout();
    }
  }

  /**
   * Validate that parsed user object matches JiraUser interface
   */
  private isValidJiraUser(user: unknown): user is JiraUser {
    if (!user || typeof user !== 'object') {
      return false;
    }

    const u = user as Record<string, unknown>;

    // Check required fields using bracket notation for index signature access
    const hasRequiredFields =
      typeof u['id'] === 'string' &&
      typeof u['email'] === 'string' &&
      (typeof u['displayName'] === 'string' || typeof u['jiraDisplayName'] === 'string') &&
      (typeof u['username'] === 'string' || typeof u['jiraUsername'] === 'string') &&
      Array.isArray(u['roles']);

    if (!hasRequiredFields) {
      console.warn('[JiraAuthService] User validation failed - missing required fields');
      return false;
    }

    // Validate roles array contains strings
    const rolesArray = u['roles'] as unknown[];
    const validRoles = rolesArray.every(r => typeof r === 'string');
    if (!validRoles) {
      console.warn('[JiraAuthService] User validation failed - invalid roles array');
      return false;
    }

    return true;
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
