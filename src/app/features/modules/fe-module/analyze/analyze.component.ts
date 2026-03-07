import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskInputComponent } from './board1-input/task-input.component';
import { ProgressMonitorComponent } from './board2-progress/progress-monitor.component';
import { OutputViewerComponent } from './board3-output/output-viewer.component';

@Component({
  selector: 'app-analyze',
  standalone: true,
  imports: [
    CommonModule,
    TaskInputComponent,
    ProgressMonitorComponent,
    OutputViewerComponent
  ],
  template: `
    <div class="g-page animate-fade-in h-full flex flex-col">
      
      <!-- Standard Page Header ─────────────────────────────── -->
      <div class="g-page__header">
        <div>
          <h1 class="g-page__title">AI Task Analyzer</h1>
          <p style="font-size:13px;color:#5f6368;margin-top:4px">
            Thứ Bảy, 07 tháng 3 năm 2026 · Phân tích nhiệm vụ và đặc tả hệ thống
          </p>
        </div>
        <div class="g-page__actions">
          <div class="lab-badge-group">
            <div class="status-pill">
              <span class="status-dot"></span>
              SYSTEM READY
            </div>
            <div class="model-badge">G-5.2</div>
          </div>
          <button class="g-btn g-btn--outlined">
            <span class="material-icons-outlined" style="font-size:18px">history</span>
            Lịch sử
          </button>
        </div>
      </div>

      <!-- Analysis Boards Grid ─────────────────────────── -->
      <div class="flex-1 min-h-0">
        <div class="analyze-grid">
          <!-- Board 1: Configuration -->
          <div class="analyze-col">
            <app-task-input></app-task-input>
          </div>

          <!-- Board 2: Processing -->
          <div class="analyze-col">
            <app-progress-monitor></app-progress-monitor>
          </div>

          <!-- Board 3: Intelligence -->
          <div class="analyze-col">
            <app-output-viewer></app-output-viewer>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .lab-badge-group {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-right: 12px;
    }

    .status-pill {
      background: #e6f4ea;
      color: #1e8e3e;
      font-size: 10px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      letter-spacing: 0.02em;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      background: #1e8e3e;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    .model-badge {
      background: #f1f3f4;
      color: #5f6368;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 6px;
      border: 1px solid #dadce0;
    }

    .analyze-grid {
      display: flex;
      flex-direction: row;
      gap: 24px;
      height: 100%;
      width: 100%;
    }

    .analyze-col {
      flex: 1;
      height: 100%;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    @media (max-width: 1200px) {
      .analyze-grid {
        flex-direction: column;
        overflow-y: auto;
      }
      .analyze-col {
        height: 600px;
        flex: 0 0 600px;
      }
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.4; }
      100% { opacity: 1; }
    }
  `]
})
export class AnalyzeComponent {}
