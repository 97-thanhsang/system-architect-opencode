import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QueueService, QueueStatus } from '../../core/services/queue.service';
import { WebSocketService, TaskProgressEvent, TaskLogEvent } from '../../core/services/websocket.service';
import { firstValueFrom, timer, Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-queue-monitor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './queue-monitor.component.html',
  styleUrls: ['./queue-monitor.component.scss']
})
export class QueueMonitorComponent implements OnInit, OnDestroy {
  private queueService = inject(QueueService);
  private webSocketService = inject(WebSocketService);
  
  private readonly destroy$ = new Subject<void>();

  // Use Angular Signals for reactive state
  readonly status = signal<QueueStatus | null>(null);
  readonly error = signal<string | null>(null);
  readonly isLoading = signal<boolean>(false);
  
  // Real-time task tracking
  readonly activeTasks = signal<TaskProgressEvent[]>([]);
  readonly logs = signal<string[]>([]);

  ngOnInit(): void {
    this.refreshStatus();
    this.setupWebSocket();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.webSocketService.unsubscribeFromQueueStatus();
  }

  /**
   * Setup real-time updates via WebSocket
   */
  private setupWebSocket(): void {
    this.webSocketService.connect();
    this.webSocketService.subscribeToQueueStatus();

    // Listen to queue status updates
    this.webSocketService.onQueueStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if (res) {
          this.status.set(res);
          this.error.set(null);
        }
      });

    // Listen to all task progress (global monitor)
    this.webSocketService.taskProgress$
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        this.updateActiveTask(event);
      });

    // Listen to logs
    this.webSocketService.taskLog$
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        this.logs.update(prev => [`[${event.taskId}] ${event.log}`, ...prev.slice(0, 49)]);
      });

    // Handle errors
    this.webSocketService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(err => {
        this.error.set(`WebSocket Error: ${err}`);
      });
  }

  private updateActiveTask(event: TaskProgressEvent): void {
    this.activeTasks.update(tasks => {
      const idx = tasks.findIndex(t => t.taskId === event.taskId);
      if (idx !== -1) {
        const newTasks = [...tasks];
        newTasks[idx] = event;
        // Remove if 100%
        if (event.progress === 100) {
          setTimeout(() => {
            this.activeTasks.update(current => current.filter(t => t.taskId !== event.taskId));
          }, 3000);
        }
        return newTasks;
      }
      return [...tasks, event];
    });
  }

  async refreshStatus(): Promise<void> {
    try {
      this.isLoading.set(true);
      const data = await firstValueFrom(this.queueService.getQueueStatus());
      this.status.set(data);
      this.error.set(null);
    } catch (e: any) {
      this.error.set(e?.message || 'Error fetching queue status');
    } finally {
      this.isLoading.set(false);
    }
  }

  async pauseQueue(): Promise<void> {
    try {
      await firstValueFrom(this.queueService.pauseQueue());
      // Status will be updated via WebSocket broadcast
    } catch (e: any) {
      this.error.set('Failed to pause queue');
    }
  }

  async resumeQueue(): Promise<void> {
    try {
      await firstValueFrom(this.queueService.resumeQueue());
      // Status will be updated via WebSocket broadcast
    } catch (e: any) {
      this.error.set('Failed to resume queue');
    }
  }
}
