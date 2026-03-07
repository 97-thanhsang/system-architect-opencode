import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StatCard {
  label: string;
  value: number | string;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  trend: string;
  trendUp: boolean;
}

interface RecentItem {
  id: number;
  title: string;
  type: string;
  status: 'done' | 'progress' | 'todo';
  assignee: string;
  updated: string;
}

@Component({
  selector: 'app-fe-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="g-page animate-fade-in">

      <!-- Page header ─────────────────────────────── -->
      <div class="g-page__header">
        <div>
          <h1 class="g-page__title">Xin chào, SangNT 👋</h1>
          <p style="font-size:13px;color:#5f6368;margin-top:4px">
            Thứ Bảy, 07 tháng 3 năm 2026 · Workspace Frontend
          </p>
        </div>
        <div class="g-page__actions">
          <button class="g-btn g-btn--outlined">
            <span class="material-icons-outlined" style="font-size:18px">filter_list</span>
            Bộ lọc
          </button>
          <button class="g-btn g-btn--primary">
            <span class="material-icons-outlined" style="font-size:18px">add</span>
            Tạo issue
          </button>
        </div>
      </div>

      <!-- Stat cards ──────────────────────────────── -->
      <div class="g-grid g-grid--4" style="margin-bottom:28px">
        @for (card of statCards; track card.label) {
          <div class="g-stat-card">
            <div class="g-stat-card__icon g-stat-card__icon--{{ card.color }}">
              <span class="material-icons-outlined">{{ card.icon }}</span>
            </div>
            <div class="g-stat-card__info">
              <div class="g-stat-card__label">{{ card.label }}</div>
              <div class="g-stat-card__value">{{ card.value }}</div>
              <div class="g-stat-card__trend" [class.g-stat-card__trend--up]="card.trendUp"
                   [class.g-stat-card__trend--down]="!card.trendUp">
                <span class="material-icons" style="font-size:14px">
                  {{ card.trendUp ? 'trending_up' : 'trending_down' }}
                </span>
                <span>{{ card.trend }}</span>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Content grid ────────────────────────────── -->
      <div class="dash-grid">

        <!-- Recent activity ─ left col -->
        <div class="g-card">
          <div class="g-card__header">
            <span class="g-card__title">Hoạt động gần đây</span>
            <button class="g-btn g-btn--text" style="height:32px;padding:0 8px;font-size:13px">Xem tất cả</button>
          </div>
          <div style="padding:0">
            @for (item of recentItems; track item.id) {
              <div class="activity-row" [class.activity-row--last]="$last">
                <div class="activity-row__avatar" [style.background]="avatarColor(item.assignee)">
                  {{ item.assignee[0].toUpperCase() }}
                </div>
                <div class="activity-row__body">
                  <div class="activity-row__title">{{ item.title }}</div>
                  <div class="activity-row__meta">
                    <span class="g-chip g-chip--{{ statusColor(item.status) }}">{{ statusLabel(item.status) }}</span>
                    <span style="color:#80868b;font-size:12px">{{ item.updated }}</span>
                  </div>
                </div>
                <button class="g-btn g-btn--icon" style="color:#5f6368">
                  <span class="material-icons-outlined" style="font-size:18px">more_vert</span>
                </button>
              </div>
            }
          </div>
        </div>

        <!-- Right column -->
        <div class="dash-right-col">

          <!-- Sprint progress -->
          <div class="g-card">
            <div class="g-card__header">
              <span class="g-card__title">Sprint 24 — Progress</span>
              <span class="g-chip g-chip--blue">Active</span>
            </div>
            <div class="g-card__body">
              <div class="sprint-meta">
                <span style="font-size:13px;color:#5f6368">14 / 21 issues hoàn thành</span>
                <span style="font-size:13px;font-weight:600;color:#1a73e8">67%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-bar__fill" style="width:67%"></div>
              </div>
              <div class="sprint-stats">
                <div class="sprint-stat">
                  <div class="sprint-stat__value" style="color:#34a853">14</div>
                  <div class="sprint-stat__label">Done</div>
                </div>
                <div class="sprint-stat">
                  <div class="sprint-stat__value" style="color:#1a73e8">4</div>
                  <div class="sprint-stat__label">In Progress</div>
                </div>
                <div class="sprint-stat">
                  <div class="sprint-stat__value" style="color:#5f6368">3</div>
                  <div class="sprint-stat__label">Todo</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick links -->
          <div class="g-card">
            <div class="g-card__header">
              <span class="g-card__title">Truy cập nhanh</span>
            </div>
            <div class="g-card__body" style="padding:12px 16px">
              @for (link of quickLinks; track link.label) {
                <button class="quick-link">
                  <div class="quick-link__icon quick-link__icon--{{ link.color }}">
                    <span class="material-icons-outlined" style="font-size:18px">{{ link.icon }}</span>
                  </div>
                  <div class="quick-link__info">
                    <span class="quick-link__label">{{ link.label }}</span>
                    <span class="quick-link__desc">{{ link.desc }}</span>
                  </div>
                  <span class="material-icons-outlined" style="font-size:18px;color:#bdc1c6">chevron_right</span>
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ── Dashboard Grid ──────────────────────────── */
    .dash-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 24px;
      align-items: start;
    }

    .dash-right-col {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* ── Activity Row ────────────────────────────── */
    .activity-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 24px;
      border-bottom: 1px solid #f1f3f4;
      transition: background .15s;

      &:hover { background: #f8f9fa; }
      &--last { border-bottom: none; }
    }

    .activity-row__avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-family: 'Google Sans', sans-serif;
    }

    .activity-row__body {
      flex: 1;
      min-width: 0;
    }

    .activity-row__title {
      font-size: 14px;
      color: #202124;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-bottom: 4px;
    }

    .activity-row__meta {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* ── Sprint Progress ─────────────────────────── */
    .sprint-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .progress-bar {
      height: 8px;
      background: #f1f3f4;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 16px;
    }

    .progress-bar__fill {
      height: 100%;
      background: linear-gradient(90deg, #1a73e8, #4285f4);
      border-radius: 4px;
      transition: width .6s cubic-bezier(.4,0,.2,1);
    }

    .sprint-stats {
      display: flex;
      justify-content: space-around;
    }

    .sprint-stat {
      text-align: center;
    }

    .sprint-stat__value {
      font-size: 24px;
      font-weight: 300;
      font-family: 'Google Sans', sans-serif;
      line-height: 1;
      margin-bottom: 4px;
    }

    .sprint-stat__label {
      font-size: 11px;
      color: #80868b;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: .06em;
    }

    /* ── Quick Links ─────────────────────────────── */
    .quick-link {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 10px 8px;
      border: none;
      background: transparent;
      border-radius: 8px;
      cursor: pointer;
      text-align: left;
      transition: background .15s;
      font-family: inherit;

      &:hover { background: #f1f3f4; }
    }

    .quick-link__icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &--blue   { background: #e8f0fe; .material-icons-outlined { color: #1a73e8; } }
      &--green  { background: #e6f4ea; .material-icons-outlined { color: #34a853; } }
      &--yellow { background: #fef7e0; .material-icons-outlined { color: #f9ab00; } }
      &--purple { background: #f3e8fd; .material-icons-outlined { color: #9334e6; } }
    }

    .quick-link__info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .quick-link__label {
      font-size: 13px;
      font-weight: 500;
      color: #202124;
    }

    .quick-link__desc {
      font-size: 11px;
      color: #80868b;
    }

    /* ── Responsive ──────────────────────────────── */
    @media (max-width: 1200px) {
      .dash-grid { grid-template-columns: 1fr; }
      .dash-right-col { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    }

    @media (max-width: 768px) {
      .dash-right-col { grid-template-columns: 1fr; }
    }
  `]
})
export class FeDashboardComponent {
  statCards: StatCard[] = [
    { label: 'Components', value: 24,  icon: 'code',         color: 'blue',   trend: '+3 tuần này', trendUp: true  },
    { label: 'Open Issues', value: 7,   icon: 'bug_report',   color: 'red',    trend: '-2 so với tuần trước', trendUp: true },
    { label: 'Completed',   value: 156, icon: 'check_circle', color: 'green',  trend: '+12 tuần này', trendUp: true },
    { label: 'In Progress', value: 12,  icon: 'autorenew',    color: 'yellow', trend: 'Ổn định',     trendUp: true  },
  ];

  recentItems: RecentItem[] = [
    { id: 1, title: 'EMSPRO2-7234 — Thiết kế login Taiga UI', type: 'task', status: 'done',     assignee: 'Sang',  updated: '2 giờ trước' },
    { id: 2, title: 'EMSPRO2-7235 — Dynamic layout sidebar',   type: 'task', status: 'progress', assignee: 'Tuan',  updated: '5 giờ trước' },
    { id: 3, title: 'EMSPRO2-7230 — Fix API interceptor lỗi 401', type: 'bug', status: 'progress', assignee: 'Nam',   updated: 'Hôm qua'    },
    { id: 4, title: 'EMSPRO2-7228 — Tạo module quản lý nhân viên', type: 'story', status: 'todo', assignee: 'Linh',  updated: '2 ngày trước' },
    { id: 5, title: 'EMSPRO2-7221 — Cập nhật bảng phân quyền IAM', type: 'task', status: 'done', assignee: 'Sang',  updated: '3 ngày trước' },
  ];

  quickLinks = [
    { icon: 'task_alt',       color: 'blue',   label: 'My Tasks',      desc: '7 task đang mở' },
    { icon: 'account_tree',   color: 'green',  label: 'Active Sprint',  desc: 'Sprint 24 · 5 ngày còn lại' },
    { icon: 'folder_open',    color: 'yellow', label: 'Dự án',          desc: '3 dự án đang hoạt động' },
    { icon: 'groups',         color: 'purple', label: 'Team',           desc: '8 thành viên' },
  ];

  statusColor(s: string): string {
    return { done: 'green', progress: 'blue', todo: 'grey' }[s] ?? 'grey';
  }

  statusLabel(s: string): string {
    return { done: 'Hoàn thành', progress: 'Đang làm', todo: 'Chờ' }[s] ?? s;
  }

  avatarColor(name: string): string {
    const colors = ['#1a73e8','#34a853','#ea4335','#f9ab00','#9334e6','#0f9d58'];
    return colors[name.charCodeAt(0) % colors.length];
  }
}
