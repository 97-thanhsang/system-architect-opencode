import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fe-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="g-page animate-fade-in">

      <!-- Header ──────────────────────────────────── -->
      <div class="g-page__header">
        <div>
          <h1 class="g-page__title">Cài đặt</h1>
          <p style="font-size:13px;color:#5f6368;margin-top:4px">Quản lý tài khoản và tuỳ chọn</p>
        </div>
      </div>

      <!-- Settings layout ─────────────────────────── -->
      <div class="settings-layout">

        <!-- Sidebar menu -->
        <nav class="settings-nav">
          @for (section of navSections; track section.id) {
            <button
              class="settings-nav__item"
              [class.settings-nav__item--active]="activeSection() === section.id"
              (click)="activeSection.set(section.id)">
              <span class="material-icons-outlined" style="font-size:20px">{{ section.icon }}</span>
              <span>{{ section.label }}</span>
            </button>
          }
        </nav>

        <!-- Content panel -->
        <div class="settings-content">

          <!-- Appearance -->
          @if (activeSection() === 'appearance') {
            <div class="g-card animate-fade-in">
              <div class="g-card__header"><span class="g-card__title">Giao diện</span></div>
              <div class="g-card__body" style="display:flex;flex-direction:column;gap:0">
                @for (opt of appearanceOptions; track opt.id) {
                  <div class="settings-row">
                    <div class="settings-row__icon settings-row__icon--{{ opt.color }}">
                      <span class="material-icons-outlined" style="font-size:20px">{{ opt.icon }}</span>
                    </div>
                    <div class="settings-row__info">
                      <span class="settings-row__label">{{ opt.label }}</span>
                      <span class="settings-row__desc">{{ opt.desc }}</span>
                    </div>
                    <label class="g-toggle">
                      <input type="checkbox" [checked]="opt.value" (change)="opt.value = !opt.value">
                      <span class="g-toggle__track"></span>
                    </label>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Notifications -->
          @if (activeSection() === 'notifications') {
            <div class="g-card animate-fade-in">
              <div class="g-card__header"><span class="g-card__title">Thông báo</span></div>
              <div class="g-card__body" style="display:flex;flex-direction:column;gap:0">
                @for (opt of notifOptions; track opt.id) {
                  <div class="settings-row">
                    <div class="settings-row__icon settings-row__icon--blue">
                      <span class="material-icons-outlined" style="font-size:20px">{{ opt.icon }}</span>
                    </div>
                    <div class="settings-row__info">
                      <span class="settings-row__label">{{ opt.label }}</span>
                      <span class="settings-row__desc">{{ opt.desc }}</span>
                    </div>
                    <label class="g-toggle">
                      <input type="checkbox" [checked]="opt.value" (change)="opt.value = !opt.value">
                      <span class="g-toggle__track"></span>
                    </label>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Account -->
          @if (activeSection() === 'account') {
            <div class="g-card animate-fade-in">
              <div class="g-card__header"><span class="g-card__title">Tài khoản Jira</span></div>
              <div class="g-card__body">
                <div class="account-info">
                  <div class="g-avatar g-avatar--xl" style="background:#1a73e8">SN</div>
                  <div class="account-info__details">
                    <h3 style="font-size:18px;font-weight:400;margin-bottom:4px">SangNT</h3>
                    <p style="font-size:14px;color:#5f6368;margin-bottom:16px">sang.nguyen&#64;ascvn.com.vn</p>
                    <div style="display:flex;gap:12px">
                      <button class="g-btn g-btn--outlined">
                        <span class="material-icons-outlined" style="font-size:16px">edit</span>
                        Chỉnh sửa hồ sơ
                      </button>
                      <button class="g-btn" style="background:#fce8e6;color:#ea4335;border:none">
                        <span class="material-icons-outlined" style="font-size:16px">link_off</span>
                        Ngắt kết nối Jira
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- Layout -->
          @if (activeSection() === 'layout') {
            <div class="g-card animate-fade-in">
              <div class="g-card__header"><span class="g-card__title">Bố cục giao diện</span></div>
              <div class="g-card__body">
                <div class="layout-options">
                  @for (lo of layoutOptions; track lo.id) {
                    <button class="layout-option" [class.layout-option--active]="selectedLayout() === lo.id"
                            (click)="selectedLayout.set(lo.id)">
                      <div class="layout-option__preview">
                        <div class="layout-option__preview-inner layout-option__preview--{{ lo.id }}"></div>
                      </div>
                      <span class="layout-option__label">{{ lo.label }}</span>
                      @if (selectedLayout() === lo.id) {
                        <span class="material-icons-outlined layout-option__check">check_circle</span>
                      }
                    </button>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ── Settings Layout ─────────────────────────── */
    .settings-layout {
      display: grid;
      grid-template-columns: 220px 1fr;
      gap: 24px;
      align-items: start;
    }

    /* ── Settings Nav ────────────────────────────── */
    .settings-nav {
      background: #fff;
      border: 1px solid #e8eaed;
      border-radius: 12px;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      box-shadow: 0 1px 2px rgba(60,64,67,.15);
    }

    .settings-nav__item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border: none;
      background: transparent;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      color: #5f6368;
      cursor: pointer;
      width: 100%;
      text-align: left;
      font-family: inherit;
      transition: background .15s, color .15s;

      &:hover { background: #f1f3f4; color: #202124; }
      &--active { background: #e8f0fe; color: #1a73e8; }
    }

    /* ── Settings Row ────────────────────────────── */
    .settings-row {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 0;
      border-bottom: 1px solid #f1f3f4;

      &:last-child { border-bottom: none; }
    }

    .settings-row__icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &--blue   { background: #e8f0fe; .material-icons-outlined { color: #1a73e8; } }
      &--green  { background: #e6f4ea; .material-icons-outlined { color: #34a853; } }
      &--yellow { background: #fef7e0; .material-icons-outlined { color: #f9ab00; } }
      &--purple { background: #f3e8fd; .material-icons-outlined { color: #9334e6; } }
    }

    .settings-row__info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .settings-row__label {
      font-size: 14px;
      font-weight: 500;
      color: #202124;
    }

    .settings-row__desc {
      font-size: 12px;
      color: #80868b;
    }

    /* ── Toggle ──────────────────────────────────── */
    .g-toggle {
      position: relative;
      display: inline-flex;
      cursor: pointer;
      flex-shrink: 0;

      input { position: absolute; opacity: 0; width: 0; height: 0; }
    }

    .g-toggle__track {
      width: 44px;
      height: 24px;
      background: #dadce0;
      border-radius: 12px;
      transition: background .2s;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 18px;
        height: 18px;
        background: #fff;
        border-radius: 50%;
        transition: transform .2s, box-shadow .2s;
        box-shadow: 0 1px 3px rgba(0,0,0,.3);
      }
    }

    .g-toggle input:checked ~ .g-toggle__track {
      background: #1a73e8;
      &::after { transform: translateX(20px); }
    }

    /* ── Account info ────────────────────────────── */
    .account-info {
      display: flex;
      align-items: flex-start;
      gap: 24px;
    }

    .account-info__details { flex: 1; }

    /* ── Layout Options ──────────────────────────── */
    .layout-options {
      display: flex;
      gap: 16px;
    }

    .layout-option {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 20px;
      border: 2px solid #e8eaed;
      border-radius: 12px;
      background: transparent;
      cursor: pointer;
      transition: border-color .2s, background .2s;
      position: relative;
      font-family: inherit;

      &:hover { border-color: #4285f4; background: #f8f9fa; }
      &--active { border-color: #1a73e8; background: #e8f0fe; }
    }

    .layout-option__preview {
      width: 80px;
      height: 56px;
      background: #f1f3f4;
      border-radius: 6px;
      overflow: hidden;
    }

    .layout-option__preview-inner {
      width: 100%;
      height: 100%;

      &--sidebar {
        background: linear-gradient(90deg, #e8f0fe 25%, #f8f9fa 25%);
      }
      &--header {
        background: linear-gradient(180deg, #e8f0fe 20%, #f8f9fa 20%);
      }
    }

    .layout-option__label {
      font-size: 13px;
      font-weight: 500;
      color: #202124;
    }

    .layout-option__check {
      position: absolute;
      top: 8px;
      right: 8px;
      font-size: 18px !important;
      color: #1a73e8;
    }

    /* ── Responsive ──────────────────────────────── */
    @media (max-width: 768px) {
      .settings-layout { grid-template-columns: 1fr; }
      .settings-nav { flex-direction: row; flex-wrap: wrap; }
      .account-info { flex-direction: column; align-items: center; text-align: center; }
      .layout-options { flex-direction: column; }
    }
  `]
})
export class FeSettingsComponent {
  activeSection  = signal('appearance');
  selectedLayout = signal('sidebar');

  navSections = [
    { id: 'appearance',     icon: 'palette',             label: 'Giao diện' },
    { id: 'notifications',  icon: 'notifications_none',  label: 'Thông báo' },
    { id: 'account',        icon: 'manage_accounts',     label: 'Tài khoản' },
    { id: 'layout',         icon: 'view_sidebar',        label: 'Bố cục' },
  ];

  appearanceOptions = [
    { id: 'dark',    icon: 'dark_mode',       color: 'purple', label: 'Chế độ tối',    desc: 'Chuyển sang giao diện tối',            value: false },
    { id: 'compact', icon: 'density_small',   color: 'blue',   label: 'Chế độ compact', desc: 'Giảm khoảng cách giữa các phần tử',  value: false },
    { id: 'anim',    icon: 'animation',       color: 'green',  label: 'Hiệu ứng',       desc: 'Bật / tắt animation giao diện',       value: true  },
  ];

  notifOptions = [
    { id: 'email',   icon: 'email',           label: 'Email',             desc: 'Nhận thông báo qua email',          value: true  },
    { id: 'push',    icon: 'notification_add',label: 'Push notification', desc: 'Thông báo trình duyệt',             value: true  },
    { id: 'jira',    icon: 'task',            label: 'Jira mentions',     desc: 'Khi được đề cập trong Jira',        value: true  },
    { id: 'sprint',  icon: 'sprint',          label: 'Sprint events',     desc: 'Bắt đầu / kết thúc sprint',         value: false },
  ];

  layoutOptions = [
    { id: 'sidebar', label: 'Sidebar' },
    { id: 'header',  label: 'Header nav' },
  ];
}
