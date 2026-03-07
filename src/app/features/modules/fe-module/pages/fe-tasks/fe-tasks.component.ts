import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Task {
  id: number;
  key: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  status: 'done' | 'progress' | 'todo';
  type: 'bug' | 'task' | 'story';
  assignee: string;
  dueDate: string;
}

@Component({
  selector: 'app-fe-tasks',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="g-page animate-fade-in">

      <!-- Page header ─────────────────────────────── -->
      <div class="g-page__header">
        <div>
          <h1 class="g-page__title">My Tasks</h1>
          <p style="font-size:13px;color:#5f6368;margin-top:4px">{{ tasks.length }} issues được giao cho bạn</p>
        </div>
        <div class="g-page__actions">
          <div class="tasks-filter-group">
            @for (f of filters; track f.id) {
              <button
                class="tasks-filter-btn"
                [class.tasks-filter-btn--active]="activeFilter() === f.id"
                (click)="activeFilter.set(f.id)">
                {{ f.label }}
                <span class="tasks-filter-count">{{ f.count }}</span>
              </button>
            }
          </div>
          <button class="g-btn g-btn--primary">
            <span class="material-icons-outlined" style="font-size:18px">add</span>
            Tạo task
          </button>
        </div>
      </div>

      <!-- Task list ───────────────────────────────── -->
      <div class="g-card">
        <div class="g-card__header">
          <span class="g-card__title">Danh sách công việc</span>
          <div style="display:flex;gap:8px">
            <button class="g-btn g-btn--icon">
              <span class="material-icons-outlined" style="font-size:18px">filter_list</span>
            </button>
            <button class="g-btn g-btn--icon">
              <span class="material-icons-outlined" style="font-size:18px">sort</span>
            </button>
          </div>
        </div>

        <!-- Table header -->
        <div class="task-table-head">
          <div class="task-table-head__type"></div>
          <div class="task-table-head__key">Key</div>
          <div class="task-table-head__title">Tiêu đề</div>
          <div class="task-table-head__priority">Ưu tiên</div>
          <div class="task-table-head__status">Trạng thái</div>
          <div class="task-table-head__assignee">Assignee</div>
          <div class="task-table-head__due">Hạn chót</div>
          <div class="task-table-head__actions"></div>
        </div>

        <!-- Table rows -->
        @for (task of filteredTasks(); track task.id) {
          <div class="task-row" [class.task-row--done]="task.status === 'done'">
            <!-- Type icon -->
            <div class="task-row__type">
              <span class="material-icons task-type-icon task-type-icon--{{ task.type }}" style="font-size:16px">
                {{ typeIcon(task.type) }}
              </span>
            </div>

            <!-- Key -->
            <div class="task-row__key">{{ task.key }}</div>

            <!-- Title -->
            <div class="task-row__title">
              <span class="task-row__title-text">{{ task.title }}</span>
            </div>

            <!-- Priority -->
            <div class="task-row__priority">
              <span class="priority-dot priority-dot--{{ task.priority }}"
                    [title]="task.priority">
                <span class="material-icons-outlined" style="font-size:14px">
                  {{ priorityIcon(task.priority) }}
                </span>
              </span>
            </div>

            <!-- Status -->
            <div class="task-row__status">
              <span class="g-chip g-chip--{{ statusColor(task.status) }}">
                {{ statusLabel(task.status) }}
              </span>
            </div>

            <!-- Assignee -->
            <div class="task-row__assignee">
              <div class="g-avatar g-avatar--sm" [style.background]="avatarColor(task.assignee)"
                   [title]="task.assignee">
                {{ task.assignee[0].toUpperCase() }}
              </div>
            </div>

            <!-- Due date -->
            <div class="task-row__due">{{ task.dueDate }}</div>

            <!-- Actions -->
            <div class="task-row__actions">
              <button class="g-btn g-btn--icon">
                <span class="material-icons-outlined" style="font-size:16px">more_horiz</span>
              </button>
            </div>
          </div>
        }

        @if (filteredTasks().length === 0) {
          <div style="padding:48px;text-align:center;color:#80868b">
            <span class="material-icons-outlined" style="font-size:48px;display:block;margin-bottom:12px;color:#dadce0">
              task_alt
            </span>
            <p style="font-size:14px">Không có task nào</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    /* ── Filters ─────────────────────────────────── */
    .tasks-filter-group {
      display: flex;
      background: #f1f3f4;
      border-radius: 8px;
      padding: 3px;
      gap: 2px;
    }

    .tasks-filter-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      height: 30px;
      padding: 0 12px;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      color: #5f6368;
      background: transparent;
      cursor: pointer;
      transition: background .15s, color .15s;
      font-family: inherit;

      &:hover { background: #e8eaed; color: #202124; }

      &--active {
        background: #fff;
        color: #1a73e8;
        box-shadow: 0 1px 2px rgba(60,64,67,.2);
      }
    }

    .tasks-filter-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      background: #e8eaed;
      border-radius: 9px;
      font-size: 11px;
      font-weight: 600;
    }

    .tasks-filter-btn--active .tasks-filter-count {
      background: #e8f0fe;
      color: #1a73e8;
    }

    /* ── Table header ─────────────────────────────── */
    .task-table-head {
      display: grid;
      grid-template-columns: 32px 100px 1fr 80px 120px 60px 100px 40px;
      gap: 8px;
      padding: 10px 20px;
      background: #f8f9fa;
      border-bottom: 1px solid #e8eaed;
      font-size: 11px;
      font-weight: 600;
      color: #80868b;
      text-transform: uppercase;
      letter-spacing: .07em;
    }

    /* ── Task Row ─────────────────────────────────── */
    .task-row {
      display: grid;
      grid-template-columns: 32px 100px 1fr 80px 120px 60px 100px 40px;
      gap: 8px;
      align-items: center;
      padding: 12px 20px;
      border-bottom: 1px solid #f1f3f4;
      transition: background .15s;
      cursor: pointer;

      &:last-child { border-bottom: none; }
      &:hover { background: #f8f9fa; }

      &--done {
        opacity: .6;

        .task-row__title-text {
          text-decoration: line-through;
          color: #80868b;
        }
      }
    }

    .task-row__type { display: flex; justify-content: center; }

    .task-type-icon {
      &--task    { color: #1a73e8; }
      &--bug     { color: #ea4335; }
      &--story   { color: #34a853; }
    }

    .task-row__key {
      font-size: 12px;
      font-weight: 500;
      color: #1a73e8;
      white-space: nowrap;
    }

    .task-row__title { min-width: 0; }

    .task-row__title-text {
      font-size: 14px;
      color: #202124;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: block;
    }

    .task-row__priority { display: flex; align-items: center; }

    .priority-dot {
      display: flex;
      align-items: center;
      justify-content: center;

      &--high    .material-icons-outlined { color: #ea4335; }
      &--medium  .material-icons-outlined { color: #f9ab00; }
      &--low     .material-icons-outlined { color: #5f6368; }
    }

    .task-row__status { display: flex; align-items: center; }
    .task-row__assignee { display: flex; align-items: center; }

    .task-row__due {
      font-size: 12px;
      color: #5f6368;
      white-space: nowrap;
    }

    .task-row__actions {
      display: flex;
      justify-content: center;
      opacity: 0;
      transition: opacity .15s;
    }

    .task-row:hover .task-row__actions { opacity: 1; }

    /* ── Responsive ──────────────────────────────── */
    @media (max-width: 900px) {
      .task-table-head,
      .task-row {
        grid-template-columns: 32px 80px 1fr 100px 40px;
      }
      .task-table-head__priority,
      .task-table-head__assignee,
      .task-table-head__due,
      .task-row__priority,
      .task-row__assignee,
      .task-row__due {
        display: none;
      }
    }
  `]
})
export class FeTasksComponent {
  tasks: Task[] = [
    { id: 1, key: 'EMSPRO2-7234', title: 'Thiết kế lại toàn bộ UI với Taiga UI + Google style',    priority: 'high',   status: 'progress', type: 'task',  assignee: 'SangNT', dueDate: '10/03' },
    { id: 2, key: 'EMSPRO2-7235', title: 'Setup Dynamic Layout (sidebar / header toggle)',           priority: 'medium', status: 'progress', type: 'task',  assignee: 'SangNT', dueDate: '08/03' },
    { id: 3, key: 'EMSPRO2-7230', title: 'Fix lỗi 401 trong JWT interceptor',                        priority: 'high',   status: 'todo',     type: 'bug',   assignee: 'SangNT', dueDate: '09/03' },
    { id: 4, key: 'EMSPRO2-7228', title: 'Tích hợp Jira MCP với trang My Tasks',                    priority: 'medium', status: 'todo',     type: 'story', assignee: 'SangNT', dueDate: '12/03' },
    { id: 5, key: 'EMSPRO2-7221', title: 'Cập nhật bảng phân quyền IAM v3.1',                       priority: 'low',    status: 'done',     type: 'task',  assignee: 'SangNT', dueDate: '05/03' },
    { id: 6, key: 'EMSPRO2-7220', title: 'Viết unit test cho JiraAuthService',                      priority: 'medium', status: 'done',     type: 'task',  assignee: 'SangNT', dueDate: '04/03' },
  ];

  filters = [
    { id: 'all',      label: 'Tất cả',      count: this.tasks.length },
    { id: 'todo',     label: 'Chờ',         count: this.tasks.filter(t => t.status === 'todo').length },
    { id: 'progress', label: 'Đang làm',    count: this.tasks.filter(t => t.status === 'progress').length },
    { id: 'done',     label: 'Hoàn thành',  count: this.tasks.filter(t => t.status === 'done').length },
  ];

  activeFilter = signal<string>('all');

  filteredTasks() {
    const f = this.activeFilter();
    return f === 'all' ? this.tasks : this.tasks.filter(t => t.status === f);
  }

  typeIcon(t: string): string {
    return { task: 'check_box_outline_blank', bug: 'bug_report', story: 'auto_stories' }[t] ?? 'task_alt';
  }

  priorityIcon(p: string): string {
    return { high: 'keyboard_double_arrow_up', medium: 'drag_handle', low: 'keyboard_double_arrow_down' }[p] ?? 'drag_handle';
  }

  statusColor(s: string): string {
    return { done: 'green', progress: 'blue', todo: 'grey' }[s] ?? 'grey';
  }

  statusLabel(s: string): string {
    return { done: 'Hoàn thành', progress: 'Đang làm', todo: 'Chờ' }[s] ?? s;
  }

  avatarColor(name: string): string {
    const colors = ['#1a73e8','#34a853','#ea4335','#f9ab00','#9334e6'];
    return colors[name.charCodeAt(0) % colors.length];
  }
}
