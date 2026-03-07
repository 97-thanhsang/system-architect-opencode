# Phase 3: Advanced Features

> **Duration**: 4-6 tuần  
> **Goal**: Nâng cao trải nghiệm với dashboard, reporting, analytics  
> **Output**: Production-ready platform với advanced features

---

## 🎯 Objectives

1. ✅ **Dashboard Jira Full Integration** (My Tasks + Sprint Board + Stats)
2. ✅ **Advanced Reporting** (PDF/HTML export, scheduled reports)
3. ✅ **Multi-task Enhancements** (Batch operations, templates)
4. ✅ **Analytics & Insights** (Performance metrics, trends)
5. ✅ **Review Module** (Code review integration)
6. ✅ **Notifications** (Email, in-app, webhook)
7. ✅ **Collaboration Features** (Comments, sharing)

---

## 📐 Dashboard Specifications

### Full Dashboard Layout

```
┌────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Dashboard | Analytics | Reports | Settings                        │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐│
│ │ QUICK STATS CARDS                                                      ││
│ │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    ││
│ │ │ Tasks Today  │ │ Success Rate │ │ Avg Duration │ │ In Progress  │    ││
│ │ │     15       │ │    92%       │ │   4m 32s     │ │      3       │    ││
│ │ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘    ││
│ └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│ ┌────────────────────────────────────────────────────────┬───────────────┐│
│ │ MY TASKS (Jira Integration)                            │   SPRINT      ││
│ │ ┌──────────────────────────────────────────────────┐   │   BOARD       ││
│ │ │ Filter: [All ▼] Search: [________] [🔍]          │   │ ┌───────────┐ ││
│ │ ├──────────────────────────────────────────────────┤   │ │  SPRINT   │ ││
│ │ │ [🔴 High] EMSPRO2-123 - Login feature     [▶️]   │   │ │   23      │ ││
│ │ │ [🟡 Med]  EMSPRO2-124 - Dashboard widget  [▶️]   │   │ │   days    │ ││
│ │ │ [🟢 Low]  EMSPRO2-125 - Dark mode         [▶️]   │   │ │  left     │ ││
│ │ │ [🔴 High] EMSPRO2-126 - API integration   [▶️]   │   │ └───────────┘ ││
│ │ │                                                  │   │               ││
│ │ │ [Load More...]                                   │   │ KANBAN BOARD  ││
│ │ └──────────────────────────────────────────────────┘   │ ┌───┬───┬───┐ ││
│ │                                                         │ │To │In │Done│ ││
│ │ WORKFLOW EXECUTION STATUS                               │ │Do │Prog│   │ ││
│ │ ┌──────────────────────────────────────────────────┐   │ ├───┼───┼───┤ ││
│ │ │ Pipeline: Feature Login Flow                     │   │ │ 3 │ 5 │ 12│ ││
│ │ │ ████████████████████████████████░░░░░░ 80%       │   │ └───┴───┴───┘ ││
│ │ │ Step: Execute (3/4) - Current file: auth.service │   │               ││
│ │ │                                                  │   │ [View Board]  ││
│ │ │ [View Details] [Pause] [Cancel]                  │   │               ││
│ │ └──────────────────────────────────────────────────┘   └───────────────┘│
│ └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐│
│ │ PERFORMANCE CHARTS                                                     ││
│ │ ┌──────────────────────────┐  ┌──────────────────────────┐             ││
│ │ │ Tasks Over Time          │  │ Success Rate Trend       │             ││
│ │ │ 📈 Line Chart            │  │ 📊 Bar Chart             │             ││
│ │ │ Last 30 days             │  │ By workflow type         │             ││
│ │ └──────────────────────────┘  └──────────────────────────┘             ││
│ │ ┌──────────────────────────┐  ┌──────────────────────────┐             ││
│ │ │ Duration Distribution    │  │ Module Usage             │             ││
│ │ │ 📊 Histogram             │  │ 🥧 Pie Chart             │             ││
│ │ │ Average: 4m 32s          │  │ Analyze: 45%             │             ││
│ │ └──────────────────────────┘  └──────────────────────────┘             ││
│ └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐│
│ │ RECENT ACTIVITY                                                         ││
│ │ ▶ 10:45 AM - Completed: EMSPRO2-123 - Login feature                    ││
│ │ ▶ 10:30 AM - Started: EMSPRO2-124 - Dashboard widget                   ││
│ │ ▶ 10:15 AM - Generated report: Weekly Summary                          ││
│ │ ▶ 09:45 AM - Completed: EMSPRO2-122 - API integration                  ││
│ │ [View All Activity]                                                     ││
│ └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Implementation Tasks

### Week 1-2: Jira Dashboard Integration

#### Task 3.1: My Tasks Component
```typescript
// my-tasks.component.ts
@Component({
  selector: 'app-my-tasks',
  templateUrl: './my-tasks.component.html'
})
export class MyTasksComponent {
  tasks$ = this.jiraService.getMyIssues();
  
  filters = {
    status: 'all',
    priority: 'all',
    search: ''
  };
  
  filteredTasks$ = this.tasks$.pipe(
    map(tasks => this.applyFilters(tasks, this.filters))
  );
  
  onRunWorkflow(issueKey: string) {
    this.router.navigate(['/modules/fe/analyze'], {
      queryParams: { jiraKey: issueKey }
    });
  }
  
  onViewInJira(issueKey: string) {
    window.open(`https://task.ascvn.com.vn/browse/${issueKey}`, '_blank');
  }
}
```

#### Task 3.2: Sprint Board Component
```typescript
// sprint-board.component.ts
@Component({
  selector: 'app-sprint-board',
  templateUrl: './sprint-board.component.html'
})
export class SprintBoardComponent {
  sprint$ = this.jiraService.getCurrentSprint();
  columns = ['To Do', 'In Progress', 'In Review', 'Done'];
  
  onDrop(event: CdkDragDrop<JiraIssue[]>, column: string) {
    if (event.previousContainer !== event.container) {
      const issue = event.item.data;
      this.jiraService.transitionIssue(issue.key, column).subscribe();
    }
  }
}
```

#### Task 3.3: Workflow Status Widget
```typescript
// workflow-status-widget.component.ts
@Component({
  selector: 'app-workflow-status-widget',
  templateUrl: './workflow-status-widget.component.html'
})
export class WorkflowStatusWidget {
  activePipelines$ = this.pipelineService.getActivePipelines();
  
  getProgressPercentage(pipeline: Pipeline): number {
    const completed = pipeline.completedSteps.length;
    const total = pipeline.steps.length;
    return (completed / total) * 100;
  }
  
  pausePipeline(id: string) {
    this.pipelineService.pause(id);
  }
  
  resumePipeline(id: string) {
    this.pipelineService.resume(id);
  }
  
  cancelPipeline(id: string) {
    this.pipelineService.cancel(id);
  }
}
```

---

### Week 3: Reporting System

#### Task 3.4: Report Generator Service
```typescript
// report-generator.service.ts
@Injectable({ providedIn: 'root' })
export class ReportGeneratorService {
  
  async generateReport(config: ReportConfig): Promise<Report> {
    const data = await this.collectReportData(config);
    
    switch (config.format) {
      case 'pdf':
        return this.generatePDF(data, config);
      case 'html':
        return this.generateHTML(data, config);
      case 'markdown':
        return this.generateMarkdown(data, config);
      default:
        throw new Error(`Unsupported format: ${config.format}`);
    }
  }
  
  private async generatePDF(data: ReportData, config: ReportConfig): Promise<Report> {
    // Use Puppeteer hoặc similar
    const html = this.compileReportTemplate(data, 'pdf');
    const pdfBuffer = await this.htmlToPDF(html);
    
    return {
      id: generateUUID(),
      format: 'pdf',
      content: pdfBuffer,
      generatedAt: new Date()
    };
  }
  
  scheduleReport(config: ReportConfig, schedule: Schedule): Observable<ScheduledReport> {
    return this.http.post<ScheduledReport>('/api/reports/schedule', {
      config,
      schedule
    });
  }
}
```

#### Task 3.5: Report Templates
```typescript
// report-templates.ts
export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'daily-summary',
    name: 'Daily Summary',
    description: 'Summary of tasks completed today',
    sections: [
      'overview',
      'completed-tasks',
      'in-progress',
      'performance-metrics'
    ]
  },
  {
    id: 'sprint-report',
    name: 'Sprint Report',
    description: 'Comprehensive sprint analysis',
    sections: [
      'sprint-overview',
      'velocity-chart',
      'burndown-chart',
      'completed-stories',
      'blockers'
    ]
  },
  {
    id: 'workflow-analytics',
    name: 'Workflow Analytics',
    description: 'Deep dive into workflow performance',
    sections: [
      'workflow-distribution',
      'duration-analysis',
      'success-rates',
      'bottlenecks'
    ]
  }
];
```

---

### Week 4: Analytics & Insights

#### Task 3.6: Analytics Dashboard
```typescript
// analytics-dashboard.component.ts
@Component({
  selector: 'app-analytics-dashboard',
  templateUrl: './analytics-dashboard.component.html'
})
export class AnalyticsDashboardComponent {
  dateRange = new FormGroup({
    start: new FormControl(subDays(new Date(), 30)),
    end: new FormControl(new Date())
  });
  
  metrics$ = this.analyticsService.getMetrics(this.dateRange.valueChanges);
  
  charts = [
    { id: 'tasks-over-time', title: 'Tasks Over Time', type: 'line' },
    { id: 'success-rate', title: 'Success Rate', type: 'bar' },
    { id: 'duration-distribution', title: 'Duration Distribution', type: 'histogram' },
    { id: 'module-usage', title: 'Module Usage', type: 'pie' }
  ];
  
  insights$ = this.analyticsService.generateInsights();
}
```

#### Task 3.7: Performance Metrics
```typescript
// performance-metrics.service.ts
@Injectable({ providedIn: 'root' })
export class PerformanceMetricsService {
  
  async calculateMetrics(dateRange: DateRange): Promise<Metrics> {
    const tasks = await this.getTasksInRange(dateRange);
    
    return {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      successRate: this.calculateSuccessRate(tasks),
      averageDuration: this.calculateAverageDuration(tasks),
      throughput: tasks.length / this.getDaysInRange(dateRange),
      bottlenecks: this.identifyBottlenecks(tasks),
      trends: this.calculateTrends(tasks)
    };
  }
  
  private identifyBottlenecks(tasks: Task[]): Bottleneck[] {
    // Analyze where tasks get stuck
    const stepDurations = tasks.map(t => ({
      analyze: t.timings.analyze,
      solution: t.timings.solution,
      execute: t.timings.execute
    }));
    
    // Find steps with longest average duration
    const avgDurations = {
      analyze: mean(stepDurations.map(d => d.analyze)),
      solution: mean(stepDurations.map(d => d.solution)),
      execute: mean(stepDurations.map(d => d.execute))
    };
    
    return Object.entries(avgDurations)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([step, duration]) => ({
        step,
        duration,
        impact: duration / sum(Object.values(avgDurations))
      }));
  }
}
```

---

### Week 5: Review Module

#### Task 3.8: Review Module Implementation
```typescript
// review.module.ts
@Component({
  selector: 'app-review',
  templateUrl: './review.component.html'
})
export class ReviewComponent {
  @Input() executionId: string;
  
  changes$ = this.reviewService.getChanges(this.executionId);
  diffView$ = this.changes$.pipe(
    map(changes => this.generateDiffView(changes))
  );
  
  comments$ = this.reviewService.getComments(this.executionId);
  
  onAddComment(file: string, line: number, comment: string) {
    this.reviewService.addComment(this.executionId, { file, line, comment });
  }
  
  onApprove() {
    this.reviewService.approve(this.executionId).subscribe(() => {
      this.snackBar.open('Changes approved', 'Close');
    });
  }
  
  onRequestChanges() {
    this.reviewService.requestChanges(this.executionId).subscribe(() => {
      this.snackBar.open('Changes requested', 'Close');
    });
  }
}
```

#### Task 3.9: Quality Gates
```typescript
// quality-gates.service.ts
@Injectable({ providedIn: 'root' })
export class QualityGatesService {
  
  gates: QualityGate[] = [
    { id: 'lint', name: 'Linting', check: this.checkLinting.bind(this) },
    { id: 'test', name: 'Tests', check: this.checkTests.bind(this) },
    { id: 'coverage', name: 'Coverage', check: this.checkCoverage.bind(this) },
    { id: 'compile', name: 'Compilation', check: this.checkCompilation.bind(this) }
  ];
  
  async runQualityGates(executionId: string): Promise<QualityGateResult[]> {
    const results = [];
    
    for (const gate of this.gates) {
      const result = await gate.check(executionId);
      results.push({
        gateId: gate.id,
        name: gate.name,
        passed: result.passed,
        details: result.details
      });
    }
    
    return results;
  }
  
  private async checkTests(executionId: string): Promise<GateCheckResult> {
    const testResults = await this.getTestResults(executionId);
    
    return {
      passed: testResults.failed === 0,
      details: {
        passed: testResults.passed,
        failed: testResults.failed,
        skipped: testResults.skipped
      }
    };
  }
}
```

---

### Week 6: Notifications & Collaboration

#### Task 3.10: Notification System
```typescript
// notification.service.ts
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notifications = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notifications.asObservable();
  
  unreadCount$ = this.notifications$.pipe(
    map(notifications => notifications.filter(n => !n.read).length)
  );
  
  show(message: string, type: NotificationType = 'info') {
    const notification: Notification = {
      id: generateUUID(),
      message,
      type,
      timestamp: new Date(),
      read: false
    };
    
    this.notifications.next([
      notification,
      ...this.notifications.value
    ]);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => this.dismiss(notification.id), 5000);
  }
  
  markAsRead(id: string) {
    const updated = this.notifications.value.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    this.notifications.next(updated);
  }
  
  setupWebSocketNotifications() {
    this.ws.on<Notification>('notification').subscribe(notification => {
      this.notifications.next([notification, ...this.notifications.value]);
    });
  }
}
```

#### Task 3.11: Collaboration Features
```typescript
// collaboration.service.ts
@Injectable({ providedIn: 'root' })
export class CollaborationService {
  
  addComment(taskId: string, comment: Comment): Observable<Comment> {
    return this.http.post<Comment>(`/api/tasks/${taskId}/comments`, comment);
  }
  
  shareReport(reportId: string, users: string[]): Observable<void> {
    return this.http.post<void>(`/api/reports/${reportId}/share`, { users });
  }
  
  mentionUser(taskId: string, userId: string): Observable<void> {
    return this.http.post<void>(`/api/tasks/${taskId}/mentions`, { userId });
  }
}
```

---

## ✅ Acceptance Criteria

### Dashboard
- [ ] My Tasks từ Jira hiển thị đúng
- [ ] Sprint board hoạt động với drag & drop
- [ ] Workflow status widget real-time
- [ ] Charts và metrics hiển thị chính xác

### Reporting
- [ ] PDF/HTML reports generate đúng
- [ ] Scheduled reports hoạt động
- [ ] Report templates hoạt động
- [ ] Custom report builder hoạt động

### Analytics
- [ ] Performance metrics tính đúng
- [ ] Bottlenecks identify chính xác
- [ ] Trends và predictions hoạt động
- [ ] Data visualization hoạt động

### Review
- [ ] Code diff view hoạt động
- [ ] Comments và discussions hoạt động
- [ ] Quality gates chạy đúng
- [ ] Approve/Reject workflow hoạt động

---

## 🚀 Phase 3 Completion Criteria

✅ **Definition of Done**:
1. Dashboard Jira hoàn chỉnh với real-time updates
2. Reporting system generate được PDF/HTML
3. Analytics cung cấp insights hữu ích
4. Review module hoạt động với quality gates
5. Notification system hoạt động
6. Tests pass > 90%
7. Performance tốt (< 3s load time)

**Sau Phase 3**: Platform sẵn sàng cho production use

---

**Phase Owner**: Solo Developer  
**Estimated Effort**: 160-240 hours  
**Dependencies**: Phase 2 hoàn thành
