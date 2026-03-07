import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job } from 'bull';

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
  ) {}

  async addAnalyzeJob(data: AnalyzeJobData): Promise<Job<AnalyzeJobData>> {
    return await this.analyzeQueue.add('analyze', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 10,
      removeOnFail: 5,
    });
  }

  async getJobStatus(jobId: string): Promise<any> {
    const job = await this.analyzeQueue.getJob(jobId);
    if (!job) {
      return null;
    }

    const state = await job.getState();
    const progress = job.progress();

    return {
      id: job.id,
      state,
      progress,
      data: job.data,
      failedReason: job.failedReason,
    };
  }

  async getQueueStatus(): Promise<any> {
    const [waiting, active, completed, failed] = await Promise.all([
      this.analyzeQueue.getWaitingCount(),
      this.analyzeQueue.getActiveCount(),
      this.analyzeQueue.getCompletedCount(),
      this.analyzeQueue.getFailedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      total: waiting + active + completed + failed,
    };
  }

  async pauseQueue(): Promise<void> {
    await this.analyzeQueue.pause();
  }

  async resumeQueue(): Promise<void> {
    await this.analyzeQueue.resume();
  }
}
