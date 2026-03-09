import { Injectable, signal, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { OpenCodeApiService, OpenCodePart, OpenCodeMessage } from '../../../../core/services/opencode-api.service';
import { environment } from '../../../../../environments/environment';

// ============================================================
// DEBUG MODE - Board 2 Flow Tracking
// ============================================================
const DEBUG = environment.analyze.debugEnabled;
const DEBUG_LEVEL = environment.analyze.debugLevel;

const DEBUG_LOG = (msg: string, data?: any) => {
  if (!DEBUG) return;
  
  if (DEBUG_LEVEL === 'verbose') {
    console.log(`%c[BOARD2-DEBUG] ${msg}`, 'color: #f59e0b; font-weight: bold', data || '');
  } else if (DEBUG_LEVEL === 'normal' && data) {
    console.log(`[BOARD2] ${msg}`);
  }
};
// ============================================================

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

// ============================================================
// TIMELINE EVENT - Phase 2 Enhancement
// ============================================================
export interface TimelineEvent {
  id: string;
  timestamp: Date;
  type: 'reasoning' | 'tool' | 'permission' | 'question' | 'status';
  title: string;
  details: string;
  duration?: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
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
  // Phase 2: Timeline events
  timelineEvents: TimelineEvent[];
}

@Injectable({
  providedIn: 'root'
})
export class AnalyzeService {
  private readonly opencodeApi = inject(OpenCodeApiService);

  // ============================================================
  // PROGRESS CONFIGURATION - Automatic Calculation
  // ============================================================
  readonly PROGRESS_PHASES = [
    { phase: 'skill-init', minProgress: 0, maxProgress: 10, weight: 0.10 },
    { phase: 'quick-start', minProgress: 10, maxProgress: 20, weight: 0.10 },
    { phase: 'classification', minProgress: 20, maxProgress: 30, weight: 0.10 },
    { phase: 'business-analysis', minProgress: 30, maxProgress: 45, weight: 0.15 },
    { phase: 'tech-spec', minProgress: 45, maxProgress: 60, weight: 0.15 },
    { phase: 'estimation', minProgress: 60, maxProgress: 70, weight: 0.10 },
    { phase: 'impact-risk', minProgress: 70, maxProgress: 85, weight: 0.15 },
    { phase: 'actionable-items', minProgress: 85, maxProgress: 95, weight: 0.10 },
    { phase: 'preflight', minProgress: 95, maxProgress: 100, weight: 0.05 }
  ] as const;

  // Helper to get initial paths
  private static getInitialProjectPath(): string {
    const saved = localStorage.getItem('lastProjectPath');
    return environment.analyze.defaultProjectPath || saved || '';
  }

  private static getInitialSavePath(): string {
    const saved = localStorage.getItem('lastProjectPath');
    if (environment.analyze.defaultSavePath) return environment.analyze.defaultSavePath;
    if (saved) return `${saved}/analyze-reports`;
    return '';
  }

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
    projectPath: AnalyzeService.getInitialProjectPath(),
    savePath: AnalyzeService.getInitialSavePath(),
    inputs: [],
    sessionId: null,
    timelineEvents: []
  });

  private lastStatus: string | null = null;

  // ============================================================
  // CONSTRUCTOR - Auto-detect working directory
  // ============================================================
  constructor() {
    if (environment.analyze.autoDetectWorkingDirectory) {
      this.detectWorkingDirectory();
    }
  }

  // ============================================================
  // PATH AUTO-DETECTION
  // ============================================================
  private getStoredProjectPath(): string | null {
    return localStorage.getItem('lastProjectPath');
  }

  detectWorkingDirectory(): void {
    const saved = this.getStoredProjectPath();
    if (saved) {
      this._state.update(s => ({
        ...s,
        projectPath: saved,
        savePath: `${saved}/analyze-reports`
      }));
      DEBUG_LOG('📁 Auto-detected working directory', { projectPath: saved });
    }
  }

  // ============================================================
  // VALIDATION
  // ============================================================
  validatePaths(): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const state = this._state();

    // Check project path exists
    if (!state.projectPath.trim()) {
      errors.push('Project path is required');
    } else if (!this.isValidPath(state.projectPath)) {
      errors.push('Invalid project path format');
    }

    // Check save path is writable
    if (!state.savePath.trim()) {
      errors.push('Save path is required');
    }

    // Warnings
    if (!state.inputs.length) {
      warnings.push('No input units staged');
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  private isValidPath(path: string): boolean {
    // Basic path validation - must start with drive letter or UNC path
    return /^[a-zA-Z]:\\|^\/|^\\\\/.test(path.trim());
  }

  // ============================================================
  // FOLDER PICKER SUPPORT
  // ============================================================
  async selectFolder(): Promise<string | null> {
    // Use native folder dialog if available, otherwise return null
    // Integration with OpenCode file picker would go here
    DEBUG_LOG('📁 Opening folder picker');
    return null;
  }

  // ============================================================
  // AUTO PROGRESS CALCULATION
  // ============================================================
  calculateProgress(phase: string): number {
    const config = this.PROGRESS_PHASES.find(p => p.phase === phase);
    if (!config) return this._state().progress;
    
    const current = this._state().progress;
    if (current < config.maxProgress) {
      // Animate within phase
      return Math.min(current + (config.maxProgress - config.minProgress) * 0.1, config.maxProgress);
    }
    return current;
  }

  getPhaseFromProgress(progress: number): string {
    for (const phase of this.PROGRESS_PHASES) {
      if (progress >= phase.minProgress && progress < phase.maxProgress) {
        return phase.phase;
      }
    }
    return 'unknown';
  }

  // ============================================================
  // TIMELINE EVENTS - Phase 2 Enhancement
  // ============================================================
  readonly timelineEvents = computed(() => this._state().timelineEvents);

  addTimelineEvent(event: Omit<TimelineEvent, 'id' | 'timestamp'>): void {
    const newEvent: TimelineEvent = {
      ...event,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date()
    };
    this._state.update(s => ({
      ...s,
      timelineEvents: [...s.timelineEvents, newEvent]
    }));
    DEBUG_LOG('📋 Timeline event added', { type: event.type, title: event.title });
  }

  updateTimelineEventStatus(id: string, status: TimelineEvent['status']): void {
    this._state.update(s => ({
      ...s,
      timelineEvents: s.timelineEvents.map(e => 
        e.id === id ? { ...e, status } : e
      )
    }));
  }

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
    if (!sessionId || !targetId) {
      DEBUG_LOG('⚠️ Cannot respond to permission - missing sessionId or targetId', { sessionId, targetId });
      return;
    }
    
    DEBUG_LOG(`📤 User responding to permission: ${response}`, { targetId, response });
    this.addLog(`[SECURITY] USER ${response.toUpperCase()} ACCESS`);
    
    // Remove from parts if it exists there
    this._state.update(s => ({ 
      ...s, 
      pendingPermission: s.pendingPermission?.id === targetId ? null : s.pendingPermission,
      parts: s.parts.filter(p => p.permissionRequest?.id !== targetId)
    }));

    try {
      DEBUG_LOG('📡 Sending permission response to API...');
      await firstValueFrom(this.opencodeApi.respondToPermission(targetId, response, projectPath));
      DEBUG_LOG('✅ Permission response sent successfully');
    } catch (err: any) {
      this.addLog(`[ERROR] FAILED TO SEND PERMISSION: ${err.message}`);
      DEBUG_LOG('❌ Failed to send permission response', { error: err.message });
    }
  }

  async respondToQuestion(optionLabel: string, questionId?: string): Promise<void> {
    const { sessionId, pendingQuestion, projectPath } = this._state();
    const targetId = questionId || pendingQuestion?.id;
    if (!sessionId || !targetId) {
      DEBUG_LOG('⚠️ Cannot respond to question - missing sessionId or targetId', { sessionId, targetId });
      return;
    }

    DEBUG_LOG('📤 User responding to question', { targetId, optionLabel });
    this.addLog(`[USER] SELECTED: ${optionLabel}`);
    
    this._state.update(s => ({ 
      ...s, 
      pendingQuestion: s.pendingQuestion?.id === targetId ? null : s.pendingQuestion,
      parts: s.parts.filter(p => p.questionRequest?.id !== targetId)
    }));

    try {
      // OpenCode expects answers: string[][] where each inner array is selected options for one question
      DEBUG_LOG('📡 Sending question response to API...');
      await firstValueFrom(this.opencodeApi.respondToQuestion(targetId, [[optionLabel]], projectPath));
      DEBUG_LOG('✅ Question response sent successfully');
    } catch (err: any) {
      this.addLog(`[ERROR] FAILED TO SEND RESPONSE: ${err.message}`);
      DEBUG_LOG('❌ Failed to send question response', { error: err.message });
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
    
    DEBUG_LOG('🚀 START ANALYSIS', { projectPath, savePath, inputsCount: inputs.length });
    
    this._state.update(s => ({
      ...s, status: 'analyzing', progress: 0, logs: ['[SYSTEM] PREPARING OPENCODE COMMAND DISPATCHER...'], parts: [], currentTool: null,
      activeSubtasks: [], pendingQuestion: null, pendingPermission: null, result: null, error: null
    }));

    try {
      DEBUG_LOG('📡 Creating session...');
      const session = await firstValueFrom(this.opencodeApi.createSession('System Architect Analysis'));
      this._state.update(s => ({ ...s, sessionId: session.id }));
      this.addLog(`[SYSTEM] SESSION_ESTABLISHED: ${session.id}`);
      DEBUG_LOG('✅ Session created', { sessionId: session.id });
      
      this.setupNativeEventListeners(session.id);
      DEBUG_LOG('🔄 Event listeners setup complete');
      
      this.addLog(`[CONTEXT] MOUNTING DIRECTORY: ${projectPath}`);
      DEBUG_LOG('📁 Mounting directory', { projectPath });
      
      // Ensure we are in the right directory first (Standard Shell Command)
      await firstValueFrom(this.opencodeApi.runShellCommand(session.id, `cd "${projectPath}"`, 'analyze'));
      DEBUG_LOG('✅ Directory mounted');

      // If manifest is empty, run the interactive /analyze command to fetch from Jira
      if (inputs.length === 0) {
        this.addLog(`[COMMAND] INVOKING NATIVE: /analyze`);
        DEBUG_LOG('📤 Executing /analyze (no inputs)');
        // We use direct mode flags to bypass path questions if already provided in UI
        const args = `--projects:${projectPath} --savePath:${savePath}`;
        await firstValueFrom(this.opencodeApi.executeCommand(session.id, 'analyze', args));
        DEBUG_LOG('✅ /analyze dispatched');
        return;
      }

      // If manifest has inputs, invoke /analyze-task for each item
      // This uses the exact logic from your commands/workflows/analyze-task.md
      DEBUG_LOG('📋 Processing inputs', { count: inputs.length });
      for (const input of inputs) {
        const taskRef = input.type === 'text' ? `"${input.content}"` : input.content;
        
        // Exact syntax from your config: --projects:[PATH] --savePath:[PATH]
        const args = `${taskRef} --projects:${projectPath} --savePath:${savePath}`;
        
        this.addLog(`[COMMAND] DISPATCHING: /analyze-task ${input.label || ''}`);
        DEBUG_LOG(`📤 Dispatching /analyze-task`, { input: input.label, args });
        await firstValueFrom(this.opencodeApi.executeCommand(session.id, 'analyze-task', args));
      }
      
    } catch (err: any) {
      DEBUG_LOG('❌ ERROR in startAnalysis', { error: err.message });
      this._state.update(s => ({ ...s, status: 'error', error: err.message }));
      this.addLog(`[FATAL] PIPELINE ERROR: ${err.message}`);
    }
  }

  private setupNativeEventListeners(sessionId: string): void {
    DEBUG_LOG('🔧 Setting up native event listeners', { sessionId });
    const eventSource = new EventSource(this.opencodeApi.getEventStreamUrl());
    
    // Periodically sync pending items to ensure we don't miss anything
    const syncInterval = setInterval(() => {
      DEBUG_LOG('🔄 Syncing pending items...');
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
        if (eventSessionId && eventSessionId !== sessionId) {
          DEBUG_LOG('⏭️ Skipping event - session mismatch', { eventSessionId, ourSession: sessionId });
          return;
        }

        DEBUG_LOG(`📥 SSE Event: ${nativeEvent.type}`, nativeEvent);
        console.log(`[SSE] Match Found (${nativeEvent.type}):`, nativeEvent);

        switch (nativeEvent.type) {
          case 'message.part.updated': 
            DEBUG_LOG('📝 Handling part update', props?.part);
            this.handlePartUpdate(props.part); 
            break;
          case 'permission.asked': 
            console.warn('[SECURITY] Permission Event Detected!', props);
            DEBUG_LOG('🔐 Handling permission asked', props);
            this.handlePermissionAsked(props); 
            break;
          case 'question.asked':
            DEBUG_LOG('❓ Handling question asked', props);
            this.handleQuestionAsked(props);
            break;
          case 'permission.replied':
            DEBUG_LOG('✅ Handling permission replied', props);
            this.handlePermissionReplied(props);
            break;
          case 'session.status':
            DEBUG_LOG('📊 Handling status update', props);
            this.handleStatusUpdate(props.status?.type);
            break;
          default:
            DEBUG_LOG('⚪ Unknown event type', { type: nativeEvent.type });
        }
      } catch (e) {
        console.error('[SSE] Error parsing event:', e);
        DEBUG_LOG('❌ Error parsing SSE event', e);
      }
    };

    eventSource.onerror = (err) => {
      console.error('[SSE] EventSource Error:', err);
      DEBUG_LOG('❌ EventSource error', err);
      eventSource.close();
    };

    const checkInterval = setInterval(() => {
      const state = this._state();
      if (state.status === 'completed' || state.status === 'error') {
        DEBUG_LOG('🛑 Cleaning up - session done', { status: state.status });
        eventSource.close();
        clearInterval(checkInterval);
        clearInterval(syncInterval);
      }
    }, 1000);
  }

  private async syncPendingItems(sessionId: string): Promise<void> {
    const { projectPath } = this._state();
    try {
      DEBUG_LOG('🔄 Syncing pending items...');
      
      const permissions = await firstValueFrom(this.opencodeApi.getPendingPermissions(projectPath));
      const myPermissions = permissions.filter(p => p.sessionID === sessionId);
      DEBUG_LOG('📋 Permissions synced', { count: myPermissions.length });
      myPermissions.forEach(p => this.handlePermissionAsked(p));

      const questions = await firstValueFrom(this.opencodeApi.getPendingQuestions(projectPath));
      const myQuestions = questions.filter(q => q.sessionID === sessionId);
      DEBUG_LOG('❓ Questions synced', { count: myQuestions.length });
      myQuestions.forEach(q => this.handleQuestionAsked(q));
    } catch (e) {
      DEBUG_LOG('⚠️ Error syncing pending items', e);
    }
  }

  private handleStatusUpdate(type: string): void {
    DEBUG_LOG('📊 Status update', { type, lastStatus: this.lastStatus });
    if (type === 'busy' && this.lastStatus !== 'busy') {
      this.addLog('[AGENT] Status: BUSY (Thinking...)');
      this.lastStatus = 'busy';
      DEBUG_LOG('🤔 Agent is now BUSY (thinking)');
    } else if (type === 'idle' && this.lastStatus !== 'idle') {
      this.addLog('[AGENT] Status: IDLE');
      this.lastStatus = 'idle';
      DEBUG_LOG('💤 Agent is now IDLE');
    }
  }

  private handlePermissionReplied(reply: any): void {
    const permId = reply.requestID;
    DEBUG_LOG('📥 handlePermissionReplied called', { permId });
    this._state.update(s => ({
      ...s,
      pendingPermission: s.pendingPermission?.id === permId ? null : s.pendingPermission,
      parts: s.parts.filter(p => p.permissionRequest?.id !== permId)
    }));
    DEBUG_LOG('✅ Permission reply processed');
  }

  private handlePartUpdate(part: OpenCodePart): void {
    DEBUG_LOG('📝 handlePartUpdate called', { partId: part.id, type: part.type });
    
    // Update parts list
    this._state.update(s => {
      const existingIdx = s.parts.findIndex(p => p.id === part.id);
      let newParts = [...s.parts];
      if (existingIdx >= 0) {
        newParts[existingIdx] = { ...newParts[existingIdx], ...part };
        DEBUG_LOG('🔄 Updated existing part', { index: existingIdx });
      } else {
        newParts.push(part);
        DEBUG_LOG('➕ Added new part', { totalParts: newParts.length });
      }
      return { ...s, parts: newParts };
    });

    // Handle progress and logs for legacy support
    if (part.type === 'reasoning' && part.text) {
      this.addLog(`[THINK] ${part.text.trim()}`);
      this._state.update(s => ({ ...s, progress: Math.min(s.progress + 1, 95) }));
      DEBUG_LOG('🧠 Reasoning part - progress +1', { progress: this._state().progress });
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
        DEBUG_LOG('🔧 Tool running - progress +2', { tool: part.tool, progress: this._state().progress });
      } else if (status === 'completed') {
        this.addLog(`[TOOL] COMPLETED: ${part.tool}`);
        DEBUG_LOG('✅ Tool completed', { tool: part.tool });
      }
    }
    if (part.type === 'subtask') {
      this.addLog(`[SUBTASK] DELEGATING TO: @${part.agent} - ${part.description}`);
      DEBUG_LOG('📋 Subtask created', { agent: part.agent, description: part.description });
    }
    if (part.type === 'text' && part.text && part.text.length > 500 && this._state().status === 'analyzing') {
      if (part.text.includes('# Analysis Report') || part.text.includes('Complexity')) {
        DEBUG_LOG('🎯 Analysis report detected - completing');
        this.completeAnalysis(part.text);
      }
    }
  }

  private handlePermissionAsked(request: any): void {
    DEBUG_LOG('🔐 handlePermissionAsked called', { requestId: request.id, permission: request.permission });
    
    const existing = this._state().parts.find(p => p.permissionRequest?.id === request.id);
    if (existing) {
      DEBUG_LOG('⏭️ Permission already exists, skipping');
      return;
    }

    this.addLog(`[SECURITY] PERMISSION REQUIRED: ${request.permission}`);
    DEBUG_LOG('🔒 Adding permission to state');
    
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
    DEBUG_LOG('✅ Permission state updated', { pendingPermission: this._state().pendingPermission });
  }

  private handleQuestionAsked(request: any): void {
    DEBUG_LOG('❓ handleQuestionAsked called', { requestId: request.id });
    
    const existing = this._state().parts.find(p => p.questionRequest?.id === request.id);
    if (existing) {
      DEBUG_LOG('⏭️ Question already exists, skipping');
      return;
    }

    // request.questions is an array. For simplicity, we'll take the first one or handle as list
    const mainQuestion = request.questions[0];
    if (!mainQuestion) {
      DEBUG_LOG('⚠️ No main question found');
      return;
    }

    this.addLog(`[QUESTION] AGENT IS ASKING: ${mainQuestion.header}`);
    DEBUG_LOG('💬 Adding question to state', { question: mainQuestion.header });
    
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
    DEBUG_LOG('✅ Question state updated', { pendingQuestion: this._state().pendingQuestion });
  }

  private addLog(message: string): void {
    const currentLogs = this._state().logs;
    if (currentLogs.length > 0 && currentLogs[currentLogs.length - 1] === message) return;
    this._state.update(s => ({ ...s, logs: [...s.logs, message] }));
  }

  private completeAnalysis(result: string): void {
    DEBUG_LOG('🎉 Analysis complete!', { resultLength: result.length });
    this._state.update(s => ({
      ...s, status: 'completed', progress: 100, result,
      currentTool: null, activeSubtasks: [], pendingQuestion: null, pendingPermission: null,
      logs: [...s.logs, '[DONE] OPENCODE PIPELINE FINISHED.']
    }));
    DEBUG_LOG('✅ State updated to completed');
  }

  reset(): void {
    this.lastStatus = null;
    this._state.set({ 
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
      projectPath: AnalyzeService.getInitialProjectPath(), 
      savePath: AnalyzeService.getInitialSavePath(), 
      inputs: [], 
      sessionId: null,
      timelineEvents: []
    });
  }
}
