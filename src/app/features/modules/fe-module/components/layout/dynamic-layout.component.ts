import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { LayoutService } from '../../services/layout.service';
import { JiraAuthService } from '../../../../../core/auth/jira-auth.service';
import { AuthService } from '../../../../../core/auth/auth.service';

@Component({
  selector: 'app-dynamic-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="shell" [class.shell--header-mode]="layoutService.menuPosition() === 'header'">

      <!-- Sidebar -->
      @if (layoutService.menuPosition() === 'sidebar') {
        <app-sidebar
          [collapsed]="layoutService.sidebarCollapsed()"
          [menuItems]="menuItems()"
          [user]="jiraAuth.user()"
          [roleLabel]="roleFallbackLabel()"
          (toggleSidebar)="layoutService.toggleSidebar()"
          (logout)="jiraAuth.logout()" />
      }

      <!-- Main wrapper -->
      <div
        class="shell__main"
        [class.shell__main--collapsed]="layoutService.sidebarCollapsed() && layoutService.menuPosition() === 'sidebar'"
        [class.shell__main--full]="layoutService.menuPosition() === 'header'">

        <!-- Header -->
        <app-header
          [menuPosition]="layoutService.menuPosition()"
          [menuItems]="menuItems()"
          [user]="jiraAuth.user()"
          [roleLabel]="roleFallbackLabel()"
          (toggleMenuPosition)="layoutService.toggleMenuPosition()"
          (logout)="jiraAuth.logout()" />

        <!-- Page content -->
        <main class="shell__content">
          <router-outlet />
        </main>

        <!-- Footer -->
        <footer class="shell__footer">
          <span>© 2026 System Architect OpenCode</span>
          <span class="shell__footer-sep">·</span>
          <a href="#" class="shell__footer-link">Điều khoản</a>
          <span class="shell__footer-sep">·</span>
          <a href="#" class="shell__footer-link">Quyền riêng tư</a>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    /* ── App Shell ─────────────────────────────────── */
    .shell {
      display: flex;
      min-height: 100vh;
      background: #f8f9fa;
    }

    /* ── Main area ─────────────────────────────────── */
    .shell__main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      margin-left: var(--sidebar-width, 256px);
      transition: margin-left .25s cubic-bezier(.4,0,.2,1);

      &--collapsed {
        margin-left: var(--sidebar-collapsed-width, 72px);
      }

      &--full, .shell--header-mode & {
        margin-left: 0;
      }
    }

    /* ── Content ───────────────────────────────────── */
    .shell__content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
    }

    /* ── Footer ────────────────────────────────────── */
    .shell__footer {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 14px 32px;
      background: #fff;
      border-top: 1px solid #e8eaed;
      font-size: 12px;
      color: #80868b;
    }

    .shell__footer-sep { color: #dadce0; }

    .shell__footer-link {
      color: #1a73e8;
      text-decoration: none;
      &:hover { text-decoration: underline; }
    }

    /* ── Responsive ────────────────────────────────── */
    @media (max-width: 768px) {
      .shell__main {
        margin-left: 0 !important;
      }
    }
  `]
})
export class DynamicLayoutComponent {
  layoutService = inject(LayoutService);
  jiraAuth      = inject(JiraAuthService);
  authService   = inject(AuthService);
  private route = inject(ActivatedRoute);

  /**
   * Role label dùng làm fallback khi jiraAuth.user() = null.
   * Lấy selectedRole từ AuthService (ví dụ: 'FE', 'BE', 'QC', 'BA')
   * hoặc module id từ route.
   */
  roleFallbackLabel(): string {
    return (
      this.authService.selectedRole()
      ?? this.currentModuleId.toUpperCase()
    );
  }

  /**
   * Resolve module id từ route data (moduleId) hoặc từ URL segment.
   * Ví dụ: /module/be → 'be', /module/fe → 'fe'
   */
  private get currentModuleId(): string {
    // Thử lấy từ route data trước (được set trong app.routes.ts)
    const fromData = this.route.snapshot.data?.['moduleId']
      ?? this.route.snapshot.parent?.data?.['moduleId'];

    if (fromData) return fromData as string;

    // Fallback: lấy từ URL (path segment thứ 2 của /module/XX)
    const url = this.route.snapshot.pathFromRoot
      .flatMap(r => r.url)
      .map(s => s.path);

    const moduleIdx = url.indexOf('module');
    if (moduleIdx !== -1 && url[moduleIdx + 1]) {
      return url[moduleIdx + 1];
    }

    // Cuối cùng fallback về role của user
    return this.jiraAuth.user()?.username?.toLowerCase() ?? 'fe';
  }

  menuItems = () => this.layoutService.getMenuItemsForModule(this.currentModuleId);
}
