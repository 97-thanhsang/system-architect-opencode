import { Injectable, signal, computed } from '@angular/core';

export interface AnalysisInput {
  id: string;
  type: 'text' | 'jira-url' | 'jira-task';
  content: string;
  label?: string;
}

export interface AnalysisState {
  status: 'idle' | 'analyzing' | 'completed' | 'error';
  progress: number;
  logs: string[];
  result: string | null;
  error: string | null;
  projectPath: string;
  savePath: string;
  inputs: AnalysisInput[];
}

@Injectable({
  providedIn: 'root'
})
export class AnalyzeService {
  private readonly _state = signal<AnalysisState>({
    status: 'idle',
    progress: 0,
    logs: [],
    result: null,
    error: null,
    projectPath: '',
    savePath: '',
    inputs: []
  });

  readonly state = this._state.asReadonly();
  readonly isAnalyzing = computed(() => this._state().status === 'analyzing');
  readonly progress = computed(() => this._state().progress);
  readonly logs = computed(() => this._state().logs);
  readonly result = computed(() => this._state().result);
  readonly inputs = computed(() => this._state().inputs);
  readonly projectPath = computed(() => this._state().projectPath);
  readonly savePath = computed(() => this._state().savePath);

  /**
   * Updates project and save paths
   */
  updatePaths(projectPath: string, savePath: string): void {
    this._state.update(s => ({ ...s, projectPath, savePath }));
  }

  /**
   * Adds a new input to the queue
   */
  addInput(input: Omit<AnalysisInput, 'id'>): void {
    const newInput = { ...input, id: Math.random().toString(36).substring(7) };
    this._state.update(s => ({
      ...s,
      inputs: [...s.inputs, newInput]
    }));
  }

  /**
   * Removes an input
   */
  removeInput(id: string): void {
    this._state.update(s => ({
      ...s,
      inputs: s.inputs.filter(i => i.id !== id)
    }));
  }

  /**
   * Clears all inputs
   */
  clearInputs(): void {
    this._state.update(s => ({
      ...s,
      inputs: []
    }));
  }

  /**
   * Starts the analysis process
   */
  startAnalysis(): void {
    const { projectPath, savePath, inputs } = this._state();
    
    if (!projectPath || !savePath || inputs.length === 0) return;

    this._state.update(s => ({
      ...s,
      status: 'analyzing',
      progress: 0,
      logs: [
        'INITIALIZING NEURAL ANALYZER...',
        `MOUNTING PROJECT: ${projectPath}`,
        `SETTING OUTPUT: ${savePath}`,
        `QUEUING ${inputs.length} PAYLOAD UNITS...`
      ],
      result: null,
      error: null
    }));

    this.simulateAnalysis();
  }

  private simulateAnalysis(): void {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      
      this._state.update(s => ({
        ...s,
        progress: currentProgress,
        logs: [...s.logs, `Processing: ${currentProgress}% complete...`]
      }));

      if (currentProgress >= 100) {
        clearInterval(interval);
        this._state.update(s => ({
          ...s,
          status: 'completed',
          result: '# Analysis Result\n\nThis is a mock analysis result in markdown format.\n\n- **Complexity**: Low\n- **Impact**: Medium\n- **Estimated Effort**: 4 hours',
          logs: [...s.logs, 'Analysis completed successfully.']
        }));
      }
    }, 500);
  }

  /**
   * Resets the analysis state to idle.
   */
  reset(): void {
    this._state.set({
      status: 'idle',
      progress: 0,
      logs: [],
      result: null,
      error: null,
      projectPath: '',
      savePath: '',
      inputs: []
    });
  }
}
