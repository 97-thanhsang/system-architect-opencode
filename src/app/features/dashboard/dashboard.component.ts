import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

type RoleId = 'FE' | 'BE' | 'QC' | 'BA';
type RoleColor = 'blue' | 'green' | 'yellow' | 'purple';

interface Role {
  id: RoleId;
  name: string;
  description: string;
  icon: string;
  color: RoleColor;
}

/**
 * Dashboard Component - Role Selection Screen
 * 
 * Fully refactored to use Google Design System with:
 * - CSS custom properties (--g-*)
 * - Utility classes (.g-page, .g-card, .g-btn, .g-grid)
 * - Material Icons Outlined
 * - OnPush change detection
 * 
 * @example
 * <app-dashboard />
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="g-page dashboard animate-fade-in">
      <!-- Page Header -->
      <div class="g-page__header">
        <div>
          <h1 class="g-page__title">System Architect</h1>
          @if (user()) {
            <p class="text-muted" style="margin-top:4px">
              Xin chào, {{ user()?.displayName }}
            </p>
          }
        </div>
        <div class="g-page__actions">
          <button class="g-btn g-btn--icon" (click)="logout()" title="Đăng xuất">
            <span class="material-icons-outlined">logout</span>
          </button>
        </div>
      </div>

      <!-- Welcome Section -->
      <div class="dashboard__welcome">
        <h2 style="font-size:28px;font-weight:400;margin-bottom:8px">
          Chào mừng trở lại!
        </h2>
        <p class="text-muted" style="font-size:16px">
          Chọn vai trò của bạn để bắt đầu
        </p>
      </div>

      <!-- Roles Grid -->
      <div class="g-grid g-grid--auto" style="margin-top:32px">
        @for (role of roles; track role.id) {
          <div 
            class="g-card role-card"
            [class.role-card--selected]="selectedRole() === role.id"
            [style.--role-color]="'var(--g-' + role.color + ')'"
            (click)="onSelectRole(role.id)"
            role="button"
            tabindex="0"
            (keydown.enter)="onSelectRole(role.id)"
            (keydown.space)="onSelectRole(role.id); $event.preventDefault()">
            
            <div class="role-card__content">
              <div class="role-card__icon" [class]="'role-card__icon--' + role.color">
                <span class="material-icons-outlined" style="font-size:32px">{{ role.icon }}</span>
              </div>
              
              <h3 class="role-card__name">{{ role.name }}</h3>
              <p class="role-card__description">{{ role.description }}</p>
              
              <button class="g-btn g-btn--primary" style="margin-top:16px">
                <span>Truy cập</span>
                <span class="material-icons-outlined" style="font-size:18px">arrow_forward</span>
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      min-height: calc(100vh - var(--header-height, 64px));
      background: var(--g-bg);
    }

    .dashboard__welcome {
      text-align: center;
      margin-bottom: var(--g-space-6);
      color: var(--g-text-primary);
    }

    .role-card {
      cursor: pointer;
      transition: all var(--g-transition-slow);
      border: 2px solid transparent;
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--g-shadow-card-hover);
      }

      &:focus-visible {
        outline: 2px solid var(--g-blue);
        outline-offset: 2px;
      }

      &--selected {
        border-color: var(--role-color, var(--g-blue));
        background: var(--g-blue-light);
      }
    }

    .role-card__content {
      padding: var(--g-space-6);
      text-align: center;
    }

    .role-card__icon {
      width: 64px;
      height: 64px;
      border-radius: var(--g-radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto var(--g-space-4);

      &--blue {
        background: var(--g-blue-light);
        color: var(--g-blue);
      }

      &--green {
        background: var(--g-green-light);
        color: var(--g-green);
      }

      &--yellow {
        background: var(--g-yellow-light);
        color: #b06000;
      }

      &--purple {
        background: var(--g-purple-light);
        color: var(--g-purple);
      }
    }

    .role-card__name {
      font-size: 18px;
      font-weight: 500;
      margin-bottom: var(--g-space-2);
      color: var(--g-text-primary);
    }

    .role-card__description {
      font-size: 14px;
      color: var(--g-text-secondary);
      line-height: 1.5;
      margin-bottom: var(--g-space-4);
    }

    /* Responsive adjustments */
    @media (max-width: 1024px) {
      .g-grid--auto {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .g-grid--auto {
        grid-template-columns: 1fr;
      }

      .dashboard__welcome h2 {
        font-size: 24px;
      }

      .role-card__content {
        padding: var(--g-space-4);
      }
    }
  `]
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /** Current user signal from AuthService */
  readonly user = this.authService.user;
  
  /** Currently selected role signal from AuthService */
  readonly selectedRole = this.authService.selectedRole;

  /** Available roles for selection */
  readonly roles: Role[] = [
    {
      id: 'FE',
      name: 'Frontend Developer',
      description: 'Xây dựng giao diện ngườ dùng, components và ứng dụng phía client',
      icon: 'code',
      color: 'blue'
    },
    {
      id: 'BE',
      name: 'Backend Developer',
      description: 'Phát triển API, services và logic phía server',
      icon: 'storage',
      color: 'green'
    },
    {
      id: 'QC',
      name: 'Quality Control',
      description: 'Kiểm thử ứng dụng, phát hiện lỗi, đảm bảo chất lượng',
      icon: 'check_circle',
      color: 'yellow'
    },
    {
      id: 'BA',
      name: 'Business Analyst',
      description: 'Phân tích yêu cầu, tài liệu hóa features, kết nối business và tech',
      icon: 'assessment',
      color: 'purple'
    }
  ];

  /**
   * Handles role selection
   * @param roleId - The ID of the selected role
   */
  onSelectRole(roleId: RoleId): void {
    try {
      this.authService.selectRole(roleId);
    } catch (error) {
      console.error('Failed to select role:', error);
    }
  }

  /**
   * Handles logout action
   */
  logout(): void {
    try {
      this.authService.logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  }
}
