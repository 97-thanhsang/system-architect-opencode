import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyzeService } from '../analyze.service';

@Component({
  selector: 'app-output-viewer',
  standalone: true,
  imports: [
    CommonModule
  ],
  template: `
    <div class="g-card h-full flex flex-col">
      <div class="g-card__header">
        <div class="flex items-center gap-3">
          <div class="g-stat-card__icon g-stat-card__icon--green" style="width: 32px; height: 32px;">
            <span class="material-icons-outlined" style="font-size: 18px;">insights</span>
          </div>
          <span class="g-card__title">Intelligence Insights</span>
        </div>
      </div>
      
      <div class="g-card__body flex-1 flex flex-col">
        @if (result()) {
          <div class="flex-1 overflow-auto bg-white rounded-lg p-5 border border-f1f3f4 shadow-inner">
            <pre class="whitespace-pre-wrap font-sans text-sm leading-relaxed" style="color: var(--g-text-primary);">{{ result() }}</pre>
          </div>
          <div class="mt-4 flex justify-end gap-2">
            <button class="g-btn g-btn--outlined" style="height: 36px;">
              <span class="material-icons-outlined" style="font-size: 18px;">download</span>
              Export
            </button>
            <button class="g-btn g-btn--primary" style="height: 36px;">
              <span class="material-icons-outlined" style="font-size: 18px;">check</span>
              Adopt
            </button>
          </div>
        } @else {
          <div class="flex-1 flex flex-col items-center justify-center text-muted gap-3 opacity-60">
            <span class="material-icons-outlined text-4xl">find_in_page</span>
            <p class="text-sm italic">Waiting for result</p>
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

    .border-f1f3f4 {
      border-color: #f1f3f4;
    }
  `]
})
export class OutputViewerComponent {
  private readonly analyzeService = inject(AnalyzeService);
  readonly result = this.analyzeService.result;
}
