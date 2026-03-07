import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { AnalyzeJobData } from './queue.service';
import { TasksGateway } from '../websocket/tasks.gateway';

@Processor('analyze')
export class TasksProcessor extends WorkerHost {
  private readonly logger = new Logger(TasksProcessor.name);

  constructor(
    private readonly tasksGateway: TasksGateway,
  ) {
    super();
  }

  async process(job: Job<AnalyzeJobData, any, string>): Promise<any> {
    const { taskId, jiraKey, input, type } = job.data;
    this.logger.debug(`Processing analyze job ${job.id} for task ${taskId}...`);
    
    // Emit start status
    this.tasksGateway.emitTaskStatus(taskId, 'active');
    this.tasksGateway.emitTaskLog(taskId, `Starting analysis for task: ${jiraKey}`);
    
    // Simulate progress updates
    for (let progress = 0; progress <= 100; progress += 20) {
      await job.updateProgress(progress);
      this.logger.debug(`Job ${job.id} progress: ${progress}%`);
      
      // Emit real-time progress via WebSocket
      this.tasksGateway.emitTaskProgress(taskId, progress);
      this.tasksGateway.emitTaskLog(taskId, `Analysis step ${progress/20}: Processing ${input}...`);
      
      // Simulate work
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    this.logger.debug(`Analyze job ${job.id} completed`);
    
    // Emit completion status
    const output = `Analysis completed for: ${input}`;
    this.tasksGateway.emitTaskStatus(taskId, 'completed', output);
    this.tasksGateway.emitTaskLog(taskId, `Analysis finished successfully.`);
    
    return {
      taskId,
      status: 'completed',
      output,
    };
  }
}
