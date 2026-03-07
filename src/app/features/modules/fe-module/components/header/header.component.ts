import { Component, input, output, signal, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import type { MenuPosition, MenuItem } from '../../services/layout.service';
import type { JiraUser } from '../../../../../core/auth/jira-auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="header" [class.header--nav-mode]="menuPosition() === 'header'">

      <!-- Left ────────────────────────────────────── -->
      <div class="header__left">
        <!-- Menu button (sidebar mode) -->
        @if (menuPosition() === 'sidebar') {
          <button class="header__icon-btn" (click)="toggleMenuPosition.emit()" title="Toggle sidebar">
            <span class="material-icons-outlined">menu</span>
          </button>
        }

        <!-- Logo (sidebar mode — secondary branding) -->
        @if (menuPosition() === 'sidebar') {
          <div class="header__brand">
            <span class="header__brand-text">System Architect</span>
          </div>
        }

        <!-- Full logo + nav (header mode) -->
        @if (menuPosition() === 'header') {
          <a routerLink="/" class="header__logo">
            <div class="header__logo-icon">
              <span class="material-icons-outlined" style="font-size:22px;color:#1a73e8">architecture</span>
            </div>
            <span class="header__logo-text">System Architect</span>
          </a>

          <nav class="header__nav">
            @for (item of menuItems(); track item.id) {
              <a
                class="header__nav-item"
                [routerLink]="item.route"
                routerLinkActive="header__nav-item--active"
                [routerLinkActiveOptions]="{ exact: false }">
                <span class="material-icons-outlined header__nav-icon">{{ item.icon }}</span>
                <span>{{ item.label }}</span>
              </a>
            }
          </nav>
        }
      </div>

      <!-- Search ──────────────────────────────────── -->
      <div class="header__search" [class.header__search--focused]="searchFocus">
        <span class="material-icons-outlined header__search-icon">search</span>
        <input
          type="text"
          class="header__search-input"
          placeholder="Tìm kiếm…"
          (focus)="searchFocus = true"
          (blur)="searchFocus = false" />
        @if (searchFocus) {
          <span class="material-icons-outlined header__search-kbd">keyboard_return</span>
        }
      </div>

      <!-- Right ───────────────────────────────────── -->
      <div class="header__right">

        <!-- Layout toggle (header mode only) -->
        @if (menuPosition() === 'header') {
          <button class="header__icon-btn" (click)="toggleMenuPosition.emit()" title="Chuyển sang Sidebar">
            <span class="material-icons-outlined">view_sidebar</span>
          </button>
        }

        <!-- Notifications -->
        <button class="header__icon-btn" title="Thông báo">
          <span class="material-icons-outlined">notifications_none</span>
          <span class="header__badge">3</span>
        </button>

        <!-- Help -->
        <button class="header__icon-btn" title="Trợ giúp">
          <span class="material-icons-outlined">help_outline</span>
        </button>

        <!-- User avatar + dropdown -->
        @if (user(); as u) {
          <div class="header__user-wrap" (clickOutside)="userMenu.set(false)">
            <button
              class="header__avatar-btn"
              (click)="userMenu.set(!userMenu())"
              [class.header__avatar-btn--open]="userMenu()">
              <div class="g-avatar g-avatar--sm" [style.background]="avatarColor(u.displayName)">
                {{ initials(u.displayName) }}
              </div>
            </button>

            @if (userMenu()) {
              <div class="header__dropdown">
                <!-- User info header -->
                <div class="header__dropdown-user">
                  <div class="g-avatar g-avatar--lg" [style.background]="avatarColor(u.displayName)">
                    {{ initials(u.displayName) }}
                  </div>
                  <div class="header__dropdown-info">
                    <span class="header__dropdown-name">{{ u.displayName }}</span>
                    <span class="header__dropdown-email">{{ u.email }}</span>
                  </div>
                </div>

                <div class="header__dropdown-divider"></div>

                <a routerLink="/app/profile" class="header__dropdown-item" (click)="userMenu.set(false)">
                  <span class="material-icons-outlined">manage_accounts</span>
                  <span>Quản lý tài khoản</span>
                </a>
                <button class="header__dropdown-item" (click)="userMenu.set(false); toggleMenuPosition.emit()">
                  <span class="material-icons-outlined">view_sidebar</span>
                  <span>Đổi layout</span>
                </button>

                <div class="header__dropdown-divider"></div>

                <button class="header__dropdown-item header__dropdown-item--danger" (click)="logout.emit()">
                  <span class="material-icons-outlined">logout</span>
                  <span>Đăng xuất</span>
                </button>
              </div>
            }
          </div>
        }
      </div>
    </header>
  `,
  styles: [`
    /* ── Header bar ────────────────────────────────── */
    .header {
      position: sticky;
      top: 0;
      z-index: 100;
      height: var(--header-height, 64px);
      background: #fff;
      border-bottom: 1px solid #e8eaed;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 16px;
      box-shadow: 0 1px 2px rgba(60,64,67,.1);
    }

    /* ── Left ──────────────────────────────────────── */
    .header__left {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 0 0 auto;
    }

    .header__brand {
      padding-left: 4px;
    }

    .header__brand-text {
      font-family: 'Google Sans', sans-serif;
      font-size: 18px;
      font-weight: 400;
      color: #5f6368;
      white-space: nowrap;
    }

    .header__logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      &:hover { text-decoration: none; }
    }

    .header__logo-icon {
      width: 36px;
      height: 36px;
      background: #e8f0fe;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .header__logo-text {
      font-family: 'Google Sans', sans-serif;
      font-size: 18px;
      font-weight: 400;
      color: #202124;
      white-space: nowrap;
    }

    /* nav (header mode) */
    .header__nav {
      display: flex;
      align-items: center;
      gap: 2px;
      margin-left: 16px;
    }

    .header__nav-item {
      display: flex;
      align-items: center;
      gap: 6px;
      height: 36px;
      padding: 0 12px;
      border-radius: 18px;
      font-size: 13px;
      font-weight: 500;
      color: #5f6368;
      text-decoration: none;
      transition: background .15s, color .15s;
      white-space: nowrap;

      &:hover { background: #f1f3f4; color: #202124; text-decoration: none; }
      &--active { background: #e8f0fe; color: #1a73e8; }
    }

    .header__nav-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
    }

    /* ── Search ────────────────────────────────────── */
    .header__search {
      flex: 1;
      max-width: 540px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      height: 44px;
      background: #f1f3f4;
      border-radius: 22px;
      padding: 0 16px;
      gap: 10px;
      transition: background .2s, box-shadow .2s;
      border: 1px solid transparent;

      &--focused {
        background: #fff;
        border-color: #dadce0;
        box-shadow: 0 1px 3px rgba(60,64,67,.2);
      }
    }

    .header__search-icon {
      font-size: 20px !important;
      color: #5f6368;
      flex-shrink: 0;
    }

    .header__search-input {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      font-size: 14px;
      font-family: inherit;
      color: #202124;
      &::placeholder { color: #80868b; }
    }

    .header__search-kbd {
      font-size: 16px !important;
      color: #80868b;
      flex-shrink: 0;
    }

    /* ── Right ─────────────────────────────────────── */
    .header__right {
      display: flex;
      align-items: center;
      gap: 4px;
      flex: 0 0 auto;
    }

    /* Icon button */
    .header__icon-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: transparent;
      color: #5f6368;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      transition: background .15s;

      .material-icons-outlined { font-size: 22px !important; }

      &:hover { background: #f1f3f4; color: #202124; }
    }

    .header__badge {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 16px;
      height: 16px;
      background: #ea4335;
      color: #fff;
      font-size: 10px;
      font-weight: 600;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #fff;
    }

    /* User avatar */
    .header__user-wrap {
      position: relative;
    }

    .header__avatar-btn {
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 2px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      transition: box-shadow .15s;

      &--open, &:hover {
        box-shadow: 0 0 0 3px #e8f0fe;
      }
    }

    /* Dropdown */
    .header__dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 300px;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 4px 16px rgba(60,64,67,.3), 0 8px 32px rgba(60,64,67,.15);
      border: 1px solid #e8eaed;
      overflow: hidden;
      z-index: 500;
      animation: fadeInDown .15s ease;
    }

    @keyframes fadeInDown {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .header__dropdown-user {
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .header__dropdown-info {
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .header__dropdown-name {
      font-size: 15px;
      font-weight: 500;
      color: #202124;
    }

    .header__dropdown-email {
      font-size: 13px;
      color: #5f6368;
    }

    .header__dropdown-divider {
      height: 1px;
      background: #e8eaed;
    }

    .header__dropdown-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      font-size: 14px;
      color: #202124;
      text-decoration: none;
      background: transparent;
      border: none;
      width: 100%;
      text-align: left;
      cursor: pointer;
      font-family: inherit;
      transition: background .15s;

      .material-icons-outlined { font-size: 20px !important; color: #5f6368; }

      &:hover { background: #f1f3f4; }

      &--danger {
        color: #ea4335;
        .material-icons-outlined { color: #ea4335; }
        &:hover { background: #fce8e6; }
      }
    }

    /* ── Responsive ────────────────────────────────── */
    @media (max-width: 768px) {
      .header__search { display: none; }
      .header__brand-text { display: none; }
      .header__nav { display: none; }
    }
  `]
})
export class HeaderComponent {
  menuPosition = input<MenuPosition>('sidebar');
  menuItems    = input<MenuItem[]>([]);
  user         = input<JiraUser | null>(null);

  toggleMenuPosition = output<void>();
  logout             = output<void>();

  userMenu    = signal(false);
  searchFocus = false;

  initials(name: string): string {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

  avatarColor(name: string): string {
    const colors = ['#1a73e8','#34a853','#ea4335','#f9ab00','#9334e6','#0f9d58'];
    return colors[name.charCodeAt(0) % colors.length];
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event): void {
    if (this.userMenu()) {
      // close dropdown when clicking outside (simple approach)
      const target = e.target as HTMLElement;
      if (!target.closest('.header__user-wrap')) {
        this.userMenu.set(false);
      }
    }
  }
}
