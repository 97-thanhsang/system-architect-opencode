import { Component, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavSection {
  id: string;
  title?: string;
  items: NavItem[];
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  badge?: string | number;
  badgeColor?: 'blue' | 'green' | 'red' | 'yellow';
}

interface UserInfo {
  displayName: string;
  email: string;
  role?: string;
  avatar?: string;
}

/**
 * Professional Sidebar Component
 * 
 * Collapsible sidebar with navigation, user menu, and quick actions.
 * Follows Google Design System with modern SaaS aesthetics.
 * 
 * @example
 * <app-professional-sidebar 
 *   [collapsed]="isSidebarCollapsed()"
 *   [sections]="navSections"
 *   [user]="currentUser()"
 *   (toggleCollapse)="toggleSidebar()"
 *   (logout)="handleLogout()" />
 */
@Component({
  selector: 'app-professional-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="pro-sidebar" [class.pro-sidebar--collapsed]="collapsed()">
      <!-- Brand Section -->
      <div class="pro-sidebar__brand">
        <div class="pro-sidebar__logo">
          <span class="material-icons-outlined">architecture</span>
        </div>
        @if (!collapsed()) {
          <span class="pro-sidebar__brand-text">System Architect</span>
        }
      </div>

      <!-- Navigation -->
      <nav class="pro-sidebar__nav">
        @for (section of sections(); track section.id) {
          <div class="pro-sidebar__section">
            @if (!collapsed() && section.title) {
              <div class="pro-sidebar__section-title">{{ section.title }}</div>
            }
            
            @for (item of section.items; track item.id) {
              <a class="pro-sidebar__item"
                 [routerLink]="item.route"
                 routerLinkActive="pro-sidebar__item--active"
                 [title]="collapsed() ? item.label : ''">
                <div class="pro-sidebar__item-icon">
                  <span class="material-icons-outlined">{{ item.icon }}</span>
                </div>
                
                @if (!collapsed()) {
                  <span class="pro-sidebar__item-label">{{ item.label }}</span>
                  
                  @if (item.badge) {
                    <span class="pro-sidebar__badge" [class]="'pro-sidebar__badge--' + (item.badgeColor || 'blue')">
                      {{ item.badge }}
                    </span>
                  }
                }
              </a>
            }
          </div>
        }
      </nav>

      <!-- Quick Actions -->
      <div class="pro-sidebar__quick-actions">
        <button class="pro-sidebar__fab" (click)="createNew.emit()">
          <span class="material-icons-outlined">add</span>
          @if (!collapsed()) {
            <span>Tạo mới</span>
          }
        </button>
      </div>

      <!-- User Section -->
      <div class="pro-sidebar__footer">
        @if (user(); as u) {
          <div class="pro-sidebar__user" 
               [class.pro-sidebar__user--collapsed]="collapsed()"
               (click)="!collapsed() && toggleUserMenu.set(!toggleUserMenu())">
            <div class="pro-sidebar__user-avatar" [style.background-color]="avatarColor(u.displayName)">
              {{ initials(u.displayName) }}
            </div>
            
            @if (!collapsed()) {
              <div class="pro-sidebar__user-info">
                <span class="pro-sidebar__user-name">{{ u.displayName }}</span>
                <span class="pro-sidebar__user-role">{{ u.role }}</span>
              </div>
              
              <button class="pro-sidebar__user-menu">
                <span class="material-icons-outlined">expand_more</span>
              </button>
            }
          </div>
          
          @if (toggleUserMenu() && !collapsed()) {
            <div class="pro-sidebar__dropdown">
              <button class="pro-sidebar__dropdown-item" (click)="profile.emit()">
                <span class="material-icons-outlined">person</span>
                <span>Hồ sơ</span>
              </button>
              <button class="pro-sidebar__dropdown-item" (click)="settings.emit()">
                <span class="material-icons-outlined">settings</span>
                <span>Cài đặt</span>
              </button>
              <div class="pro-sidebar__dropdown-divider"></div>
              <button class="pro-sidebar__dropdown-item pro-sidebar__dropdown-item--danger" (click)="logout.emit()">
                <span class="material-icons-outlined">logout</span>
                <span>Đăng xuất</span>
              </button>
            </div>
          }
        }
      </div>

      <!-- Collapse Toggle -->
      <button class="pro-sidebar__toggle" (click)="toggleCollapse.emit()">
        <span class="material-icons-outlined">
          {{ collapsed() ? 'chevron_right' : 'chevron_left' }}
        </span>
      </button>
    </aside>
  `,
  styles: [`
    :host {
      --sidebar-width: 260px;
      --sidebar-collapsed: 72px;
      --header-height: 68px;
    }

    .pro-sidebar {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: var(--sidebar-width);
      background: var(--g-surface, #ffffff);
      border-right: 1px solid var(--g-border, #e0e0e0);
      display: flex;
      flex-direction: column;
      z-index: 200;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;

      &--collapsed {
        width: var(--sidebar-collapsed);

        .pro-sidebar__brand {
          padding: 16px;
          justify-content: center;
        }

        .pro-sidebar__item {
          justify-content: center;
          padding: 12px;
        }

        .pro-sidebar__fab {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          padding: 0;
          justify-content: center;
        }
      }
    }

    .pro-sidebar__brand {
      height: var(--header-height);
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 20px;
      flex-shrink: 0;
      border-bottom: 1px solid var(--g-bg-dark, #f1f3f4);
    }

    .pro-sidebar__logo {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, var(--g-blue, #1a73e8), #4285f4);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
      
      .material-icons-outlined {
        font-size: 24px;
      }
    }

    .pro-sidebar__brand-text {
      font-family: 'Google Sans', sans-serif;
      font-size: 18px;
      font-weight: 500;
      color: var(--g-text-primary, #202124);
    }

    .pro-sidebar__nav {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .pro-sidebar__section {
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .pro-sidebar__section-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--g-text-tertiary, #80868b);
      padding: 0 12px;
      margin-bottom: 8px;
    }

    .pro-sidebar__item {
      display: flex;
      align-items: center;
      gap: 12px;
      height: 44px;
      padding: 0 12px;
      border-radius: 12px;
      color: var(--g-text-secondary, #5f6368);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      margin-bottom: 2px;

      &:hover {
        background: var(--g-bg, #f8f9fa);
        color: var(--g-text-primary, #202124);
      }

      &--active {
        background: var(--g-blue-light, #e8f0fe);
        color: var(--g-blue, #1a73e8);

        .pro-sidebar__item-icon {
          color: var(--g-blue, #1a73e8);
        }
      }
    }

    .pro-sidebar__item-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      
      .material-icons-outlined {
        font-size: 22px;
      }
    }

    .pro-sidebar__item-label {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .pro-sidebar__badge {
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 600;

      &--blue {
        background: var(--g-blue-light, #e8f0fe);
        color: var(--g-blue, #1a73e8);
      }

      &--green {
        background: var(--g-green-light, #e6f4ea);
        color: var(--g-green, #34a853);
      }

      &--red {
        background: var(--g-red-light, #fce8e6);
        color: var(--g-red, #ea4335);
      }

      &--yellow {
        background: var(--g-yellow-light, #fef7e0);
        color: #b06000;
      }
    }

    .pro-sidebar__quick-actions {
      padding: 16px 20px;
      border-top: 1px solid var(--g-bg-dark, #f1f3f4);
    }

    .pro-sidebar__fab {
      width: 100%;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: var(--g-blue, #1a73e8);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 8px rgba(26, 115, 232, 0.3);

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(26, 115, 232, 0.4);
      }

      &:active {
        transform: translateY(0);
      }

      .material-icons-outlined {
        font-size: 20px;
      }
    }

    .pro-sidebar__footer {
      padding: 16px;
      border-top: 1px solid var(--g-bg-dark, #f1f3f4);
      position: relative;
    }

    .pro-sidebar__user {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 12px;
      cursor: pointer;
      transition: background 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background: var(--g-bg, #f8f9fa);
      }

      &--collapsed {
        justify-content: center;
        padding: 8px;
      }
    }

    .pro-sidebar__user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .pro-sidebar__user-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .pro-sidebar__user-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--g-text-primary, #202124);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .pro-sidebar__user-role {
      font-size: 12px;
      color: var(--g-text-tertiary, #80868b);
    }

    .pro-sidebar__user-menu {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: var(--g-text-tertiary, #80868b);
      cursor: pointer;
      border-radius: 50%;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background: var(--g-bg-dark, #f1f3f4);
        color: var(--g-text-primary, #202124);
      }
    }

    .pro-sidebar__dropdown {
      position: absolute;
      bottom: calc(100% + 8px);
      left: 16px;
      right: 16px;
      background: var(--g-surface, #ffffff);
      border-radius: 16px;
      box-shadow: var(--g-shadow-4, 0 2px 3px rgba(60,64,67,.3), 0 6px 10px 4px rgba(60,64,67,.15));
      border: 1px solid var(--g-border, #e0e0e0);
      overflow: hidden;
      animation: slideUp 0.2s ease;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .pro-sidebar__dropdown-item {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 12px 16px;
      background: transparent;
      border: none;
      font-size: 14px;
      color: var(--g-text-primary, #202124);
      cursor: pointer;
      transition: background 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background: var(--g-bg, #f8f9fa);
      }

      &--danger {
        color: var(--g-red, #ea4335);

        .material-icons-outlined {
          color: var(--g-red, #ea4335);
        }

        &:hover {
          background: var(--g-red-light, #fce8e6);
        }
      }

      .material-icons-outlined {
        font-size: 20px;
        color: var(--g-text-secondary, #5f6368);
      }
    }

    .pro-sidebar__dropdown-divider {
      height: 1px;
      background: var(--g-bg-dark, #f1f3f4);
      margin: 8px 0;
    }

    .pro-sidebar__toggle {
      position: absolute;
      right: -12px;
      top: 24px;
      width: 24px;
      height: 24px;
      background: var(--g-surface, #ffffff);
      border: 1px solid var(--g-border, #e0e0e0);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--g-text-secondary, #5f6368);
      box-shadow: var(--g-shadow-1, 0 1px 2px rgba(60,64,67,.3));
      opacity: 0;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 10;

      .material-icons-outlined {
        font-size: 16px;
      }
    }

    .pro-sidebar:hover .pro-sidebar__toggle {
      opacity: 1;
    }

    @media (max-width: 768px) {
      .pro-sidebar {
        transform: translateX(-100%);
        
        &.mobile-open {
          transform: translateX(0);
        }
      }
    }
  `]
})
export class ProfessionalSidebarComponent {
  collapsed = input<boolean>(false);
  sections = input<NavSection[]>([]);
  user = input<UserInfo | null>(null);

  toggleCollapse = output<void>();
  createNew = output<void>();
  profile = output<void>();
  settings = output<void>();
  logout = output<void>();

  toggleUserMenu = signal(false);

  initials(name: string): string {
    return name?.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase() || '';
  }

  avatarColor(name: string): string {
    const colors = ['#1a73e8', '#34a853', '#ea4335', '#f9ab00', '#9334e6', '#0f9d58'];
    return colors[(name?.charCodeAt(0) || 0) % colors.length];
  }
}
