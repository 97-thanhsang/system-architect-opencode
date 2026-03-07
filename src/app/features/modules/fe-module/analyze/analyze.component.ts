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
    <div class="g-page animate-fade-in">
      
      <!-- Page header ─────────────────────────────── -->
      <div class="g-page__header">
        <div>
          <h1 class="g-page__title">AI Task Analyzer</h1>
          <p style="font-size:13px;color:#5f6368;margin-top:4px">
            Intelligent insights for requirements, system impact, and architecture
          </p>
        </div>
        <div class="g-page__actions">
          <button class="g-btn g-btn--outlined">
            <span class="material-icons-outlined" style="font-size:18px">history</span>
            History
          </button>
        </div>
      </div>

      <!-- Analysis Boards ─────────────────────────── -->
      <div class="analyze-grid">
        <!-- Input Board -->
        <app-task-input class="analyze-col"></app-task-input>

        <!-- Processing Board -->
        <app-progress-monitor class="analyze-col"></app-progress-monitor>

        <!-- Insights Board -->
        <app-output-viewer class="analyze-col"></app-output-viewer>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .analyze-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      height: calc(100vh - 200px); /* Adjust based on header height */
      min-height: 500px;
    }

    .analyze-col {
      height: 100%;
      min-width: 0; /* Prevents flex/grid blowup */
    }

    @media (max-width: 1200px) {
      .analyze-grid {
        grid-template-columns: 1fr;
        height: auto;
      }
      .analyze-col {
        height: 500px;
      }
    }
  `]
})
export class AnalyzeComponent {}
