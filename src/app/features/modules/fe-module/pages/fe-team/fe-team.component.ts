import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-fe-team',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatIconModule
  ],
  template: `
    <div class="page-container">
      <h1 class="page-title">Team</h1>
      
      <mat-card>
        <mat-card-header>
          <mat-card-title>Team Members</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-list>
            @for (member of teamMembers; track member.id) {
              <mat-list-item>
                <mat-icon matListItemIcon>person</mat-icon>
                <h3 matListItemTitle>{{ member.name }}</h3>
                <p matListItemLine>{{ member.role }} - {{ member.email }}</p>
              </mat-list-item>
            }
          </mat-list>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px 0;
    }

    .page-title {
      font-size: 28px;
      font-weight: 300;
      margin-bottom: 24px;
      color: #333;
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
}
