import { Component, inject, computed } from '@angular/core';
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
    <div class="g-card h-full flex flex-col shadow-sm border-0 bg-white">
      <!-- Card Header -->
      <div class="g-card__header">
        <div class="flex items-center gap-3">
          <div class="g-stat-card__icon g-stat-card__icon--yellow" style="width: 36px; height: 36px;">
            <span class="material-icons-outlined" style="font-size: 20px;">memory</span>
          </div>
          <div class="flex flex-col">
            <span class="g-card__title">Neural Processing Unit</span>
            <span style="font-size: 11px; color: #80868b; font-weight: 500; text-transform: uppercase; letter-spacing: 0.02em;">
               OpenCode Receival Pipeline
            </span>
          </div>
        </div>
      </div>
      
      <div class="g-card__body flex-1 flex flex-col px-6 py-6 overflow-hidden">
        @if (isAnalyzing() || progress() > 0) {
          <!-- Neural Progress Visualization -->
          <div class="mb-8">
            <div class="flex justify-between items-end mb-3 px-1">
              <div class="flex flex-col">
                <span class="unit-label mb-1">PIPELINE THROUGHPUT</span>
                <span class="text-[10px] font-extrabold text-google-blue tracking-widest uppercase animate-pulse">
                   {{ getStageName() }}
                </span>
              </div>
              <div class="flex flex-col items-end">
                <span class="progress-val" [class.completed]="progress() === 100">{{ progress() }}%</span>
              </div>
            </div>
            <div class="lab-progress-container shadow-inner bg-slate-100 rounded-full overflow-hidden h-2.5">
              <div class="lab-progress-fill h-full transition-all duration-500 rounded-full" 
                   [style.width.%]="progress()"
                   [ngClass]="progress() === 100 ? 'bg-green-500' : 'bg-amber-500'">
                <div class="lab-progress-glow"></div>
              </div>
            </div>
          </div>

          <!-- Interactive Question Layer -->
          @if (pendingQuestion(); as question) {
            <div class="mb-6 animate-slide-in">
              <div class="p-5 bg-blue-50 border border-blue-100 rounded-2xl shadow-sm">
                <div class="flex items-center gap-2 mb-3">
                  <span class="material-icons-outlined text-blue-600 text-sm">help_outline</span>
                  <span class="text-[10px] font-black text-blue-600 uppercase tracking-widest">Decision Required</span>
                </div>
                <h3 class="text-sm font-bold text-slate-900 mb-4">{{ question.title }}</h3>
                <div class="flex flex-wrap gap-3">
                  @for (opt of question.options; track opt.label) {
                    <button (click)="onResponse(opt.label)" 
                            class="px-4 py-2 bg-white border border-blue-200 rounded-xl text-[11px] font-bold text-blue-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm">
                      {{ opt.label }}
                    </button>
                  }
                </div>
              </div>
            </div>
          }

          <!-- Floating Security Guard -->
          @if (pendingPermission(); as perm) {
            <div class="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
              <div class="w-full max-w-sm bg-white rounded-[28px] shadow-2xl border border-slate-200 overflow-hidden">
                <div class="p-8 text-center">
                  <div class="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 mx-auto mb-4">
                    <span class="material-icons-outlined text-2xl">security</span>
                  </div>
                  <h3 class="text-lg font-bold text-slate-900 mb-2">Permission Required</h3>
                  <p class="text-sm text-slate-600 mb-8">{{ perm.title }}</p>
                  
                  <div class="flex flex-col gap-2">
                    <button (click)="onPermissionResponse('once')" class="h-11 bg-google-blue text-white rounded-xl font-bold text-sm">Allow Once</button>
                    <button (click)="onPermissionResponse('always')" class="h-11 bg-white border border-google-blue text-google-blue rounded-xl font-bold text-sm">Always Allow</button>
                    <button (click)="onPermissionResponse('reject')" class="h-11 text-slate-400 font-bold text-sm">Deny</button>
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- OpenCode Terminal Module -->
          <div class="terminal-module flex-1 flex flex-col min-h-0 rounded-2xl overflow-hidden border border-slate-200 bg-[#0F172A] shadow-2xl">
            <div class="terminal-header h-9 bg-[#1E293B] px-4 flex items-center justify-between">
              <div class="flex gap-1.5">
                <div class="w-2.5 h-2.5 rounded-full bg-[#FF5F57]"></div>
                <div class="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]"></div>
                <div class="w-2.5 h-2.5 rounded-full bg-[#28C840]"></div>
              </div>
              <div class="terminal-title font-mono text-[9px] text-slate-400 tracking-[0.2em] font-bold">AGENT_CORE_LOG_STREAM</div>
              <div class="terminal-meta font-mono text-[8px] text-slate-500 bg-[#0F172A] px-2 py-0.5 rounded border border-white/5">SSL_ENCRYPTED</div>
            </div>
            
            <div class="terminal-body flex-1 overflow-auto p-5 custom-scrollbar relative">
              <div class="scanline"></div>
              @for (log of logs(); track $index) {
                <div class="log-entry animate-fade-in group mb-1.5 flex gap-4 font-mono text-[11px] leading-relaxed">
                  <span class="log-ts text-slate-600 font-bold shrink-0">[{{ $index + 1 | number:'2.0-0' }}]</span>
                  <div class="flex-1 min-w-0">
                    <span class="log-text" [ngClass]="getLogClass(log)">{{ log }}</span>
                  </div>
                </div>
              }
              <div class="cursor-line flex gap-4 font-mono text-[11px] items-center mt-2">
                <span class="log-ts text-slate-600 font-bold shrink-0">[{{ logs().length + 1 | number:'2.0-0' }}]</span>
                <div class="flex items-center gap-2">
                   <span class="text-google-blue font-black animate-pulse">></span>
                   <div class="w-2 h-4 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-blink"></div>
                </div>
              </div>
            </div>
          </div>
        } @else {
          <div class="flex-1 flex flex-col items-center justify-center text-slate-300 gap-8 opacity-40">
            <div class="idle-sonar relative w-24 h-24 rounded-full border-2 border-slate-100 flex items-center justify-center">
              <span class="material-icons-outlined text-5xl text-slate-200">sensors</span>
              <div class="absolute inset-0 rounded-full border-2 border-slate-200 animate-ping opacity-20"></div>
            </div>
            <div class="flex flex-col items-center gap-2">
              <p class="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 text-center">Neutral State<br>Waiting for Neural Injection</p>
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
      font-size: 9px;
      font-weight: 800;
      color: #94A3B8;
      letter-spacing: 0.1em;
    }

    .progress-val {
      font-family: 'JetBrains Mono', monospace;
      font-size: 28px;
      font-weight: 800;
      color: #F59E0B;
      line-height: 1;
      &.completed { color: #10B981; }
    }

    .lab-progress-glow {
      position: absolute;
      top: 0; right: 0; bottom: 0; left: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      animation: sweep 2s infinite linear;
    }

    @keyframes sweep {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    .scanline {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.02) 50%);
      background-size: 100% 4px;
      z-index: 10;
      pointer-events: none;
    }

    .log-text { 
      color: #E2E8F0;
      &.system { color: #3B82F6; font-weight: bold; }
      &.process { color: #F59E0B; }
      &.done { color: #10B981; font-weight: bold; }
      &.error { color: #EF4444; }
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }

    .animate-blink { animation: blink 0.8s infinite; }

    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
  `]
})
export class ProgressMonitorComponent {
  private readonly analyzeService = inject(AnalyzeService);

  readonly isAnalyzing = this.analyzeService.isAnalyzing;
  readonly progress = this.analyzeService.progress;
  readonly logs = this.analyzeService.logs;
  readonly pendingQuestion = this.analyzeService.pendingQuestion;
  readonly pendingPermission = this.analyzeService.pendingPermission;

  getStageName(): string {
    const p = this.progress();
    if (this.pendingPermission()) return 'Security Action Required';
    if (this.pendingQuestion()) return 'Waiting for User Input';
    if (p === 0) return 'Awaiting Stage';
    if (p < 20) return 'Bootstrapping Pipeline';
    if (p < 40) return 'Context Detection';
    if (p < 80) return 'Neural Refinement Loop';
    if (p < 100) return 'Finalizing Report';
    return 'Analysis Complete';
  }

  getLogClass(log: string): string {
    if (log.startsWith('[SYSTEM]')) return 'system';
    if (log.startsWith('[PROCESS]') || log.startsWith('[THINK]') || log.includes('QUALITY_INDEX')) return 'process';
    if (log.startsWith('[DONE]')) return 'done';
    if (log.startsWith('[ERROR]') || log.startsWith('[FATAL]')) return 'error';
    return '';
  }

  onResponse(label: string): void {
    this.analyzeService.respondToQuestion(label);
  }

  onPermissionResponse(response: 'once' | 'always' | 'reject'): void {
    this.analyzeService.respondToPermission(response);
  }
}
