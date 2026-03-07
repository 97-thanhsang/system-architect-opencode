import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  template: `
    <div class="callback-container">
      <mat-card class="callback-card">
        <mat-card-content>
          @if (error) {
            <div class="error-message">
              <h2>Authentication Failed</h2>
              <p>{{ error }}</p>
              <button mat-button color="primary" (click)="goToLogin()">
                Try Again
              </button>
            </div>
          } @else {
            <div class="loading-container">
              <mat-spinner diameter="48"></mat-spinner>
              <p>Completing authentication...</p>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #f5f5f5;
    }

    .callback-card {
      max-width: 400px;
      width: 100%;
      padding: 20px;
      text-align: center;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      padding: 40px;
    }

    .error-message {
      padding: 20px;
      
      h2 {
        color: #f44336;
        margin-bottom: 16px;
      }

      p {
        color: #666;
        margin-bottom: 20px;
      }
    }
  `]
})
export class AuthCallbackComponent implements OnInit {
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      const state = params['state'];
      const error = params['error'];

      if (error) {
        this.error = `Authentication error: ${error}`;
        return;
      }

      if (code && state) {
        this.authService.handleAuthCallback(code, state).subscribe(success => {
          if (success) {
            this.router.navigate(['/dashboard']);
          } else {
            this.error = 'Failed to complete authentication';
          }
        });
      } else {
        this.error = 'Invalid callback parameters';
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
