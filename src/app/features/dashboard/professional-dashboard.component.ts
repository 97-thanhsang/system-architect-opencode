import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

/**
 * Module Selection Dashboard
 * 
 * Distinct from login page but uses same design tokens
 * Layout: Full-width centered with modern cards
 */
@Component({
  selector: 'app-professional-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dashboard">
      <!-- Header -->
      <header class="dashboard__header">
        <div class="header__left">
          <span class="header__logo material-icons-outlined">architecture</span>
          <span class="header__title">System Architect</span>
        </div>
        <div class="header__right">
          <div class="header__user">
            <div class="header__avatar" [style.background]="avatarColor()">
              {{ initials() }}
            </div>
            <span class="header__username">{{ user()?.displayName || 'User' }}</span>
          </div>
          <button class="header__logout" (click)="logout()" title="Đăng xuất">
            <span class="material-icons-outlined">logout</span>
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <main class="dashboard__main">
        <!-- Hero Section -->
        <div class="hero">
          <h1 class="hero__title">Xin chào, {{ user()?.displayName || 'User' }}! 👋</h1>
          <p class="hero__subtitle">Chọn module để truy cập workspace của bạn</p>
        </div>

        <!-- Modules Grid -->
        <div class="modules">
          @for (module of modules; track module.id) {
            <a class="module-card" (click)="selectModule(module.id.toUpperCase())" tabindex="0">
              <div class="module-card__header">
                <div class="module-card__icon" [class]="'module-card__icon--' + module.id">
                  <span class="material-icons-outlined">{{ module.icon }}</span>
                </div>
                <span class="module-card__arrow">
                  <span class="material-icons">arrow_forward</span>
                </span>
              </div>
              <div class="module-card__body">
                <h3 class="module-card__title">{{ module.title }}</h3>
                <p class="module-card__desc">{{ module.description }}</p>
                <span class="module-card__badge">{{ module.role }}</span>
              </div>
            </a>
          }
        </div>
      </main>

      <!-- Footer -->
      <footer class="dashboard__footer">
        <span>© 2026 System Architect OpenCode</span>
        <span class="footer__dot">·</span>
        <a href="#" class="footer__link">Điều khoản</a>
        <span class="footer__dot">·</span>
        <a href="#" class="footer__link">Quyền riêng tư</a>
      </footer>
    </div>
  `,
  styles: [`
    /* ═══════════════════════════════════════════════════════
       LAYOUT
    ═══════════════════════════════════════════════════════ */
    .dashboard {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--g-bg, #f8f9fa);
    }

    /* ═══════════════════════════════════════════════════════
       HEADER
    ═══════════════════════════════════════════════════════ */
    .dashboard__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 32px;
      background: var(--g-surface, #ffffff);
      border-bottom: 1px solid var(--g-border, #e0e0e0);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }

    .header__left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header__logo {
      font-size: 28px;
      color: var(--g-blue, #1a73e8);
    }

    .header__title {
      font-family: 'Google Sans', sans-serif;
      font-size: 18px;
      font-weight: 600;
      color: var(--g-text-primary, #202124);
    }

    .header__right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header__user {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .header__avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 600;
      color: #fff;
    }

    .header__username {
      font-size: 14px;
      font-weight: 500;
      color: var(--g-text-primary, #202124);
    }

    .header__logout {
      background: none;
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--g-text-secondary, #5f6368);
      transition: all 0.2s;

      &:hover {
        background: var(--g-bg, #f1f3f4);
        color: var(--g-red, #ea4335);
      }

      .material-icons-outlined { font-size: 20px; }
    }

    /* ═══════════════════════════════════════════════════════
       MAIN CONTENT
    ═══════════════════════════════════════════════════════ */
    .dashboard__main {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px 32px;
    }

    /* ═══════════════════════════════════════════════════════
       HERO
    ═══════════════════════════════════════════════════════ */
    .hero {
      text-align: center;
      margin-bottom: 48px;
    }

    .hero__title {
      font-family: 'Google Sans', sans-serif;
      font-size: 36px;
      font-weight: 500;
      color: var(--g-text-primary, #202124);
      margin: 0 0 8px;
    }

    .hero__subtitle {
      font-size: 16px;
      color: var(--g-text-secondary, #5f6368);
      margin: 0;
    }

    /* ═══════════════════════════════════════════════════════
       MODULES GRID
    ═══════════════════════════════════════════════════════ */
    .modules {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
      max-width: 800px;
      width: 100%;
    }

    /* ═══════════════════════════════════════════════════════
       MODULE CARD
    ═══════════════════════════════════════════════════════ */
    .module-card {
      display: flex;
      flex-direction: column;
      background: var(--g-surface, #ffffff);
      border: 1px solid var(--g-border, #e0e0e0);
      border-radius: 16px;
      overflow: hidden;
      text-decoration: none;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        border-color: var(--g-blue, #1a73e8);

        .module-card__arrow {
          transform: translateX(4px);
          background: var(--g-blue, #1a73e8);
          color: #fff;
        }
      }
    }

    .module-card__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 20px 0;
    }

    .module-card__icon {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;

      .material-icons-outlined { font-size: 28px; color: #fff; }

      &--fe { background: linear-gradient(135deg, #1a73e8, #4285f4); }
      &--be { background: linear-gradient(135deg, #34a853, #46c663); }
      &--qc { background: linear-gradient(135deg, #f9ab00, #fbbc04); }
      &--ba { background: linear-gradient(135deg, #9334e6, #a855f7); }
    }

    .module-card__arrow {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--g-bg, #f1f3f4);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--g-text-secondary, #5f6368);
      transition: all 0.2s;

      .material-icons { font-size: 18px; }
    }

    .module-card__body {
      padding: 16px 20px 20px;
    }

    .module-card__title {
      font-family: 'Google Sans', sans-serif;
      font-size: 20px;
      font-weight: 600;
      color: var(--g-text-primary, #202124);
      margin: 0 0 6px;
    }

    .module-card__desc {
      font-size: 14px;
      color: var(--g-text-secondary, #5f6368);
      margin: 0 0 12px;
      line-height: 1.5;
    }

    .module-card__badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 4px 10px;
      border-radius: 6px;
      background: var(--g-bg, #f1f3f4);
      color: var(--g-text-secondary, #5f6368);
    }

    /* ═══════════════════════════════════════════════════════
       FOOTER
    ═══════════════════════════════════════════════════════ */
    .dashboard__footer {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 20px;
      font-size: 12px;
      color: var(--g-text-tertiary, #80868b);
      border-top: 1px solid var(--g-border, #e0e0e0);
      background: var(--g-surface, #ffffff);
    }

    .footer__dot { color: var(--g-border, #dadce0); }

    .footer__link {
      color: var(--g-text-link, #1a73e8);
      text-decoration: none;
      &:hover { text-decoration: underline; }
    }

    /* ═══════════════════════════════════════════════════════
       RESPONSIVE
    ═══════════════════════════════════════════════════════ */
    @media (max-width: 768px) {
      .dashboard__header {
        padding: 12px 16px;
      }

      .header__title { display: none; }
      .header__username { display: none; }

      .dashboard__main {
        padding: 32px 16px;
      }

      .hero__title {
        font-size: 28px;
      }

      .modules {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }
  `]
})
export class ProfessionalDashboardComponent {
  private authService = inject(AuthService);

  user = this.authService.user;

  modules = [
    {
      id: 'fe',
      title: 'Frontend',
      description: 'Phát triển giao diện người dùng với Angular, React',
      icon: 'code',
      route: '/module/fe',
      role: 'FE Developer'
    },
    {
      id: 'be',
      title: 'Backend',
      description: 'Xây dựng API và xử lý logic nghiệp vụ',
      icon: 'storage',
      route: '/module/be',
      role: 'BE Developer'
    },
    {
      id: 'qc',
      title: 'QC',
      description: 'Kiểm thử và đảm bảo chất lượng sản phẩm',
      icon: 'verified',
      route: '/module/qc',
      role: 'QA Engineer'
    },
    {
      id: 'ba',
      title: 'BA',
      description: 'Phân tích nghiệp vụ và quản lý yêu cầu',
      icon: 'business',
      route: '/module/ba',
      role: 'Business Analyst'
    }
  ];

  initials(): string {
    const name = this.user()?.displayName || 'User';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  avatarColor(): string {
    const colors = [
      'linear-gradient(135deg, #667eea, #764ba2)',
      'linear-gradient(135deg, #f093fb, #f5576c)',
      'linear-gradient(135deg, #4facfe, #00f2fe)',
      'linear-gradient(135deg, #43e97b, #38f9d7)',
      'linear-gradient(135deg, #fa709a, #fee140)'
    ];
    const index = (this.user()?.displayName?.length || 0) % colors.length;
    return colors[index];
  }

  selectModule(role: string): void {
    console.log(`[Dashboard] Selecting module for role: ${role}`);
    this.authService.selectRole(role);
  }

  logout(): void {
    this.authService.logout();
  }
}
