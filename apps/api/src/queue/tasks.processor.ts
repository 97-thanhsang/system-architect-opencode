import { Processor, Process, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { AnalyzeJobData } from './queue.service';

@Processor('analyze')
export class TasksProcessor {
  private readonly logger = new Logger(TasksProcessor.name);

  @Process('analyze')
  async handleAnalyze(job: Job<AnalyzeJobData>): Promise<any> {
    this.logger.debug(`Processing analyze job ${job.id}...`);
    
    const { taskId, jiraKey, input, type } = job.data;
    
    // Simulate progress updates
    for (let progress = 0; progress <= 100; progress += 20) {
      await job.progress(progress);
      this.logger.debug(`Job ${job.id} progress: ${progress}%`);
      
      // Simulate work
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.logger.debug(`Analyze job ${job.id} completed`);
    
    return {
      taskId,
      status: 'completed',
      output: `Analysis completed for: ${input}`,
    };
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(`Job ${job.id} has started`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.debug(`Job ${job.id} has completed with result:`, result);
  }

  @OnQueueFailed()
  onFailed(job: Job, err: Error) {
    this.logger.error(`Job ${job.id} has failed with error:`, err.message);
  }
}
