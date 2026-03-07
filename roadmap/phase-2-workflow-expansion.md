# Phase 2: Solution & Execute Modules

> **Duration**: 4-6 tuần  
> **Goal**: Mở rộng platform với Solution và Execute workflows  
> **Output**: Complete workflow pipeline (Analyze → Solution → Execute)

---

## 🎯 Objectives

1. ✅ Implement **Solution Module** với UI tương tự Analyze
2. ✅ Implement **Execute Module** cho code implementation
3. ✅ **Pipeline Orchestration**: Chạy liên tiếp nhiều steps
4. ✅ **Workflow Templates**: Predefined workflows cho common scenarios
5. ✅ **Inter-module Communication**: Data flow giữa các modules
6. ✅ **Checkpoint & Resume**: Lưu và phục hồi workflow state

---

## 📐 Module Architecture

### Solution Module Flow

```
Board 1: SOLUTION INPUT
├── Select Analysis Output (từ Analyze Module)
├── Configuration:
│   ├── Tech Stack preferences
│   ├── Architecture patterns
│   └── Constraints & requirements
└── [START SOLUTION]

Board 2: DESIGN PROGRESS
├── Overall Progress
├── Current Phase:
│   ├── Pattern Analysis
│   ├── Solution Design
│   ├── Technical Specification
│   └── Output Generation
├── Live Logs
└── Design Decisions (real-time)

Board 3: SOLUTION OUTPUT
├── Tabs:
│   ├── 📐 Architecture Diagram
│   ├── 📋 Technical Spec
│   ├── 🔧 Implementation Plan
│   ├── 📊 Complexity Analysis
│   └── 📄 Full Solution.md
├── Interactive Elements:
│   ├── Approve/Reject decisions
│   ├── Add custom notes
│   └── Export to Execute
└── [PROCEED TO EXECUTE]
```

### Execute Module Flow

```
Board 1: EXECUTION INPUT
├── Select Solution Output
├── Configuration:
│   ├── Code style preferences
│   ├── Test requirements
│   ├── Breaking changes handling
│   └── Rollback strategy
├── File Selection:
│   ├── Auto-detect affected files
│   ├── Manual file selection
│   └── Exclude patterns
└── [START EXECUTION]

Board 2: IMPLEMENTATION PROGRESS
├── Overall Progress
├── Current File: [filename]
├── Stats:
│   ├── Files completed: X/Y
│   ├── Lines changed: +X/-Y
│   ├── Tests generated: X
│   └── Time elapsed: XX:XX
├── Live Code Preview (diff view)
└── Compilation Status

Board 3: IMPLEMENTATION OUTPUT
├── Tabs:
│   ├── 📁 Changed Files
│   ├── 🔍 Diff View
│   ├── 🧪 Test Results
│   ├── 📊 Code Metrics
│   └── 📝 Implementation Report
├── Actions:
│   ├── Review Changes
│   ├── Apply to Project
│   ├── Generate PR
│   └── Rollback
└── Quality Gates Status
```

---

## 🛠️ Implementation Tasks

### Week 1-2: Solution Module

#### Task 2.1: Solution Input Component
```typescript
// solution-input.component.ts
@Component({
  selector: 'app-solution-input',
  templateUrl: './solution-input.component.html'
})
export class SolutionInputComponent {
  // Load previous analysis outputs
  analysisOutputs$ = this.solutionService.getAvailableAnalysisOutputs();
  
  configForm = this.fb.group({
    analysisOutputId: ['', Validators.required],
    techStack: this.fb.group({
      frontend: ['angular'],
      backend: ['nestjs'],
      database: ['postgresql']
    }),
    patterns: this.fb.array([]),
    constraints: this.fb.group({
      maxComplexity: [5],
      requireTests: [true],
      breakingChanges: ['avoid']
    })
  });
  
  onStart() {
    const config: SolutionConfig = {
      analysisOutputId: this.configForm.value.analysisOutputId,
      preferences: this.configForm.value
    };
    
    this.solutionService.startSolution(config).subscribe();
  }
}
```

#### Task 2.2: Design Progress Component
```typescript
// design-progress.component.ts
@Component({
  selector: 'app-design-progress',
  templateUrl: './design-progress.component.html'
})
export class DesignProgressComponent {
  phases = [
    { id: 'analysis', label: 'Pattern Analysis', icon: 'search' },
    { id: 'design', label: 'Solution Design', icon: 'architecture' },
    { id: 'spec', label: 'Technical Spec', icon: 'description' },
    { id: 'output', label: 'Output Generation', icon: 'output' }
  ];
  
  currentPhase$ = this.solutionService.currentPhase$;
  designDecisions$ = this.solutionService.designDecisions$;
  
  approveDecision(decisionId: string) {
    this.solutionService.approveDecision(decisionId);
  }
  
  rejectDecision(decisionId: string, reason: string) {
    this.solutionService.rejectDecision(decisionId, reason);
  }
}
```

#### Task 2.3: Solution Output Viewer
```typescript
// solution-output.component.ts
@Component({
  selector: 'app-solution-output',
  templateUrl: './solution-output.component.html'
})
export class SolutionOutputComponent {
  @Input() solutionId: string;
  
  activeTab = 'architecture';
  
  tabs = [
    { id: 'architecture', label: 'Architecture', icon: 'account_tree' },
    { id: 'technical', label: 'Technical Spec', icon: 'code' },
    { id: 'plan', label: 'Implementation Plan', icon: 'list_alt' },
    { id: 'complexity', label: 'Complexity Analysis', icon: 'analytics' }
  ];
  
  onProceedToExecute() {
    this.router.navigate(['/modules/fe/execute'], {
      queryParams: { solutionId: this.solutionId }
    });
  }
}
```

---

### Week 3-4: Execute Module

#### Task 2.4: Execute Input Component
```typescript
// execute-input.component.ts
@Component({
  selector: 'app-execute-input',
  templateUrl: './execute-input.component.html'
})
export class ExecuteInputComponent implements OnInit {
  // Get solutionId from query params
  solutionId = this.route.snapshot.queryParamMap.get('solutionId');
  
  configForm = this.fb.group({
    solutionId: [this.solutionId, Validators.required],
    codeStyle: ['standard'],
    generateTests: [true],
    testCoverage: [80],
    affectedFiles: this.fb.array([])
  });
  
  ngOnInit() {
    if (this.solutionId) {
      // Auto-load solution output
      this.loadSolutionOutput(this.solutionId);
    }
  }
  
  detectAffectedFiles() {
    this.executeService.detectAffectedFiles(this.solutionId)
      .subscribe(files => {
        this.affectedFiles.clear();
        files.forEach(file => {
          this.affectedFiles.push(this.fb.control(file));
        });
      });
  }
  
  onStart() {
    const config: ExecuteConfig = this.configForm.value;
    this.executeService.startExecution(config).subscribe();
  }
}
```

#### Task 2.5: Implementation Progress Component
```typescript
// implementation-progress.component.ts
@Component({
  selector: 'app-implementation-progress',
  templateUrl: './implementation-progress.component.html'
})
export class ImplementationProgressComponent {
  stats$ = this.executeService.implementationStats$;
  currentFile$ = this.executeService.currentFile$;
  diffView$ = this.executeService.diffView$;
  
  compilationStatus$ = this.executeService.compilationStatus$;
  
  pauseExecution() {
    this.executeService.pause();
  }
  
  resumeExecution() {
    this.executeService.resume();
  }
  
  abortExecution() {
    this.executeService.abort();
  }
}
```

#### Task 2.6: Implementation Output Component
```typescript
// implementation-output.component.ts
@Component({
  selector: 'app-implementation-output',
  templateUrl: './implementation-output.component.html'
})
export class ImplementationOutputComponent {
  @Input() executionId: string;
  
  changedFiles$ = this.executeService.getChangedFiles(this.executionId);
  testResults$ = this.executeService.getTestResults(this.executionId);
  qualityGates$ = this.executeService.getQualityGates(this.executionId);
  
  onReviewChanges() {
    this.router.navigate(['/review'], {
      queryParams: { executionId: this.executionId }
    });
  }
  
  onApplyChanges() {
    this.executeService.applyChanges(this.executionId).subscribe({
      next: () => this.snackBar.open('Changes applied successfully', 'Close'),
      error: (err) => this.snackBar.open(`Failed: ${err.message}`, 'Close')
    });
  }
  
  onGeneratePR() {
    this.executeService.generatePR(this.executionId).subscribe({
      next: (prUrl) => {
        this.snackBar.open('PR created', 'View');
        window.open(prUrl, '_blank');
      }
    });
  }
}
```

---

### Week 5-6: Pipeline Orchestration

#### Task 2.7: Workflow Pipeline Service
```typescript
// workflow-pipeline.service.ts
@Injectable({ providedIn: 'root' })
export class WorkflowPipelineService {
  private pipelines = new BehaviorSubject<Pipeline[]>([]);
  pipelines$ = this.pipelines.asObservable();
  
  createPipeline(config: PipelineConfig): Observable<Pipeline> {
    return this.http.post<Pipeline>('/api/pipelines', config);
  }
  
  startPipeline(pipelineId: string): Observable<void> {
    return this.http.post<void>(`/api/pipelines/${pipelineId}/start`);
  }
  
  // Orchestrate workflow: Analyze → Solution → Execute
  async runFullWorkflow(input: WorkflowInput): Promise<PipelineResult> {
    // Step 1: Analyze
    const analyzeResult = await this.runAnalyze(input.tasks);
    
    // Step 2: Solution (auto-start with analyze output)
    const solutionResult = await this.runSolution({
      analysisOutputId: analyzeResult.outputId,
      autoApprove: input.autoApproveSolution
    });
    
    // Step 3: Execute (auto-start with solution output)
    const executeResult = await this.runExecute({
      solutionOutputId: solutionResult.outputId,
      autoApply: input.autoApplyChanges
    });
    
    return {
      pipelineId: generateUUID(),
      steps: [analyzeResult, solutionResult, executeResult],
      status: 'completed',
      completedAt: new Date()
    };
  }
  
  private async runAnalyze(tasks: TaskInput[]): Promise<StepResult> {
    // Implementation
  }
  
  private async runSolution(config: SolutionConfig): Promise<StepResult> {
    // Implementation
  }
  
  private async runExecute(config: ExecuteConfig): Promise<StepResult> {
    // Implementation
  }
}
```

#### Task 2.8: Workflow Templates
```typescript
// workflow-templates.ts
export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'quick-fix',
    name: 'Quick Bug Fix',
    description: 'Analyze, solve, and execute simple bug fixes',
    steps: ['analyze', 'execute'], // Skip solution for simple fixes
    config: {
      analyze: { mode: 'quick' },
      execute: { skipTests: false }
    }
  },
  {
    id: 'feature-dev',
    name: 'Feature Development',
    description: 'Full workflow for new feature development',
    steps: ['analyze', 'solution', 'execute', 'review'],
    config: {
      analyze: { mode: 'full' },
      solution: { generateDiagrams: true },
      execute: { generateTests: true, coverage: 80 }
    }
  },
  {
    id: 'refactor',
    name: 'Code Refactoring',
    description: 'Safe refactoring with full test coverage',
    steps: ['analyze', 'solution', 'execute'],
    config: {
      analyze: { focus: 'quality' },
      solution: { breakingChanges: 'avoid' },
      execute: { preserveBehavior: true }
    }
  }
];
```

#### Task 2.9: Checkpoint & Resume
```typescript
// checkpoint.service.ts
@Injectable({ providedIn: 'root' })
export class CheckpointService {
  async saveCheckpoint(
    pipelineId: string, 
    step: string, 
    state: any
  ): Promise<void> {
    await this.http.post('/api/checkpoints', {
      pipelineId,
      step,
      state,
      timestamp: new Date()
    }).toPromise();
  }
  
  async resumeFromCheckpoint(checkpointId: string): Promise<Pipeline> {
    const checkpoint = await this.http
      .get<Checkpoint>(`/api/checkpoints/${checkpointId}`)
      .toPromise();
    
    // Restore pipeline state
    return this.workflowPipelineService.restorePipeline(
      checkpoint.pipelineId, 
      checkpoint.state
    );
  }
  
  getCheckpoints(pipelineId: string): Observable<Checkpoint[]> {
    return this.http.get<Checkpoint[]>(`/api/pipelines/${pipelineId}/checkpoints`);
  }
}
```

---

## 🔄 Inter-Module Communication

### Data Flow Architecture

```
Analyze Module
    ↓ [Analysis Output]
Solution Module
    ↓ [Solution Design]
Execute Module
    ↓ [Code Changes]
Review Module (Phase 3)
    ↓ [PR/Merge]
Project Repository
```

### Shared State Management

```typescript
// workflow-state.service.ts
@Injectable({ providedIn: 'root' })
export class WorkflowStateService {
  private state = new BehaviorSubject<WorkflowState>({
    currentStep: null,
    completedSteps: [],
    artifacts: {}
  });
  
  state$ = this.state.asObservable();
  
  setCurrentStep(step: WorkflowStep) {
    this.state.next({
      ...this.state.value,
      currentStep: step
    });
  }
  
  completeStep(step: WorkflowStep, output: any) {
    this.state.next({
      ...this.state.value,
      currentStep: null,
      completedSteps: [...this.state.value.completedSteps, step],
      artifacts: {
        ...this.state.value.artifacts,
        [step]: output
      }
    });
  }
  
  getArtifact(step: WorkflowStep): any {
    return this.state.value.artifacts[step];
  }
}
```

---

## 📊 Backend Implementation

### Pipeline Controller

```typescript
// pipeline.controller.ts
@Controller('pipelines')
export class PipelineController {
  
  @Post()
  async createPipeline(
    @Body() config: PipelineConfig,
    @Req() req: AuthenticatedRequest
  ): Promise<Pipeline> {
    return this.pipelineService.create(config, req.user);
  }
  
  @Post(':id/start')
  async startPipeline(@Param('id') id: string): Promise<void> {
    return this.pipelineService.start(id);
  }
  
  @Get(':id/status')
  async getPipelineStatus(@Param('id') id: string): Promise<PipelineStatus> {
    return this.pipelineService.getStatus(id);
  }
  
  @Post(':id/checkpoint')
  async createCheckpoint(
    @Param('id') id: string,
    @Body() checkpoint: CreateCheckpointDto
  ): Promise<Checkpoint> {
    return this.checkpointService.create(id, checkpoint);
  }
  
  @Post('checkpoints/:id/resume')
  async resumeFromCheckpoint(@Param('id') id: string): Promise<Pipeline> {
    return this.pipelineService.resumeFromCheckpoint(id);
  }
}
```

### Pipeline Processor

```typescript
// pipeline.processor.ts
@Processor('pipelines')
export class PipelineProcessor {
  
  @Process('run-pipeline')
  async handlePipeline(job: Job<PipelineJobData>) {
    const { pipelineId, steps } = job.data;
    
    try {
      for (const step of steps) {
        // Update current step
        await this.updatePipelineStep(pipelineId, step);
        
        // Execute step
        switch (step.type) {
          case 'analyze':
            await this.executeAnalyzeStep(pipelineId, step.config);
            break;
          case 'solution':
            await this.executeSolutionStep(pipelineId, step.config);
            break;
          case 'execute':
            await this.executeExecuteStep(pipelineId, step.config);
            break;
        }
        
        // Save checkpoint after each step
        await this.checkpointService.save(pipelineId, step.type);
      }
      
      // Mark pipeline complete
      await this.completePipeline(pipelineId);
      
    } catch (error) {
      await this.failPipeline(pipelineId, error);
      throw error;
    }
  }
  
  private async executeSolutionStep(
    pipelineId: string, 
    config: SolutionStepConfig
  ): Promise<void> {
    // Get previous analyze output
    const analyzeOutput = await this.getPreviousOutput(pipelineId, 'analyze');
    
    // Spawn solution process
    const process = this.opencodeService.spawnProcess('/solution-task', [
      '--analysis-output', analyzeOutput.path,
      '--output-path', config.outputPath
    ]);
    
    // Stream progress
    await this.streamProcessOutput(pipelineId, process);
  }
  
  private async executeExecuteStep(
    pipelineId: string, 
    config: ExecuteStepConfig
  ): Promise<void> {
    // Get previous solution output
    const solutionOutput = await this.getPreviousOutput(pipelineId, 'solution');
    
    // Spawn execute process
    const process = this.opencodeService.spawnProcess('/execute-task', [
      '--solution-output', solutionOutput.path,
      '--project-path', config.projectPath,
      '--output-path', config.outputPath
    ]);
    
    // Stream progress
    await this.streamProcessOutput(pipelineId, process);
  }
}
```

---

## ✅ Acceptance Criteria

### Solution Module
- [ ] User có thể chọn Analysis output để làm input
- [ ] Solution process chạy và tạo design documents
- [ ] Real-time design decisions hiển thị
- [ ] User có thể approve/reject decisions
- [ ] Output files đầy đủ (Architecture, Spec, Plan)

### Execute Module
- [ ] User có thể chọn Solution output
- [ ] Auto-detect affected files hoạt động
- [ ] Code implementation thực thi đúng
- [ ] Diff view hiển thị changes
- [ ] Test results và quality gates hoạt động
- [ ] Apply changes vào project hoạt động

### Pipeline Orchestration
- [ ] Full workflow (Analyze → Solution → Execute) chạy được
- [ ] Checkpoint save sau mỗi step
- [ ] Resume from checkpoint hoạt động
- [ ] Workflow templates hoạt động
- [ ] Error handling và rollback hoạt động

---

## 🚀 Phase 2 Completion Criteria

✅ **Definition of Done**:
1. Cả 3 modules (Analyze/Solution/Execute) hoạt động độc lập
2. Pipeline orchestration chạy được end-to-end
3. Data flow giữa modules hoạt động
4. Checkpoint & resume hoạt động
5. Workflow templates sẵn sàng
6. Tests pass > 85%

**Sau Phase 2**: Platform có thể thực thi complete workflow từ A-Z

---

**Phase Owner**: Solo Developer  
**Estimated Effort**: 160-240 hours  
**Dependencies**: Phase 1 (MVP Analyze) hoàn thành
