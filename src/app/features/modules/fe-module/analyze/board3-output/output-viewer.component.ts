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
    <div class="g-card h-full flex flex-col shadow-sm">
      <!-- Card Header -->
      <div class="g-card__header">
        <div class="flex items-center gap-3">
          <div class="g-stat-card__icon g-stat-card__icon--green" style="width: 36px; height: 36px;">
            <span class="material-icons-outlined" style="font-size: 20px;">psychology</span>
          </div>
          <div class="flex flex-col">
            <span class="g-card__title">Intelligence Unit</span>
            <span style="font-size: 11px; color: #80868b; font-weight: 500; text-transform: uppercase; letter-spacing: 0.02em;">
               Synthesized insights & output
            </span>
          </div>
        </div>
      </div>
      
      <div class="g-card__body flex-1 flex flex-col px-6 py-6 overflow-hidden">
        @if (result()) {
          <div class="insight-container flex-1 flex flex-col min-h-0 bg-[#F8F9FA] rounded-2xl border border-[#E9ECEF] overflow-hidden shadow-inner">
            <div class="insight-header">
              <div class="flex items-center gap-2">
                <span class="material-icons-outlined text-[#10B981] text-sm">description</span>
                <span class="unit-label">SYSTEM_IMPACT_REPORT.md</span>
              </div>
              <div class="flex gap-1.5">
                <button class="tool-btn" title="Copy to Clipboard">
                  <span class="material-icons-outlined">content_copy</span>
                </button>
                <button class="tool-btn" title="Toggle Fullscreen">
                  <span class="material-icons-outlined">fullscreen</span>
                </button>
              </div>
            </div>
            
            <div class="flex-1 overflow-auto p-8 custom-scrollbar bg-white">
              <div class="markdown-preview">
                <!-- Content Area -->
                <div class="prose prose-slate max-w-none">
                  <pre class="whitespace-pre-wrap font-sans text-[14px] leading-[1.6] text-[#334155] selection:bg-[#EBF5FF]">{{ result() }}</pre>
                </div>
                
                <!-- Bottom Decoration -->
                <div class="mt-8 pt-6 border-t border-[#F1F3F4] flex justify-between items-center opacity-50">
                   <span class="text-[9px] font-bold text-[#ADB5BD] uppercase tracking-widest">Confidence Score: 0.98</span>
                   <span class="text-[9px] font-bold text-[#ADB5BD] uppercase tracking-widest">Verified by G-5.2</span>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 flex gap-3">
            <button class="g-btn g-btn--outlined flex-1" style="height: 48px;">
              <span class="material-icons-outlined">download</span>
              EXPORT PACKAGE
            </button>
            <button class="g-btn g-btn--primary flex-1" style="height: 48px;">
              <span class="material-icons-outlined">check_circle</span>
              ADOPT SOLUTION
            </button>
          </div>
        } @else {
          <div class="flex-1 flex flex-col items-center justify-center text-[#CBD5E1] gap-6 opacity-40">
            <div class="search-pulse">
              <span class="material-icons-outlined text-5xl">find_in_page</span>
            </div>
            <p class="text-[11px] font-extrabold uppercase tracking-[0.2em]">Synthesizing Output</p>
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

    .unit-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 800;
      color: #ADB5BD;
      letter-spacing: 0.1em;
    }

    .insight-container {
      display: flex;
      flex-direction: column;
    }

    .insight-header {
      height: 40px;
      background: #F8F9FA;
      padding: 0 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #EDF2F7;
    }

    .tool-btn {
      width: 24px;
      height: 24px;
      border: none;
      background: transparent;
      color: #ADB5BD;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s;
      &:hover { background: #EBF5FF; color: #1A73E8; }
      .material-icons-outlined { font-size: 16px; }
    }

    .markdown-preview {
      background-image: linear-gradient(#F8F9FA 1.5px, transparent 1.5px),
                        linear-gradient(90deg, #F8F9FA 1.5px, transparent 1.5px);
      background-size: 32px 32px;
    }

    .search-pulse {
      animation: bounce 2s infinite ease-in-out;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #F1F3F4; border-radius: 10px; }
  `]
})
export class OutputViewerComponent {
  private readonly analyzeService = inject(AnalyzeService);
  readonly result = this.analyzeService.result;
}
