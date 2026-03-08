import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { 
  TuiButtonModule, 
  TuiTextfieldControllerModule, 
  TuiDataListModule,
  TuiDialogModule,
  TuiDialogService,
  TuiErrorModule,
  TuiNotificationModule
} from '@taiga-ui/core';
import { 
  TuiTextAreaModule, 
  TuiInputModule, 
  TuiTabsModule,
  TuiFieldErrorPipeModule
} from '@taiga-ui/kit';
import { AnalyzeService } from '../analyze.service';
import { PolymorpheusContent } from '@tinkoff/ng-polymorpheus';

@Component({
  selector: 'app-task-input',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TuiButtonModule,
    TuiTextAreaModule,
    TuiInputModule,
    TuiTextfieldControllerModule,
    TuiTabsModule,
    TuiDataListModule,
    TuiDialogModule,
    TuiErrorModule,
    TuiFieldErrorPipeModule,
    TuiNotificationModule
  ],
  template: `
    <div class="flex flex-col h-full bg-white rounded-[24px] shadow-google-soft overflow-hidden animate-fade-in border border-google-border">
      <!-- Card Header -->
      <div class="px-6 py-5 border-b border-google-border flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-google-blue border border-blue-100 shadow-sm">
            <span class="material-icons-outlined text-xl">input</span>
          </div>
          <div class="flex flex-col">
            <span class="text-base font-medium text-slate-900 leading-tight">Input Manifest</span>
            <span class="text-[11px] text-google-gray font-medium uppercase tracking-wider">Source Selection & Injection</span>
          </div>
        </div>
      </div>
      
      <div class="flex-1 flex flex-col p-8 overflow-hidden gap-10">
        
        <!-- ── REGION 01: WORKSPACE CONFIG ────── -->
        <div class="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:border-blue-100 group">
          <div class="flex items-center gap-2 mb-5">
            <span class="material-icons-outlined text-google-blue text-sm">settings</span>
            <span class="text-[10px] font-bold text-google-gray uppercase tracking-widest">01. WORKSPACE CONFIGURATION</span>
          </div>
          
          <div class="flex flex-col gap-4">
            <!-- Source Path Row -->
            <div class="flex items-center gap-4 p-3 bg-white border rounded-xl transition-all"
                 [class.border-red-300]="!projectPath().trim()"
                 [class.bg-red-50]="!projectPath().trim()"
                 [class.border-google-border]="projectPath().trim()"
                 [class.focus-within:border-google-blue]="projectPath().trim()">
              <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                   [class.bg-slate-100]="projectPath().trim()" [class.text-slate-500]="projectPath().trim()"
                   [class.bg-red-100]="!projectPath().trim()" [class.text-red-500]="!projectPath().trim()">
                <span class="material-icons-outlined text-lg">{{ projectPath().trim() ? 'folder' : 'priority_high' }}</span>
              </div>
              <div class="flex flex-col flex-1 min-w-0">
                <span class="text-[8px] font-bold uppercase leading-none mb-1"
                      [class.text-google-gray]="projectPath().trim()" [class.text-red-500]="!projectPath().trim()">
                  Source Path {{ !projectPath().trim() ? '(Required)' : '' }}
                </span>
                <input 
                  [ngModel]="projectPath()" 
                  (ngModelChange)="projectPath.set($event)"
                  class="w-full border-none outline-none text-[13px] text-slate-700 bg-transparent p-0 font-medium"
                  placeholder="E:/SOURCE/your-project"
                />
              </div>
            </div>

            <!-- Output Path Row -->
            <div class="flex items-center gap-4 p-3 bg-white border rounded-xl transition-all"
                 [class.border-red-300]="!savePath().trim()"
                 [class.bg-red-50]="!savePath().trim()"
                 [class.border-google-border]="savePath().trim()"
                 [class.focus-within:border-google-blue]="savePath().trim()">
              <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                   [class.bg-slate-100]="savePath().trim()" [class.text-slate-500]="savePath().trim()"
                   [class.bg-red-100]="!savePath().trim()" [class.text-red-500]="!savePath().trim()">
                <span class="material-icons-outlined text-lg">{{ savePath().trim() ? 'save' : 'priority_high' }}</span>
              </div>
              <div class="flex flex-col flex-1 min-w-0">
                <span class="text-[8px] font-bold uppercase leading-none mb-1"
                      [class.text-google-gray]="savePath().trim()" [class.text-red-500]="!savePath().trim()">
                  Reports Path {{ !savePath().trim() ? '(Required)' : '' }}
                </span>
                <input 
                  [ngModel]="savePath()" 
                  (ngModelChange)="savePath.set($event)"
                  class="w-full border-none outline-none text-[13px] text-slate-700 bg-transparent p-0 font-medium"
                  placeholder="E:/SOURCE/your-project/reports"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- ── REGION 02: INJECTION UNIT ──── -->
        <div class="flex-1 flex flex-col min-h-0 bg-slate-50/50 p-5 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:border-blue-100">
          <div class="flex items-center gap-2 mb-5">
            <span class="material-icons-outlined text-google-blue text-sm">dynamic_feed</span>
            <span class="text-[10px] font-bold text-google-gray uppercase tracking-widest">02. DATA INJECTION UNIT</span>
          </div>

          <div class="flex-1 flex flex-col bg-slate-100/50 rounded-xl border border-slate-200 overflow-hidden shadow-inner">
            <div class="h-11 bg-slate-50 px-4 flex items-center gap-5 border-b border-slate-200">
              <button class="h-full border-b-2 font-bold text-[10px] tracking-wider transition-all" 
                      [class.border-google-blue]="activeTab === 0" [class.text-google-blue]="activeTab === 0"
                      [class.border-transparent]="activeTab !== 0" [class.text-slate-400]="activeTab !== 0"
                      (click)="activeTab = 0">TEXT_INPUT</button>
              <button class="h-full border-b-2 font-bold text-[10px] tracking-wider transition-all" 
                      [class.border-google-blue]="activeTab === 1" [class.text-google-blue]="activeTab === 1"
                      [class.border-transparent]="activeTab !== 1" [class.text-slate-400]="activeTab !== 1"
                      (click)="activeTab = 1">JIRA_LINK</button>
              <button class="h-full border-b-2 font-bold text-[10px] tracking-wider transition-all" 
                      [class.border-google-blue]="activeTab === 2" [class.text-google-blue]="activeTab === 2"
                      [class.border-transparent]="activeTab !== 2" [class.text-slate-400]="activeTab !== 2"
                      (click)="activeTab = 2">REMOTE_BROWSE</button>
            </div>

            <div class="flex-1 flex flex-col p-5 bg-white overflow-hidden">
              @if (activeTab === 0) {
                <div class="flex flex-col h-full animate-fade-in">
                  <div class="flex-1 border-[1.5px] border-slate-200 rounded-xl p-3 bg-slate-50/30 focus-within:border-google-blue focus-within:ring-4 focus-within:ring-blue-50 transition-all">
                    <textarea
                      [ngModel]="rawText()"
                      (ngModelChange)="rawText.set($event)"
                      class="w-full h-full border-none outline-none text-[13px] text-slate-700 bg-transparent resize-none leading-relaxed"
                      placeholder="Enter technical requirements or specifications..."
                    ></textarea>
                  </div>
                  <div class="flex justify-end mt-4">
                    <button class="h-9 px-5 border border-google-border rounded-full text-[11px] font-bold text-google-gray uppercase tracking-wider hover:border-google-blue hover:text-google-blue hover:bg-blue-50 transition-all disabled:opacity-40"
                            [disabled]="!rawText().trim()" (click)="addText()">
                      <span class="material-icons-outlined text-sm mr-2">add</span> Stage Data
                    </button>
                  </div>
                </div>
              }

              @if (activeTab === 1) {
                <div class="flex flex-col animate-fade-in py-2">
                  <div class="flex items-center gap-3 h-12 px-4 border-[1.5px] border-slate-200 rounded-xl bg-white focus-within:border-google-blue transition-all mb-4 shadow-sm">
                    <span class="material-icons-outlined text-slate-400">link</span>
                    <input 
                      [ngModel]="jiraUrl()" 
                      (ngModelChange)="jiraUrl.set($event)"
                      class="flex-1 border-none outline-none text-[13px] text-slate-700 bg-transparent"
                      placeholder="Paste Jira URL..."
                    />
                  </div>
                  <div class="flex justify-end">
                    <button class="h-9 px-5 border border-google-border rounded-full text-[11px] font-bold text-google-gray uppercase tracking-wider hover:border-google-blue hover:text-google-blue hover:bg-blue-50 transition-all disabled:opacity-40"
                            [disabled]="!jiraUrl().trim()" (click)="addJiraUrl()">
                      <span class="material-icons-outlined text-sm mr-2">bolt</span> Resolve Context
                    </button>
                  </div>
                </div>
              }

              @if (activeTab === 2) {
                <div class="flex-1 flex flex-col items-center justify-center animate-fade-in text-center py-4">
                  <div class="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4 border border-blue-100">
                     <span class="material-icons-outlined text-google-blue text-2xl">search</span>
                  </div>
                  <h4 class="text-sm font-bold text-slate-800 mb-1">Task Board Connection</h4>
                  <p class="text-[11px] text-google-gray mb-5 px-6 leading-relaxed">Import units directly from the linked Jira board.</p>
                  <button (click)="showJiraSearch(searchDialog)" 
                          class="h-9 px-6 bg-google-blue text-white text-[11px] font-bold rounded-full shadow-google-soft hover:bg-google-blue-dark transition-all uppercase tracking-wider">
                    Search Board
                  </button>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- ── REGION 03: MANIFEST STACK ──── -->
        <div class="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 flex flex-col min-h-0 hover:bg-white hover:border-blue-100 transition-all">
          <div class="flex items-center justify-between mb-5 px-1">
             <div class="flex items-center gap-2">
                <span class="material-icons-outlined text-google-blue text-sm">checklist</span>
                <span class="text-[10px] font-bold text-google-gray uppercase tracking-widest">03. QUEUED UNITS MANIFEST</span>
                <div class="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-bold text-google-blue border border-blue-100">{{ inputs().length }}</div>
             </div>
             @if (inputs().length > 0) {
                <button class="flex items-center gap-1.5 px-2 py-1 text-[9px] font-extrabold text-google-gray hover:text-red-500 transition-all uppercase tracking-tighter" (click)="clearAll()">
                  <span class="material-icons-outlined text-sm">delete_sweep</span> WIPE STACK
                </button>
             }
          </div>

          <div class="flex flex-col gap-2.5 min-h-[120px] max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
            @for (item of inputs(); track item.id) {
              <div class="flex items-center gap-4 p-2.5 bg-white border border-google-border rounded-xl group transition-all hover:border-slate-300 hover:shadow-sm">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                     [class.bg-blue-50]="item.type === 'text'" [class.text-google-blue]="item.type === 'text'"
                     [class.bg-blue-100]="item.type !== 'text'" [class.text-blue-700]="item.type !== 'text'">
                   <span class="material-icons-outlined text-[16px]">{{ getTypeIcon(item.type) }}</span>
                </div>
                
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-2 mb-0.5">
                    <span class="text-[9px] font-black text-slate-800 truncate uppercase tracking-tighter">{{ item.label || 'UNIT' }}</span>
                    <button class="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all" 
                            (click)="removeInput(item.id)">
                      <span class="material-icons-outlined text-sm">close</span>
                    </button>
                  </div>
                  <div class="text-[11px] text-google-gray truncate break-all leading-normal">{{ item.content }}</div>
                </div>
              </div>
            } @empty {
              <div class="flex-1 flex flex-col items-center justify-center py-10 border border-dashed border-red-200 rounded-2xl bg-red-50/30 animate-pulse">
                 <span class="material-icons-outlined text-2xl mb-1 text-red-300">playlist_add</span>
                 <span class="text-[10px] font-bold uppercase tracking-widest text-red-400">At least one unit required</span>
              </div>
            }
          </div>
        </div>

        <!-- ── ACTION: EXECUTION COMMIT ──── -->
        <div class="mt-2 flex flex-col items-center gap-3">
          @if (!canSubmit()) {
            <p class="text-[10px] font-bold text-red-400 uppercase tracking-wider animate-fade-in flex items-center gap-1.5">
              <span class="material-icons-outlined text-sm">info</span>
              Complete all required fields & stage at least one unit
            </p>
          }
          <button
            class="h-10 px-10 bg-google-blue text-white text-[11px] font-bold rounded-full shadow-google-soft hover:bg-google-blue-dark hover:shadow-google-hover hover:-translate-y-px active:translate-y-0 transition-all uppercase tracking-[0.1em] disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed"
            [disabled]="isAnalyzing() || !canSubmit()"
            (click)="onExecute()"
          >
            <span class="material-icons-outlined mr-2.5 text-base">rocket_launch</span>
            Commit to Analyzer
          </button>
        </div>
      </div>
    </div>

    <!-- Jira Search Dialog -->
    <ng-template #searchDialog let-observer>
       <div class="flex flex-col gap-5 p-6">
         <h2 class="text-xl font-medium text-slate-900 tracking-tight">Enterprise Task Search</h2>
         <tui-input [(ngModel)]="searchQuery" [tuiTextfieldCleaner]="true" tuiTextfieldSize="m">
            Keyword or ID
            <input tuiTextfield />
         </tui-input>
         <div class="max-h-[350px] overflow-y-auto bg-slate-50 rounded-2xl p-3 border border-google-border">
            @for (task of mockJiraTasks; track task.id) {
               <div class="p-4 bg-white hover:bg-blue-50 rounded-xl cursor-pointer transition-all flex justify-between items-center mb-2 border border-google-border hover:border-google-blue group"
                    (click)="selectJiraTask(task); observer.complete()">
                  <div class="flex flex-col gap-1">
                    <span class="text-[10px] font-bold text-google-blue uppercase tracking-tighter">{{task.id}}</span>
                    <span class="text-[14px] font-medium text-slate-800">{{task.title}}</span>
                  </div>
                  <span class="material-icons-outlined text-slate-300 group-hover:text-google-blue transition-colors">add_circle</span>
               </div>
            }
         </div>
       </div>
    </ng-template>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #DADCE0; border-radius: 10px; }
  `]
})
export class TaskInputComponent {
  private readonly analyzeService = inject(AnalyzeService);
  private readonly dialogService = inject(TuiDialogService);
  
  projectPath = signal('E:/SOURCE/ems.finance.fe');
  savePath = signal('E:/SOURCE/ems.finance.fe/analyze-reports');
  
  activeTab = 0;
  rawText = signal('');
  jiraUrl = signal('');
  searchQuery = signal('');
  
  readonly inputs = this.analyzeService.inputs;
  readonly isAnalyzing = this.analyzeService.isAnalyzing;

  mockJiraTasks = [
    { id: 'EMSPRO2-7234', title: 'Thiết kế login Taiga UI' },
    { id: 'EMSPRO2-7235', title: 'Cập nhật Sidebar Menu 3 cấp' },
    { id: 'EMSPRO2-7230', title: 'Sửa lỗi CSS Header Avatar' },
    { id: 'EMSPRO2-7221', title: 'Xây dựng Queue & WebSocket' }
  ];

  canSubmit(): boolean {
    return (
      this.projectPath().trim().length > 0 &&
      this.savePath().trim().length > 0 &&
      this.inputs().length > 0
    );
  }

  onFolderSelected(event: any, type: 'project' | 'save'): void {
    // Standard folder selection disabled for UX stability
  }

  addText(): void {
    if (!this.rawText().trim()) return;
    this.analyzeService.addInput({
      type: 'text',
      content: this.rawText().trim(),
      label: 'TEXT_PAYLOAD'
    });
    this.rawText.set('');
  }

  addJiraUrl(): void {
    if (!this.jiraUrl().trim()) return;
    const keyMatch = this.jiraUrl().match(/browse\/([A-Z0-9-]+)/);
    const label = keyMatch ? `JIRA_${keyMatch[1]}` : 'JIRA_LINK';
    
    this.analyzeService.addInput({
      type: 'jira-url',
      content: this.jiraUrl().trim(),
      label
    });
    this.jiraUrl.set('');
  }

  showJiraSearch(content: PolymorpheusContent): void {
    this.dialogService.open(content, { 
      size: 'm',
      appearance: 'lab-dialog'
    }).subscribe();
  }

  selectJiraTask(task: {id: string, title: string}): void {
    this.analyzeService.addInput({
      type: 'jira-task',
      content: task.title,
      label: `BROWSE_${task.id}`
    });
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'text': return 'notes';
      case 'jira-url': return 'link';
      case 'jira-task': return 'fact_check';
      default: return 'help_outline';
    }
  }

  clearAll(): void {
    this.analyzeService.clearInputs();
  }

  removeInput(id: string): void {
    this.analyzeService.removeInput(id);
  }

  onExecute(): void {
    if (this.canSubmit()) {
      this.analyzeService.updatePaths(this.projectPath(), this.savePath());
      this.analyzeService.startAnalysis();
    }
  }
}
