import { Component } from '@angular/core';

@Component({
  selector: 'app-be-logs',
  standalone: true,
  template: `
    <div class="g-page">
      <div class="page-header">
        <h1 class="page-title">Logs</h1>
        <p class="page-subtitle">Xem và phân tích system logs</p>
      </div>
      <div class="placeholder-content">
        <span class="material-icons-outlined placeholder-icon">receipt_long</span>
        <p>Logs đang được phát triển...</p>
      </div>
    </div>
  `,
  styles: [`
    .g-page { padding: 32px; }
    .page-header { margin-bottom: 32px; }
    .page-title { font-size: 24px; font-weight: 600; color: var(--g-text-primary, #202124); margin: 0 0 8px; }
    .page-subtitle { font-size: 14px; color: var(--g-text-secondary, #5f6368); margin: 0; }
    .placeholder-content {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 16px; padding: 80px 32px; background: var(--g-surface, #fff);
      border-radius: 12px; border: 1px dashed var(--g-border, #e0e0e0);
      color: var(--g-text-tertiary, #80868b); font-size: 14px;
    }
    .placeholder-icon { font-size: 48px !important; opacity: 0.4; }
  `]
})
export class BeLogsComponent {}
