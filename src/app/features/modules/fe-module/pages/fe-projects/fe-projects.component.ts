import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fe-projects',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="g-page animate-fade-in">

      <!-- Header ──────────────────────────────────── -->
      <div class="g-page__header">
        <div>
          <h1 class="g-page__title">Dự án</h1>
          <p style="font-size:13px;color:#5f6368;margin-top:4px">{{ projects.length }} dự án đang hoạt động</p>
        </div>
        <div class="g-page__actions">
          <button class="g-btn g-btn--outlined">
            <span class="material-icons-outlined" style="font-size:18px">filter_list</span>
            Bộ lọc
          </button>
          <button class="g-btn g-btn--primary">
            <span class="material-icons-outlined" style="font-size:18px">add</span>
            Tạo dự án
          </button>
        </div>
      </div>

      <!-- Projects grid ───────────────────────────── -->
      <div class="g-grid g-grid--3">
        @for (project of projects; track project.id) {
          <div class="project-card">
            <!-- Card header -->
            <div class="project-card__header">
              <div class="project-card__icon" [style.background]="project.color + '1a'">
                <span class="material-icons-outlined" [style.color]="project.color" style="font-size:24px">{{ project.icon }}</span>
              </div>
              <div class="project-card__meta">
                <span class="project-card__key">{{ project.key }}</span>
                <span class="g-chip g-chip--{{ statusColor(project.status) }}">{{ project.status }}</span>
              </div>
            </div>

            <!-- Card body -->
            <h3 class="project-card__name">{{ project.name }}</h3>
            <p class="project-card__desc">{{ project.description }}</p>

            <!-- Stats -->
            <div class="project-card__stats">
              <div class="project-stat">
                <span class="material-icons-outlined" style="font-size:14px;color:#5f6368">task_alt</span>
                <span>{{ project.issues }} issues</span>
              </div>
              <div class="project-stat">
                <span class="material-icons-outlined" style="font-size:14px;color:#5f6368">groups</span>
                <span>{{ project.members }} thành viên</span>
              </div>
            </div>

            <!-- Progress -->
            <div class="project-card__progress">
              <div class="project-card__progress-bar">
                <div class="project-card__progress-fill" [style.width]="project.progress + '%'"
                     [style.background]="project.color"></div>
              </div>
              <span class="project-card__progress-pct">{{ project.progress }}%</span>
            </div>

            <!-- Footer -->
            <div class="project-card__footer">
              <div class="project-avatars">
                @for (m of project.memberAvatars; track m) {
                  <div class="g-avatar g-avatar--sm project-avatar" [style.background]="avatarColor(m)" [title]="m">
                    {{ m[0].toUpperCase() }}
                  </div>
                }
              </div>
              <button class="g-btn g-btn--text" style="font-size:13px;height:32px;padding:0 10px">
                Xem chi tiết
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    /* ── Project Card ────────────────────────────── */
    .project-card {
      background: #fff;
      border: 1px solid #e8eaed;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 1px 2px rgba(60,64,67,.2);
      transition: box-shadow .2s, transform .2s;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 0;

      &:hover {
        box-shadow: 0 2px 8px rgba(60,64,67,.25), 0 6px 20px rgba(60,64,67,.12);
        transform: translateY(-2px);
      }
    }

    .project-card__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .project-card__icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .project-card__meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }

    .project-card__key {
      font-size: 11px;
      font-weight: 600;
      color: #80868b;
      letter-spacing: .08em;
      text-transform: uppercase;
    }

    .project-card__name {
      font-size: 16px;
      font-weight: 500;
      color: #202124;
      margin-bottom: 8px;
    }

    .project-card__desc {
      font-size: 13px;
      color: #5f6368;
      line-height: 1.5;
      margin-bottom: 16px;
    }

    .project-card__stats {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .project-stat {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #5f6368;
    }

    .project-card__progress {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
    }

    .project-card__progress-bar {
      flex: 1;
      height: 6px;
      background: #f1f3f4;
      border-radius: 3px;
      overflow: hidden;
    }

    .project-card__progress-fill {
      height: 100%;
      border-radius: 3px;
      transition: width .5s cubic-bezier(.4,0,.2,1);
    }

    .project-card__progress-pct {
      font-size: 12px;
      font-weight: 600;
      color: #5f6368;
      flex-shrink: 0;
    }

    .project-card__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 12px;
      border-top: 1px solid #f1f3f4;
    }

    .project-avatars {
      display: flex;
    }

    .project-avatar {
      margin-left: -6px;
      border: 2px solid #fff;
      &:first-child { margin-left: 0; }
    }
  `]
})
export class FeProjectsComponent {
  projects = [
    {
      id: 1, name: 'System Architect Platform', key: 'SAP',
      description: 'Nền tảng quản lý kiến trúc hệ thống với OpenCode integration.',
      status: 'Đang làm', icon: 'architecture', color: '#1a73e8',
      issues: 47, members: 5, progress: 68,
      memberAvatars: ['Sang', 'Tuan', 'Nam']
    },
    {
      id: 2, name: 'Jira MCP Integration', key: 'JIRA',
      description: 'Tích hợp Jira MCP với OAuth và REST API cho workspace.',
      status: 'Đang làm', icon: 'integration_instructions', color: '#34a853',
      issues: 23, members: 3, progress: 45,
      memberAvatars: ['Sang', 'Linh']
    },
    {
      id: 3, name: 'EMS Finance Frontend', key: 'EMS',
      description: 'Giao diện quản lý tài chính với Angular 12 + Nx workspace.',
      status: 'Lập kế hoạch', icon: 'account_balance', color: '#9334e6',
      issues: 12, members: 4, progress: 20,
      memberAvatars: ['Sang', 'Tuan', 'Nam', 'Linh']
    },
  ];

  statusColor(s: string): string {
    if (s.includes('làm')) return 'blue';
    if (s.includes('kế hoạch')) return 'yellow';
    if (s.includes('Xong')) return 'green';
    return 'grey';
  }

  avatarColor(name: string): string {
    const colors = ['#1a73e8','#34a853','#ea4335','#f9ab00','#9334e6'];
    return colors[name.charCodeAt(0) % colors.length];
  }
}
