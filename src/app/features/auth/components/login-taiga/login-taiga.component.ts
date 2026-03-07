import { Component, inject, signal, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { JiraAuthService } from '../../../../core/auth/jira-auth.service';
import { TokenStorageService } from '../../../../core/auth/token-storage.service';

@Component({
  selector: 'app-login-taiga',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">

      <!-- ══ LEFT — Brand panel ══════════════════════════════ -->
      <aside class="brand">
        <!-- animated grid bg -->
        <div class="brand__grid" aria-hidden="true"></div>

        <div class="brand__body">
          <!-- Logo mark -->
          <div class="brand__mark">
            <div class="brand__mark-ring brand__mark-ring--outer"></div>
            <div class="brand__mark-ring brand__mark-ring--inner"></div>
            <span class="material-icons brand__mark-icon">architecture</span>
          </div>

          <h1 class="brand__title">System<br>Architect</h1>
          <p class="brand__tagline">Workspace powered by OpenCode</p>

          <ul class="brand__feats">
            <li class="brand__feat">
              <div class="brand__feat-icon">
                <span class="material-icons-outlined">bolt</span>
              </div>
              <div>
                <strong>Real-time Jira sync</strong>
                <span>Tasks, sprints &amp; issues tức thì</span>
              </div>
            </li>
            <li class="brand__feat">
              <div class="brand__feat-icon">
                <span class="material-icons-outlined">manage_accounts</span>
              </div>
              <div>
                <strong>Role-based workspace</strong>
                <span>Dashboard tùy chỉnh theo vai trò</span>
              </div>
            </li>
            <li class="brand__feat">
              <div class="brand__feat-icon">
                <span class="material-icons-outlined">hub</span>
              </div>
              <div>
                <strong>AI-powered assistant</strong>
                <span>OpenCode agent hỗ trợ 24/7</span>
              </div>
            </li>
          </ul>
        </div>

        <!-- trust badges -->
        <div class="brand__trust">
          <div class="trust-badge">
            <span class="material-icons-outlined" style="font-size:14px">verified_user</span>
            <span>Bảo mật</span>
          </div>
          <div class="trust-badge">
            <span class="material-icons-outlined" style="font-size:14px">speed</span>
            <span>Hiệu suất cao</span>
          </div>
          <div class="trust-badge">
            <span class="material-icons-outlined" style="font-size:14px">cloud</span>
            <span>Cloud-native</span>
          </div>
        </div>
      </aside>

      <!-- ══ RIGHT — Form panel ═══════════════════════════════ -->
      <main class="form-panel">

        <!-- top bar -->
        <div class="form-panel__topbar">
          <div class="topbar-logo">
            <span class="material-icons-outlined" style="font-size:20px;color:#1a73e8">architecture</span>
            <span class="topbar-logo__text">System Architect</span>
          </div>
          <div class="topbar-meta">
            <span class="material-icons-outlined" style="font-size:16px;color:#80868b">language</span>
            <span style="font-size:13px;color:#5f6368">Tiếng Việt</span>
          </div>
        </div>

        <!-- card -->
        <div class="card" [class.card--shake]="shake()">

          <!-- card inner scroll -->
          <div class="card__inner">

            <!-- heading -->
            <div class="card__head">
              <div class="card__avatar">
                <span class="material-icons-outlined" style="font-size:28px;color:#1a73e8">account_circle</span>
              </div>
              <h2 class="card__title">Đăng nhập</h2>
              <p class="card__sub">
                Dùng tài khoản <span class="card__sub-hl">Jira</span> của bạn
              </p>
            </div>

            <!-- error banner -->
            @if (errorMsg()) {
              <div class="alert alert--error" role="alert">
                <span class="material-icons" style="font-size:18px;flex-shrink:0">error_outline</span>
                <span>{{ errorMsg() }}</span>
                <button class="alert__close" (click)="errorMsg.set('')" aria-label="Đóng">
                  <span class="material-icons" style="font-size:16px">close</span>
                </button>
              </div>
            }

            <!-- success banner -->
            @if (successMsg()) {
              <div class="alert alert--success" role="status">
                <span class="material-icons" style="font-size:18px;flex-shrink:0">check_circle_outline</span>
                <span>{{ successMsg() }}</span>
              </div>
            }

            <!-- form -->
            <form class="form" (ngSubmit)="doLogin()" novalidate>

              <!-- Jira URL (collapsible) -->
              <div class="form__group">
                <button
                  type="button"
                  class="form__url-toggle"
                  (click)="showUrl = !showUrl">
                  <span class="material-icons-outlined" style="font-size:16px">link</span>
                  <span>{{ jiraUrl || 'https://task.ascvn.com.vn' }}</span>
                  <span class="material-icons" style="font-size:16px;margin-left:auto;transition:transform .2s"
                        [style.transform]="showUrl ? 'rotate(180deg)' : 'rotate(0)'">
                    expand_more
                  </span>
                </button>

                @if (showUrl) {
                  <div class="field" style="margin-top:8px">
                    <label class="field__label" for="jiraUrl">Jira URL</label>
                    <div class="field__wrap" [class.field__wrap--focus]="focusUrl">
                      <span class="material-icons-outlined field__icon">public</span>
                      <input
                        id="jiraUrl"
                        class="field__input"
                        type="url"
                        placeholder="https://your-domain.atlassian.net"
                        [(ngModel)]="jiraUrl"
                        name="jiraUrl"
                        (focus)="focusUrl=true"
                        (blur)="focusUrl=false" />
                    </div>
                  </div>
                }
              </div>

              <!-- Username -->
              <div class="field" [class.field--error]="touchedUser && !username.trim()">
                <label class="field__label" for="username">
                  Tên đăng nhập
                  <span class="field__required" aria-hidden="true">*</span>
                </label>
                <div class="field__wrap" [class.field__wrap--focus]="focusUser">
                  <span class="material-icons-outlined field__icon">person_outline</span>
                  <input
                    #usernameInput
                    id="username"
                    class="field__input"
                    type="text"
                    placeholder="Nhập username Jira"
                    [(ngModel)]="username"
                    name="username"
                    autocomplete="username"
                    (focus)="focusUser=true"
                    (blur)="focusUser=false; touchedUser=true"
                    (keyup.enter)="passwordInput.focus()" />
                  @if (username.trim()) {
                    <span class="material-icons-outlined field__ok" style="color:#34a853">check</span>
                  }
                </div>
                @if (touchedUser && !username.trim()) {
                  <p class="field__err">
                    <span class="material-icons" style="font-size:13px">info</span>
                    Tên đăng nhập không được để trống
                  </p>
                }
              </div>

              <!-- Password -->
              <div class="field" [class.field--error]="touchedPass && !password.trim()">
                <div class="field__label-row">
                  <label class="field__label" for="password">
                    Mật khẩu
                    <span class="field__required" aria-hidden="true">*</span>
                  </label>
                  <button type="button" class="field__forgot" tabindex="-1">
                    Quên mật khẩu?
                  </button>
                </div>
                <div class="field__wrap" [class.field__wrap--focus]="focusPass">
                  <span class="material-icons-outlined field__icon">lock_outline</span>
                  <input
                    #passwordInput
                    id="password"
                    class="field__input"
                    [type]="showPass ? 'text' : 'password'"
                    placeholder="••••••••••••"
                    [(ngModel)]="password"
                    name="password"
                    autocomplete="current-password"
                    (focus)="focusPass=true"
                    (blur)="focusPass=false; touchedPass=true"
                    (keyup.enter)="doLogin()" />
                  <button
                    type="button"
                    class="field__eye"
                    (click)="showPass = !showPass"
                    [title]="showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
                    tabindex="-1">
                    <span class="material-icons-outlined" style="font-size:18px">
                      {{ showPass ? 'visibility_off' : 'visibility' }}
                    </span>
                  </button>
                </div>
                @if (touchedPass && !password.trim()) {
                  <p class="field__err">
                    <span class="material-icons" style="font-size:13px">info</span>
                    Mật khẩu không được để trống
                  </p>
                }
              </div>

              <!-- Remember -->
              <label class="remember">
                <input type="checkbox" [(ngModel)]="remember" name="remember" class="remember__check">
                <span class="remember__box">
                  @if (remember) {
                    <span class="material-icons" style="font-size:13px;color:#fff">check</span>
                  }
                </span>
                <span class="remember__label">Ghi nhớ đăng nhập</span>
              </label>

              <!-- Submit -->
              <button
                type="submit"
                class="btn-submit"
                [class.btn-submit--loading]="loading()"
                [disabled]="loading()">
                @if (loading()) {
                  <span class="spinner"></span>
                  <span>Đang xác thực…</span>
                } @else {
                  <span class="material-icons-outlined" style="font-size:20px">login</span>
                  <span>Đăng nhập</span>
                }
              </button>
            </form>

            <!-- divider -->
            <div class="divider">
              <span class="divider__text">hoặc tiếp tục với</span>
            </div>

            <!-- guest -->
            <button type="button" class="btn-guest" (click)="continueAsGuest()">
              <span class="material-icons-outlined" style="font-size:18px;color:#5f6368">person_off</span>
              <span>Dùng thử không cần đăng nhập</span>
            </button>
          </div>

          <!-- card footer -->
          <div class="card__footer">
            <span class="material-icons-outlined" style="font-size:14px">lock</span>
            <span>Kết nối an toàn · Jira REST API v2</span>
          </div>
        </div>

        <!-- page footer -->
        <footer class="page-footer">
          <span>© 2026 System Architect OpenCode</span>
          <span class="sep">·</span>
          <a href="#" class="footer-link">Điều khoản</a>
          <span class="sep">·</span>
          <a href="#" class="footer-link">Quyền riêng tư</a>
        </footer>
      </main>
    </div>
  `,
  styles: [`
    /* ──────────────────────────────────────────────
       PAGE SHELL
    ────────────────────────────────────────────── */
    .page {
      display: flex;
      min-height: 100vh;
      background: #fff;
    }

    /* ──────────────────────────────────────────────
       LEFT BRAND PANEL
    ────────────────────────────────────────────── */
    .brand {
      flex: 0 0 460px;
      background: linear-gradient(160deg, #0d47a1 0%, #1565c0 35%, #1a73e8 70%, #4285f4 100%);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 48px 48px 36px;
      position: relative;
      overflow: hidden;
    }

    /* animated dot-grid */
    .brand__grid {
      position: absolute;
      inset: 0;
      background-image:
        radial-gradient(circle, rgba(255,255,255,.14) 1px, transparent 1px);
      background-size: 28px 28px;
      mask-image: radial-gradient(ellipse 100% 100% at 50% 50%, black 30%, transparent 100%);
    }

    .brand__body {
      position: relative;
      z-index: 1;
    }

    /* logo mark */
    .brand__mark {
      position: relative;
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 32px;
    }

    .brand__mark-ring {
      position: absolute;
      border-radius: 50%;
      border: 1.5px solid rgba(255,255,255,.25);
      animation: pulse-ring 3s ease-in-out infinite;
    }

    .brand__mark-ring--outer {
      inset: 0;
      animation-delay: 0s;
    }

    .brand__mark-ring--inner {
      inset: 10px;
      animation-delay: .5s;
    }

    @keyframes pulse-ring {
      0%, 100% { opacity: .25; transform: scale(1); }
      50%       { opacity: .6;  transform: scale(1.04); }
    }

    .brand__mark-icon {
      font-size: 40px !important;
      color: #fff;
      position: relative;
      z-index: 1;
      text-shadow: 0 2px 12px rgba(0,0,0,.2);
    }

    .brand__title {
      font-family: 'Google Sans', sans-serif;
      font-size: 40px;
      font-weight: 700;
      color: #fff;
      line-height: 1.15;
      letter-spacing: -.5px;
      margin: 0 0 12px;
    }

    .brand__tagline {
      font-size: 15px;
      color: rgba(255,255,255,.72);
      margin: 0 0 44px;
    }

    .brand__feats {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 22px;
    }

    .brand__feat {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      color: rgba(255,255,255,.9);
      font-size: 13.5px;
      line-height: 1.45;
    }

    .brand__feat-icon {
      width: 38px;
      height: 38px;
      background: rgba(255,255,255,.15);
      border: 1px solid rgba(255,255,255,.2);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      backdrop-filter: blur(4px);

      .material-icons-outlined { font-size: 20px !important; color: #fff; }
    }

    .brand__feat strong {
      display: block;
      font-weight: 600;
      color: #fff;
      margin-bottom: 2px;
    }

    /* trust badges */
    .brand__trust {
      position: relative;
      z-index: 1;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .trust-badge {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 5px 10px;
      background: rgba(255,255,255,.12);
      border: 1px solid rgba(255,255,255,.2);
      border-radius: 20px;
      font-size: 11px;
      font-weight: 500;
      color: rgba(255,255,255,.85);
      backdrop-filter: blur(4px);
    }

    /* ──────────────────────────────────────────────
       RIGHT FORM PANEL
    ────────────────────────────────────────────── */
    .form-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      background: #f8f9fa;
      padding: 0 24px 32px;
      min-height: 100vh;
    }

    .form-panel__topbar {
      width: 100%;
      max-width: 460px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 0;
    }

    .topbar-logo {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .topbar-logo__text {
      font-family: 'Google Sans', sans-serif;
      font-size: 15px;
      font-weight: 500;
      color: #3c4043;
    }

    .topbar-meta {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    /* ──────────────────────────────────────────────
       CARD
    ────────────────────────────────────────────── */
    .card {
      background: #fff;
      border-radius: 20px;
      width: 100%;
      max-width: 460px;
      box-shadow:
        0 1px 3px rgba(60,64,67,.12),
        0 4px 16px rgba(60,64,67,.12),
        0 8px 32px rgba(60,64,67,.08);
      overflow: hidden;
      border: 1px solid #e8eaed;

      &--shake {
        animation: shake .45s cubic-bezier(.36,.07,.19,.97);
      }
    }

    @keyframes shake {
      0%,100% { transform: translateX(0); }
      15%      { transform: translateX(-6px); }
      30%      { transform: translateX(6px); }
      45%      { transform: translateX(-4px); }
      60%      { transform: translateX(4px); }
      75%      { transform: translateX(-2px); }
    }

    .card__inner {
      padding: 36px 36px 28px;
    }

    /* ── Card heading ───────────────────────────── */
    .card__head {
      text-align: center;
      margin-bottom: 28px;
    }

    .card__avatar {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #e8f0fe, #c5d8fc);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 18px;
      box-shadow: 0 2px 8px rgba(26,115,232,.2);
    }

    .card__title {
      font-family: 'Google Sans', sans-serif;
      font-size: 26px;
      font-weight: 400;
      color: #202124;
      margin: 0 0 8px;
      letter-spacing: -.2px;
    }

    .card__sub {
      font-size: 14px;
      color: #5f6368;
    }

    .card__sub-hl {
      color: #1a73e8;
      font-weight: 500;
    }

    /* ── Alert ─────────────────────────────────── */
    .alert {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px 14px;
      border-radius: 10px;
      font-size: 13px;
      margin-bottom: 20px;
      line-height: 1.5;
      animation: fadeIn .2s ease;
    }

    @keyframes fadeIn {
      from { opacity:0; transform:translateY(-6px); }
      to   { opacity:1; transform:translateY(0); }
    }

    .alert--error {
      background: #fce8e6;
      color: #c5221f;
      border: 1px solid #f5c6c2;
    }

    .alert--success {
      background: #e6f4ea;
      color: #1e7e34;
      border: 1px solid #c3e6cb;
    }

    .alert__close {
      margin-left: auto;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      color: inherit;
      opacity: .7;
      flex-shrink: 0;
      &:hover { opacity: 1; }
    }

    /* ── Form ──────────────────────────────────── */
    .form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .form__group { margin: 0; }

    /* Jira URL toggle */
    .form__url-toggle {
      display: flex;
      align-items: center;
      gap: 6px;
      width: 100%;
      padding: 8px 12px;
      background: #f8f9fa;
      border: 1px solid #e8eaed;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 500;
      color: #5f6368;
      cursor: pointer;
      font-family: inherit;
      text-align: left;
      transition: background .15s, border-color .15s;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      &:hover { background: #f1f3f4; border-color: #dadce0; }
    }

    /* ── Field ─────────────────────────────────── */
    .field { display: flex; flex-direction: column; gap: 6px; }

    .field__label {
      font-size: 12px;
      font-weight: 600;
      color: #3c4043;
      letter-spacing: .04em;
      text-transform: uppercase;
    }

    .field__label-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .field__required { color: #ea4335; margin-left: 2px; }

    .field__forgot {
      background: none;
      border: none;
      font-size: 12px;
      color: #1a73e8;
      cursor: pointer;
      font-family: inherit;
      padding: 0;
      font-weight: 500;
      &:hover { text-decoration: underline; }
    }

    .field__wrap {
      display: flex;
      align-items: center;
      height: 52px;
      border: 1.5px solid #dadce0;
      border-radius: 10px;
      background: #fff;
      transition: border-color .18s, box-shadow .18s;
      overflow: hidden;

      &--focus {
        border-color: #1a73e8;
        box-shadow: 0 0 0 3px rgba(26,115,232,.14);
      }
    }

    .field--error .field__wrap {
      border-color: #ea4335;
      &.field__wrap--focus { box-shadow: 0 0 0 3px rgba(234,67,53,.12); }
    }

    .field__icon {
      padding: 0 13px;
      font-size: 20px !important;
      color: #80868b;
      flex-shrink: 0;
    }

    .field__input {
      flex: 1;
      height: 100%;
      border: none;
      outline: none;
      background: transparent;
      font-size: 14.5px;
      font-family: 'Inter', sans-serif;
      color: #202124;
      letter-spacing: .01em;

      &::placeholder { color: #bdc1c6; }
      &[type='password'] { letter-spacing: .12em; font-size: 18px; }
    }

    .field__ok {
      padding: 0 12px;
      flex-shrink: 0;
      font-size: 18px !important;
      animation: fadeIn .2s ease;
    }

    .field__eye {
      padding: 0 13px;
      background: none;
      border: none;
      cursor: pointer;
      color: #80868b;
      display: flex;
      align-items: center;
      flex-shrink: 0;
      transition: color .15s;
      &:hover { color: #1a73e8; }
    }

    .field__err {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #ea4335;
      margin: 0;
      animation: fadeIn .2s ease;
    }

    /* ── Remember me ─────────────────────────── */
    .remember {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      user-select: none;
    }

    .remember__check { display: none; }

    .remember__box {
      width: 18px;
      height: 18px;
      border: 2px solid #dadce0;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background .15s, border-color .15s;
      flex-shrink: 0;
    }

    .remember__check:checked ~ .remember__box {
      background: #1a73e8;
      border-color: #1a73e8;
    }

    .remember__label {
      font-size: 13px;
      color: #5f6368;
    }

    /* ── Submit button ─────────────────────────── */
    .btn-submit {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      height: 52px;
      background: #1a73e8;
      color: #fff;
      border: none;
      border-radius: 10px;
      font-family: 'Google Sans', sans-serif;
      font-size: 15px;
      font-weight: 500;
      letter-spacing: .02em;
      cursor: pointer;
      transition: background .18s, box-shadow .18s, transform .1s;
      box-shadow: 0 1px 3px rgba(60,64,67,.3), 0 2px 6px 2px rgba(60,64,67,.15);
      margin-top: 4px;

      &:hover:not(:disabled) {
        background: #1557b0;
        box-shadow: 0 2px 6px rgba(60,64,67,.3), 0 4px 10px 3px rgba(60,64,67,.15);
        transform: translateY(-1px);
      }

      &:active:not(:disabled) { transform: translateY(0); }

      &:disabled {
        opacity: .5;
        cursor: not-allowed;
        transform: none;
      }

      &--loading { background: #1557b0; }
    }

    /* spinner */
    .spinner {
      width: 20px;
      height: 20px;
      border: 2.5px solid rgba(255,255,255,.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin .65s linear infinite;
      flex-shrink: 0;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* ── Divider ────────────────────────────────── */
    .divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 20px 0 16px;

      &::before, &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: #e8eaed;
      }
    }

    .divider__text {
      font-size: 12px;
      color: #80868b;
      white-space: nowrap;
      font-weight: 500;
    }

    /* ── Guest button ───────────────────────────── */
    .btn-guest {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      height: 48px;
      background: transparent;
      color: #444746;
      border: 1.5px solid #dadce0;
      border-radius: 10px;
      font-family: 'Google Sans', sans-serif;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background .15s, border-color .15s;

      &:hover {
        background: #f1f3f4;
        border-color: #bdc1c6;
      }
    }

    /* ── Card footer ────────────────────────────── */
    .card__footer {
      padding: 14px 36px;
      background: #f8f9fa;
      border-top: 1px solid #e8eaed;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 12px;
      color: #80868b;

      .material-icons-outlined { font-size: 14px !important; }
    }

    /* ── Page footer ────────────────────────────── */
    .page-footer {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #80868b;
      padding-top: 20px;
    }

    .sep { color: #dadce0; }

    .footer-link {
      color: #1a73e8;
      text-decoration: none;
      &:hover { text-decoration: underline; }
    }

    /* ──────────────────────────────────────────────
       RESPONSIVE
    ────────────────────────────────────────────── */
    @media (max-width: 960px) {
      .brand { display: none; }
      .form-panel { justify-content: center; padding-top: 32px; }
    }

    @media (max-width: 520px) {
      .form-panel { padding: 0 16px 24px; background: #fff; }
      .card {
        border-radius: 0;
        border: none;
        box-shadow: none;
      }
      .card__inner { padding: 28px 20px 20px; }
      .card__footer { padding: 12px 20px; }
      .card__title { font-size: 22px; }
    }
  `]
})
export class LoginTaigaComponent implements OnInit {
  private jiraAuth = inject(JiraAuthService);
  private tokenStorage = inject(TokenStorageService);
  private router   = inject(Router);

  /**
   * Check if user is already authenticated on component initialization
   * This provides an additional safeguard in case the route guard fails
   */
  ngOnInit(): void {
    console.log('[LoginTaigaComponent] Initializing login page...');

    // Check authentication status from both services
    const isJiraAuth = this.jiraAuth.isAuthenticated();
    const isTokenStorageAuth = this.tokenStorage.isAuthenticated();

    console.log('[LoginTaigaComponent] JiraAuthService.isAuthenticated():', isJiraAuth);
    console.log('[LoginTaigaComponent] TokenStorageService.isAuthenticated():', isTokenStorageAuth);

    // If user is already authenticated, redirect to dashboard
    if (isJiraAuth || isTokenStorageAuth) {
      console.log('[LoginTaigaComponent] ⚠️ User is already authenticated, redirecting to /module/fe');
      this.router.navigate(['/module/fe']);
      return;
    }

    console.log('[LoginTaigaComponent] ✅ User not authenticated, showing login form');
  }

  username = '';
  password = '';
  jiraUrl  = 'https://task.ascvn.com.vn';
  showPass = false;
  showUrl  = false;
  remember = false;

  focusUser = false;
  focusPass = false;
  focusUrl  = false;

  touchedUser = false;
  touchedPass = false;

  loading    = signal(false);
  errorMsg   = signal('');
  successMsg = signal('');
  shake      = signal(false);

  async doLogin(): Promise<void> {
    this.touchedUser = true;
    this.touchedPass = true;

    if (!this.username.trim() || !this.password.trim()) {
      this.triggerShake();
      this.errorMsg.set('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');

    try {
      const ok = await this.jiraAuth.login({
        username: this.username.trim(),
        password: this.password,
        jiraUrl: this.jiraUrl || 'https://task.ascvn.com.vn',
        remember: this.remember
      });

      if (ok) {
        this.successMsg.set('Đăng nhập thành công! Đang chuyển hướng…');
        setTimeout(() => this.router.navigate(['/module/fe']), 800);
      } else {
        this.triggerShake();
        this.errorMsg.set('Tên đăng nhập hoặc mật khẩu không chính xác.');
      }
    } catch {
      this.triggerShake();
      this.errorMsg.set('Không thể kết nối đến máy chủ Jira. Kiểm tra lại URL và kết nối mạng.');
    } finally {
      this.loading.set(false);
    }
  }

  continueAsGuest(): void {
    this.router.navigate(['/module/fe']);
  }

  private triggerShake(): void {
    this.shake.set(true);
    setTimeout(() => this.shake.set(false), 500);
  }
}
