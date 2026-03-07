import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Taiga UI Imports
import { 
  TuiButtonModule,
  TuiSvgModule
} from '@taiga-ui/core';
import { 
  TuiIslandModule,
  TuiMarkerIconModule,
  TuiBadgeModule
} from '@taiga-ui/kit';

import { AuthService } from '../../core/auth/auth.service';

interface Role {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  badge: string;
}

@Component({
  selector: 'app-dashboard-taiga',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    // Taiga UI Modules
    TuiButtonModule,
    TuiIslandModule,
    TuiMarkerIconModule,
    TuiBadgeModule,
    TuiSvgModule
  ],
  template: `
    <div class="dashboard-container">
      <!-- Header -->
      <header class="dashboard-header">
        <div class="header-content">
          <div class="logo">
            <tui-marker-icon 
              src="tuiIconArchitectureLarge" 
              mode="primary"
              size="s">
            </tui-marker-icon>
            <span class="tui-text_h5">System Architect</span>
          </div>
          
          <div class="user-info" *ngIf="user() as u">
            <span class="tui-text_body-m">{{ u.displayName }}</span>
            <button
              tuiButton
              type="button"
              appearance="secondary"
              size="s"
              (click)="logout()">
              <tui-svg src="tuiIconLogout"></tui-svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="dashboard-main">
        <div class="welcome-section">
          <h1 class="tui-text_h2">Welcome back!</h1>
          <p class="tui-text_body-l tui-text_color-02">
            Select your role to get started
          </p>
        </div>

        <!-- Role Cards Grid -->
        <div class="roles-grid">
          <tui-island
            *ngFor="let role of roles; trackBy: trackByRoleId"
            class="role-card"
            [hoverable]="true"
            (click)="selectRole(role.id)">
            
            <div class="role-content">
              <div class="role-icon-wrapper" [style.--role-color]="role.color">
                <tui-marker-icon 
                  [src]="'tuiIcon' + role.icon + 'Large'" 
                  [mode]="'custom'"
                  size="m">
                </tui-marker-icon>
              </div>
              
              <div class="role-info">
                <h3 class="tui-text_h4">{{ role.name }}</h3>
                <p class="tui-text_body-m tui-text_color-02">
                  {{ role.description }}
                </p>
              </div>

              <tui-badge
                status="primary"
                size="l"
                class="role-badge">
                {{ role.badge }}
              </tui-badge>
            </div>

            <div class="role-action">
              <button
                tuiButton
                type="button"
                size="m"
                class="full-width">
                Enter Module
                <tui-svg src="tuiIconArrowRight"></tui-svg>
              </button>
            </div>
          </tui-island>
        </div>

        <!-- Quick Stats -->
        <div class="stats-section">
          <h2 class="tui-text_h4">Quick Overview</h2>
          
          <div class="stats-grid">
            <tui-island *ngFor="let stat of stats" class="stat-item">
              <div class="stat-content">
                <tui-marker-icon 
                  [src]="'tuiIcon' + stat.icon" 
                  [mode]="stat.mode"
                  size="xs">
                </tui-marker-icon>
                <div class="stat-info">
                  <span class="tui-text_h3">{{ stat.value }}</span>
                  <span class="tui-text_body-s tui-text_color-02">{{ stat.label }}</span>
                </div>
              </div>
            </tui-island>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: var(--tui-base-02);
    }

    .dashboard-header {
      background: var(--tui-base-01);
      border-bottom: 1px solid var(--tui-base-03);
      padding: 16px 24px;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .dashboard-main {
      max-width: 1400px;
      margin: 0 auto;
      padding: 48px 24px;
    }

    .welcome-section {
      text-align: center;
      margin-bottom: 48px;

      h1 {
        margin-bottom: 8px;
      }
    }

    .roles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      margin-bottom: 48px;
    }

    .role-card {
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
      }
    }

    .role-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 32px 24px;
      gap: 16px;
    }

    .role-icon-wrapper {
      --tui-marker-icon-bg: var(--role-color);
      
      tui-marker-icon {
        --tui-marker-icon-color: white;
      }
    }

    .role-info {
      h3 {
        margin-bottom: 8px;
      }
    }

    .role-badge {
      margin-top: 8px;
    }

    .role-action {
      padding: 0 24px 24px;
    }

    .full-width {
      width: 100%;
    }

    .stats-section {
      h2 {
        margin-bottom: 24px;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .stat-item {
      padding: 20px;
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    @media (max-width: 768px) {
      .dashboard-main {
        padding: 24px 16px;
      }

      .roles-grid {
        grid-template-columns: 1fr;
      }

      .header-content {
        flex-direction: column;
        gap: 12px;
      }
    }
  `]
})
export class DashboardTaigaComponent {
  private authService = inject(AuthService);

  user = this.authService.user;

  roles: Role[] = [
    {
      id: 'FE',
      name: 'Frontend Developer',
      description: 'Build user interfaces, components, and client-side applications',
      icon: 'Code',
      color: '#526ed3',
      badge: 'UI/UX'
    },
    {
      id: 'BE',
      name: 'Backend Developer',
      description: 'Develop APIs, services, and server-side logic',
      icon: 'Server',
      color: '#4db524',
      badge: 'API'
    },
    {
      id: 'QC',
      name: 'Quality Control',
      description: 'Test applications, identify bugs, ensure quality',
      icon: 'CheckCircle',
      color: '#ff9f42',
      badge: 'Test'
    },
    {
      id: 'BA',
      name: 'Business Analyst',
      description: 'Analyze requirements, document features, bridge business and tech',
      icon: 'BarChart',
      color: '#1b94f5',
      badge: 'Analysis'
    }
  ];

  stats = [
    { icon: 'Folder', mode: 'primary', value: '24', label: 'Active Projects' },
    { icon: 'CheckCircle', mode: 'success', value: '156', label: 'Completed Tasks' },
    { icon: 'AlertCircle', mode: 'warning', value: '7', label: 'Pending Issues' },
    { icon: 'Users', mode: 'accent', value: '12', label: 'Team Members' }
  ];

  selectRole(roleId: string): void {
    this.authService.selectRole(roleId);
  }

  logout(): void {
    this.authService.logout();
  }

  trackByRoleId(index: number, role: Role): string {
    return role.id;
  }
}
