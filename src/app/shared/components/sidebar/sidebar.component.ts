/**
 * Sidebar Component
 * @description Responsive sidebar navigation with role-based menu
 * @version 1.0.0
 */

import {
  Component,
  inject,
  ViewChild,
  HostListener,
  ChangeDetectionStrategy,
  effect,
  Input,
  ViewChildren,
  QueryList
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// Angular Material
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatRippleModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule, MatMenuPanel } from '@angular/material/menu';

// Models & Services
import { MenuItem, Role, ALL_ROLES } from '../../../core/models/menu.model';
import { MenuService } from '../../../core/services/menu.service';

/**
 * Menu Item Component (Recursive)
 */
@Component({
  selector: 'app-menu-item',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatBadgeModule,
    MatRippleModule,
    MatMenuModule
  ],
  template: `
    <div class="menu-item-wrapper">
      <!-- Parent Menu Item -->
      <a
        mat-list-item
        class="menu-item"
        [class.menu-item--active]="isActive"
        [class.menu-item--has-children]="hasChildren"
        [class.menu-item--disabled]="item.disabled"
        [routerLink]="item.route"
        [attr.data-item-id]="item.id"
        [matTooltip]="isCollapsed ? item.label : ''"
        [matTooltipPosition]="'right'"
        matRipple
        (click)="onItemClick($event)"
      >
        <!-- Icon -->
        <mat-icon
          matListItemIcon
          class="menu-item__icon"
          [class.menu-item__icon--active]="isActive"
        >
          {{ item.icon || 'circle' }}
        </mat-icon>

        <!-- Label & Badge -->
        @if (!isCollapsed) {
          <span matListItemTitle class="menu-item__label">
            {{ item.label }}
          </span>

          @if (item.badge) {
            <span matListItemMeta class="menu-item__badge">
              @switch (item.badge.style) {
                @case ('number') {
                  <span class="badge badge--number" [class]="'badge--' + item.badge.color">
                    {{ item.badge.text }}
                  </span>
                }
                @case ('text') {
                  <span class="badge badge--text" [class]="'badge--' + item.badge.color">
                    {{ item.badge.text }}
                  </span>
                }
                @default {
                  <span class="badge badge--dot" [class]="'badge--' + item.badge.color"></span>
                }
              }
            </span>
          }
        }

        <!-- Expand Icon -->
        @if (hasChildren && !isCollapsed) {
          <mat-icon
            matListItemMeta
            class="menu-item__expand-icon"
            [class.menu-item__expand-icon--expanded]="isExpanded"
          >
            expand_more
          </mat-icon>
        }
      </a>

      <!-- Children Menu Items -->
      @if (hasChildren && isExpanded && !isCollapsed) {
        <div class="menu-children" [@expandCollapse]="isExpanded">
          @for (child of item.children; track child.id) {
            <app-menu-item
              [item]="child"
              [level]="level + 1"
              [isCollapsed]="isCollapsed"
            />
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .menu-item-wrapper {
      width: 100%;
    }

    .menu-item {
      position: relative;
      height: 44px;
      border-radius: 8px;
      margin: 2px 8px;
      transition: all 200ms ease;
      cursor: pointer;

      &:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }

      &--active {
        background-color: rgba(63, 81, 181, 0.12);
        color: #3f51b5;

        &:hover {
          background-color: rgba(63, 81, 181, 0.18);
        }
      }

      &--has-children {
        .menu-item__label {
          font-weight: 500;
        }
      }

      &--disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }
    }

    .menu-item__icon {
      margin-right: 12px;
      color: rgba(0, 0, 0, 0.54);
      transition: color 200ms ease;

      &--active {
        color: #3f51b5;
      }
    }

    .menu-item__label {
      font-size: 14px;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.87);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .menu-item__badge {
      display: flex;
      align-items: center;
      margin-left: auto;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 500;

      &--number {
        min-width: 20px;
        height: 20px;
        padding: 0 6px;
        border-radius: 10px;
      }

      &--text {
        padding: 2px 8px;
        border-radius: 12px;
      }

      &--dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }

      &--primary {
        background-color: #3f51b5;
        color: white;
      }

      &--accent {
        background-color: #ff4081;
        color: white;
      }

      &--warn {
        background-color: #f44336;
        color: white;
      }
    }

    .menu-item__expand-icon {
      transition: transform 200ms ease;
      color: rgba(0, 0, 0, 0.38);

      &--expanded {
        transform: rotate(180deg);
      }
    }

    .menu-children {
      padding-left: 16px;
      overflow: hidden;
    }
  `]
})
export class MenuItemComponent {
  private readonly menuService = inject(MenuService);

  @Input() item!: MenuItem;
  @Input() level = 0;
  @Input() isCollapsed = false;

  get hasChildren(): boolean {
    return !!this.item.children && this.item.children.length > 0;
  }

  get isActive(): boolean {
    return this.menuService.isItemActive(this.item.id);
  }

  get isExpanded(): boolean {
    return this.menuService.isGroupExpanded(this.item.id);
  }

  onItemClick(event: Event): void {
    if (this.hasChildren) {
      event.preventDefault();
      this.menuService.toggleGroup(this.item.id);
    } else {
      this.menuService.navigateToItem(this.item.id);
    }
  }
}

/**
 * Main Sidebar Component
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDividerModule,
    MatBadgeModule,
    MatRippleModule,
    MatSelectModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatMenuModule,
    MenuItemComponent
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <!-- Sidebar Navigation -->
      <mat-sidenav
        #sidenav
        class="sidenav"
        [mode]="isMobile ? 'over' : 'side'"
        [opened]="isMobile ? mobileOpen() : true"
        [disableClose]="!isMobile"
        [style.width.px]="sidenavWidth"
        (openedChange)="onSidenavToggle($event)"
      >
        <!-- Sidebar Header -->
        <div class="sidenav-header">
          <div class="sidenav-brand">
            <mat-icon class="sidenav-brand__icon">architecture</mat-icon>
            @if (!isCollapsed) {
              <span class="sidenav-brand__text">System Architect</span>
            }
          </div>

          <!-- Role Selector -->
          @if (!isCollapsed) {
            <div class="sidenav-role">
              <mat-form-field appearance="outline" class="sidenav-role__field">
                <mat-label>Current Role</mat-label>
                <mat-select
                  [value]="currentRole()"
                  (selectionChange)="onRoleChange($event.value)"
                >
                  @for (role of availableRoles; track role) {
                    <mat-option [value]="role">
                      <div class="role-option">
                        <mat-icon>{{ getRoleIcon(role) }}</mat-icon>
                        <span>{{ getRoleLabel(role) }}</span>
                      </div>
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
          } @else {
            <button
              mat-icon-button
              [matMenuTriggerFor]="roleMenu"
              class="sidenav-role__button"
              [matTooltip]="'Current Role: ' + (currentRole() || 'None')"
            >
              <mat-icon>{{ getRoleIcon(currentRole()) }}</mat-icon>
            </button>
          }
        </div>

        <mat-divider></mat-divider>

        <!-- Menu Items -->
        <div class="sidenav-content">
          <mat-nav-list class="sidenav-menu">
            @if (menuItems().length === 0) {
              <div class="sidenav-empty">
                <mat-icon>menu_open</mat-icon>
                <p>No menu items available</p>
              </div>
            } @else {
              @for (item of menuItems(); track item.id) {
                <app-menu-item
                  [item]="item"
                  [isCollapsed]="isCollapsed"
                />
              }
            }
          </mat-nav-list>
        </div>

        <!-- Sidebar Footer -->
        <div class="sidenav-footer">
          <mat-divider></mat-divider>

          <div class="sidenav-footer__content">
            <!-- User Profile -->
            @if (!isCollapsed) {
              <div class="user-profile">
                <div class="user-avatar">
                  <mat-icon>account_circle</mat-icon>
                </div>
                <div class="user-info">
                  <span class="user-name">John Doe</span>
                  <span class="user-role">{{ getRoleLabel(currentRole()) }}</span>
                </div>
              </div>
            }

            <!-- Collapse Toggle -->
            @if (!isMobile && isCollapsible) {
              <button
                mat-icon-button
                class="collapse-toggle"
                [matTooltip]="isCollapsed ? 'Expand' : 'Collapse'"
                (click)="toggleCollapse()"
              >
                <mat-icon>{{ isCollapsed ? 'chevron_right' : 'chevron_left' }}</mat-icon>
              </button>
            }
          </div>
        </div>
      </mat-sidenav>

      <!-- Main Content Area -->
      <mat-sidenav-content class="sidenav-content-wrapper">
        <!-- Mobile Header -->
        @if (isMobile) {
          <mat-toolbar class="mobile-header">
            <button
              mat-icon-button
              (click)="toggleMobileMenu()"
              aria-label="Toggle menu"
            >
              <mat-icon>menu</mat-icon>
            </button>
            <span class="mobile-header__title">{{ getPageTitle() }}</span>
          </mat-toolbar>
        }

        <!-- Page Content -->
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  private readonly menuService = inject(MenuService);
  private readonly router = inject(Router);

  // Signals from service
  readonly currentRole = this.menuService.currentRole;
  readonly menuItems = this.menuService.menuItems;
  readonly isExpanded = this.menuService.isExpanded;
  readonly activeItemId = this.menuService.activeItemId;
  readonly mobileOpen = this.menuService.mobileOpen;

  // Component state
  isMobile = false;
  isCollapsible = true;
  availableRoles = ALL_ROLES;
  roleMenu: MatMenuPanel | null = null;

  // Computed values
  get isCollapsed(): boolean {
    return !this.menuService.isExpanded();
  }

  get sidenavWidth(): number {
    // Return width based on expanded state (256px expanded, 64px collapsed)
    return this.menuService.isExpanded() ? 256 : 64;
  }

  constructor() {
    this.checkScreenSize();

    // Set default role if none selected
    effect(() => {
      if (!this.currentRole()) {
        this.menuService.setRole('FE');
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    const mobileBreakpoint = 768;
    this.isMobile = window.innerWidth < mobileBreakpoint;

    if (this.isMobile) {
      this.menuService.setMobileOpen(false);
    }
  }

  onSidenavToggle(opened: boolean): void {
    if (this.isMobile && !opened) {
      this.menuService.setMobileOpen(false);
    }
  }

  toggleCollapse(): void {
    this.menuService.toggleSidebar();
  }

  toggleMobileMenu(): void {
    this.menuService.toggleMobileSidebar();
  }

  onRoleChange(role: Role): void {
    this.menuService.setRole(role);
  }

  getRoleIcon(role: Role | null): string {
    const icons: Record<Role, string> = {
      FE: 'code',
      BE: 'dns',
      QC: 'bug_report',
      BA: 'analytics',
      PM: 'manage_accounts',
      ADMIN: 'admin_panel_settings'
    };
    return role ? icons[role] : 'person';
  }

  getRoleLabel(role: Role | null): string {
    const labels: Record<Role, string> = {
      FE: 'Frontend Developer',
      BE: 'Backend Developer',
      QC: 'Quality Control',
      BA: 'Business Analyst',
      PM: 'Project Manager',
      ADMIN: 'Administrator'
    };
    return role ? labels[role] : 'Select Role';
  }

  getPageTitle(): string {
    const activeItem = this.menuService.activeMenuItem();
    return activeItem?.label || 'Dashboard';
  }
}
