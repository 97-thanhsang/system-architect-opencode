import { Component, inject, computed, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
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
      <div class="g-card__header border-b border-slate-100 bg-slate-50/50">
        <div class="flex items-center gap-3">
          <div class="g-stat-card__icon g-stat-card__icon--yellow" style="width: 36px; height: 36px;">
            <span class="material-icons-outlined" style="font-size: 20px;">psychology</span>
          </div>
          <div class="flex flex-col">
            <span class="g-card__title">Neural Processing Unit</span>
            <span style="font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">
               Active Intelligence Stream
            </span>
          </div>
        </div>
      </div>
      
      <div class="g-card__body flex-1 flex flex-col p-0 overflow-hidden relative">
        <!-- Background Pattern -->
        <div class="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style="background-image: radial-gradient(#64748b 0.5px, transparent 0.5px); background-size: 20px 20px;"></div>

        <!-- Floating Security Guard Overlay (Critical Priority) -->
        @if (pendingPermission(); as perm) {
          <div class="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in">
            <div class="w-full max-w-[320px] bg-white rounded-[28px] shadow-2xl border border-amber-200 overflow-hidden animate-slide-up">
              <div class="p-8 text-center">
                <div class="w-16 h-16 rounded-3xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 mx-auto mb-5 shadow-inner">
                  <span class="material-icons-outlined text-3xl animate-pulse">security</span>
                </div>
                <h3 class="text-lg font-bold text-slate-900 mb-2">Security Authorization</h3>
                <p class="text-[12px] text-slate-500 mb-1 font-medium">Agent is requesting access to:</p>
                <div class="px-3 py-1.5 bg-slate-50 rounded-lg mb-6 border border-slate-100">
                  <span class="text-[11px] font-mono font-bold text-amber-700 break-all">{{ perm.tool }}</span>
                </div>
                
                <div class="flex flex-col gap-2">
                  <button (click)="onPermissionResponse('once', perm.id)" 
                          class="h-11 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 transition-all shadow-md active:scale-95">
                    Allow Once
                  </button>
                  <button (click)="onPermissionResponse('always', perm.id)" 
                          class="h-11 bg-white border-2 border-amber-600 text-amber-600 rounded-xl font-bold text-sm hover:bg-amber-50 transition-all active:scale-95">
                    Always Allow
                  </button>
                  <button (click)="onPermissionResponse('reject', perm.id)" 
                          class="h-11 text-slate-400 font-bold text-sm hover:text-red-500 transition-colors">
                    Deny Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        }

        @if (isAnalyzing() || progress() > 0) {
          <!-- Progress Header Overlay -->
          <div class="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
            <div class="flex justify-between items-center mb-2">
              <div class="flex items-center gap-3">
                <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">{{ getStageName() }}</span>
                @if (isAnalyzing() && progress() < 100) {
                  <button (click)="onCancel()" 
                          class="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-all group shadow-sm border border-red-100">
                    <span class="material-icons-outlined text-[12px]">stop_circle</span>
                    <span class="text-[9px] font-black uppercase tracking-tighter">Abort Pipeline</span>
                  </button>
                }
              </div>
              <span class="text-[11px] font-mono font-bold" [class.text-green-600]="progress() === 100" [class.text-amber-600]="progress() < 100">{{ progress() }}%</span>
            </div>
            <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full transition-all duration-700 ease-out rounded-full" 
                   [style.width.%]="progress()"
                   [ngClass]="progress() === 100 ? 'bg-green-500' : 'bg-amber-500'"></div>
            </div>
          </div>

          <!-- Interaction Stream -->
          <div #scrollContainer class="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar">
            @for (part of parts(); track part.id) {
              <div class="part-container animate-slide-up">
                
                <!-- Reasoning Part (Thought) -->
                @if (part.type === 'reasoning') {
                  <div class="flex gap-4 group">
                    <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <span class="material-icons-outlined text-slate-400 text-sm">tips_and_updates</span>
                    </div>
                    <div class="flex-1 bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none p-4 shadow-sm italic text-[12px] text-slate-500 leading-relaxed">
                      {{ part.text }}
                    </div>
                  </div>
                }

                <!-- Text Part (AI Response) -->
                @if (part.type === 'text' && part.text) {
                  <div class="flex gap-4">
                    <div class="w-8 h-8 rounded-full bg-google-blue/10 flex items-center justify-center shrink-0 border border-google-blue/20">
                      <span class="material-icons-outlined text-google-blue text-sm">smart_toy</span>
                    </div>
                    <div class="flex-1 bg-white border border-slate-100 rounded-2xl rounded-tl-none p-4 shadow-sm text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {{ part.text }}
                    </div>
                  </div>
                }

                <!-- Tool Part (Actions) -->
                @if (part.type === 'tool') {
                  <div class="ml-12 flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                    <div class="w-6 h-6 rounded-lg flex items-center justify-center" 
                         [ngClass]="part.state?.status === 'running' ? 'bg-amber-50 text-amber-600 animate-spin' : 'bg-green-50 text-green-600'">
                      <span class="material-icons-outlined text-[14px]">
                        {{ part.state?.status === 'running' ? 'autorenew' : 'check_circle' }}
                      </span>
                    </div>
                    <div class="flex flex-col">
                      <span class="text-[11px] font-bold text-slate-800 uppercase tracking-wider">{{ part.tool }}</span>
                      <span class="text-[9px] text-slate-400 font-mono truncate max-w-[200px]">
                        {{ part.state?.input?.filePath || part.state?.input?.pattern || 'Executing operation...' }}
                      </span>
                    </div>
                  </div>
                }

                <!-- Permission Part (SECURITY) -->
                @if (part.type === 'permission') {
                  <div class="ml-12 p-5 bg-amber-50 border border-amber-100 rounded-2xl shadow-md border-l-4 border-l-amber-500 animate-pulse-subtle">
                    <div class="flex items-center gap-2 mb-3">
                      <span class="material-icons-outlined text-amber-600 text-sm">security</span>
                      <span class="text-[10px] font-black text-amber-600 uppercase tracking-widest">Security Authorization</span>
                    </div>
                    <h4 class="text-[13px] font-bold text-slate-900 mb-2">{{ part.permissionRequest.permission }}</h4>
                    <p class="text-[11px] text-slate-600 mb-4">{{ part.permissionRequest.patterns?.join(', ') }}</p>
                    
                    <div class="flex gap-2">
                      <button (click)="onPermissionResponse('once', part.permissionRequest.id)" 
                              class="flex-1 h-9 bg-amber-600 text-white rounded-lg font-bold text-[11px] hover:bg-amber-700 transition-colors shadow-sm">Allow Once</button>
                      <button (click)="onPermissionResponse('always', part.permissionRequest.id)" 
                              class="flex-1 h-9 bg-white border border-amber-200 text-amber-700 rounded-lg font-bold text-[11px] hover:bg-amber-50 transition-colors shadow-sm">Always</button>
                      <button (click)="onPermissionResponse('reject', part.permissionRequest.id)" 
                              class="flex-1 h-9 bg-white border border-red-100 text-red-400 rounded-lg font-bold text-[11px] hover:bg-red-50 transition-colors">Deny</button>
                    </div>
                  </div>
                }

                <!-- Question Part (INTERACTIVE) -->
                @if (part.type === 'question') {
                  <div class="ml-12 p-5 bg-blue-50 border border-blue-100 rounded-2xl shadow-md border-l-4 border-l-blue-500">
                    <div class="flex items-center gap-2 mb-3">
                      <span class="material-icons-outlined text-blue-600 text-sm">help_outline</span>
                      <span class="text-[10px] font-black text-blue-600 uppercase tracking-widest">Decision Required</span>
                    </div>
                    @for (q of part.questionRequest.questions; track q.header) {
                      <h4 class="text-[13px] font-bold text-slate-900 mb-3">{{ q.question }}</h4>
                      <div class="flex flex-col gap-2">
                        @for (opt of q.options; track opt.label) {
                          <button (click)="onResponse(opt.label, part.questionRequest.id)" 
                                  class="w-full p-3 bg-white border border-blue-200 rounded-xl text-[11px] text-left hover:bg-blue-600 hover:text-white transition-all group">
                            <div class="font-bold mb-0.5">{{ opt.label }}</div>
                            <div class="text-[10px] opacity-70 group-hover:text-blue-100">{{ opt.description }}</div>
                          </button>
                        }
                      </div>
                    }
                  </div>
                }

              </div>
            }

            <!-- Typing Indicator / Cursor -->
            @if (isBusy()) {
              <div class="flex gap-4 ml-2 animate-fade-in">
                <div class="flex gap-1.5 items-center bg-slate-50 px-3 py-2 rounded-full border border-slate-100 shadow-sm">
                  <div class="w-1.5 h-1.5 bg-google-blue rounded-full animate-bounce" style="animation-delay: 0s"></div>
                  <div class="w-1.5 h-1.5 bg-google-blue rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                  <div class="w-1.5 h-1.5 bg-google-blue rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
                </div>
              </div>
            }
          </div>
        } @else {
          <!-- Idle State -->
          <div class="flex-1 flex flex-col items-center justify-center gap-8 animate-fade-in">
            <div class="relative">
              <div class="w-32 h-32 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                <span class="material-icons-outlined text-6xl text-slate-200">hub</span>
              </div>
              <div class="absolute inset-0 rounded-full border-2 border-google-blue/10 animate-ping" style="animation-duration: 3s;"></div>
            </div>
            <div class="text-center space-y-2">
              <h3 class="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Neural Sync Ready</h3>
              <p class="text-[11px] text-slate-400 font-medium">Awaiting input manifest to begin processing pipeline</p>
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

    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }

    .animate-slide-up {
      animation: slideUp 0.4s ease-out;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes pulse-subtle {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.85; }
    }
    .animate-pulse-subtle { animation: pulse-subtle 2s infinite; }
  `]
})
export class ProgressMonitorComponent implements AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  private readonly analyzeService = inject(AnalyzeService);

  readonly isAnalyzing = this.analyzeService.isAnalyzing;
  readonly progress = this.analyzeService.progress;
  readonly parts = this.analyzeService.parts;
  readonly pendingQuestion = this.analyzeService.pendingQuestion;
  readonly pendingPermission = this.analyzeService.pendingPermission;

  isBusy(): boolean {
    return this.isAnalyzing() && this.progress() < 100;
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch(err) {}
  }

  getStageName(): string {
    const p = this.progress();
    if (this.pendingPermission()) return 'Action Required: Security Guard';
    if (this.pendingQuestion()) return 'Action Required: Knowledge Sync';
    if (p === 0) return 'Awaiting Neural Injection';
    if (p < 10) return 'Step 0: Skill Initialization';
    if (p < 20) return 'Phase A: Quick Start';
    if (p < 30) return 'Phase B: Classification';
    if (p < 40) return 'Phase C: Business Analysis';
    if (p < 55) return 'Phase D: Tech Specification';
    if (p < 65) return 'Phase E: Estimation';
    if (p < 80) return 'Phase F: Impact & Risk';
    if (p < 90) return 'Phase G: Actionable Items';
    if (p < 100) return 'Phase H: Pre-flight Gate';
    return 'Core Analysis Synchronized';
  }

  onResponse(label: string, questionId?: string): void {
    this.analyzeService.respondToQuestion(label, questionId);
  }

  onPermissionResponse(response: 'once' | 'always' | 'reject', permissionId?: string): void {
    this.analyzeService.respondToPermission(response, permissionId);
  }

  onCancel(): void {
    this.analyzeService.cancelAnalysis();
  }
}
