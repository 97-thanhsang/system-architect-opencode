import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import type { MenuItem } from '../../services/layout.service';
import type { JiraUser } from '../../../../../core/auth/jira-auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.sidebar--collapsed]="collapsed()">

      <!-- Logo ─────────────────────────────────────── -->
      <div class="sidebar__logo">
        <div class="sidebar__logo-icon">
          <span class="material-icons-outlined" style="font-size:24px;color:#1a73e8">architecture</span>
        </div>
        @if (!collapsed()) {
          <span class="sidebar__logo-text">System Architect</span>
        }
      </div>

      <div class="sidebar__divider"></div>

      <!-- Navigation ──────────────────────────────── -->
      <nav class="sidebar__nav">
        @for (item of menuItems(); track item.id) {
          <a
            class="sidebar__item"
            [routerLink]="item.route"
            routerLinkActive="sidebar__item--active"
            [routerLinkActiveOptions]="{ exact: false }"
            [title]="collapsed() ? item.label : ''">
            <span class="material-icons-outlined sidebar__item-icon">{{ item.icon }}</span>
            @if (!collapsed()) {
              <span class="sidebar__item-label">{{ item.label }}</span>
            }
          </a>
        }
      </nav>

      <div class="sidebar__spacer"></div>
      <div class="sidebar__divider"></div>

      <!-- User Footer ─────────────────────────────── -->
      <div class="sidebar__footer">
        @if (user(); as u) {
          <div class="sidebar__user" [class.sidebar__user--collapsed]="collapsed()">
            <!-- Avatar -->
            <div class="g-avatar g-avatar--sm sidebar__avatar"
                 [style.background]="avatarColor(u.displayName)">
              {{ initials(u.displayName) }}
            </div>

            @if (!collapsed()) {
              <div class="sidebar__user-info">
                <span class="sidebar__user-name">{{ u.displayName }}</span>
                <span class="sidebar__user-email">{{ u.email }}</span>
              </div>
              <button
                class="sidebar__logout"
                (click)="logout.emit()"
                title="Đăng xuất">
                <span class="material-icons-outlined" style="font-size:18px">logout</span>
              </button>
            } @else {
              <button
                class="sidebar__logout sidebar__logout--center"
                (click)="logout.emit()"
                title="Đăng xuất">
                <span class="material-icons-outlined" style="font-size:18px">logout</span>
              </button>
            }
          </div>
        }
      </div>

      <!-- Collapse Toggle ─────────────────────────── -->
      <button class="sidebar__toggle" (click)="toggleSidebar.emit()"
              [title]="collapsed() ? 'Mở rộng' : 'Thu gọn'">
        <span class="material-icons sidebar__toggle-icon">
          {{ collapsed() ? 'chevron_right' : 'chevron_left' }}
        </span>
      </button>
    </aside>
  `,
  styles: [`
    /* ── Container ─────────────────────────────────── */
    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: var(--sidebar-width, 256px);
      background: #fff;
      border-right: 1px solid #e8eaed;
      display: flex;
      flex-direction: column;
      z-index: 200;
      transition: width .25s cubic-bezier(.4,0,.2,1);
      overflow: hidden;

      &--collapsed {
        width: var(--sidebar-collapsed-width, 72px);

        .sidebar__logo {
          padding: 0;
          justify-content: center;
          height: 64px;
        }
        .sidebar__item {
          justify-content: center;
          padding: 0;
          height: 48px;
          border-left: 3px solid transparent;
          border-radius: 0 24px 24px 0;
          margin: 2px 8px 2px 0;
        }
        .sidebar__item--active {
          background: #e8f0fe;
          border-left-color: #1a73e8;
        }
        .sidebar__item-icon {
          margin: 0;
        }
      }
    }

    /* ── Logo ──────────────────────────────────────── */
    .sidebar__logo {
      height: 64px;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 20px;
      flex-shrink: 0;
    }

    .sidebar__logo-icon {
      width: 36px;
      height: 36px;
      background: #e8f0fe;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .sidebar__logo-text {
      font-family: 'Google Sans', sans-serif;
      font-size: 16px;
      font-weight: 500;
      color: #202124;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ── Divider ───────────────────────────────────── */
    .sidebar__divider {
      height: 1px;
      background: #e8eaed;
      flex-shrink: 0;
    }

    /* ── Navigation ────────────────────────────────── */
    .sidebar__nav {
      flex: 0 0 auto;
      padding: 8px 0;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .sidebar__item {
      display: flex;
      align-items: center;
      gap: 16px;
      height: 44px;
      padding: 0 20px;
      margin: 1px 8px;
      border-radius: 0 22px 22px 0;
      color: #444746;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: background .15s ease, color .15s ease;
      white-space: nowrap;
      cursor: pointer;
      border-left: 3px solid transparent;

      &:hover:not(.sidebar__item--active) {
        background: #f1f3f4;
        color: #202124;
        text-decoration: none;
      }

      &--active {
        background: #e8f0fe;
        color: #1a73e8;
        border-left-color: #1a73e8;

        .sidebar__item-icon {
          color: #1a73e8;
        }
      }
    }

    .sidebar__item-icon {
      font-size: 20px !important;
      color: #5f6368;
      flex-shrink: 0;
      transition: color .15s;
    }

    .sidebar__item-label {
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ── Spacer ────────────────────────────────────── */
    .sidebar__spacer { flex: 1; }

    /* ── Footer ────────────────────────────────────── */
    .sidebar__footer {
      padding: 12px 0;
      flex-shrink: 0;
    }

    .sidebar__user {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 16px;
      border-radius: 12px;
      margin: 0 8px;
      transition: background .15s;

      &:hover { background: #f1f3f4; }

      &--collapsed {
        flex-direction: column;
        padding: 8px 0;
        margin: 0;
        border-radius: 0;
        justify-content: center;
        &:hover { background: transparent; }
      }
    }

    .sidebar__avatar { flex-shrink: 0; }

    .sidebar__user-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .sidebar__user-name {
      font-size: 13px;
      font-weight: 500;
      color: #202124;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .sidebar__user-email {
      font-size: 11px;
      color: #5f6368;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .sidebar__logout {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background: transparent;
      color: #5f6368;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      transition: background .15s, color .15s;

      &:hover { background: #e8eaed; color: #ea4335; }

      &--center { margin: 0 auto; }
    }

    /* ── Toggle button ─────────────────────────────── */
    .sidebar__toggle {
      position: absolute;
      right: -14px;
      top: 72px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #fff;
      border: 1px solid #dadce0;
      box-shadow: 0 1px 3px rgba(60,64,67,.3);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #5f6368;
      transition: background .15s, color .15s, opacity .15s;
      opacity: 0;
      z-index: 10;

      &:hover { background: #e8f0fe; color: #1a73e8; }
    }

    .sidebar:hover .sidebar__toggle { opacity: 1; }

    .sidebar__toggle-icon {
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
    }

    /* ── Responsive ────────────────────────────────── */
    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
        box-shadow: none;

        &.mobile-open {
          transform: translateX(0);
          box-shadow: 0 0 0 100vw rgba(0,0,0,.3);
        }
      }
    }
  `]
})
export class SidebarComponent {
  collapsed  = input<boolean>(false);
  menuItems  = input<MenuItem[]>([]);
  user       = input<JiraUser | null>(null);

  toggleSidebar = output<void>();
  logout        = output<void>();

  initials(name: string): string {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

  avatarColor(name: string): string {
    const colors = ['#1a73e8','#34a853','#ea4335','#f9ab00','#9334e6','#0f9d58'];
    const i = name.charCodeAt(0) % colors.length;
    return colors[i];
  }
}
