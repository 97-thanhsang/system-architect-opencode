import { Component, inject, signal, TemplateRef } from '@angular/core';
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
  TuiMarkerIconModule,
  TuiBadgeModule,
  TuiIslandModule,
  TuiFieldErrorPipeModule,
  TuiInputFilesModule,
  TuiFilesModule
} from '@taiga-ui/kit';
import { AnalyzeService, AnalysisInput } from '../analyze.service';
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
    TuiMarkerIconModule,
    TuiBadgeModule,
    TuiIslandModule,
    TuiDataListModule,
    TuiDialogModule,
    TuiErrorModule,
    TuiFieldErrorPipeModule,
    TuiInputFilesModule,
    TuiFilesModule
  ],
  template: `
    <div class="lab-card h-full flex flex-col border-t-4 border-blue-600 bg-white shadow-2xl overflow-hidden animate-fade-in">
      
      <!-- ── SECTION 01: CONFIG (Ultra-Minimal) ────────── -->
      <div class="p-4 border-b border-slate-100 bg-slate-50/20">
        <div class="flex flex-col gap-2">
          <!-- Hidden inputs for directory selection -->
          <input #projectDir type="file" webkitdirectory (change)="onFolderSelected($event, 'project')" style="display: none" />
          <input #saveDir type="file" webkitdirectory (change)="onFolderSelected($event, 'save')" style="display: none" />

          <div class="mini-config" [class.active]="projectPath()" (click)="projectDir.click()">
            <span class="mini-config__val truncate">{{ projectPath() || 'Select Project Root...' }}</span>
            <span class="material-icons-outlined mini-config__icon">folder</span>
            @if (projectPath()) { <div class="mini-config__dot"></div> }
          </div>

          <div class="mini-config" [class.active]="savePath()" (click)="saveDir.click()">
            <span class="mini-config__val truncate">{{ savePath() || 'Select Storage Path...' }}</span>
            <span class="material-icons-outlined mini-config__icon">save</span>
            @if (savePath()) { <div class="mini-config__dot"></div> }
          </div>
        </div>
      </div>

      <!-- ── SECTION 02: INJECTION ────────────────────────── -->
      <div class="flex-1 flex flex-col min-h-0 bg-white">
        <div class="px-5 pt-5 pb-2">
          <div class="injection-tabs">
            <button class="inj-tab" [class.active]="activeTab === 0" (click)="activeTab = 0">
               <span class="material-icons-outlined">link</span> JIRA_LINK
            </button>
            <button class="inj-tab" [class.active]="activeTab === 1" (click)="activeTab = 1">
               <span class="material-icons-outlined">search</span> BROWSE
            </button>
            <button class="inj-tab" [class.active]="activeTab === 2" (click)="activeTab = 2">
               <span class="material-icons-outlined">upload_file</span> PAYLOAD
            </button>
          </div>
        </div>

        <div class="px-5 flex-1 flex flex-col overflow-hidden min-h-[200px]">
          @if (activeTab === 0) {
            <div class="tab-pane animate-fade-in">
              <tui-input 
                [ngModel]="jiraUrl()" 
                (ngModelChange)="jiraUrl.set($event)"
                tuiTextfieldSize="m"
                class="lab-field">
                Task URL
                <input tuiTextfield placeholder="Paste Jira link..." />
              </tui-input>
              <button tuiButton appearance="secondary" size="s" class="lab-inject-btn"
                      [disabled]="!jiraUrl().trim()" (click)="addJiraUrl()">
                Inject Task Reference
              </button>
            </div>
          }

          @if (activeTab === 1) {
            <div class="tab-pane items-center justify-center bg-slate-50/50 border border-slate-100 rounded-2xl animate-fade-in p-6">
              <div class="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-3">
                 <span class="material-icons-outlined text-xl text-blue-400">cloud_done</span>
              </div>
              <button tuiButton appearance="secondary" size="s" class="lab-inject-btn" (click)="showJiraSearch(searchDialog)">
                Open Jira Browser
              </button>
            </div>
          }

          @if (activeTab === 2) {
            <div class="tab-pane animate-fade-in flex flex-col h-full pb-4">
              <div class="payload-selector" (click)="payloadPicker.click()">
                 <span class="material-icons-outlined text-2xl mb-1">upload_file</span>
                 <span class="text-[10px] font-bold uppercase tracking-widest">Select Payload</span>
              </div>
              <input #payloadPicker type="file" webkitdirectory (change)="onPayloadSelected($event)" style="display: none" />
              
              @if (selectedPayload()) {
                 <div class="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between">
                    <span class="text-[11px] font-bold text-blue-700 truncate flex-1 mr-2">{{ selectedPayload() }}</span>
                    <button tuiButton appearance="secondary" size="xs" (click)="injectPayload()">INJECT</button>
                 </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- ── SECTION 03: MANIFEST ─────────────────────────── -->
      <div class="p-5 bg-slate-900 border-t border-slate-800">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-500">Active Manifest Stack</h3>
          <div class="stack-counter">{{ inputs().length }} UNITS</div>
        </div>

        <div class="manifest-viewport custom-scrollbar">
          @for (item of inputs(); track item.id) {
            <div class="manifest-item animate-slide-in">
              <div class="item-status-bar" [ngClass]="'type-' + item.type"></div>
              <div class="flex-1 min-w-0">
                <div class="item-meta">{{ item.label || 'UNTITLED' }}</div>
                <div class="item-val">{{ item.content }}</div>
              </div>
              <button class="item-eject" (click)="removeInput(item.id)" title="Eject Unit">
                <span class="material-icons-outlined">close</span>
              </button>
            </div>
          } @empty {
            <div class="manifest-empty">
              <p class="text-[9px] font-bold uppercase tracking-[0.2em] opacity-30">Awaiting Sequence Data</p>
            </div>
          }
        </div>

        <button
          tuiButton
          appearance="primary"
          class="lab-launch-btn mt-5"
          [disabled]="isAnalyzing() || !canSubmit()"
          (click)="onExecute()"
        >
          <span class="material-icons-outlined mr-3">rocket_launch</span>
          INITIALIZE SEQUENCE
        </button>
      </div>
    </div>

    <!-- Jira Search Dialog -->
    <ng-template #searchDialog let-observer>
       <div class="flex flex-col gap-6 p-2">
         <div class="flex flex-col">
            <h2 class="text-2xl font-extrabold text-[#1E1E2D] tracking-tight uppercase">Search Jira Tasks</h2>
            <p class="text-xs font-medium text-[#ADB5BD] uppercase tracking-wider">Local Repository Index</p>
         </div>

         <tui-input [(ngModel)]="searchQuery" [tuiTextfieldCleaner]="true" class="lab-input">
            TASK ID OR KEYWORD
            <input tuiTextfield />
         </tui-input>

         <div class="max-h-[350px] overflow-y-auto bg-[#F8F9FA] rounded-2xl p-3 custom-scrollbar border border-[#E9ECEF]">
            @for (task of mockJiraTasks; track task.id) {
               <div class="p-4 bg-white hover:bg-[#EBF5FF] rounded-xl cursor-pointer transition-all flex justify-between items-center mb-2 border border-[#E9ECEF] hover:border-[#1A73E8] group"
                    (click)="selectJiraTask(task); observer.complete()">
                  <div class="flex flex-col">
                    <span class="font-mono text-[#1A73E8] font-extrabold text-xs mb-1 tracking-tighter">{{task.id}}</span>
                    <span class="text-sm font-bold text-[#495057] group-hover:text-[#1A73E8]">{{task.title}}</span>
                  </div>
                  <span class="material-icons-outlined text-[#DEE2E6] group-hover:text-[#1A73E8] transition-colors">add_circle</span>
               </div>
            }
         </div>
       </div>
    </ng-template>

    <ng-template #pathIcon><span class="material-icons-outlined text-slate-400">folder_open</span></ng-template>
    <ng-template #saveIcon><span class="material-icons-outlined text-slate-400">save</span></ng-template>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .lab-card { border-radius: 24px; }

    /* Mini Config (Region 1) */
    .mini-config {
       display: flex;
       align-items: center;
       justify-content: space-between;
       gap: 12px;
       height: 38px;
       padding: 0 12px;
       background: #fff;
       border: 1px solid #E9ECEF;
       border-radius: 10px;
       cursor: pointer;
       position: relative;
       transition: all 0.2s ease;

       &:hover {
          border-color: #1A73E8;
          background: #F8F9FA;
       }

       &.active {
          border-color: #1A73E8;
          background: #FDFDFE;
          .mini-config__val { color: #1E1E2D; font-weight: 600; }
          .mini-config__icon { color: #1A73E8; }
       }
    }

    .mini-config__val {
       flex: 1;
       font-size: 11px;
       color: #ADB5BD;
       font-weight: 500;
    }

    .mini-config__icon {
       font-size: 16px !important;
       color: #ADB5BD;
       transition: color 0.2s;
    }

    .mini-config__dot {
       position: absolute;
       top: 6px; right: 6px;
       width: 6px; height: 6px;
       background: #10B981;
       border-radius: 50%;
       border: 1.5px solid #fff;
       box-shadow: 0 0 4px rgba(16, 185, 129, 0.4);
    }

    /* Badge */
    .lab-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      background: #F1F3F4;
      color: #ADB5BD;
      &--ready { background: #EBF5FF; color: #1A73E8; }
    }

    /* Injection Tabs */
    .injection-tabs {
       display: flex;
       background: #F1F3F4;
       padding: 4px;
       border-radius: 12px;
       gap: 4px;
    }

    .inj-tab {
       flex: 1;
       height: 32px;
       border: none;
       background: transparent;
       border-radius: 8px;
       font-size: 10px;
       font-weight: 800;
       color: #5F6368;
       display: flex;
       align-items: center;
       justify-content: center;
       gap: 6px;
       cursor: pointer;
       transition: all 0.2s;
       .material-icons-outlined { font-size: 14px; }
       &.active { background: #fff; color: #1A73E8; box-shadow: 0 2px 6px rgba(0,0,0,0.06); }
    }

    .tab-pane { padding-top: 12px; display: flex; flex-direction: column; gap: 12px; height: 100%; }
    .lab-field { --tui-radius-m: 12px; }
    
    .lab-inject-btn {
       --tui-radius-m: 10px;
       font-size: 10px !important;
       font-weight: 800 !important;
       text-transform: uppercase;
       letter-spacing: 0.05em;
    }

    .payload-selector {
       flex: 1;
       display: flex;
       flex-direction: column;
       align-items: center;
       justify-content: center;
       border: 2px dashed #E9ECEF;
       border-radius: 16px;
       background: #FDFDFE;
       cursor: pointer;
       transition: all 0.2s;
       color: #ADB5BD;
       &:hover { background: #F8F9FA; border-color: #1A73E8; color: #1A73E8; }
    }

    /* Manifest Stack */
    .stack-counter {
       font-family: 'JetBrains Mono', monospace;
       font-size: 9px;
       font-weight: 700;
       color: #10B981;
       background: rgba(16, 185, 129, 0.1);
       padding: 2px 8px;
       border-radius: 4px;
    }

    .manifest-viewport {
       height: 140px;
       overflow-y: auto;
       display: flex;
       flex-direction: column;
       gap: 8px;
       padding-right: 4px;
    }

    .manifest-item {
       display: flex;
       align-items: center;
       gap: 12px;
       padding: 10px 14px;
       background: #1E293B;
       border-radius: 12px;
       border: 1px solid #334155;
       transition: all 0.2s;
       &:hover { border-color: #475569; background: #242F41; }
    }

    .item-status-bar {
       width: 3px; height: 24px; border-radius: 3px;
       &.type-text { background: #3B82F6; }
       &.type-jira-url, &.type-jira-task { background: #0052CC; }
    }

    .item-meta { font-family: 'JetBrains Mono', monospace; font-size: 8px; font-weight: 800; color: #475569; margin-bottom: 1px; }
    .item-val { font-size: 11px; font-weight: 600; color: #CBD5E1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .item-eject {
       width: 24px; height: 24px; border-radius: 6px; border: none; background: transparent;
       color: #475569; display: flex; align-items: center; justify-content: center; cursor: pointer;
       &:hover { background: #FF4D4F; color: #fff; }
       .material-icons-outlined { font-size: 14px; }
    }

    .manifest-empty {
       flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
       color: #475569; border: 1px dashed #334155; border-radius: 12px;
    }

    .lab-launch-btn {
       --tui-radius-m: 14px;
       width: 100%;
       height: 52px !important;
       font-size: 14px !important;
       font-weight: 900 !important;
       letter-spacing: 0.05em !important;
       background: #1A73E8;
       box-shadow: 0 8px 20px rgba(26, 115, 232, 0.2);
       &:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(26, 115, 232, 0.3); }
    }

    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
  `]
})
export class TaskInputComponent {
  private readonly analyzeService = inject(AnalyzeService);
  private readonly dialogService = inject(TuiDialogService);
  
  // Region 1 States (Signals)
  projectPath = signal('E:/SOURCE/ems.finance.fe');
  savePath = signal('E:/SOURCE/ems.finance.fe/analyze-reports');
  
  // Region 2 States
  activeTab = 0;
  jiraUrl = signal('');
  searchQuery = signal('');
  selectedPayload = signal('');
  files: File[] = [];
  
  // Shared States
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

  onPayloadSelected(event: any): void {
     const files = event.target.files;
     if (files && files.length > 0) {
        const firstPath = files[0].webkitRelativePath;
        const folderName = firstPath.split('/')[0];
        this.selectedPayload.set(`E:/SOURCE/${folderName}`);
        event.target.value = '';
     }
  }

  injectPayload(): void {
     if (!this.selectedPayload()) return;
     this.analyzeService.addInput({
        type: 'text',
        content: this.selectedPayload(),
        label: 'Payload'
     });
     this.selectedPayload.set('');
  }

  addFilesToStack(): void {
     this.files.forEach(file => {
        this.analyzeService.addInput({
           type: 'text',
           content: `File: ${file.name} (${Math.round(file.size / 1024)} KB)`,
           label: 'Document'
        });
     });
     this.files = [];
  }

  onReject(file: any): void {
     console.warn('Rejected:', file);
  }

  removeFile(file: File): void {
     this.files = this.files.filter(f => f !== file);
  }

  addJiraUrl(): void {
    if (!this.jiraUrl().trim()) return;
    const keyMatch = this.jiraUrl().match(/browse\/([A-Z0-9-]+)/);
    const label = keyMatch ? keyMatch[1] : 'Jira Link';
    
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
      label: task.id
    });
  }

  removeInput(id: string): void {
    this.analyzeService.removeInput(id);
  }

  onExecute(): void {
    this.analyzeService.updatePaths(this.projectPath(), this.savePath());
    this.analyzeService.startAnalysis();
  }
}
