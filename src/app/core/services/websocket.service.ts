import { Injectable, signal, computed, inject, NgZone, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, timer, Subscription } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';
import { io, Socket } from 'socket.io-client';
import { TokenStorageService } from '../auth/token-storage.service';
import { environment } from '../../../environments/environment';

/**
 * WebSocket connection states
 */
export enum WebSocketConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

/**
 * Event types emitted by WebSocket service
 */
export interface TaskProgressEvent {
  taskId: string;
  progress: number;
  logs?: string[];
  timestamp: string;
}

export interface TaskStatusEvent {
  taskId: string;
  status: string;
  output?: string;
  timestamp: string;
}

export interface TaskLogEvent {
  taskId: string;
  log: string;
  timestamp: string;
}

export interface QueueStatusEvent {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  total: number;
}

export interface SubscribeEvent {
  taskId?: string;
  [key: string]: unknown;
}

/**
 * WebSocket configuration options
 */
export interface WebSocketConfig {
  /** WebSocket server URL */
  wsUrl: string;
  /** Maximum reconnection attempts (default: 5) */
  maxReconnectAttempts: number;
  /** Initial reconnect delay in ms (default: 1000) */
  reconnectDelay: number;
  /** Maximum reconnect delay in ms (default: 30000) */
  maxReconnectDelay: number;
  /** Enable debug logging (default: false) */
  debugLogging: boolean;
}

/**
 * WebSocketService - Real-time communication with backend
 *
 * Features:
 * - Socket.io connection management
 * - JWT authentication via handshake
 * - Auto-reconnect with exponential backoff
 * - Room management for tasks and queue
 * - RxJS Observables for all events
 * - Connection state management with Angular Signals
 *
 * Usage:
 * ```typescript
 * // Connect
 * webSocketService.connect();
 *
 * // Subscribe to task progress
 * webSocketService.onTaskProgress().subscribe(event => {
 *   console.log('Progress:', event.progress);
 * });
 *
 * // Subscribe to specific task
 * webSocketService.subscribeToTask('task-123');
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class WebSocketService implements OnDestroy {
  // Dependencies
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly ngZone = inject(NgZone);

  // Configuration
  private readonly config: WebSocketConfig = {
    wsUrl: environment.apiUrl.replace('http', 'ws') + '/tasks',
    maxReconnectAttempts: 5,
    reconnectDelay: 1000,
    maxReconnectDelay: 30000,
    debugLogging: false
  };

  // Socket instance
  private socket: Socket | null = null;
  private readonly destroy$ = new Subject<void>();

  // Reconnection state
  private reconnectAttempts = 0;
  private reconnectTimer: Subscription | null = null;
  private shouldReconnect = true;

  // Angular Signals for reactive state
  private readonly _connectionState = signal<WebSocketConnectionState>(WebSocketConnectionState.DISCONNECTED);
  private readonly _connectedTaskIds = signal<Set<string>>(new Set());
  private readonly _subscribedToQueue = signal<boolean>(false);
  private readonly _lastError = signal<string | null>(null);

  // Public readonly signals
  readonly connectionState = this._connectionState.asReadonly();
  readonly connectedTaskIds = this._connectedTaskIds.asReadonly();
  readonly subscribedToQueue = this._subscribedToQueue.asReadonly();
  readonly lastError = this._lastError.asReadonly();

  // Computed signals
  readonly isConnected = computed(() => 
    this._connectionState() === WebSocketConnectionState.CONNECTED
  );

  readonly isConnecting = computed(() => 
    this._connectionState() === WebSocketConnectionState.CONNECTING
  );

  readonly isReconnecting = computed(() => 
    this._connectionState() === WebSocketConnectionState.RECONNECTING
  );

  // Event subjects for RxJS observables
  private readonly _taskProgress$ = new Subject<TaskProgressEvent>();
  private readonly _taskStatus$ = new Subject<TaskStatusEvent>();
  private readonly _taskLog$ = new Subject<TaskLogEvent>();
  private readonly _queueStatus$ = new Subject<QueueStatusEvent>();
  private readonly _connectionState$ = new BehaviorSubject<WebSocketConnectionState>(
    WebSocketConnectionState.DISCONNECTED
  );
  private readonly _error$ = new Subject<string>();

  // Public observables
  /** Observable of task progress events */
  readonly taskProgress$ = this._taskProgress$.asObservable();
  
  /** Observable of task status events */
  readonly taskStatus$ = this._taskStatus$.asObservable();
  
  /** Observable of task log events */
  readonly taskLog$ = this._taskLog$.asObservable();
  
  /** Observable of queue status events */
  readonly queueStatus$ = this._queueStatus$.asObservable();
  
  /** Observable of connection state changes */
  readonly connectionStateChange$ = this._connectionState$.asObservable();
  
  /** Observable of error events */
  readonly error$ = this._error$.asObservable();

  constructor() {
    this.log('WebSocketService initialized');
  }

  /**
   * Connect to WebSocket server
   * Automatically authenticates with JWT token
   */
  connect(): void {
    if (this.socket?.connected) {
      this.log('Already connected');
      return;
    }

    this.shouldReconnect = true;
    this.updateConnectionState(WebSocketConnectionState.CONNECTING);

    // Get JWT token for authentication
    const token = this.tokenStorage.getAccessToken();

    this.log('Connecting to WebSocket server:', this.config.wsUrl);

    // Create socket connection with authentication
    this.socket = io(this.config.wsUrl, {
      auth: {
        token: token
      },
      transports: ['websocket'],
      reconnection: false, // We handle reconnection manually
      timeout: 10000,
      forceNew: true
    });

    this.setupEventHandlers();
  }

  /**
   * Disconnect from WebSocket server
   * @param force - If true, prevents auto-reconnect
   */
  disconnect(force = false): void {
    this.shouldReconnect = !force;

    if (this.reconnectTimer) {
      this.reconnectTimer.unsubscribe();
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.updateConnectionState(WebSocketConnectionState.DISCONNECTED);
    this._connectedTaskIds.set(new Set());
    this._subscribedToQueue.set(false);
    
    this.log('Disconnected from WebSocket server');
  }

  /**
   * Subscribe to a specific task's updates
   * @param taskId - Task ID to subscribe to
   */
  subscribeToTask(taskId: string): void {
    if (!this.socket?.connected) {
      this.log('Cannot subscribe: not connected');
      return;
    }

    this.socket.emit('subscribe-task', taskId);
    
    // Update local state
    const current = this._connectedTaskIds();
    const updated = new Set(current);
    updated.add(taskId);
    this._connectedTaskIds.set(updated);

    this.log(`Subscribed to task: ${taskId}`);
  }

  /**
   * Unsubscribe from a specific task
   * @param taskId - Task ID to unsubscribe from
   */
  unsubscribeFromTask(taskId: string): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('unsubscribe-task', taskId);
    
    // Update local state
    const current = this._connectedTaskIds();
    const updated = new Set(current);
    updated.delete(taskId);
    this._connectedTaskIds.set(updated);

    this.log(`Unsubscribed from task: ${taskId}`);
  }

  /**
   * Subscribe to queue status updates
   */
  subscribeToQueueStatus(): void {
    if (!this.socket?.connected) {
      this.log('Cannot subscribe: not connected');
      return;
    }

    this.socket.emit('subscribe-queue');
    this._subscribedToQueue.set(true);
    this.log('Subscribed to queue status');
  }

  /**
   * Unsubscribe from queue status updates
   */
  unsubscribeFromQueueStatus(): void {
    if (!this.socket?.connected) {
      return;
    }

    // Socket.io doesn't have unsubscribe for rooms
    // We just stop listening locally
    this._subscribedToQueue.set(false);
    this.log('Unsubscribed from queue status');
  }

  /**
   * Get Observable for specific task progress
   * @param taskId - Filter events for specific task
   * @returns Observable of progress events
   */
  onTaskProgress(taskId?: string): Observable<TaskProgressEvent> {
    if (taskId) {
      return this._taskProgress$.pipe(
        filter(event => event.taskId === taskId)
      );
    }
    return this._taskProgress$;
  }

  /**
   * Get Observable for specific task status
   * @param taskId - Filter events for specific task
   * @returns Observable of status events
   */
  onTaskStatus(taskId?: string): Observable<TaskStatusEvent> {
    if (taskId) {
      return this._taskStatus$.pipe(
        filter(event => event.taskId === taskId)
      );
    }
    return this._taskStatus$;
  }

  /**
   * Get Observable for specific task logs
   * @param taskId - Filter events for specific task
   * @returns Observable of log events
   */
  onTaskLog(taskId?: string): Observable<TaskLogEvent> {
    if (taskId) {
      return this._taskLog$.pipe(
        filter(event => event.taskId === taskId)
      );
    }
    return this._taskLog$;
  }

  /**
   * Get Observable for queue status updates
   * @returns Observable of queue status events
   */
  onQueueStatus(): Observable<QueueStatusEvent> {
    return this._queueStatus$;
  }

  /**
   * Setup socket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      this.ngZone.run(() => {
        this.reconnectAttempts = 0;
        this.updateConnectionState(WebSocketConnectionState.CONNECTED);
        this._lastError.set(null);
        this.log('Connected to WebSocket server');
      });
    });

    this.socket.on('disconnect', (reason) => {
      this.ngZone.run(() => {
        this.log('Disconnected:', reason);
        
        if (this.shouldReconnect && reason !== 'io client disconnect') {
          this.attemptReconnect();
        } else {
          this.updateConnectionState(WebSocketConnectionState.DISCONNECTED);
        }
      });
    });

    this.socket.on('connect_error', (error) => {
      this.ngZone.run(() => {
        this.log('Connection error:', error.message);
        this._lastError.set(error.message);
        this._error$.next(error.message);
        this.updateConnectionState(WebSocketConnectionState.ERROR);
      });
    });

    // Task events
    this.socket.on('task-progress', (data: TaskProgressEvent) => {
      this.ngZone.run(() => {
        this._taskProgress$.next(data);
      });
    });

    this.socket.on('task-status', (data: TaskStatusEvent) => {
      this.ngZone.run(() => {
        this._taskStatus$.next(data);
      });
    });

    this.socket.on('task-log', (data: TaskLogEvent) => {
      this.ngZone.run(() => {
        this._taskLog$.next(data);
      });
    });

    // Queue events
    this.socket.on('queue-status', (data: QueueStatusEvent) => {
      this.ngZone.run(() => {
        this._queueStatus$.next(data);
      });
    });

    // Subscription confirmations
    this.socket.on('subscribed', (data: SubscribeEvent) => {
      if (data?.taskId) {
        this.log(`Subscription confirmed for task: ${data.taskId}`);
      }
    });

    this.socket.on('unsubscribed', (data: SubscribeEvent) => {
      if (data?.taskId) {
        this.log(`Unsubscription confirmed for task: ${data.taskId}`);
      }
    });

    this.socket.on('subscribed-queue', () => {
      this.log('Queue subscription confirmed');
    });
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (!this.shouldReconnect || this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.log('Max reconnection attempts reached or reconnection disabled');
      this.updateConnectionState(WebSocketConnectionState.DISCONNECTED);
      return;
    }

    this.reconnectAttempts++;
    this.updateConnectionState(WebSocketConnectionState.RECONNECTING);

    // Calculate delay with exponential backoff
    const delay = Math.min(
      this.config.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.config.maxReconnectDelay
    );

    this.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`);

    this.reconnectTimer = timer(delay)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.log('Attempting reconnection...');
        this.connect();
      });
  }

  /**
   * Update connection state and emit to observables
   */
  private updateConnectionState(state: WebSocketConnectionState): void {
    this._connectionState.set(state);
    this._connectionState$.next(state);
  }

  /**
   * Update configuration
   * @param config - Partial config to merge
   */
  updateConfig(config: Partial<WebSocketConfig>): void {
    Object.assign(this.config, config);
    this.log('Configuration updated:', this.config);
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<WebSocketConfig> {
    return { ...this.config };
  }

  /**
   * Debug logging
   */
  private log(...args: unknown[]): void {
    if (this.config.debugLogging) {
      console.log('[WebSocketService]', ...args);
    }
  }

  /**
   * Cleanup on service destruction
   */
  ngOnDestroy(): void {
    this.disconnect(true);
    this.destroy$.next();
    this.destroy$.complete();
    this._taskProgress$.complete();
    this._taskStatus$.complete();
    this._taskLog$.complete();
    this._queueStatus$.complete();
    this._connectionState$.complete();
    this._error$.complete();
  }
}
