import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterLink
  ],
  template: `
    <div class="not-found-container">
      <mat-card class="not-found-card">
        <mat-card-content>
          <div class="error-code">404</div>
          <h1>Page Not Found</h1>
          <p>The page you are looking for does not exist or has been moved.</p>
          <button mat-raised-button color="primary" routerLink="/dashboard">
            <mat-icon>home</mat-icon>
            Back to Dashboard
          </button>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .not-found-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #f5f5f5;
      padding: 20px;
    }

    .not-found-card {
      max-width: 500px;
      width: 100%;
      text-align: center;
      padding: 60px 40px;
    }

    .error-code {
      font-size: 120px;
      font-weight: 700;
      color: #e0e0e0;
      line-height: 1;
      margin-bottom: 20px;
    }

    h1 {
      font-size: 32px;
      font-weight: 300;
      color: #333;
      margin-bottom: 16px;
    }

    p {
      font-size: 16px;
      color: #666;
      margin-bottom: 32px;
    }

    button {
      padding: 12px 32px;
      font-size: 16px;

      mat-icon {
        margin-right: 8px;
      }
    }
  `]
})
export class NotFoundComponent {}
