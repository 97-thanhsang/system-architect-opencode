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
  parts: OpenCodePart[];
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
    parts: [],
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
  readonly parts = computed(() => this._state().parts);
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

  async respondToPermission(response: 'once' | 'always' | 'reject', permissionId?: string): Promise<void> {
    const { sessionId, pendingPermission, projectPath } = this._state();
    const targetId = permissionId || pendingPermission?.id;
    if (!sessionId || !targetId) return;
    
    this.addLog(`[SECURITY] USER ${response.toUpperCase()} ACCESS`);
    
    // Remove from parts if it exists there
    this._state.update(s => ({ 
      ...s, 
      pendingPermission: s.pendingPermission?.id === targetId ? null : s.pendingPermission,
      parts: s.parts.filter(p => p.permissionRequest?.id !== targetId)
    }));

    try {
      await firstValueFrom(this.opencodeApi.respondToPermission(targetId, response, projectPath));
    } catch (err: any) {
      this.addLog(`[ERROR] FAILED TO SEND PERMISSION: ${err.message}`);
    }
  }

  async respondToQuestion(optionLabel: string, questionId?: string): Promise<void> {
    const { sessionId, pendingQuestion, projectPath } = this._state();
    const targetId = questionId || pendingQuestion?.id;
    if (!sessionId || !targetId) return;

    this.addLog(`[USER] SELECTED: ${optionLabel}`);
    
    this._state.update(s => ({ 
      ...s, 
      pendingQuestion: s.pendingQuestion?.id === targetId ? null : s.pendingQuestion,
      parts: s.parts.filter(p => p.questionRequest?.id !== targetId)
    }));

    try {
      // OpenCode expects answers: string[][] where each inner array is selected options for one question
      await firstValueFrom(this.opencodeApi.respondToQuestion(targetId, [[optionLabel]], projectPath));
    } catch (err: any) {
      this.addLog(`[ERROR] FAILED TO SEND RESPONSE: ${err.message}`);
    }
  }

  async cancelAnalysis(): Promise<void> {
    const { sessionId } = this._state();
    if (!sessionId) return;

    this.addLog(`[SYSTEM] ABORTING SESSION...`);
    try {
      await firstValueFrom(this.opencodeApi.abortSession(sessionId));
      this._state.update(s => ({ 
        ...s, 
        status: 'completed',
        progress: 100,
        logs: [...s.logs, '[CANCELLED] OPERATION ABORTED BY USER.']
      }));
    } catch (err: any) {
      this.addLog(`[ERROR] FAILED TO ABORT: ${err.message}`);
    }
  }

  async startAnalysis(): Promise<void> {
    const { projectPath, savePath, inputs } = this._state();
    
    this._state.update(s => ({
      ...s, status: 'analyzing', progress: 0, logs: ['[SYSTEM] PREPARING OPENCODE COMMAND DISPATCHER...'], parts: [], currentTool: null,
      activeSubtasks: [], pendingQuestion: null, pendingPermission: null, result: null, error: null
    }));

    try {
      const session = await firstValueFrom(this.opencodeApi.createSession('System Architect Analysis'));
      this._state.update(s => ({ ...s, sessionId: session.id }));
      this.addLog(`[SYSTEM] SESSION_ESTABLISHED: ${session.id}`);
      this.setupNativeEventListeners(session.id);
      
      this.addLog(`[CONTEXT] MOUNTING DIRECTORY: ${projectPath}`);
      // Ensure we are in the right directory first (Standard Shell Command)
      await firstValueFrom(this.opencodeApi.runShellCommand(session.id, `cd "${projectPath}"`, 'analyze'));

      // If manifest is empty, run the interactive /analyze command to fetch from Jira
      if (inputs.length === 0) {
        this.addLog(`[COMMAND] INVOKING NATIVE: /analyze`);
        // We use direct mode flags to bypass path questions if already provided in UI
        const args = `--projects:${projectPath} --savePath:${savePath}`;
        await firstValueFrom(this.opencodeApi.executeCommand(session.id, 'analyze', args));
        return;
      }

      // If manifest has inputs, invoke /analyze-task for each item
      // This uses the exact logic from your commands/workflows/analyze-task.md
      for (const input of inputs) {
        const taskRef = input.type === 'text' ? `"${input.content}"` : input.content;
        
        // Exact syntax from your config: --projects:[PATH] --savePath:[PATH]
        const args = `${taskRef} --projects:${projectPath} --savePath:${savePath}`;
        
        this.addLog(`[COMMAND] DISPATCHING: /analyze-task ${input.label || ''}`);
        await firstValueFrom(this.opencodeApi.executeCommand(session.id, 'analyze-task', args));
      }
      
    } catch (err: any) {
      this._state.update(s => ({ ...s, status: 'error', error: err.message }));
      this.addLog(`[FATAL] PIPELINE ERROR: ${err.message}`);
    }
  }

  private setupNativeEventListeners(sessionId: string): void {
    const eventSource = new EventSource(this.opencodeApi.getEventStreamUrl());
    
    // Periodically sync pending items to ensure we don't miss anything
    const syncInterval = setInterval(() => {
      this.syncPendingItems(sessionId);
    }, 3000);

    eventSource.onmessage = (event) => {
      try {
        const nativeEvent = JSON.parse(event.data);
        const props = nativeEvent.properties;
        
        // Robust session filtering
        const eventSessionId = props?.sessionID || props?.sessionId || nativeEvent.sessionId || nativeEvent.sessionID;
        
        // If event has a session ID, it MUST match ours. 
        // If it doesn't have one (global event), we process it only if it's relevant.
        if (eventSessionId && eventSessionId !== sessionId) return;

        console.log(`[SSE] Match Found (${nativeEvent.type}):`, nativeEvent);

        switch (nativeEvent.type) {
          case 'message.part.updated': 
            this.handlePartUpdate(props.part); 
            break;
          case 'permission.asked': 
            console.warn('[SECURITY] Permission Event Detected!', props);
            this.handlePermissionAsked(props); 
            break;
          case 'question.asked':
            this.handleQuestionAsked(props);
            break;
          case 'permission.replied':
            this.handlePermissionReplied(props);
            break;
          case 'session.status':
            this.handleStatusUpdate(props.status?.type);
            break;
        }
      } catch (e) {
        console.error('[SSE] Error parsing event:', e);
      }
    };

    eventSource.onerror = (err) => {
      console.error('[SSE] EventSource Error:', err);
      eventSource.close();
    };

    const checkInterval = setInterval(() => {
      const state = this._state();
      if (state.status === 'completed' || state.status === 'error') {
        eventSource.close();
        clearInterval(checkInterval);
        clearInterval(syncInterval);
      }
    }, 1000);
  }

  private async syncPendingItems(sessionId: string): Promise<void> {
    const { projectPath } = this._state();
    try {
      const permissions = await firstValueFrom(this.opencodeApi.getPendingPermissions(projectPath));
      const myPermissions = permissions.filter(p => p.sessionID === sessionId);
      myPermissions.forEach(p => this.handlePermissionAsked(p));

      const questions = await firstValueFrom(this.opencodeApi.getPendingQuestions(projectPath));
      const myQuestions = questions.filter(q => q.sessionID === sessionId);
      myQuestions.forEach(q => this.handleQuestionAsked(q));
    } catch (e) {}
  }

  private handleStatusUpdate(type: string): void {
    if (type === 'busy' && this.lastStatus !== 'busy') {
      this.addLog('[AGENT] Status: BUSY (Thinking...)');
      this.lastStatus = 'busy';
    } else if (type === 'idle' && this.lastStatus !== 'idle') {
      this.addLog('[AGENT] Status: IDLE');
      this.lastStatus = 'idle';
    }
  }

  private handlePermissionReplied(reply: any): void {
    const permId = reply.requestID;
    this._state.update(s => ({
      ...s,
      pendingPermission: s.pendingPermission?.id === permId ? null : s.pendingPermission,
      parts: s.parts.filter(p => p.permissionRequest?.id !== permId)
    }));
  }

  private handlePartUpdate(part: OpenCodePart): void {
    // Update parts list
    this._state.update(s => {
      const existingIdx = s.parts.findIndex(p => p.id === part.id);
      let newParts = [...s.parts];
      if (existingIdx >= 0) {
        newParts[existingIdx] = { ...newParts[existingIdx], ...part };
      } else {
        newParts.push(part);
      }
      return { ...s, parts: newParts };
    });

    // Handle progress and logs for legacy support
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

  private handlePermissionAsked(request: any): void {
    const existing = this._state().parts.find(p => p.permissionRequest?.id === request.id);
    if (existing) return;

    this.addLog(`[SECURITY] PERMISSION REQUIRED: ${request.permission}`);
    
    const permissionPart: OpenCodePart = {
      id: 'perm-' + request.id,
      type: 'permission',
      permissionRequest: request
    };

    this._state.update(s => ({ 
      ...s, 
      pendingPermission: { 
        id: request.id, 
        tool: request.permission, 
        title: `Permission for ${request.permission}`,
        pattern: request.patterns?.join(', '),
        message: request.metadata?.command || request.metadata?.path
      },
      parts: [...s.parts, permissionPart]
    }));
  }

  private handleQuestionAsked(request: any): void {
    const existing = this._state().parts.find(p => p.questionRequest?.id === request.id);
    if (existing) return;

    // request.questions is an array. For simplicity, we'll take the first one or handle as list
    const mainQuestion = request.questions[0];
    if (!mainQuestion) return;

    this.addLog(`[QUESTION] AGENT IS ASKING: ${mainQuestion.header}`);
    
    const questionPart: OpenCodePart = {
      id: 'ques-' + request.id,
      type: 'question',
      questionRequest: request
    };

    this._state.update(s => ({ 
      ...s, 
      pendingQuestion: { 
        id: request.id, 
        title: mainQuestion.question, 
        options: mainQuestion.options 
      },
      parts: [...s.parts, questionPart]
    }));
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
    this._state.set({ status: 'idle', progress: 0, logs: [], parts: [], currentTool: null, activeSubtasks: [], pendingQuestion: null, pendingPermission: null, result: null, error: null, projectPath: 'E:/SOURCE/ems.finance.fe', savePath: 'E:/SOURCE/ems.finance.fe/analyze-reports', inputs: [], sessionId: null });
  }
}
