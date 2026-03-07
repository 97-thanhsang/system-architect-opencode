import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TuiButtonModule, TuiTextfieldControllerModule } from '@taiga-ui/core';
import { TuiTextAreaModule } from '@taiga-ui/kit';
import { AnalyzeService } from '../analyze.service';

@Component({
  selector: 'app-task-input',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TuiButtonModule,
    TuiTextAreaModule,
    TuiTextfieldControllerModule
  ],
  template: `
    <div class="g-card h-full flex flex-col">
      <div class="g-card__header">
        <div class="flex items-center gap-3">
          <div class="g-stat-card__icon g-stat-card__icon--blue" style="width: 32px; height: 32px;">
            <span class="material-icons-outlined" style="font-size: 18px;">edit_note</span>
          </div>
          <span class="g-card__title">Requirement Input</span>
        </div>
      </div>
      
      <div class="g-card__body flex-1 flex flex-col gap-4">
        <p class="text-sm text-muted">Describe your task or paste requirements below.</p>
        
        <tui-text-area
          [(ngModel)]="userInput"
          [expandable]="true"
          class="flex-1 tui-text-area-custom"
          placeholder="Enter task description here..."
        >
          Detailed Specifications
        </tui-text-area>

        <button
          tuiButton
          type="button"
          appearance="primary"
          class="w-full"
          [disabled]="!userInput() || isAnalyzing()"
          (click)="onAnalyze()"
        >
          Execute Analysis
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .tui-text-area-custom {
      --tui-radius-m: 12px;
    }
  `]
})
export class TaskInputComponent {
  private readonly analyzeService = inject(AnalyzeService);
  
  readonly userInput = signal('');
  readonly isAnalyzing = this.analyzeService.isAnalyzing;

  onAnalyze(): void {
    if (this.userInput().trim()) {
      this.analyzeService.startAnalysis(this.userInput());
    }
  }
}
