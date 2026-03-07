# Phase 1: MVP - Analyze Module

> **Duration**: 4-5 tuần  
> **Goal**: Hoàn thiện Analyze workflow với 3-board UI, real-time progress, multi-task support  
> **Output**: Working Analyze Module cho Module FE

---

## 🎯 Objectives

1. ✅ Implement **Board 1**: Input Configuration (3 sections)
2. ✅ Implement **Board 2**: Real-time Progress Monitor
3. ✅ Implement **Board 3**: Output File Viewer
4. ✅ Multi-task queue (max 5 tasks)
5. ✅ Real-time WebSocket integration
6. ✅ File copy automation
7. ✅ Dashboard basic stats
8. ✅ Error handling & retry

---

## 📐 UI Design Specification

### Layout Overview

```
┌────────────────────────────────────────────────────────────────────────────┐
│ HEADER                                                                      │
│ [Logo]  Dashboard | Modules | Settings              [User Avatar] [Logout] │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐│
│ │ MODULE: FE DEVELOPER                                                    ││
│ │ Breadcrumb: Dashboard / Modules / FE / Analyze                          ││
│ └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐│
│ │ BOARD 1: INPUT CONFIGURATION                                [Collapse ▼]││
│ ├─────────────────────────────────────────────────────────────────────────┤│
│ │ SECTION A: PATH SELECTION                                               ││
│ │ ┌─────────────────────────────────────────────────────────────────────┐ ││
│ │ │ 📁 Project Directory:  [/home/user/projects/my-app]    [Browse]     │ ││
│ │ │ 📁 Output Directory:   [/home/user/output]            [Browse]     │ ││
│ │ └─────────────────────────────────────────────────────────────────────┘ ││
│ │                                                                         ││
│ │ SECTION B: TASK INPUT                                                   ││
│ │ ┌─────────────────────────────────────────────────────────────────────┐ ││
│ │ │ Type:  ○ Jira Issue  ○ URL  ○ Plain Text                            │ ││
│ │ │ Input: [EMSPRO2-123                           ]  [Add ➕]            │ ││
│ │ │         hoặc                                        hoặc            │ ││
│ │ │       [https://task.ascvn.com.vn/browse/EMSPRO2-123    ]  [Add ➕]   │ ││
│ │ │         hoặc                                                        │ ││
│ │ │       [Implement login feature with OAuth2...               ] [Add ➕]│ ││
│ │ └─────────────────────────────────────────────────────────────────────┘ ││
│ │                                                                         ││
│ │ SECTION C: TASK LIST                                                    ││
│ │ ┌─────────────────────────────────────────────────────────────────────┐ ││
│ │ │ # │ Type      │ Input                                    │ Actions │ ││
│ │ │───│───────────│──────────────────────────────────────────│─────────│ ││
│ │ │ 1 │ Jira      │ EMSPRO2-123 - Login feature              │ 🗑️      │ ││
│ │ │ 2 │ URL       │ https://.../browse/EMSPRO2-124           │ 🗑️      │ ││
│ │ │ 3 │ Text      │ Implement dashboard with 3 boards...     │ 🗑️      │ ││
│ │ └─────────────────────────────────────────────────────────────────────┘ ││
│ │                                                             [START ▶️]  ││
│ └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐│
│ │ BOARD 2: EXECUTION PROGRESS                                [Collapse ▼] ││
│ ├─────────────────────────────────────────────────────────────────────────┤│
│ │ ┌─────────────────────────────────────────────────────────────────────┐ ││
│ │ │ OVERALL PROGRESS                                                    │ ││
│ │ │ ████████████░░░░░░░░  3/5 Tasks (60%)                              │ ││
│ │ │                                                                     │ ││
│ │ │ CURRENT TASK: EMSPRO2-123                                          │ ││
│ │ │ Status: 🟡 Running - Phase: Loading Jira issue...                  │ ││
│ │ │ Progress: ██████████████░░░░ 70%                                   │ ││
│ │ │                                                                     │ ││
│ │ │ LIVE LOGS:                                                         │ ││
│ │ │ ▶ [10:23:45] Starting analysis for EMSPRO2-123                     │ ││
│ │ │ ▶ [10:23:46] Loading Jira issue...                                │ ││
│ │ │ ▶ [10:23:47] Jira issue loaded: Implement login feature           │ ││
│ │ │ ▶ [10:23:48] Running /analyze-task command...                     │ ││
│ │ │ ▶ [10:24:15] Analysis complete. Output saved to temp directory    │ ││
│ │ │ ▶ [10:24:16] Copying files to output directory...                 │ ││
│ │ │ ▶ [10:24:17] ✅ Task completed successfully                       │ ││
│ │ └─────────────────────────────────────────────────────────────────────┘ ││
│ │                                                                         ││
│ │ QUEUE STATUS:                                                          │ ││
│ │ ┌─────────┬──────────┬─────────────────────┬─────────────┬─────────────┐│ ││
│ │ │ #       │ Task     │ Status              │ Progress    │ Actions     ││ ││
│ │ ├─────────┼──────────┼─────────────────────┼─────────────┼─────────────┤│ ││
│ │ │ 1       │ EMS123   │ ✅ Completed        │ 100%        │ View        ││ ││
│ │ │ 2       │ EMS124   │ 🟡 Running          │ 70%         │ Cancel      ││ ││
│ │ │ 3       │ EMS125   │ ⏳ Queued           │ -           │ Remove      ││ ││
│ │ │ 4       │ Custom1  │ ⏳ Queued           │ -           │ Remove      ││ ││
│ │ │ 5       │ Custom2  │ ⏳ Queued           │ -           │ Remove      ││ ││
│ │ └─────────┴──────────┴─────────────────────┴─────────────┴─────────────┘│ ││
│ └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐│
│ │ BOARD 3: OUTPUT VIEWER                                     [Collapse ▼] ││
│ ├─────────────────────────────────────────────────────────────────────────┤│
│ │ [📄 Analysis Report] [📋 Task Spec] [🔧 Technical Details] [📊 JSON]     ││
│ │                                                                         ││
│ │ ┌─────────────────────────────────────────────────────────────────────┐ ││
│ │ │ # Analysis Report for EMSPRO2-123                                   │ ││
│ │ │                                                                     │ ││
│ │ │ ## Executive Summary                                                │ ││
│ │ │ Task: Implement login feature with Jira OAuth2 integration         │ ││
│ │ │ Complexity: Medium                                                  │ ││
│ │ │ Estimated Effort: 3-4 days                                          │ ││
│ │ │                                                                     │ ││
│ │ │ ## Requirements                                                     │ ││
│ │ │ 1. Jira OAuth2 authentication flow                                  │ ││
│ │ │ 2. Token management and refresh                                     │ ││
│ │ │ 3. Protected routes with guards                                     │ ││
│ │ │ ...                                                                 │ ││
│ │ │                                                                     │ ││
│ │ │ ## Technical Approach                                               │ ││
│ │ │ - Use @nestjs/passport for OAuth2 strategy                          │ ││
│ │ │ - Store tokens in httpOnly cookies                                  │ ││
│ │ │ - Implement JWT strategy for API protection                         │ ││
│ │ └─────────────────────────────────────────────────────────────────────┘ ││
│ │                                                                         ││
│ │ [📥 Download] [📋 Copy] [🌐 Open in New Tab]                            ││
│ └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Implementation Breakdown

### Week 1: Board 1 - Input Configuration

#### Task 1.1: Path Selection Component
**File**: `apps/web/src/app/features/modules/fe-module/analyze/components/path-selector/`

```typescript
// path-selector.component.ts
@Component({
  selector: 'app-path-selector',
  templateUrl: './path-selector.component.html',
  styleUrls: ['./path-selector.component.scss']
})
export class PathSelectorComponent {
  @Output() pathsChange = new EventEmitter<PathConfig>();
  
  pathForm = this.fb.group({
    projectPath: ['', Validators.required],
    outputPath: ['', Validators.required]
  });
  
  async browseProjectPath() {
    // Use File System Access API hoặc Electron IPC
    const path = await this.fileService.selectDirectory();
    this.pathForm.patchValue({ projectPath: path });
  }
  
  async browseOutputPath() {
    const path = await this.fileService.selectDirectory();
    this.pathForm.patchValue({ outputPath: path });
  }
}
```

**Features**:
- [ ] Directory browser (File System Access API hoặc native file picker)
- [ ] Path validation (exists, writable)
- [ ] Recent paths dropdown
- [ ] Default path suggestions

#### Task 1.2: Task Input Component
**File**: `apps/web/src/app/features/modules/fe-module/analyze/components/task-input/`

```typescript
// task-input.component.ts
@Component({
  selector: 'app-task-input',
  templateUrl: './task-input.component.html'
})
export class TaskInputComponent {
  @Output() taskAdd = new EventEmitter<TaskInput>();
  
  inputType: 'jira' | 'url' | 'text' = 'jira';
  inputValue = '';
  
  addTask() {
    if (!this.inputValue.trim()) return;
    
    const task: TaskInput = {
      id: uuid(),
      type: this.inputType,
      value: this.inputValue.trim(),
      createdAt: new Date()
    };
    
    this.taskAdd.emit(task);
    this.inputValue = '';
  }
  
  validateInput(): boolean {
    switch (this.inputType) {
      case 'jira':
        return /^[A-Z]+-\d+$/.test(this.inputValue);
      case 'url':
        return this.isValidUrl(this.inputValue);
      case 'text':
        return this.inputValue.length >= 10;
    }
  }
}
```

**Features**:
- [ ] Radio buttons chọn type (Jira/URL/Text)
- [ ] Input validation theo type
- [ ] Add button (disabled nếu invalid)
- [ ] Hint text cho mỗi type

#### Task 1.3: Task List Component
**File**: `apps/web/src/app/features/modules/fe-module/analyze/components/task-list/`

```typescript
// task-list.component.ts
@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html'
})
export class TaskListComponent {
  @Input() tasks: TaskInput[] = [];
  @Output() taskRemove = new EventEmitter<string>();
  @Output() tasksReorder = new EventEmitter<TaskInput[]>();
  @Output() startAnalysis = new EventEmitter<void>();
  
  maxTasks = 5;
  
  canAddMore(): boolean {
    return this.tasks.length < this.maxTasks;
  }
  
  removeTask(taskId: string) {
    this.taskRemove.emit(taskId);
  }
  
  drop(event: CdkDragDrop<TaskInput[]>) {
    moveItemInArray(this.tasks, event.previousIndex, event.currentIndex);
    this.tasksReorder.emit(this.tasks);
  }
  
  getTaskDisplay(task: TaskInput): string {
    switch (task.type) {
      case 'jira':
        return task.value;
      case 'url':
        return this.truncateUrl(task.value);
      case 'text':
        return this.truncateText(task.value, 50);
    }
  }
}
```

**Features**:
- [ ] Table hiển thị tasks
- [ ] Drag & drop reorder (CDK)
- [ ] Remove button mỗi row
- [ ] Max 5 tasks validation
- [ ] Start button (disabled nếu no tasks)

#### Task 1.4: Board 1 Integration
**File**: `apps/web/src/app/features/modules/fe-module/analyze/components/board1/`

```typescript
// board1.component.ts
@Component({
  selector: 'app-analyze-board1',
  templateUrl: './board1.component.html'
})
export class AnalyzeBoard1Component {
  @Output() analysisStart = new EventEmitter<AnalysisConfig>();
  
  pathConfig: PathConfig | null = null;
  tasks: TaskInput[] = [];
  
  onPathsChange(config: PathConfig) {
    this.pathConfig = config;
  }
  
  onTaskAdd(task: TaskInput) {
    if (this.tasks.length >= 5) {
      this.snackBar.open('Maximum 5 tasks allowed', 'Close');
      return;
    }
    this.tasks = [...this.tasks, task];
  }
  
  onTaskRemove(taskId: string) {
    this.tasks = this.tasks.filter(t => t.id !== taskId);
  }
  
  onStart() {
    if (!this.pathConfig || this.tasks.length === 0) return;
    
    this.analysisStart.emit({
      paths: this.pathConfig,
      tasks: this.tasks
    });
  }
}
```

**Deliverables Week 1**:
- [ ] Board 1 UI hoàn chỉnh
- [ ] Form validation hoạt động
- [ ] Task list management (add/remove/reorder)
- [ ] Path browser integration

---

### Week 2: Board 2 - Real-time Progress

#### Task 2.1: Queue Status Service
**File**: `apps/web/src/app/core/services/queue-status.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class QueueStatusService {
  private tasks = new BehaviorSubject<QueueTask[]>([]);
  tasks$ = this.tasks.asObservable();
  
  constructor(private ws: WebsocketService) {
    this.setupWebSocketListeners();
  }
  
  private setupWebSocketListeners() {
    // Listen for task progress updates
    this.ws.on<TaskProgress>('task:progress').subscribe(progress => {
      this.updateTaskProgress(progress);
    });
    
    // Listen for task completion
    this.ws.on<TaskComplete>('task:complete').subscribe(result => {
      this.markTaskComplete(result);
    });
    
    // Listen for task errors
    this.ws.on<TaskError>('task:error').subscribe(error => {
      this.markTaskError(error);
    });
  }
  
  startTasks(config: AnalysisConfig): Observable<void> {
    return this.http.post<void>('/api/tasks/analyze/batch', config);
  }
  
  cancelTask(taskId: string): Observable<void> {
    return this.http.post<void>(`/api/tasks/${taskId}/cancel`);
  }
  
  private updateTaskProgress(progress: TaskProgress) {
    const current = this.tasks.value;
    const updated = current.map(t => 
      t.id === progress.taskId ? { ...t, progress } : t
    );
    this.tasks.next(updated);
  }
}
```

#### Task 2.2: Progress Monitor Component
**File**: `apps/web/src/app/features/modules/fe-module/analyze/components/progress-monitor/`

```typescript
// progress-monitor.component.ts
@Component({
  selector: 'app-progress-monitor',
  templateUrl: './progress-monitor.component.html'
})
export class ProgressMonitorComponent implements OnDestroy {
  @Input() tasks: QueueTask[] = [];
  
  overallProgress$ = this.calculateOverallProgress();
  currentTask$ = this.getCurrentRunningTask();
  logs$ = this.logService.logs$;
  
  private destroy$ = new Subject<void>();
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  getTaskStatusIcon(status: TaskStatus): string {
    switch (status) {
      case 'queued': return '⏳';
      case 'running': return '🟡';
      case 'completed': return '✅';
      case 'failed': return '❌';
      case 'cancelled': return '🚫';
    }
  }
  
  onCancelTask(taskId: string) {
    this.queueService.cancelTask(taskId).subscribe();
  }
}
```

**Features**:
- [ ] Overall progress bar
- [ ] Current task indicator
- [ ] Live logs stream (auto-scroll)
- [ ] Queue status table
- [ ] Cancel action cho running tasks

#### Task 2.3: Log Stream Component
**File**: `apps/web/src/app/features/modules/fe-module/analyze/components/log-stream/`

```typescript
// log-stream.component.ts
@Component({
  selector: 'app-log-stream',
  templateUrl: './log-stream.component.html'
})
export class LogStreamComponent implements AfterViewChecked {
  @Input() logs: LogEntry[] = [];
  @ViewChild('logContainer') logContainer!: ElementRef;
  
  autoScroll = true;
  
  ngAfterViewChecked() {
    if (this.autoScroll) {
      this.scrollToBottom();
    }
  }
  
  private scrollToBottom() {
    const container = this.logContainer.nativeElement;
    container.scrollTop = container.scrollHeight;
  }
  
  getLogColor(level: LogLevel): string {
    switch (level) {
      case 'info': return '#2196F3';
      case 'success': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'error': return '#F44336';
      default: return '#666';
    }
  }
  
  formatTimestamp(timestamp: Date): string {
    return new Date(timestamp).toLocaleTimeString();
  }
}
```

**Features**:
- [ ] Auto-scroll to bottom
- [ ] Pause scroll on user interaction
- [ ] Color-coded log levels
- [ ] Timestamp display
- [ ] Filter by log level

#### Task 2.4: Board 2 Integration
**File**: `apps/web/src/app/features/modules/fe-module/analyze/components/board2/`

```typescript
// board2.component.ts
@Component({
  selector: 'app-analyze-board2',
  templateUrl: './board2.component.html'
})
export class AnalyzeBoard2Component {
  @Input() isRunning = false;
  
  tasks$ = this.queueService.tasks$;
  
  trackByTaskId(index: number, task: QueueTask): string {
    return task.id;
  }
}
```

**Deliverables Week 2**:
- [ ] Real-time progress updates via WebSocket
- [ ] Overall progress calculation
- [ ] Live logs stream
- [ ] Queue management (cancel/remove)
- [ ] Visual indicators for task status

---

### Week 3: Board 3 - Output Viewer

#### Task 3.1: File Viewer Service
**File**: `apps/web/src/app/core/services/file-viewer.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class FileViewerService {
  constructor(private http: HttpClient) {}
  
  loadOutputFiles(taskId: string): Observable<OutputFile[]> {
    return this.http.get<OutputFile[]>(`/api/tasks/${taskId}/output`);
  }
  
  loadFileContent(taskId: string, filename: string): Observable<string> {
    return this.http.get(`/api/tasks/${taskId}/output/${filename}`, {
      responseType: 'text'
    });
  }
  
  downloadFile(taskId: string, filename: string): Observable<Blob> {
    return this.http.get(`/api/tasks/${taskId}/output/${filename}/download`, {
      responseType: 'blob'
    });
  }
}
```

#### Task 3.2: Markdown Viewer Component
**File**: `apps/web/src/app/shared/components/markdown-viewer/`

```typescript
// markdown-viewer.component.ts
@Component({
  selector: 'app-markdown-viewer',
  templateUrl: './markdown-viewer.component.html'
})
export class MarkdownViewerComponent {
  @Input() content = '';
  
  compiledMarkdown$ = this.compileMarkdown();
  
  private compileMarkdown(): Observable<SafeHtml> {
    return of(this.content).pipe(
      map(content => {
        // Use marked.js hoặc similar library
        const html = marked(content, {
          highlight: (code, lang) => {
            return hljs.highlight(code, { language: lang }).value;
          }
        });
        return this.sanitizer.bypassSecurityTrustHtml(html);
      })
    );
  }
}
```

#### Task 3.3: Output File Tabs
**File**: `apps/web/src/app/features/modules/fe-module/analyze/components/output-tabs/`

```typescript
// output-tabs.component.ts
@Component({
  selector: 'app-output-tabs',
  templateUrl: './output-tabs.component.html'
})
export class OutputTabsComponent {
  @Input() taskId: string | null = null;
  
  tabs: TabConfig[] = [
    { id: 'analysis', label: '📄 Analysis Report', icon: 'description' },
    { id: 'spec', label: '📋 Task Spec', icon: 'assignment' },
    { id: 'technical', label: '🔧 Technical Details', icon: 'code' },
    { id: 'json', label: '📊 JSON', icon: 'data_object' }
  ];
  
  activeTab = 'analysis';
  fileContent$ = this.loadActiveTabContent();
  
  selectTab(tabId: string) {
    this.activeTab = tabId;
    this.fileContent$ = this.loadActiveTabContent();
  }
  
  private loadActiveTabContent(): Observable<string> {
    if (!this.taskId) return of('');
    
    const filename = this.getFilenameForTab(this.activeTab);
    return this.fileService.loadFileContent(this.taskId, filename);
  }
  
  private getFilenameForTab(tabId: string): string {
    const map: Record<string, string> = {
      analysis: 'ANALYSIS.md',
      spec: 'TASK.md',
      technical: 'TECHNICAL.md',
      json: 'TASK.json'
    };
    return map[tabId];
  }
}
```

**Features**:
- [ ] Tab navigation cho từng file type
- [ ] Markdown rendering with syntax highlighting
- [ ] JSON viewer with collapsible sections
- [ ] Download button cho mỗi file
- [ ] Copy to clipboard
- [ ] Open in new tab

#### Task 3.4: Board 3 Integration
**File**: `apps/web/src/app/features/modules/fe-module/analyze/components/board3/`

```typescript
// board3.component.ts
@Component({
  selector: 'app-analyze-board3',
  templateUrl: './board3.component.html'
})
export class AnalyzeBoard3Component {
  @Input() completedTasks: QueueTask[] = [];
  
  selectedTaskId: string | null = null;
  
  selectTask(taskId: string) {
    this.selectedTaskId = taskId;
  }
}
```

**Deliverables Week 3**:
- [ ] File browser cho completed tasks
- [ ] Markdown/HTML/JSON viewers
- [ ] Download & copy functionality
- [ ] Tab-based navigation

---

### Week 4: Integration & Polish

#### Task 4.1: Analyze Page Integration
**File**: `apps/web/src/app/features/modules/fe-module/analyze/analyze.component.ts`

```typescript
// analyze.component.ts
@Component({
  selector: 'app-analyze',
  templateUrl: './analyze.component.html'
})
export class AnalyzeComponent {
  // State machine
  viewState: 'input' | 'running' | 'completed' = 'input';
  
  // Board visibility
  showBoard1 = true;
  showBoard2 = false;
  showBoard3 = false;
  
  onAnalysisStart(config: AnalysisConfig) {
    this.viewState = 'running';
    this.showBoard2 = true;
    
    this.queueService.startTasks(config).subscribe({
      next: () => {
        // Tasks queued successfully
      },
      error: (err) => {
        this.snackBar.open(`Failed to start: ${err.message}`, 'Close');
        this.viewState = 'input';
      }
    });
    
    // Listen for completion
    this.queueService.allTasksComplete$.subscribe(() => {
      this.viewState = 'completed';
      this.showBoard3 = true;
    });
  }
}
```

#### Task 4.2: Error Handling & Retry
```typescript
// error-handler.service.ts
@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  handleTaskError(error: TaskError): Observable<void> {
    const dialogRef = this.dialog.open(ErrorDialogComponent, {
      data: {
        title: 'Task Failed',
        message: error.message,
        details: error.details,
        actions: ['retry', 'skip', 'cancel']
      }
    });
    
    return dialogRef.afterClosed().pipe(
      switchMap(action => {
        switch (action) {
          case 'retry':
            return this.retryTask(error.taskId);
          case 'skip':
            return this.skipTask(error.taskId);
          default:
            return throwError(() => error);
        }
      })
    );
  }
}
```

#### Task 4.3: Dashboard Stats
```typescript
// dashboard-stats.component.ts
@Component({
  selector: 'app-dashboard-stats',
  templateUrl: './dashboard-stats.component.html'
})
export class DashboardStatsComponent {
  stats$ = this.statsService.getTodayStats();
  
  cards = [
    { title: 'Tasks Analyzed', icon: 'analytics', color: 'primary' },
    { title: 'Success Rate', icon: 'check_circle', color: 'success' },
    { title: 'Avg Duration', icon: 'timer', color: 'accent' },
    { title: 'In Queue', icon: 'queue', color: 'warn' }
  ];
}
```

#### Task 4.4: Testing & Bug Fixes
**Testing Checklist**:
- [ ] Unit tests cho components
- [ ] Integration tests cho API calls
- [ ] E2E tests cho complete workflow
- [ ] Error scenarios (network failure, invalid inputs)
- [ ] Performance tests (5 tasks concurrent)
- [ ] Cross-browser testing

**Deliverables Week 4**:
- [ ] Complete integration của 3 boards
- [ ] Error handling & retry mechanism
- [ ] Dashboard with basic stats
- [ ] All tests passing
- [ ] Documentation

---

## 📊 Backend Implementation

### API Endpoints

```typescript
// tasks.controller.ts
@Controller('tasks')
export class TasksController {
  
  @Post('analyze/batch')
  async startBatchAnalysis(
    @Body() config: AnalysisConfig,
    @Req() req: AuthenticatedRequest
  ): Promise<BatchResult> {
    return this.tasksService.startBatchAnalysis(config, req.user);
  }
  
  @Get(':id/output')
  async getOutputFiles(
    @Param('id') taskId: string
  ): Promise<OutputFile[]> {
    return this.tasksService.getOutputFiles(taskId);
  }
  
  @Get(':id/output/:filename')
  async getOutputFileContent(
    @Param('id') taskId: string,
    @Param('filename') filename: string
  ): Promise<string> {
    return this.tasksService.getOutputFileContent(taskId, filename);
  }
  
  @Post(':id/cancel')
  async cancelTask(
    @Param('id') taskId: string
  ): Promise<void> {
    return this.tasksService.cancelTask(taskId);
  }
}
```

### Queue Processor Implementation

```typescript
// queue.processor.ts
@Processor('tasks')
export class TasksProcessor {
  private readonly logger = new Logger(TasksProcessor.name);
  
  @Process('analyze')
  async handleAnalyze(job: Job<AnalyzeJobData>) {
    const { taskId, input, paths } = job.data;
    
    try {
      // Update status
      await this.updateTaskStatus(taskId, TaskStatus.RUNNING);
      
      // Prepare command arguments
      const args = this.buildAnalyzeArgs(input, paths);
      
      // Spawn opencode process
      const process = this.opencodeService.spawnProcess('/analyze-task', args);
      
      // Stream progress
      process.stdout.on('data', (data) => {
        const log = data.toString();
        this.websocket.emitLog(taskId, log);
        this.logger.debug(`[${taskId}] ${log}`);
      });
      
      // Wait for completion
      await new Promise((resolve, reject) => {
        process.on('close', (code) => {
          if (code === 0) {
            resolve(code);
          } else {
            reject(new Error(`Process exited with code ${code}`));
          }
        });
      });
      
      // Copy output files
      await this.copyOutputFiles(taskId, paths.outputPath);
      
      // Mark complete
      await this.updateTaskStatus(taskId, TaskStatus.COMPLETED);
      this.websocket.emitComplete(taskId);
      
    } catch (error) {
      this.logger.error(`Task ${taskId} failed:`, error);
      await this.updateTaskStatus(taskId, TaskStatus.FAILED, error.message);
      this.websocket.emitError(taskId, error);
      throw error;
    }
  }
  
  private buildAnalyzeArgs(input: TaskInput, paths: PathConfig): string[] {
    const args = [
      '--project-path', paths.projectPath,
      '--output-path', paths.outputPath,
    ];
    
    switch (input.type) {
      case 'jira':
        args.push('--jira-key', input.value);
        break;
      case 'url':
        args.push('--url', input.value);
        break;
      case 'text':
        args.push('--text', input.value);
        break;
    }
    
    return args;
  }
}
```

---

## 🎨 UI/UX Specifications

### Color Scheme
```scss
// Primary colors
$primary: #1976d2;
$accent: #e91e63;
$warn: #f44336;

// Status colors
$status-queued: #9e9e9e;
$status-running: #ff9800;
$status-completed: #4caf50;
$status-failed: #f44336;

// Background
$bg-primary: #fafafa;
$bg-card: #ffffff;
```

### Responsive Breakpoints
- Mobile: < 768px (single column boards)
- Tablet: 768px - 1024px (stacked boards)
- Desktop: > 1024px (full 3-board layout)

### Animation Specifications
- Board collapse/expand: 300ms ease-in-out
- Progress bar updates: 200ms ease
- Toast notifications: slide in 300ms, auto-dismiss 5000ms
- Tab switching: 150ms fade

---

## ✅ Acceptance Criteria

### Functional
- [ ] User có thể input 1-5 tasks (Jira/URL/Text)
- [ ] User có thể chọn project và output paths
- [ ] Tasks được execute đúng thứ tự
- [ ] Real-time progress hiển thị chính xác
- [ ] Output files được copy đúng location
- [ ] User có thể view output files trong app
- [ ] User có thể download/copy output files

### Non-Functional
- [ ] Page load < 3s
- [ ] WebSocket connect < 1s
- [ ] Progress updates < 100ms latency
- [ ] Support 5 concurrent tasks
- [ ] Graceful error handling
- [ ] Mobile responsive

---

## 🚀 Phase 1 Completion Criteria

✅ **Definition of Done**:
1. Tất cả 3 boards hoạt động đúng flow
2. User có thể chạy analyze workflow end-to-end
3. Real-time updates hoạt động ổn định
4. Error handling đầy đủ
5. Tests pass > 80%
6. Documentation hoàn chỉnh

**Sau Phase 1**: Sẵn sàng cho beta testing với FE Developers

---

**Phase Owner**: Solo Developer  
**Estimated Effort**: 160-200 hours  
**Dependencies**: Phase 0 (Foundation) hoàn thành
