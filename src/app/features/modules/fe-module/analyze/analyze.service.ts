import { Injectable, signal, computed } from '@angular/core';

export interface AnalysisState {
  status: 'idle' | 'analyzing' | 'completed' | 'error';
  progress: number;
  logs: string[];
  result: string | null;
  error: string | null;
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
    error: null
  });

  readonly state = this._state.asReadonly();
  readonly isAnalyzing = computed(() => this._state().status === 'analyzing');
  readonly progress = computed(() => this._state().progress);
  readonly logs = computed(() => this._state().logs);
  readonly result = computed(() => this._state().result);

  /**
   * Starts the analysis process for a given task input.
   * @param input The task description or requirement to analyze.
   */
  startAnalysis(input: string): void {
    this._state.update(s => ({
      ...s,
      status: 'analyzing',
      progress: 0,
      logs: ['Starting analysis...', `Input received: ${input.substring(0, 50)}...`],
      result: null,
      error: null
    }));

    // Mock analysis process
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
      error: null
    });
  }
}
