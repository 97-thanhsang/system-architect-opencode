/**
 * TokenStorageService Usage Examples
 *
 * This file demonstrates how to use the TokenStorageService in Angular 17+ applications
 */

import { Component, inject, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import {
  TokenStorageService,
  User,
  TokenStorageError,
  TokenStorageErrorType
} from '../../core/auth/token-storage.service';

// ============================================
// Example 1: Basic Component Usage
// ============================================

@Component({
  selector: 'app-login-example',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule],
  template: `
    <mat-card class="login-card">
      <mat-card-header>
        <mat-card-title>Token Storage Demo</mat-card-title>
      </mat-card-header>

      <mat-card-content>
        <!-- Authentication State -->
        <div class="state-section">
          <h3>Authentication State</h3>
          <p>
            Status:
            <span [class.authenticated]="isAuthenticated()">
              {{ isAuthenticated() ? 'Authenticated' : 'Not Authenticated' }}
            </span>
          </p>
          <p>Token Expires: {{ tokenExpiry() | date:'medium' }}</p>
          <p>Time Until Expiry: {{ timeUntilExpiry() | number }} ms</p>
          <p>Expiring Soon: {{ isTokenExpiringSoon() ? 'Yes' : 'No' }}</p>
          <p>Refreshing: {{ isRefreshing() ? 'Yes' : 'No' }}</p>
        </div>

        <!-- User Info -->
        @if (currentUser()) {
          <div class="user-section">
            <h3>Current User</h3>
            <p>Email: {{ currentUser()?.email }}</p>
            <p>Name: {{ currentUser()?.displayName }}</p>
            <p>Roles: {{ currentUser()?.roles?.join(', ') }}</p>
          </div>
        }

        <!-- Error Display -->
        @if (refreshError()) {
          <div class="error-section">
            <p class="error-message">{{ refreshError() }}</p>
          </div>
        }
      </mat-card-content>

      <mat-card-actions>
        <button mat-raised-button color="primary" (click)="login()" [disabled]="isAuthenticated()">
          Login
        </button>
        <button mat-raised-button color="warn" (click)="logout()" [disabled]="!isAuthenticated()">
          Logout
        </button>
        <button mat-raised-button (click)="manualRefresh()" [disabled]="!isAuthenticated() || isRefreshing()">
          Refresh Token
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .login-card {
      max-width: 600px;
      margin: 20px auto;
    }

    .state-section,
    .user-section {
      margin-bottom: 20px;
    }

    h3 {
      margin-bottom: 10px;
      color: #333;
    }

    p {
      margin: 5px 0;
    }

    .authenticated {
      color: green;
      font-weight: bold;
    }

    .error-section {
      background: #ffebee;
      padding: 10px;
      border-radius: 4px;
      margin-top: 10px;
    }

    .error-message {
      color: #c62828;
      margin: 0;
    }

    mat-card-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
  `]
})
export class LoginExampleComponent implements OnInit {
  // Inject TokenStorageService
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  // Expose signals directly to template
  readonly isAuthenticated = this.tokenStorage.isAuthenticated;
  readonly currentUser = this.tokenStorage.currentUser;
  readonly tokenExpiry = this.tokenStorage.tokenExpiry;
  readonly timeUntilExpiry = this.tokenStorage.timeUntilExpiry;
  readonly isTokenExpiringSoon = this.tokenStorage.isTokenExpiringSoon;
  readonly isRefreshing = this.tokenStorage.isRefreshing;
  readonly refreshError = this.tokenStorage.refreshError;

  constructor() {
    // React to authentication state changes
    effect(() => {
      const isAuth = this.isAuthenticated();
      const user = this.currentUser();

      if (isAuth && user) {
        console.log('User authenticated:', user.email);
      } else {
        console.log('User not authenticated');
      }
    });

    // React to token expiry
    effect(() => {
      const expiringSoon = this.isTokenExpiringSoon();
      if (expiringSoon && this.isAuthenticated()) {
        console.warn('Token is expiring soon!');
        this.snackBar.open('Your session will expire soon', 'OK', {
          duration: 5000
        });
      }
    });
  }

  ngOnInit(): void {
    // Check if user is already authenticated
    if (this.tokenStorage.isAuthenticated()) {
      console.log('User is already authenticated');
    }
  }

  /**
   * Login example - store tokens from API response
   */
  async login(): Promise<void> {
    try {
      // Call your authentication API
      const response = await firstValueFrom(
        this.http.post<{
          accessToken: string;
          expiresIn: number;
          user: User;
        }>('/api/auth/login', {
          username: 'user@example.com',
          password: 'password'
        })
      );

      // Store tokens in TokenStorageService
      this.tokenStorage.storeTokens(
        response.accessToken,
        response.expiresIn,
        response.user
      );

      this.snackBar.open('Login successful!', 'Close', { duration: 3000 });

      // Navigate to dashboard
      await this.router.navigate(['/dashboard']);

    } catch (error) {
      console.error('Login failed:', error);
      this.snackBar.open('Login failed. Please try again.', 'Close', {
        duration: 5000
      });
    }
  }

  /**
   * Logout example
   */
  logout(): void {
    this.tokenStorage.logout();
    this.snackBar.open('Logged out successfully', 'Close', { duration: 3000 });
  }

  /**
   * Manual token refresh example
   */
  async manualRefresh(): Promise<void> {
    try {
      const newToken = await firstValueFrom(
        this.tokenStorage.refreshAccessToken()
      );

      this.snackBar.open('Token refreshed successfully', 'Close', {
        duration: 3000
      });

      console.log('New token:', newToken);

    } catch (error) {
      console.error('Token refresh failed:', error);

      if (error instanceof TokenStorageError) {
        switch (error.type) {
          case TokenStorageErrorType.TOKEN_EXPIRED:
            this.snackBar.open('Session expired. Please login again.', 'Close', {
              duration: 5000
            });
            break;
          case TokenStorageErrorType.NETWORK_ERROR:
            this.snackBar.open('Network error. Please check your connection.', 'Close', {
              duration: 5000
            });
            break;
          default:
            this.snackBar.open('Failed to refresh token', 'Close', {
              duration: 5000
            });
        }
      }
    }
  }
}

// ============================================
// Example 2: Service Usage
// ============================================

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly http = inject(HttpClient);

  /**
   * Example: Make authenticated API call
   * The token will be automatically added by the interceptor
   */
  async getUserProfile(): Promise<User> {
    // Token is automatically added by tokenRefreshInterceptor
    return firstValueFrom(
      this.http.get<User>('/api/user/profile')
    );
  }

  /**
   * Example: Check authentication before API call
   */
  async safeApiCall<T>(endpoint: string): Promise<T | null> {
    // Check if authenticated
    if (!this.tokenStorage.isAuthenticated()) {
      console.warn('Not authenticated');
      return null;
    }

    // Check if token is expiring soon
    if (this.tokenStorage.isTokenExpiringSoon()) {
      console.warn('Token expiring soon, refreshing...');
      try {
        await firstValueFrom(this.tokenStorage.refreshAccessToken());
      } catch (error) {
        console.error('Failed to refresh token:', error);
        return null;
      }
    }

    // Make the API call
    return firstValueFrom(this.http.get<T>(endpoint));
  }
}

// ============================================
// Example 3: Guard Usage
// ============================================

import { CanActivateFn, Router } from '@angular/router';

/**
   * Auth Guard using TokenStorageService
   */
export const modernAuthGuard: CanActivateFn = (route, state) => {
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);

  if (tokenStorage.isAuthenticated()) {
    // Optionally check if token is expiring soon and refresh proactively
    if (tokenStorage.isTokenExpiringSoon()) {
      tokenStorage.refreshAccessToken().subscribe({
        error: () => {
          router.navigate(['/auth/login']);
        }
      });
    }
    return true;
  }

  // Redirect to login
  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });

  return false;
};

// ============================================
// Example 4: Configuration
// ============================================

import { APP_INITIALIZER } from '@angular/core';

/**
   * Configure TokenStorageService on app startup
   */
export function configureTokenStorage(tokenStorage: TokenStorageService): () => void {
  return () => {
    // Update configuration
    tokenStorage.updateConfig({
      refreshBufferSeconds: 300, // Refresh 5 minutes before expiry
      maxRetryAttempts: 5,
      retryDelayMs: 2000,
      debugLogging: true // Enable for development
    });
  };
}

/**
   * Provider for app initializer
   */
export const tokenStorageInitializerProvider = {
  provide: APP_INITIALIZER,
  useFactory: configureTokenStorage,
  deps: [TokenStorageService],
  multi: true
};

// ============================================
// Example 5: Advanced Patterns
// ============================================

import { Component, inject, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-advanced-example',
  standalone: true,
  template: '<div>Advanced Token Management Example</div>'
})
export class AdvancedExampleComponent implements OnDestroy {
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly destroy$ = new Subject<void>();

  constructor() {
    // Subscribe to token refresh events
    this.tokenStorage.tokenRefreshCompleted$
      .pipe(takeUntil(this.destroy$))
      .subscribe((newToken) => {
        console.log('Token refreshed:', newToken.substring(0, 10) + '...');
      });

    // Subscribe to access token changes
    this.tokenStorage.accessToken$
      .pipe(takeUntil(this.destroy$))
      .subscribe((token) => {
        if (token) {
          console.log('Access token updated');
        } else {
          console.log('Access token cleared');
        }
      });
  }

  /**
   * Example: Queue operations during token refresh
   */
  async performSensitiveOperation(): Promise<void> {
    try {
      // If token is refreshing, this will wait
      if (this.tokenStorage.isRefreshing()) {
        console.log('Waiting for token refresh...');
        await this.tokenStorage.queueRequestForRefresh();
      }

      // Perform operation with valid token
      console.log('Performing sensitive operation...');

    } catch (error) {
      console.error('Operation failed:', error);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// ============================================
// Module Setup (if using NgModules)
// ============================================

/*
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

@NgModule({
  providers: [
    TokenStorageService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenRefreshInterceptor, // Class-based version if needed
      multi: true
    },
    tokenStorageInitializerProvider
  ]
})
export class AuthModule { }
*/
