import { Injectable, signal, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { OpenCodeApiService, OpenCodePart, OpenCodeMessage } from '../../../../core/services/opencode-api.service';

export interface AnalysisInput {
  id: string;
  type: 'text' | 'jira-url' | 'jira-task';
  content: string;
  label?: string;
}

export interface AnalysisQuestion {
  id: string;
  title: string;
  options: Array<{ label: string; description: string; }>;
}

export interface AnalysisPermission {
  id: string;
  tool: string;
  title: string;
  pattern?: string;
  message?: string;
}

export interface AnalysisState {
  status: 'idle' | 'analyzing' | 'completed' | 'error';
  progress: number;
  logs: string[];
  currentTool: string | null;
  activeSubtasks: string[];
  pendingQuestion: AnalysisQuestion | null;
  pendingPermission: AnalysisPermission | null;
  result: string | null;
  error: string | null;
  projectPath: string;
  savePath: string;
  inputs: AnalysisInput[];
  sessionId: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyzeService {
  private readonly opencodeApi = inject(OpenCodeApiService);

  private readonly _state = signal<AnalysisState>({
    status: 'idle',
    progress: 0,
    logs: [],
    currentTool: null,
    activeSubtasks: [],
    pendingQuestion: null,
    pendingPermission: null,
    result: null,
    error: null,
    projectPath: 'E:/SOURCE/ems.finance.fe',
    savePath: 'E:/SOURCE/ems.finance.fe/analyze-reports',
    inputs: [],
    sessionId: null
  });

  private lastStatus: string | null = null;

  readonly state = this._state.asReadonly();
  readonly isAnalyzing = computed(() => this._state().status === 'analyzing');
  readonly progress = computed(() => this._state().progress);
  readonly logs = computed(() => this._state().logs);
  readonly pendingQuestion = computed(() => this._state().pendingQuestion);
  readonly pendingPermission = computed(() => this._state().pendingPermission);
  readonly result = computed(() => this._state().result);
  readonly inputs = computed(() => this._state().inputs);

  updatePaths(projectPath: string, savePath: string): void {
    this._state.update(s => ({ ...s, projectPath, savePath }));
  }

  addInput(input: Omit<AnalysisInput, 'id'>): void {
    const newInput = { ...input, id: Math.random().toString(36).substring(7) };
    this._state.update(s => ({ ...s, inputs: [...s.inputs, newInput] }));
  }

  removeInput(id: string): void {
    this._state.update(s => ({ ...s, inputs: s.inputs.filter(i => i.id !== id) }));
  }

  clearInputs(): void {
    this._state.update(s => ({ ...s, inputs: [] }));
  }

  async respondToPermission(response: 'once' | 'always' | 'reject'): Promise<void> {
    const { sessionId, pendingPermission } = this._state();
    if (!sessionId || !pendingPermission) return;
    this.addLog(`[SECURITY] USER ${response.toUpperCase()} ACCESS: ${pendingPermission.tool}`);
    this._state.update(s => ({ ...s, pendingPermission: null }));
    try {
      await firstValueFrom(this.opencodeApi.respondToPermission(sessionId, pendingPermission.id, response));
    } catch (err: any) {
      this.addLog(`[ERROR] FAILED TO SEND PERMISSION: ${err.message}`);
    }
  }

  async respondToQuestion(optionLabel: string): Promise<void> {
    const { sessionId, pendingQuestion } = this._state();
    if (!sessionId || !pendingQuestion) return;
    this.addLog(`[USER] SELECTED: ${optionLabel}`);
    this._state.update(s => ({ ...s, pendingQuestion: null }));
    try {
      await firstValueFrom(this.opencodeApi.respondToPermission(sessionId, pendingQuestion.id, optionLabel));
    } catch (err: any) {
      this.addLog(`[ERROR] FAILED TO SEND RESPONSE: ${err.message}`);
    }
  }

  async startAnalysis(): Promise<void> {
    const { projectPath, savePath, inputs } = this._state();
    if (!projectPath || inputs.length === 0) return;
    this._state.update(s => ({
      ...s, status: 'analyzing', progress: 0, logs: ['[SYSTEM] INITIALIZING OPENCODE NATIVE BRIDGE...'], currentTool: null,
      activeSubtasks: [], pendingQuestion: null, pendingPermission: null, result: null, error: null
    }));
    try {
      const session = await firstValueFrom(this.opencodeApi.createSession('System Architect Analysis'));
      this._state.update(s => ({ ...s, sessionId: session.id }));
      this.addLog(`[SYSTEM] SESSION_ESTABLISHED: ${session.id}`);
      this.setupNativeEventListeners(session.id);
      this.addLog(`[CONTEXT] MOUNTING DIRECTORY: ${projectPath}`);
      await firstValueFrom(this.opencodeApi.runShellCommand(session.id, `cd "${projectPath}"`, 'analyze'));
      const payload = inputs.map(i => `[${i.type}] ${i.label || 'DATA'}: ${i.content}`).join('\n\n');
      let args = `"${payload}"`;
      if (savePath) args += ` --save="${savePath}"`;
      this.addLog(`[COMMAND] INVOKING: analyze-task`);
      await firstValueFrom(this.opencodeApi.executeCommand(session.id, 'analyze-task', args));
    } catch (err: any) {
      this._state.update(s => ({ ...s, status: 'error', error: err.message }));
      this.addLog(`[FATAL] CONNECTION ERROR: ${err.message}`);
    }
  }

  private setupNativeEventListeners(sessionId: string): void {
    const eventSource = new EventSource(this.opencodeApi.getEventStreamUrl());
    eventSource.onmessage = (event) => {
      try {
        const nativeEvent = JSON.parse(event.data);
        const props = nativeEvent.properties;
        if (props.sessionID !== sessionId && props.sessionId !== sessionId) return;
        switch (nativeEvent.type) {
          case 'message.part.updated': this.handlePartUpdate(props.part); break;
          case 'command.executed': this.addLog(`[EXEC] Command ${props.name} started`); break;
          case 'permission.updated': this.handleQuestionRequest(props); break;
          case 'session.status':
            const statusType = props.status?.type;
            if (statusType === 'busy' && this.lastStatus !== 'busy') {
              this.addLog('[AGENT] Status: BUSY (Thinking...)');
              this.lastStatus = 'busy';
            } else if (statusType === 'idle' && this.lastStatus !== 'idle') {
              this.addLog('[AGENT] Status: IDLE');
              this.lastStatus = 'idle';
            }
            break;
        }
      } catch (e) {}
    };
    eventSource.onerror = () => eventSource.close();
    const checkInterval = setInterval(() => {
      const state = this._state();
      if (state.status === 'completed' || state.status === 'error') {
        eventSource.close();
        clearInterval(checkInterval);
      }
    }, 1000);
  }

  private handlePartUpdate(part: OpenCodePart): void {
    if (part.type === 'reasoning' && part.text) {
      this.addLog(`[THINK] ${part.text.trim()}`);
      this._state.update(s => ({ ...s, progress: Math.min(s.progress + 1, 95) }));
    }
    if (part.type === 'tool') {
      const status = part.state?.status;
      if (status === 'running') {
        let detail = '';
        const input = part.state?.input;
        if (input) {
          if (input.filePath) detail = ` (file: ${input.filePath.split(/[\\/]/).pop()})`;
          else if (input.pattern) detail = ` (pattern: ${input.pattern})`;
        }
        this.addLog(`[TOOL] EXECUTING: ${part.tool}${detail}`);
        this._state.update(s => ({ ...s, progress: Math.min(s.progress + 2, 98) }));
      } else if (status === 'completed') {
        this.addLog(`[TOOL] COMPLETED: ${part.tool}`);
      }
    }
    if (part.type === 'subtask') {
      this.addLog(`[SUBTASK] DELEGATING TO: @${part.agent} - ${part.description}`);
    }
    if (part.type === 'text' && part.text && part.text.length > 500 && this._state().status === 'analyzing') {
      if (part.text.includes('# Analysis Report') || part.text.includes('Complexity')) this.completeAnalysis(part.text);
    }
  }

  private handleQuestionRequest(permission: any): void {
    const options = permission.metadata?.options;
    if (options && options.length > 0) {
      this.addLog(`[QUESTION] AGENT IS ASKING: ${permission.title}`);
      this._state.update(s => ({ ...s, pendingQuestion: { id: permission.id, title: permission.title, options } }));
    } else {
      this.addLog(`[SECURITY] PERMISSION REQUIRED: ${permission.title}`);
      this._state.update(s => ({ ...s, pendingPermission: { id: permission.id, tool: permission.type || 'tool', title: permission.title, pattern: permission.pattern, message: permission.metadata?.command || permission.metadata?.path } }));
    }
  }

  private addLog(message: string): void {
    const currentLogs = this._state().logs;
    if (currentLogs.length > 0 && currentLogs[currentLogs.length - 1] === message) return;
    this._state.update(s => ({ ...s, logs: [...s.logs, message] }));
  }

  private completeAnalysis(result: string): void {
    this._state.update(s => ({
      ...s, status: 'completed', progress: 100, result,
      currentTool: null, activeSubtasks: [], pendingQuestion: null, pendingPermission: null,
      logs: [...s.logs, '[DONE] OPENCODE PIPELINE FINISHED.']
    }));
  }

  reset(): void {
    this.lastStatus = null;
    this._state.set({ status: 'idle', progress: 0, logs: [], currentTool: null, activeSubtasks: [], pendingQuestion: null, pendingPermission: null, result: null, error: null, projectPath: 'E:/SOURCE/ems.finance.fe', savePath: 'E:/SOURCE/ems.finance.fe/analyze-reports', inputs: [], sessionId: null });
  }
}
