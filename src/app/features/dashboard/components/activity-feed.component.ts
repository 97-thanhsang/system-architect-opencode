import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

interface ActivityItem {
  id: string;
  type: 'task' | 'bug' | 'story' | 'comment' | 'merge';
  title: string;
  status: 'completed' | 'in-progress' | 'pending' | 'blocked';
  assignee: {
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  metadata?: {
    project?: string;
    priority?: 'high' | 'medium' | 'low';
  };
}

/**
 * Activity Feed Component
 * 
 * Displays a list of recent activities with status indicators.
 * Includes avatars, badges, and relative timestamps.
 * 
 * @example
 * <app-activity-feed
 *   title="Hoạt động gần đây"
 *   [activities]="recentActivities"
 *   [showViewAll]="true" />
 */
@Component({
  selector: 'app-activity-feed',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="activity-feed">
      <!-- Header -->
      <div class="activity-feed__header">
        <h3 class="activity-feed__title">{{ title() }}</h3>
        @if (showViewAll()) {
          <button class="activity-feed__view-all">Xem tất cả</button>
        }
      </div>

      <!-- List -->
      <div class="activity-feed__list">
        @for (item of activities(); track item.id) {
          <div class="activity-item" [class]="'activity-item--' + item.type">
            <!-- Avatar -->
            <div class="activity-item__avatar" [style.background-color]="avatarColor(item.assignee.name)">
              {{ initials(item.assignee.name) }}
            </div>

            <!-- Content -->
            <div class="activity-item__content">
              <div class="activity-item__title">{{ item.title }}</div>
              
              <div class="activity-item__meta">
                <!-- Type Badge -->
                <span class="activity-item__type" [class]="'activity-item__type--' + item.type">
                  {{ typeLabel(item.type) }}
                </span>
                
                <!-- Status -->
                <span class="activity-item__status" [class]="'activity-item__status--' + item.status">
                  <span class="activity-item__status-dot"></span>
                  {{ statusLabel(item.status) }}
                </span>

                <!-- Priority -->
                @if (item.metadata?.priority) {
                  <span class="activity-item__priority" [class]="'activity-item__priority--' + item.metadata!.priority">
                    {{ item.metadata!.priority }}
                  </span>
                }
              </div>
            </div>

            <!-- Timestamp -->
            <div class="activity-item__time">
              {{ formatTime(item.timestamp) }}
            </div>
          </div>
        }
      </div>

      <!-- Empty State -->
      @if (activities().length === 0) {
        <div class="activity-feed__empty">
          <span class="material-icons-outlined">inbox</span>
          <p>Chưa có hoạt động nào</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .activity-feed {
      background: var(--g-surface, #ffffff);
      border-radius: 16px;
      border: 1px solid var(--g-border, #e0e0e0);
      overflow: hidden;
    }

    .activity-feed__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 20px 16px;
      border-bottom: 1px solid var(--g-bg-dark, #f1f3f4);
    }

    .activity-feed__title {
      font-family: 'Google Sans', sans-serif;
      font-size: 16px;
      font-weight: 500;
      color: var(--g-text-primary, #202124);
    }

    .activity-feed__view-all {
      padding: 6px 12px;
      background: transparent;
      border: none;
      color: var(--g-blue, #1a73e8);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border-radius: 8px;
      transition: background 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background: var(--g-blue-light, #e8f0fe);
      }
    }

    .activity-feed__list {
      padding: 8px;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 12px;
      transition: background 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background: var(--g-bg, #f8f9fa);
      }
    }

    .activity-item__avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .activity-item__content {
      flex: 1;
      min-width: 0;
    }

    .activity-item__title {
      font-size: 14px;
      font-weight: 500;
      color: var(--g-text-primary, #202124);
      margin-bottom: 6px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .activity-item__meta {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .activity-item__type {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.025em;

      &--task { background: var(--g-blue-light, #e8f0fe); color: var(--g-blue, #1a73e8); }
      &--bug { background: var(--g-red-light, #fce8e6); color: var(--g-red, #ea4335); }
      &--story { background: var(--g-purple-light, #f3e8fd); color: var(--g-purple, #9334e6); }
      &--comment { background: var(--g-green-light, #e6f4ea); color: var(--g-green, #34a853); }
      &--merge { background: var(--g-yellow-light, #fef7e0); color: #b06000; }
    }

    .activity-item__status {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: var(--g-text-secondary, #5f6368);

      &--completed { --status-color: var(--g-green, #34a853); }
      &--in-progress { --status-color: var(--g-blue, #1a73e8); }
      &--pending { --status-color: #f9ab00; }
      &--blocked { --status-color: var(--g-red, #ea4335); }
    }

    .activity-item__status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--status-color);
    }

    .activity-item__priority {
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;

      &--high { background: var(--g-red-light, #fce8e6); color: var(--g-red, #ea4335); }
      &--medium { background: var(--g-yellow-light, #fef7e0); color: #b06000; }
      &--low { background: var(--g-blue-light, #e8f0fe); color: var(--g-blue, #1a73e8); }
    }

    .activity-item__time {
      font-size: 12px;
      color: var(--g-text-tertiary, #80868b);
      white-space: nowrap;
    }

    .activity-feed__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      color: var(--g-text-tertiary, #80868b);

      .material-icons-outlined {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      p {
        font-size: 14px;
      }
    }
  `]
})
export class ActivityFeedComponent {
  title = input<string>('Hoạt động gần đây');
  activities = input<ActivityItem[]>([]);
  showViewAll = input<boolean>(true);

  initials(name: string): string {
    return name?.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase() || '';
  }

  avatarColor(name: string): string {
    const colors = ['#1a73e8', '#34a853', '#ea4335', '#f9ab00', '#9334e6', '#0f9d58'];
    return colors[(name?.charCodeAt(0) || 0) % colors.length];
  }

  typeLabel(type: string): string {
    const labels: Record<string, string> = {
      task: 'Task',
      bug: 'Bug',
      story: 'Story',
      comment: 'Comment',
      merge: 'Merge'
    };
    return labels[type] || type;
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      completed: 'Hoàn thành',
      'in-progress': 'Đang làm',
      pending: 'Chờ xử lý',
      blocked: 'Bị chặn'
    };
    return labels[status] || status;
  }

  formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    
    return new Date(date).toLocaleDateString('vi-VN');
  }
}
