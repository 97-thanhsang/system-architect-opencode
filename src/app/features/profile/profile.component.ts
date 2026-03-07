import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule
  ],
  template: `
    <div class="profile-container">
      <h1 class="page-title">User Profile</h1>
      
      <div class="profile-grid">
        <!-- Profile Info Card -->
        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar>account_circle</mat-icon>
            <mat-card-title>Profile Information</mat-card-title>
            <mat-card-subtitle>Update your personal details</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            @if (user(); as u) {
              <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="profile-form">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Display Name</mat-label>
                  <input matInput formControlName="displayName" placeholder="Your name">
                  <mat-icon matSuffix>person</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Email</mat-label>
                  <input matInput formControlName="email" type="email" placeholder="your@email.com">
                  <mat-icon matSuffix>email</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Current Role</mat-label>
                  <input matInput [value]="selectedRole() || 'Not selected'" disabled>
                  <mat-icon matSuffix>work</mat-icon>
                </mat-form-field>

                <div class="form-actions">
                  <button 
                    mat-raised-button 
                    color="primary"
                    type="submit"
                    [disabled]="profileForm.invalid || !profileForm.dirty">
                    <mat-icon>save</mat-icon>
                    Save Changes
                  </button>
                </div>
              </form>
            }
          </mat-card-content>
        </mat-card>

        <!-- Account Settings Card -->
        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar>settings</mat-icon>
            <mat-card-title>Account Settings</mat-card-title>
            <mat-card-subtitle>Manage your account</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="settings-list">
              <div class="setting-item">
                <div class="setting-info">
                  <h3>Jira Integration</h3>
                  <p>Connected to Jira account</p>
                </div>
                <button mat-stroked-button color="warn" (click)="disconnectJira()">
                  Disconnect
                </button>
              </div>

              <mat-divider></mat-divider>

              <div class="setting-item">
                <div class="setting-info">
                  <h3>Active Sessions</h3>
                  <p>1 active session</p>
                </div>
                <button mat-stroked-button (click)="viewSessions()">
                  View All
                </button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 24px 0;
    }

    .page-title {
      font-size: 28px;
      font-weight: 300;
      margin-bottom: 24px;
      color: #333;
    }

    .profile-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
    }

    mat-card {
      border-radius: 12px;
    }

    mat-card-header {
      margin-bottom: 16px;

      mat-icon[mat-card-avatar] {
        font-size: 40px;
        width: 40px;
        height: 40px;
        color: #1976d2;
      }
    }

    .profile-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      margin-top: 8px;
      
      button {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }

    .settings-list {
      .setting-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 0;

        .setting-info {
          h3 {
            font-size: 16px;
            font-weight: 500;
            margin: 0 0 4px 0;
          }

          p {
            font-size: 14px;
            color: #666;
            margin: 0;
          }
        }
      }
    }

    @media (max-width: 600px) {
      .profile-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProfileComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  user = this.authService.user;
  selectedRole = this.authService.selectedRole;

  profileForm: FormGroup = this.fb.group({
    displayName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]]
  });

  constructor() {
    // Initialize form with user data
    const user = this.user();
    if (user) {
      this.profileForm.patchValue({
        displayName: user.displayName,
        email: user.email
      });
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      console.log('Profile updated:', this.profileForm.value);
      // TODO: Call API to update profile
    }
  }

  disconnectJira(): void {
    if (confirm('Are you sure you want to disconnect your Jira account?')) {
      this.authService.logout();
    }
  }

  viewSessions(): void {
    console.log('View sessions clicked');
  }
}
