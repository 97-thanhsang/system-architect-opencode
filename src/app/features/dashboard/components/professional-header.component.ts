import { Component, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Breadcrumb {
  label: string;
  route?: string;
  icon?: string;
}

/**
 * Professional Header Component
 * 
 * Modern header with breadcrumbs, global search, and action buttons.
 * Features sticky positioning and responsive design.
 * 
 * @example
 * <app-professional-header
 *   [breadcrumbs]="[{ label: 'Dashboard', icon: 'dashboard' }]"
 *   [notificationCount]="5"
 *   (onSearch)="handleSearch($event)"
 *   (createNew)="openCreateModal()" />
 */
@Component({
  selector: 'app-professional-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="pro-header">
      <!-- Left: Breadcrumbs & Mobile Menu -->
      <div class="pro-header__left">
        <button class="pro-header__menu-btn" (click)="toggleMobileMenu.emit()">
          <span class="material-icons-outlined">menu</span>
        </button>

        <!-- Breadcrumbs -->
        <nav class="pro-header__breadcrumbs">
          @for (crumb of breadcrumbs(); track $index; let last = $last) {
            @if (!$first) {
              <span class="pro-header__breadcrumb-separator">
                <span class="material-icons-outlined">chevron_right</span>
              </span>
            }
            
            @if (crumb.route && !last) {
              <a class="pro-header__breadcrumb" [routerLink]="crumb.route">
                @if (crumb.icon) {
                  <span class="material-icons-outlined">{{ crumb.icon }}</span>
                }
                <span>{{ crumb.label }}</span>
              </a>
            } @else {
              <span class="pro-header__breadcrumb pro-header__breadcrumb--current">
                @if (crumb.icon) {
                  <span class="material-icons-outlined">{{ crumb.icon }}</span>
                }
                <span>{{ crumb.label }}</span>
              </span>
            }
          }
        </nav>
      </div>

      <!-- Center: Global Search -->
      <div class="pro-header__search" [class.pro-header__search--focused]="searchFocused()">
        <span class="material-icons-outlined pro-header__search-icon">search</span>
        <input
          type="text"
          class="pro-header__search-input"
          placeholder="Tìm kiếm nhanh..."
          (focus)="searchFocused.set(true)"
          (blur)="searchFocused.set(false)"
          (input)="onSearch.emit($any($event.target).value)" />
        <kbd class="pro-header__search-kbd">⌘K</kbd>
      </div>

      <!-- Right: Actions -->
      <div class="pro-header__right">
        <!-- Theme Toggle -->
        <button class="pro-header__icon-btn" (click)="toggleTheme.emit()" title="Chuyển đổi giao diện">
          <span class="material-icons-outlined">
            {{ isDarkMode() ? 'light_mode' : 'dark_mode' }}
          </span>
        </button>

        <!-- Notifications -->
        <button class="pro-header__icon-btn pro-header__icon-btn--has-badge" (click)="toggleNotifications.emit()">
          <span class="material-icons-outlined">notifications</span>
          @if (notificationCount() > 0) {
            <span class="pro-header__badge">{{ notificationCount() }}</span>
          }
        </button>

        <!-- Help -->
        <button class="pro-header__icon-btn" title="Trợ giúp">
          <span class="material-icons-outlined">help_outline</span>
        </button>

        <!-- Create New -->
        <button class="pro-header__create-btn" (click)="createNew.emit()">
          <span class="material-icons-outlined">add</span>
          <span>Tạo mới</span>
        </button>
      </div>
    </header>
  `,
  styles: [`
    :host {
      --header-height: 68px;
    }

    .pro-header {
      position: sticky;
      top: 0;
      z-index: 100;
      height: var(--header-height);
      background: var(--g-surface, #ffffff);
      border-bottom: 1px solid var(--g-border, #e0e0e0);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      gap: 24px;
    }

    .pro-header__left {
      display: flex;
      align-items: center;
      gap: 16px;
      flex: 0 0 auto;
    }

    .pro-header__menu-btn {
      display: none;
      width: 40px;
      height: 40px;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      border-radius: 50%;
      color: var(--g-text-secondary, #5f6368);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background: var(--g-bg, #f8f9fa);
        color: var(--g-text-primary, #202124);
      }

      @media (max-width: 768px) {
        display: flex;
      }
    }

    .pro-header__breadcrumbs {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .pro-header__breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      color: var(--g-text-secondary, #5f6368);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      border-radius: 8px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background: var(--g-bg, #f8f9fa);
        color: var(--g-text-primary, #202124);
      }

      &--current {
        color: var(--g-text-primary, #202124);
        cursor: default;

        &:hover {
          background: transparent;
        }
      }

      .material-icons-outlined {
        font-size: 18px;
      }
    }

    .pro-header__breadcrumb-separator {
      color: var(--g-text-tertiary, #80868b);
      display: flex;
      align-items: center;

      .material-icons-outlined {
        font-size: 18px;
      }
    }

    .pro-header__search {
      flex: 1;
      max-width: 480px;
      display: flex;
      align-items: center;
      gap: 12px;
      height: 44px;
      padding: 0 16px;
      background: var(--g-bg, #f8f9fa);
      border-radius: 22px;
      border: 1px solid transparent;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &--focused {
        background: var(--g-surface, #ffffff);
        border-color: var(--g-blue, #1a73e8);
        box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.12);
      }
    }

    .pro-header__search-icon {
      color: var(--g-text-tertiary, #80868b);
      font-size: 20px !important;
    }

    .pro-header__search-input {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      font-size: 14px;
      color: var(--g-text-primary, #202124);

      &::placeholder {
        color: var(--g-text-tertiary, #80868b);
      }
    }

    .pro-header__search-kbd {
      padding: 2px 6px;
      background: var(--g-bg-dark, #f1f3f4);
      border-radius: 4px;
      font-size: 11px;
      font-family: 'Roboto Mono', monospace;
      color: var(--g-text-tertiary, #80868b);
    }

    .pro-header__right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .pro-header__icon-btn {
      position: relative;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      border-radius: 50%;
      color: var(--g-text-secondary, #5f6368);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background: var(--g-bg, #f8f9fa);
        color: var(--g-text-primary, #202124);
      }

      .material-icons-outlined {
        font-size: 22px;
      }

      &--has-badge {
        .material-icons-outlined {
          font-size: 24px;
        }
      }
    }

    .pro-header__badge {
      position: absolute;
      top: 6px;
      right: 6px;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      background: var(--g-red, #ea4335);
      color: white;
      font-size: 11px;
      font-weight: 600;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--g-surface, #ffffff);
    }

    .pro-header__create-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      height: 40px;
      padding: 0 16px;
      margin-left: 8px;
      background: var(--g-blue, #1a73e8);
      color: white;
      border: none;
      border-radius: 20px;
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

    @media (max-width: 768px) {
      .pro-header {
        padding: 0 16px;
      }

      .pro-header__breadcrumbs {
        display: none;
      }

      .pro-header__search {
        max-width: none;
      }

      .pro-header__create-btn {
        width: 40px;
        height: 40px;
        padding: 0;
        border-radius: 50%;
        
        span:last-child {
          display: none;
        }
      }
    }
  `]
})
export class ProfessionalHeaderComponent {
  breadcrumbs = input<Breadcrumb[]>([]);
  notificationCount = input<number>(0);
  isDarkMode = input<boolean>(false);

  toggleMobileMenu = output<void>();
  toggleTheme = output<void>();
  toggleNotifications = output<void>();
  createNew = output<void>();
  onSearch = output<string>();

  searchFocused = signal(false);
}
