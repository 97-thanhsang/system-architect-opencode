import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../core/auth/auth.service';

interface Role {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatToolbarModule
  ],
  template: `
    <div class="dashboard-container">
      <mat-toolbar color="primary" class="dashboard-toolbar">
        <span class="toolbar-title">System Architect</span>
        <span class="spacer"></span>
        @if (user()) {
          <span class="user-name">{{ user()?.displayName }}</span>
        }
        <button mat-icon-button (click)="logout()" matTooltip="Logout">
          <mat-icon>logout</mat-icon>
        </button>
      </mat-toolbar>

      <div class="dashboard-content">
        <div class="welcome-section">
          <h1>Welcome back!</h1>
          <p class="subtitle">Select your role to get started</p>
        </div>

        <div class="roles-grid">
          @for (role of roles; track role.id) {
            <mat-card 
              class="role-card"
              [class.selected]="selectedRole() === role.id"
              (click)="selectRole(role.id)">
              <mat-card-content>
                <div class="role-icon" [style.color]="role.color">
                  <mat-icon>{{ role.icon }}</mat-icon>
                </div>
                <h2 class="role-name">{{ role.name }}</h2>
                <p class="role-description">{{ role.description }}</p>
              </mat-card-content>
              <mat-card-actions align="end">
                <button mat-button color="primary">
                  Enter
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: #f5f5f5;
    }

    .dashboard-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .toolbar-title {
      font-size: 20px;
      font-weight: 500;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .user-name {
      margin-right: 16px;
      font-size: 14px;
    }

    .dashboard-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .welcome-section {
      text-align: center;
      margin-bottom: 40px;

      h1 {
        font-size: 32px;
        font-weight: 300;
        margin-bottom: 8px;
        color: #333;
      }

      .subtitle {
        font-size: 16px;
        color: #666;
      }
    }

    .roles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }

    .role-card {
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid transparent;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      }

      &.selected {
        border-color: #1976d2;
        background: #e3f2fd;
      }

      mat-card-content {
        padding: 24px;
        text-align: center;
      }

      .role-icon {
        margin-bottom: 16px;

        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
        }
      }

      .role-name {
        font-size: 20px;
        font-weight: 500;
        margin-bottom: 8px;
        color: #333;
      }

      .role-description {
        font-size: 14px;
        color: #666;
        line-height: 1.5;
      }

      mat-card-actions {
        padding: 16px;
        justify-content: flex-end;
      }
    }

    @media (max-width: 600px) {
      .roles-grid {
        grid-template-columns: 1fr;
      }

      .dashboard-content {
        padding: 20px 16px;
      }

      .welcome-section h1 {
        font-size: 24px;
      }
    }
  `]
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  user = this.authService.user;
  selectedRole = this.authService.selectedRole;

  roles: Role[] = [
    {
      id: 'FE',
      name: 'Frontend Developer',
      description: 'Build user interfaces, components, and client-side applications',
      icon: 'code',
      color: '#1976d2'
    },
    {
      id: 'BE',
      name: 'Backend Developer',
      description: 'Develop APIs, services, and server-side logic',
      icon: 'storage',
      color: '#388e3c'
    },
    {
      id: 'QC',
      name: 'Quality Control',
      description: 'Test applications, identify bugs, ensure quality',
      icon: 'check_circle',
      color: '#f57c00'
    },
    {
      id: 'BA',
      name: 'Business Analyst',
      description: 'Analyze requirements, document features, bridge business and tech',
      icon: 'assessment',
      color: '#7b1fa2'
    }
  ];

  selectRole(roleId: string): void {
    this.authService.selectRole(roleId);
  }

  logout(): void {
    this.authService.logout();
  }
}
