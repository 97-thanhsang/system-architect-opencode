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
    <div class="g-card h-full flex flex-col shadow-sm">
      <!-- Card Header -->
      <div class="g-card__header">
        <div class="flex items-center gap-3">
          <div class="g-stat-card__icon g-stat-card__icon--yellow" style="width: 36px; height: 36px;">
            <span class="material-icons-outlined" style="font-size: 20px;">memory</span>
          </div>
          <div class="flex flex-col">
            <span class="g-card__title">Processing Unit</span>
            <span style="font-size: 11px; color: #80868b; font-weight: 500; text-transform: uppercase; letter-spacing: 0.02em;">
               Real-time execution stream
            </span>
          </div>
        </div>
      </div>
      
      <div class="g-card__body flex-1 flex flex-col px-6 py-6 overflow-hidden">
        @if (isAnalyzing() || progress() > 0) {
          <!-- Progress Visualization -->
          <div class="mb-8">
            <div class="flex justify-between items-end mb-3">
              <div class="flex flex-col">
                <span class="unit-label mb-1">ANALYSIS THROUGHPUT</span>
                <span class="text-[10px] font-extrabold text-[#94A3B8] tracking-widest uppercase">
                   NEURAL-ENGINE-V2 // ACTIVE
                </span>
              </div>
              <div class="flex flex-col items-end">
                <span class="progress-val">{{ progress() }}%</span>
              </div>
            </div>
            <div class="lab-progress-container shadow-inner">
              <div class="lab-progress-fill" [style.width.%]="progress()">
                <div class="lab-progress-glow"></div>
              </div>
            </div>
          </div>

          <!-- Terminal Module -->
          <div class="terminal-module flex-1 flex flex-col min-h-0">
            <div class="terminal-header">
              <div class="flex gap-2">
                <div class="dot red"></div>
                <div class="dot yellow"></div>
                <div class="dot green"></div>
              </div>
              <div class="terminal-title">AGENT_CORE_LOG_STREAM</div>
              <div class="terminal-meta">ENCRYPTED</div>
            </div>
            
            <div class="terminal-body flex-1 overflow-auto p-4 custom-scrollbar">
              <div class="scanline"></div>
              @for (log of logs(); track $index) {
                <div class="log-entry animate-fade-in">
                  <span class="log-ts">[{{ $index + 1 | number:'2.0-0' }}]</span>
                  <span class="log-cursor">_</span>
                  <span class="log-text">{{ log }}</span>
                </div>
              }
              <div class="cursor-line">
                <span class="log-ts">[{{ logs().length + 1 | number:'2.0-0' }}]</span>
                <span class="log-cursor">_</span>
                <div class="typing-cursor"></div>
              </div>
            </div>
          </div>
        } @else {
          <div class="flex-1 flex flex-col items-center justify-center text-[#CBD5E1] gap-6 opacity-40">
            <div class="idle-ring">
              <span class="material-icons-outlined text-5xl">sensors</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <p class="text-[11px] font-extrabold uppercase tracking-[0.3em]">Awaiting Signal Input</p>
            </div>
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

    .progress-val {
      font-family: 'JetBrains Mono', monospace;
      font-size: 28px;
      font-weight: 800;
      color: #F59E0B;
      line-height: 1;
    }

    .lab-progress-container {
      height: 10px;
      background: #F1F3F4;
      border-radius: 5px;
      overflow: hidden;
      position: relative;
    }

    .lab-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #F59E0B, #FBBF24);
      border-radius: 5px;
      transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }

    .lab-progress-glow {
      position: absolute;
      top: 0; right: 0; bottom: 0; left: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
      animation: sweep 1.5s infinite linear;
    }

    @keyframes sweep {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    .terminal-module {
      background: #0F172A;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      border: 1px solid #1E293B;
      position: relative;
      overflow: hidden;
    }

    .terminal-header {
      height: 36px;
      background: #1E293B;
      display: flex;
      align-items: center;
      padding: 0 16px;
      justify-content: space-between;
    }

    .dot { width: 8px; height: 8px; border-radius: 50%; }
    .dot.red { background: #FF5F57; }
    .dot.yellow { background: #FFBD2E; }
    .dot.green { background: #28C840; }

    .terminal-title {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      color: #94A3B8;
      font-weight: 700;
      letter-spacing: 0.1em;
    }

    .terminal-meta {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8px;
      color: #475569;
      font-weight: 700;
      background: #0F172A;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .terminal-body {
      position: relative;
      background: radial-gradient(circle at center, #1E293B 0%, #0F172A 100%);
    }

    .scanline {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.1) 50%);
      background-size: 100% 4px;
      z-index: 10;
      pointer-events: none;
      opacity: 0.1;
    }

    .log-entry {
      display: flex;
      gap: 12px;
      margin-bottom: 6px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      line-height: 1.5;
    }

    .log-ts { color: #475569; font-weight: 700; }
    .log-cursor { color: #3B82F6; font-weight: 800; opacity: 0.7; }
    .log-text { color: #CBD5E1; }

    .cursor-line {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .typing-cursor {
      width: 7px;
      height: 13px;
      background: #10B981;
      animation: blink 0.8s infinite;
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }

    .idle-ring {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      border: 3px solid #F1F3F4;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      &::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 2px solid #E2E8F0;
        animation: sonar 2.5s infinite cubic-bezier(0.4, 0, 0.2, 1);
      }
    }

    @keyframes sonar {
      0% { transform: scale(0.9); opacity: 0.8; }
      100% { transform: scale(1.6); opacity: 0; }
    }

    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 10px; }
  `]
})
export class ProgressMonitorComponent {
  private readonly analyzeService = inject(AnalyzeService);

  readonly isAnalyzing = this.analyzeService.isAnalyzing;
  readonly progress = this.analyzeService.progress;
  readonly logs = this.analyzeService.logs;
}
