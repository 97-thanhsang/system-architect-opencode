import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fe-team',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="g-page">
      <div class="g-page__header">
        <h1 class="g-page__title">Team Members</h1>
        <div class="g-page__actions">
          <button class="g-btn g-btn--primary">
            <span class="material-icons-outlined">add</span>
            Add Member
          </button>
        </div>
      </div>
      
      <div class="g-card">
        <div class="g-card__header">
          <h2 class="g-card__title">All Members</h2>
        </div>
        <div class="team-list">
          @for (member of teamMembers; track member.id) {
            <div class="team-item">
              <div class="g-avatar" [style.background]="getAvatarColor(member.name)">
                {{ getInitials(member.name) }}
              </div>
              <div class="team-item__info">
                <div class="team-item__name">{{ member.name }}</div>
                <div class="team-item__email">{{ member.email }}</div>
              </div>
              <div class="team-item__role">
                <span class="g-chip">{{ member.role }}</span>
              </div>
              <div class="team-item__actions">
                <button class="icon-btn" title="More options">
                  <span class="material-icons-outlined">more_vert</span>
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .team-list {
      display: flex;
      flex-direction: column;
    }
    
    .team-item {
      display: flex;
      align-items: center;
      padding: 16px 24px;
      gap: 16px;
      border-bottom: 1px solid var(--g-divider);
      transition: background-color var(--g-transition);
    }
    
    .team-item:last-child {
      border-bottom: none;
    }
    
    .team-item:hover {
      background-color: var(--g-bg-hover, #f8f9fa);
    }
    
    .team-item__info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .team-item__name {
      font-size: 14px;
      font-weight: 500;
      color: var(--g-text-primary);
    }
    
    .team-item__email {
      font-size: 13px;
      color: var(--g-text-secondary);
    }
    
    .team-item__role {
      flex-shrink: 0;
      width: 160px;
    }
    
    .team-item__actions {
      flex-shrink: 0;
    }
    
    .icon-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background: transparent;
      color: var(--g-text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background-color var(--g-transition), color var(--g-transition);
    }
    
    .icon-btn:hover {
      background-color: var(--g-divider);
      color: var(--g-text-primary);
    }
  `]
})
export class FeTeamComponent {
  teamMembers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Frontend Developer' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Backend Developer' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'QA Engineer' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Business Analyst' }
  ];

  getInitials(name: string): string {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

  getAvatarColor(name: string): string {
    const colors = ['#1a73e8','#34a853','#ea4335','#f9ab00','#9334e6','#0f9d58'];
    const i = name.charCodeAt(0) % colors.length;
    return colors[i];
  }
}
