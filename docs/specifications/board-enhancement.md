# 📋 Specification: Board 1-2-3 Enhancement

> **Project**: System Architect OpenCode  
> **Version**: 1.0  
> **Date**: March 9, 2026  
> **Status**: Draft  
> **Author**: System Architect Agent

---

## 1. Overview

### 1.1 Purpose

This specification defines enhancements for Board 1 (Task Input), Board 2 (Progress Monitor), and Board 3 (Output Viewer) of the Analyze module, based on root-opencode patterns and user feedback.

### 1.2 Current Issues

| Board | Issue | Priority |
|-------|-------|----------|
| Board 1 | Hardcoded paths | HIGH |
| Board 1 | Mock Jira tasks | HIGH |
| Board 2 | Manual progress calculation | MEDIUM |
| Board 2 | Missing event timeline | MEDIUM |
| Board 3 | Export not implemented | HIGH |
| Board 3 | Adopt Solution not implemented | HIGH |
| Service | Debug mode hardcoded | LOW |

---

## 2. Board 1: Task Input Enhancement

### 2.1 Remove Hardcoded Paths

**Current**:
```typescript
projectPath = signal('E:/SOURCE/ems.finance.fe');
savePath = signal('E:/SOURCE/ems.finance.fe/analyze-reports');
```

**Proposed**:
```typescript
projectPath = signal('');
savePath = signal('');

// Auto-detect from current working directory
constructor() {
  this.detectWorkingDirectory();
}

private detectWorkingDirectory() {
  // Get current directory from OpenCode context or localStorage
  const saved = localStorage.getItem('lastProjectPath');
  if (saved) {
    this.projectPath.set(saved);
    this.savePath.set(`${saved}/analyze-reports`);
  }
}
```

### 2.2 Add Folder Picker

**New Component**: `folder-picker.component.ts`

```typescript
@Component({
  selector: 'app-folder-picker',
  standalone: true,
  template: `
    <button class="folder-btn" (click)="openFolderDialog()">
      <span class="material-icons-outlined">folder_open</span>
      <span>Browse</span>
    </button>
  `
})
export class FolderPickerComponent {
  private analyzeService = inject(AnalyzeService);
  
  async openFolderDialog() {
    // Use OpenCode file picker or native dialog
    const result = await this.analyzeService.selectFolder();
    return result;
  }
}
```

### 2.3 Integrate Real Jira MCP

**Current**: Mock tasks
**Proposed**: Use Jira MCP tools

```typescript
// In analyze.service.ts - add Jira integration
import { jiraApi } from '../../../core/services/jira-api.service';

async searchJiraTasks(query: string): Promise<JiraTask[]> {
  // Use Jira MCP: jira-server_jira_search_issues
  const results = await jiraApi.searchIssues(`text ~ "${query}"`);
  return results.map(issue => ({
    id: issue.key,
    title: issue.fields.summary,
    status: issue.fields.status.name,
    assignee: issue.fields.assignee?.displayName
  }));
}

async getJiraTaskDetails(taskId: string): Promise<JiraTaskDetail> {
  // Use Jira MCP: jira-server_jira_get_issue
  const issue = await jiraApi.getIssue(taskId);
  return {
    key: issue.key,
    summary: issue.fields.summary,
    description: issue.fields.description,
    status: issue.fields.status.name,
    priority: issue.fields.priority.name,
    assignee: issue.fields.assignee?.displayName,
    reporter: issue.fields.reporter?.displayName,
    created: issue.fields.created,
    updated: issue.fields.updated,
    labels: issue.fields.labels
  };
}
```

### 2.4 Enhanced Input Validation

```typescript
interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

validatePaths(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check project path exists
  if (!this.projectPath().trim()) {
    errors.push('Project path is required');
  } else if (!this.isValidPath(this.projectPath())) {
    errors.push('Invalid project path format');
  }
  
  // Check save path is writable
  if (!this.savePath().trim()) {
    errors.push('Save path is required');
  }
  
  // Warnings
  if (!this.inputs().length) {
    warnings.push('No input units staged');
  }
  
  return { valid: errors.length === 0, errors, warnings };
}
```

---

## 3. Board 2: Progress Monitor Enhancement

### 3.1 Automatic Progress Calculation

**Current**: Manual increment
```typescript
this._state.update(s => ({ ...s, progress: Math.min(s.progress + 1, 95) }));
```

**Proposed**: Event-based calculation

```typescript
interface ProgressConfig {
  phase: string;
  minProgress: number;
  maxProgress: number;
  weight: number;
}

const PROGRESS_PHASES: ProgressConfig[] = [
  { phase: 'skill-init', minProgress: 0, maxProgress: 10, weight: 0.10 },
  { phase: 'quick-start', minProgress: 10, maxProgress: 20, weight: 0.10 },
  { phase: 'classification', minProgress: 20, maxProgress: 30, weight: 0.10 },
  { phase: 'business-analysis', minProgress: 30, maxProgress: 45, weight: 0.15 },
  { phase: 'tech-spec', minProgress: 45, maxProgress: 60, weight: 0.15 },
  { phase: 'estimation', minProgress: 60, maxProgress: 70, weight: 0.10 },
  { phase: 'impact-risk', minProgress: 70, maxProgress: 85, weight: 0.15 },
  { phase: 'actionable-items', minProgress: 85, maxProgress: 95, weight: 0.10 },
  { phase: 'preflight', minProgress: 95, maxProgress: 100, weight: 0.05 }
];

calculateProgress(phase: string): number {
  const config = PROGRESS_PHASES.find(p => p.phase === phase);
  if (!config) return 0;
  
  const current = this._state().progress;
  if (current < config.maxProgress) {
    // Animate within phase
    return Math.min(current + (config.maxProgress - config.minProgress) * 0.1, config.maxProgress);
  }
  return current;
}
```

### 3.2 Event Timeline View

**New Feature**: Visual timeline of all events

```typescript
interface TimelineEvent {
  id: string;
  timestamp: Date;
  type: 'reasoning' | 'tool' | 'permission' | 'question' | 'status';
  title: string;
  details: string;
  duration?: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

@Component({
  selector: 'app-timeline-view',
  template: `
    <div class="timeline-container">
      @for (event of timelineEvents(); track event.id) {
        <div class="timeline-item" [class]="event.status">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <span class="timeline-title">{{ event.title }}</span>
            <span class="timeline-time">{{ event.timestamp | date:'HH:mm:ss' }}</span>
          </div>
        </div>
      }
    </div>
  `
})
export class TimelineViewComponent {
  timelineEvents = signal<TimelineEvent[]>([]);
  
  addEvent(event: TimelineEvent) {
    this.timelineEvents.update(events => [...events, event]);
  }
}
```

### 3.3 Enhanced Debug Mode

**Current**: Hardcoded `true`
**Proposed**: Configurable via environment or service

```typescript
// In environment.ts
export const environment = {
  production: false,
  debugMode: true,  // Enable debug logs
  debugLevel: 'verbose' // 'minimal' | 'normal' | 'verbose'
};

// In analyze.service.ts
private readonly debugEnabled = environment.debugMode;
private readonly debugLevel = environment.debugLevel;

private debugLog(msg: string, data?: any) {
  if (!this.debugEnabled) return;
  
  if (this.debugLevel === 'verbose') {
    console.log(`[BOARD2-DEBUG] ${msg}`, data);
  } else if (this.debugLevel === 'normal' && data) {
    console.log(`[BOARD2] ${msg}`);
  }
}
```

---

## 4. Board 3: Output Viewer Enhancement

### 4.1 Implement Export Function

**Current**: Button not functional
**Proposed**: Export to file

```typescript
interface ExportOptions {
  format: 'markdown' | 'json' | 'pdf';
  filename?: string;
  includeMetadata?: boolean;
}

async exportResult(options: ExportOptions): Promise<void> {
  const { format, filename, includeMetadata } = options;
  const result = this.result();
  
  let content: string;
  let mimeType: string;
  let extension: string;
  
  switch (format) {
    case 'markdown':
      content = result;
      mimeType = 'text/markdown';
      extension = 'md';
      break;
    case 'json':
      content = JSON.stringify({
        result,
        metadata: includeMetadata ? this.getMetadata() : null,
        exportedAt: new Date().toISOString()
      }, null, 2);
      mimeType = 'application/json';
      extension = 'json';
      break;
    case 'pdf':
      // Use browser print or PDF library
      content = await this.convertToPDF(result);
      mimeType = 'application/pdf';
      extension = 'pdf';
      break;
  }
  
  // Trigger download
  this.downloadFile(content, filename || `analysis-report.${extension}`, mimeType);
}

private downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

### 4.2 Implement Adopt Solution

**Current**: Button not functional
**Proposed**: Create task from analysis

```typescript
interface AdoptOptions {
  action: 'create-task' | 'create-branch' | 'create-pr';
  targetProject?: string;
}

async adoptSolution(options: AdoptOptions): Promise<void> {
  const result = this.result();
  const parsed = this.parseAnalysisResult(result);
  
  switch (options case 'create-task.action) {
   ':
      // Create Jira task from analysis
      await this.createJiraTask(parsed);
      break;
    case 'create-branch':
      // Create Git branch
      await this.createGitBranch(parsed);
      break;
    case 'create-pr':
      // Create Pull Request
      await this.createPullRequest(parsed);
      break;
  }
}

private parseAnalysisResult(result: string): ParsedAnalysis {
  // Parse markdown result to extract:
  // - Summary
  // - Complexity/Risk
  // - Requirements
  // - Tech Spec
  // - Action Items
  // Use regex or markdown parser
}
```

### 4.3 Enhanced Markdown Rendering

**Current**: Simple `<pre>` tag
**Proposed**: Rich markdown viewer

```typescript
// Install: npm install marked
import { marked } from 'marked';

@Component({
  selector: 'app-markdown-viewer',
  template: `
    <div class="markdown-body" [innerHTML]="renderedContent()"></div>
  `
})
export class MarkdownViewerComponent {
  private readonly sanitizer = inject(DomSanitizer);
  
  @Input() content = '';
  
  renderedContent(): SafeHtml {
    const html = marked.parse(this.content);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
```

---

## 5. Service Layer Enhancement

### 5.1 Add Environment Configuration

```typescript
interface AnalyzeConfig {
  apiUrl: string;
  debugEnabled: boolean;
  debugLevel: 'minimal' | 'normal' | 'verbose';
  defaultProjectPath: string;
  defaultSavePath: string;
  jiraEnabled: boolean;
}

const DEFAULT_CONFIG: AnalyzeConfig = {
  apiUrl: '/api/opencode',
  debugEnabled: false,
  debugLevel: 'normal',
  defaultProjectPath: '',
  defaultSavePath: '',
  jiraEnabled: true
};

@Injectable({ providedIn: 'root' })
export class AnalyzeConfigService {
  private config = signal<AnalyzeConfig>(DEFAULT_CONFIG);
  
  get(): AnalyzeConfig {
    return this.config();
  }
  
  update(partial: Partial<AnalyzeConfig>): void {
    this.config.update(c => ({ ...c, ...partial }));
  }
}
```

### 5.2 Add Error Handling

```typescript
interface ErrorDetails {
  code: string;
  message: string;
  timestamp: Date;
  context: string;
  recoverable: boolean;
}

handleError(error: any): ErrorDetails {
  let details: ErrorDetails;
  
  if (error.status === 401) {
    details = {
      code: 'AUTH_REQUIRED',
      message: 'Please authenticate with OpenCode',
      timestamp: new Date(),
      context: 'session-create',
      recoverable: true
    };
  } else if (error.status === 0) {
    details = {
      code: 'NETWORK_ERROR',
      message: 'Unable to connect to OpenCode server',
      timestamp: new Date(),
      context: 'api-call',
      recoverable: true
    };
  } else {
    details = {
      code: 'UNKNOWN',
      message: error.message || 'An unexpected error occurred',
      timestamp: new Date(),
      context: 'unknown',
      recoverable: false
    };
  }
  
  this.addLog(`[ERROR] ${details.code}: ${details.message}`);
  return details;
}
```

---

## 6. Implementation Phases

### Phase 1: Foundation ✅ COMPLETED
- [x] Add environment configuration
- [x] Fix hardcoded paths
- [x] Add folder picker

### Phase 2: Board 2 Enhancement ✅ COMPLETED
- [x] Auto progress calculation (PROGRESS_PHASES config)
- [x] Timeline view (TimelineEvent interface)
- [x] Configurable debug mode (environment.analyze.debugLevel)

### Phase 3: Board 3 Enhancement ✅ COMPLETED
- [x] Markdown rendering (enhanced preview)
- [x] Export functionality (markdown, json, pdf)
- [x] Adopt Solution (create-task, create-branch, create-pr)

### Phase 4: Integration (Pending)
- [ ] Real Jira MCP integration
- [ ] Error handling improvements
- [ ] Testing

---

## 7. Files Modified

| File | Changes | Status |
|------|---------|--------|
| `src/environments/environment.ts` | Added analyze config (debugEnabled, debugLevel, autoDetectWorkingDirectory) | ✅ |
| `src/app/.../analyze/analyze.service.ts` | Added PROGRESS_PHASES, timeline events, validation, path auto-detect | ✅ |
| `src/app/.../analyze/board1-input/task-input.component.ts` | Removed hardcoded paths, added folder picker buttons | ✅ |
| `src/app/.../analyze/board3-output/output-viewer.component.ts` | Added export and adopt solution functionality | ✅ |

---

## 8. Open Questions

1. **Export formats**: Should we support PDF? (Requires additional library)
2. **Jira connection**: Use existing MCP or create new service?
3. **Adoption actions**: Which actions should be available by default?

---

**Status**: Phase 1-3 COMPLETED | Phase 4 PENDING
**Last Updated**: March 9, 2026
