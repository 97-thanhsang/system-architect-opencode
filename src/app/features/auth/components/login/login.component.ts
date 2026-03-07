import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  TuiButtonModule, 
  TuiSvgModule,
  TuiTextfieldControllerModule,
  TuiErrorModule
} from '@taiga-ui/core';
import { 
  TuiInputModule, 
  TuiInputPasswordModule,
  TuiIslandModule
} from '@taiga-ui/kit';
import { JiraAuthService } from '../../../../core/auth/jira-auth.service';
import { TokenStorageService } from '../../../../core/auth/token-storage.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TuiIslandModule,
    TuiButtonModule,
    TuiSvgModule,
    TuiInputModule,
    TuiInputPasswordModule,
    TuiTextfieldControllerModule,
    TuiErrorModule
  ],
  template: `
    <div class="login-container">
      <tui-island class="login-card">
        <!-- Header -->
        <div class="login-header">
          <h1 class="tui-text_h4">Welcome to System Architect</h1>
          <p class="tui-text_body-m">Sign in with your Jira account</p>
        </div>
        
        <!-- Content -->
        <div class="login-content">
          <!-- Logo -->
          <div class="logo-container">
            <tui-svg src="tuiIconArchitectureLarge" class="app-logo"></tui-svg>
          </div>
          
          <!-- Error Message -->
          @if (jiraAuth.error()) {
            <div class="error-message">
              <tui-svg src="tuiIconError" class="error-icon"></tui-svg>
              <span>{{ jiraAuth.error() }}</span>
            </div>
          }
          
          <!-- Login Form -->
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <div class="form-field">
              <tui-input
                formControlName="username"
                tuiTextfieldIconLeft="tuiIconUser"
                tuiTextfieldSize="l"
                [tuiTextfieldLabelOutside]="true">
                Username
                <input
                  tuiTextfield
                  type="text"
                  placeholder="Enter your Jira username"
                  autocomplete="username" />
              </tui-input>
              @if (loginForm.get('username')?.touched && loginForm.get('username')?.hasError('required')) {
                <tui-error error="Username is required"></tui-error>
              }
            </div>
            
            <div class="form-field">
              <tui-input-password
                formControlName="password"
                tuiTextfieldIconLeft="tuiIconLock"
                tuiTextfieldSize="l"
                [tuiTextfieldLabelOutside]="true">
                Password
                <input
                  tuiTextfield
                  placeholder="Enter your password"
                  autocomplete="current-password" />
              </tui-input-password>
              @if (loginForm.get('password')?.touched && loginForm.get('password')?.hasError('required')) {
                <tui-error error="Password is required"></tui-error>
              }
            </div>
            
            <div class="form-field">
              <tui-input
                formControlName="jiraUrl"
                tuiTextfieldIconLeft="tuiIconLink"
                tuiTextfieldSize="l"
                [tuiTextfieldLabelOutside]="true">
                Jira URL
                <input
                  tuiTextfield
                  type="text"
                  placeholder="https://your-domain.atlassian.net" />
              </tui-input>
            </div>
          </form>
          
          <p class="description tui-text_body-s">
            Access your workspace, manage Jira tasks, and collaborate with your team.
          </p>
        </div>
        
        <!-- Actions -->
        <div class="login-actions">
          <button
            tuiButton
            type="submit"
            size="l"
            appearance="primary"
            class="login-button"
            [disabled]="loginForm.invalid || jiraAuth.loading()"
            [showLoader]="jiraAuth.loading()"
            (click)="onSubmit()">
            <tui-svg src="tuiIconLogin" class="button-icon"></tui-svg>
            <span>Sign In</span>
          </button>
        </div>
        
        <!-- Footer -->
        <div class="login-footer">
          <tui-svg src="tuiIconLock" class="footer-icon"></tui-svg>
          <span class="tui-text_body-s">Secure Jira authentication</span>
        </div>
      </tui-island>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #526ed3 0%, #314692 100%);
      padding: 20px;
    }

    .login-card {
      max-width: 450px;
      width: 100%;
      text-align: center;
      padding: 40px 32px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }

    .login-header {
      margin-bottom: 24px;

      h1 {
        margin-bottom: 8px;
        color: var(--tui-text-01);
      }

      p {
        color: var(--tui-text-02);
      }
    }

    .login-content {
      padding: 20px 0;
    }

    .logo-container {
      margin-bottom: 24px;
    }

    .app-logo {
      width: 64px;
      height: 64px;
      color: var(--tui-primary);
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin: 20px 0;
      text-align: left;
    }

    .form-field {
      width: 100%;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--tui-error-bg);
      color: var(--tui-error-fill);
      padding: 12px 16px;
      border-radius: var(--tui-radius-m);
      margin-bottom: 16px;
      font-size: 14px;

      .error-icon {
        width: 20px;
        height: 20px;
      }
    }

    .description {
      color: var(--tui-text-02);
      line-height: 1.6;
      margin-top: 16px;
    }

    .login-actions {
      margin: 24px 0;
    }

    .login-button {
      width: 100%;
      
      .button-icon {
        margin-right: 8px;
      }
    }

    .login-footer {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding-top: 16px;
      border-top: 1px solid var(--tui-base-03);
      color: var(--tui-text-02);

      .footer-icon {
        width: 16px;
        height: 16px;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private tokenStorage = inject(TokenStorageService);
  
  // Make jiraAuth public so template can access it
  jiraAuth = inject(JiraAuthService);

  loginForm: FormGroup;

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      jiraUrl: ['https://task.ascvn.com.vn']
    });
  }

  /**
   * Check if user is already authenticated on component initialization
   * Redirects to dashboard if already logged in
   */
  ngOnInit(): void {
    console.log('[LoginComponent] Initializing login page...');

    // Check authentication status from both services
    const isJiraAuth = this.jiraAuth.isAuthenticated();
    const isTokenStorageAuth = this.tokenStorage.isAuthenticated();

    console.log('[LoginComponent] JiraAuthService.isAuthenticated():', isJiraAuth);
    console.log('[LoginComponent] TokenStorageService.isAuthenticated():', isTokenStorageAuth);

    // If user is already authenticated, redirect to dashboard
    if (isJiraAuth || isTokenStorageAuth) {
      console.log('[LoginComponent] ⚠️ User is already authenticated, redirecting to /module/fe');
      this.router.navigate(['/module/fe']);
      return;
    }

    console.log('[LoginComponent] ✅ User not authenticated, showing login form');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    const credentials = this.loginForm.value;
    
    this.jiraAuth.login(credentials).subscribe(success => {
      if (success) {
        this.router.navigate(['/dashboard']);
      }
    });
  }
}
