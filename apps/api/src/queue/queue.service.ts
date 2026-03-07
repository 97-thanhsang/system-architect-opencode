import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { TasksGateway } from '../websocket/tasks.gateway';

export interface AnalyzeJobData {
  taskId: string;
  jiraKey?: string;
  input: string;
  type: string;
  projectPath?: string;
  outputPath?: string;
}

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('analyze') private readonly analyzeQueue: Queue,
    private readonly tasksGateway: TasksGateway,
  ) {}

  async addAnalyzeJob(data: AnalyzeJobData): Promise<Job<AnalyzeJobData, any, string>> {
    const job = await this.analyzeQueue.add('analyze', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 10,
      removeOnFail: 5,
    });
    
    // Broadcast updated status
    this.broadcastQueueStatus();
    
    return job;
  }

  async getJobStatus(jobId: string): Promise<any> {
    const job = await this.analyzeQueue.getJob(jobId);
    if (!job) {
      return null;
    }

    const state = await job.getState();

    return {
      id: job.id,
      state,
      progress: job.progress,
      data: job.data,
      failedReason: job.failedReason,
    };
  }

  async getQueueStatus(): Promise<any> {
    const waiting = await this.analyzeQueue.getWaitingCount();
    const active = await this.analyzeQueue.getActiveCount();
    const completed = await this.analyzeQueue.getCompletedCount();
    const failed = await this.analyzeQueue.getFailedCount();

    const status = {
      waiting,
      active,
      completed,
      failed,
      total: waiting + active + completed + failed,
    };

    return status;
  }

  async pauseQueue(): Promise<void> {
    await this.analyzeQueue.pause();
    this.broadcastQueueStatus();
  }

  async resumeQueue(): Promise<void> {
    await this.analyzeQueue.resume();
    this.broadcastQueueStatus();
  }

  /**
   * Helper to broadcast status to all WebSocket clients
   */
  async broadcastQueueStatus(): Promise<void> {
    const status = await this.getQueueStatus();
    this.tasksGateway.emitQueueStatus(status);
  }
}
