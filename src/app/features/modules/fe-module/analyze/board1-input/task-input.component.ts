import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { 
  TuiButtonModule, 
  TuiTextfieldControllerModule, 
  TuiDataListModule,
  TuiDialogModule,
  TuiDialogService,
  TuiErrorModule
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
    TuiFieldErrorPipeModule
  ],
  template: `
    <div class="g-card h-full flex flex-col shadow-sm border-0 bg-white">
      <!-- Card Header: Same as Board 2 & 3 -->
      <div class="g-card__header">
        <div class="flex items-center gap-3">
          <div class="g-stat-card__icon g-stat-card__icon--blue" style="width: 36px; height: 36px;">
            <span class="material-icons-outlined" style="font-size: 20px;">input</span>
          </div>
          <div class="flex flex-col">
            <span class="g-card__title">Input Manifest</span>
            <span style="font-size: 11px; color: #80868b; font-weight: 500; text-transform: uppercase; letter-spacing: 0.02em;">
               Source selection & data injection
            </span>
          </div>
        </div>
      </div>
      
      <div class="g-card__body flex-1 flex flex-col px-6 py-6 overflow-hidden gap-6">
        
        <!-- ── REGION 01: WORKSPACE CONFIG ────── -->
        <div class="flex flex-col gap-3">
          <span class="region-label">WORKSPACE CONFIGURATION</span>
          <div class="grid grid-cols-1 gap-2">
            <!-- Source Folder Selection -->
            <input #projectDir type="file" webkitdirectory (change)="onFolderSelected($event, 'project')" style="display: none" />
            <input #saveDir type="file" webkitdirectory (change)="onFolderSelected($event, 'save')" style="display: none" />

            <div class="input-selection-row" (click)="projectDir.click()">
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <span class="material-icons-outlined text-[#5F6368]">folder</span>
                <div class="flex flex-col min-w-0">
                  <span class="text-[9px] font-bold text-[#80868B] uppercase">Source Path</span>
                  <span class="text-[13px] font-medium text-[#202124] truncate">{{ projectPath() || 'Select Project Root...' }}</span>
                </div>
              </div>
              <span class="material-icons-outlined text-[#DADCE0] text-sm">chevron_right</span>
            </div>

            <div class="input-selection-row" (click)="saveDir.click()">
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <span class="material-icons-outlined text-[#5F6368]">save</span>
                <div class="flex flex-col min-w-0">
                  <span class="text-[9px] font-bold text-[#80868B] uppercase">Reports Path</span>
                  <span class="text-[13px] font-medium text-[#202124] truncate">{{ savePath() || 'Select Storage Path...' }}</span>
                </div>
              </div>
              <span class="material-icons-outlined text-[#DADCE0] text-sm">chevron_right</span>
            </div>
          </div>
        </div>

        <!-- ── REGION 02: INJECTION UNIT ──── -->
        <div class="flex-1 flex flex-col min-h-0">
          <span class="region-label mb-3">DATA INJECTION UNIT</span>
          <div class="injection-container flex-1 flex flex-col bg-[#F8F9FA] rounded-2xl border border-[#E9ECEF] overflow-hidden shadow-inner">
            <div class="injection-tabs">
              <button class="inj-tab" [class.active]="activeTab === 0" (click)="activeTab = 0">TEXT_INPUT</button>
              <button class="inj-tab" [class.active]="activeTab === 1" (click)="activeTab = 1">JIRA_LINK</button>
              <button class="inj-tab" [class.active]="activeTab === 2" (click)="activeTab = 2">REMOTE_BROWSE</button>
            </div>

            <div class="flex-1 flex flex-col p-5 bg-white overflow-hidden">
              @if (activeTab === 0) {
                <div class="flex flex-col h-full animate-fade-in">
                  <textarea
                    [ngModel]="rawText()"
                    (ngModelChange)="rawText.set($event)"
                    class="inj-textarea flex-1"
                    placeholder="Describe your requirements or paste technical specifications..."
                  ></textarea>
                  <button class="inj-action-btn mt-4" [disabled]="!rawText().trim()" (click)="addText()">
                    <span class="material-icons-outlined text-[18px]">add_task</span>
                    Stage Requirements
                  </button>
                </div>
              }

              @if (activeTab === 1) {
                <div class="flex flex-col animate-fade-in py-4">
                  <div class="inj-input-wrap mb-4">
                    <span class="material-icons-outlined text-[#5F6368] text-lg">link</span>
                    <input 
                      [ngModel]="jiraUrl()" 
                      (ngModelChange)="jiraUrl.set($event)"
                      class="inj-input-field"
                      placeholder="https://jira.ascvn.com.vn/browse/EMSPRO2-XXXX"
                    />
                  </div>
                  <button class="inj-action-btn" [disabled]="!jiraUrl().trim()" (click)="addJiraUrl()">
                    <span class="material-icons-outlined text-[18px]">bolt</span>
                    Resolve Jira Context
                  </button>
                </div>
              }

              @if (activeTab === 2) {
                <div class="flex-1 flex flex-col items-center justify-center animate-fade-in text-center p-4">
                  <div class="w-14 h-14 rounded-full bg-[#EBF5FF] flex items-center justify-center mb-4 border border-[#D2E3FC]">
                     <span class="material-icons-outlined text-[#1A73E8] text-2xl">search</span>
                  </div>
                  <h4 class="text-[14px] font-bold text-[#202124] mb-2">Remote Task Browser</h4>
                  <p class="text-[12px] text-[#5F6368] leading-relaxed mb-6">
                    Connect to your enterprise task board to select and import specifications directly.
                  </p>
                  <button tuiButton appearance="primary" size="m" class="g-btn--primary" (click)="showJiraSearch(searchDialog)" style="border-radius: 20px; padding: 0 24px; height: 36px;">
                    Search Jira Board
                  </button>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- ── REGION 03: MANIFEST STACK ──── -->
        <div class="flex flex-col min-h-0">
          <div class="flex items-center justify-between mb-3 px-1">
             <span class="region-label">QUEUED UNITS MANIFEST</span>
             <div class="stack-badge">{{ inputs().length }} UNITS STAGED</div>
          </div>

          <div class="manifest-list custom-scrollbar overflow-y-auto">
            @for (item of inputs(); track item.id) {
              <div class="manifest-item animate-slide-in group">
                <div class="item-icon-box" [ngClass]="item.type">
                   <span class="material-icons-outlined text-[16px]">{{ getTypeIcon(item.type) }}</span>
                </div>
                
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-2 mb-1">
                    <span class="text-[10px] font-extrabold text-[#202124] truncate uppercase tracking-tighter">{{ item.label || 'DATA_UNIT' }}</span>
                    <button class="opacity-0 group-hover:opacity-100 p-0.5 text-[#80868B] hover:text-[#D93025] transition-all" 
                            (click)="removeInput(item.id)">
                      <span class="material-icons-outlined text-sm">delete</span>
                    </button>
                  </div>
                  <div class="item-snippet">{{ item.content }}</div>
                </div>
              </div>
            } @empty {
              <div class="flex flex-col items-center justify-center py-10 opacity-20 border-2 border-dashed border-[#F1F3F4] rounded-2xl">
                 <span class="material-icons-outlined text-3xl mb-2 text-[#5F6368]">playlist_add</span>
                 <span class="text-[11px] font-bold uppercase tracking-[0.2em]">Staging area empty</span>
              </div>
            }
          </div>

          @if (inputs().length > 0) {
            <div class="mt-4 flex justify-end">
              <button class="text-[11px] font-bold text-[#1A73E8] hover:underline" (click)="clearAll()">
                CLEAR ENTIRE STACK
              </button>
            </div>
          }
        </div>

        <!-- ── ACTION: EXECUTION COMMIT ──── -->
        <div class="mt-2 pt-2 border-t border-[#F1F3F4]">
          <button
            class="g-btn g-btn--primary w-full"
            style="height: 52px; font-size: 14px; letter-spacing: 0.05em;"
            [disabled]="isAnalyzing() || !canSubmit()"
            (click)="onExecute()"
          >
            <span class="material-icons-outlined mr-3">rocket_launch</span>
            COMMIT TO SYSTEM ANALYZER
          </button>
        </div>
      </div>
    </div>

    <!-- Jira Search Dialog -->
    <ng-template #searchDialog let-observer>
       <div class="flex flex-col gap-4 p-4">
         <h2 class="text-xl font-bold text-[#202124] tracking-tight mb-2">Search Enterprise Tasks</h2>
         <tui-input [(ngModel)]="searchQuery" [tuiTextfieldCleaner]="true" tuiTextfieldSize="m">
            Task ID or Keyword
            <input tuiTextfield />
         </tui-input>
         <div class="max-h-[350px] overflow-y-auto bg-[#F8F9FA] rounded-xl p-3 custom-scrollbar border border-[#E9ECEF]">
            @for (task of mockJiraTasks; track task.id) {
               <div class="p-4 bg-white hover:bg-[#F1F3F4] rounded-lg cursor-pointer transition-all flex justify-between items-center mb-2 border border-[#DADCE0] hover:border-[#BDC1C6] group"
                    (click)="selectJiraTask(task); observer.complete()">
                  <div class="flex flex-col gap-1">
                    <span class="text-[11px] font-black text-[#1A73E8] uppercase tracking-tighter">{{task.id}}</span>
                    <span class="text-[14px] font-semibold text-[#202124]">{{task.title}}</span>
                  </div>
                  <span class="material-icons-outlined text-[#DADCE0] group-hover:text-[#1A73E8] transition-colors">add_circle</span>
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

    .region-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 800;
      color: #ADB5BD;
      letter-spacing: 0.1em;
    }

    /* Input Selection Rows */
    .input-selection-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: #fff;
      border: 1px solid #DADCE0;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      
      &:hover {
        background: #F8F9FA;
        border-color: #BDC1C6;
        box-shadow: 0 1px 2px rgba(60,64,67,0.3);
      }
    }

    /* Injection Container Styles (Matching Output Viewer) */
    .injection-container {
      display: flex;
      flex-direction: column;
    }

    .injection-tabs {
      height: 44px;
      background: #F8F9FA;
      padding: 0 16px;
      display: flex;
      align-items: center;
      gap: 20px;
      border-bottom: 1px solid #EDF2F7;
    }

    .inj-tab {
      height: 100%;
      border: none;
      background: transparent;
      font-size: 10px;
      font-weight: 800;
      color: #80868B;
      position: relative;
      cursor: pointer;
      letter-spacing: 0.05em;
      transition: all 0.2s;
      
      &:hover { color: #202124; }
      
      &.active {
        color: #1A73E8;
        &::after {
          content: '';
          position: absolute;
          bottom: -1px; left: 0; right: 0;
          height: 3px;
          background: #1A73E8;
          border-radius: 3px 3px 0 0;
        }
      }
    }

    .inj-textarea {
      width: 100%;
      border: none;
      outline: none;
      font-size: 14px;
      color: #3C4043;
      background: transparent;
      resize: none;
      line-height: 1.6;
      font-family: inherit;
    }

    .inj-input-wrap {
      display: flex;
      align-items: center;
      background: #fff;
      border: 1px solid #DADCE0;
      border-radius: 10px;
      padding: 0 16px;
      height: 48px;
      gap: 16px;
      &:focus-within { border-color: #1A73E8; box-shadow: 0 0 0 2px rgba(26,115,232,0.1); }
    }

    .inj-input-field {
      flex: 1;
      border: none;
      outline: none;
      font-size: 14px;
      color: #3C4043;
      background: transparent;
    }

    .inj-action-btn {
      height: 40px;
      border: 1px solid #1A73E8;
      background: #fff;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      color: #1A73E8;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 0 20px;
      cursor: pointer;
      transition: all 0.2s;
      &:hover:not(:disabled) { background: #F4F8FE; box-shadow: 0 1px 2px rgba(26,115,232,0.15); }
      &:disabled { opacity: 0.5; cursor: not-allowed; border-color: #DADCE0; color: #ADB5BD; }
    }

    /* Manifest List (Bottom Section) */
    .stack-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      font-weight: 800;
      color: #fff;
      background: #5F6368;
      padding: 2px 10px;
      border-radius: 12px;
    }

    .manifest-list {
      min-height: 160px;
      max-height: 300px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .manifest-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 16px;
      background: #fff;
      border: 1px solid #DADCE0;
      border-radius: 14px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      &:hover { 
        border-color: #BDC1C6;
        box-shadow: 0 2px 6px rgba(60,64,67,0.1);
        transform: scale(1.005);
      }
    }

    .item-icon-box {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      &.text { background: #E8F0FE; color: #1A73E8; }
      &.jira-url, &.jira-task { background: #E2F2FF; color: #0052CC; }
    }

    .item-snippet {
      font-size: 12px;
      color: #5F6368;
      overflow-wrap: anywhere;
      word-break: break-word;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.4;
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
    const files = event.target.files;
    if (files && files.length > 0) {
      const firstPath = files[0].webkitRelativePath;
      const folderName = firstPath.split('/')[0];
      const mockPath = `E:/SOURCE/${folderName}`;
      
      if (type === 'project') this.projectPath.set(mockPath);
      else this.savePath.set(mockPath);
      
      event.target.value = '';
    }
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
    this.analyzeService.updatePaths(this.projectPath(), this.savePath());
    this.analyzeService.startAnalysis();
  }
}
