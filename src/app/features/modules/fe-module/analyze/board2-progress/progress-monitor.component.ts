import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiProgressModule } from '@taiga-ui/kit';
import { AnalyzeService } from '../analyze.service';

@Component({
  selector: 'app-progress-monitor',
  standalone: true,
  imports: [
    CommonModule,
    TuiProgressModule
  ],
  template: `
    <div class="g-card h-full flex flex-col">
      <div class="g-card__header">
        <div class="flex items-center gap-3">
          <div class="g-stat-card__icon g-stat-card__icon--yellow" style="width: 32px; height: 32px;">
            <span class="material-icons-outlined" style="font-size: 18px;">pending_actions</span>
          </div>
          <span class="g-card__title">Processing Stream</span>
        </div>
      </div>
      
      <div class="g-card__body flex-1 flex flex-col">
        @if (isAnalyzing() || progress() > 0) {
          <div class="mb-4">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-medium text-muted">Analysis Progress</span>
              <span class="text-sm font-bold" style="color: var(--g-yellow);">{{ progress() }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-bar__fill" [style.width.%]="progress()"></div>
            </div>
          </div>

          <div class="flex-1 overflow-auto bg-slate-900 rounded-lg p-3 font-mono text-xs leading-relaxed shadow-inner border border-slate-800">
            @for (log of logs(); track $index) {
              <div class="mb-1.5 flex gap-2">
                <span style="color: #607d8b; shrink-0">[{{ $index + 1 }}]</span>
                <span style="color: #4caf50;">{{ log }}</span>
              </div>
            }
            <div class="pulse-cursor inline-block w-1.5 h-3.5 bg-green-500 ml-1"></div>
          </div>
        } @else {
          <div class="flex-1 flex flex-col items-center justify-center text-muted gap-3 opacity-60">
            <span class="material-icons-outlined text-4xl">hourglass_empty</span>
            <p class="text-sm italic">Waiting for input</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .progress-bar {
      height: 6px;
      background: #f1f3f4;
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-bar__fill {
      height: 100%;
      background: var(--g-yellow);
      border-radius: 3px;
      transition: width .3s ease;
    }

    .pulse-cursor {
      animation: pulse 1s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
  `]
})
export class ProgressMonitorComponent {
  private readonly analyzeService = inject(AnalyzeService);

  readonly isAnalyzing = this.analyzeService.isAnalyzing;
  readonly progress = this.analyzeService.progress;
  readonly logs = this.analyzeService.logs;
}
