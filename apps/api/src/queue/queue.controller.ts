import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { QueueService } from '../queue/queue.service';
import { AnalyzeJobData } from '../queue/queue.service';

@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Get('status')
  async getQueueStatus(): Promise<any> {
    return await this.queueService.getQueueStatus();
  }

  @Get('job/:id')
  async getJobStatus(@Param('id') jobId: string): Promise<any> {
    return await this.queueService.getJobStatus(jobId);
  }

  @Post('analyze')
  async addAnalyzeJob(@Body() jobData: AnalyzeJobData): Promise<any> {
    const job = await this.queueService.addAnalyzeJob(jobData);
    return {
      jobId: job.id,
      status: 'queued',
    };
  }

  @Post('pause')
  async pauseQueue(): Promise<{ status: string }> {
    await this.queueService.pauseQueue();
    return { status: 'paused' };
  }

  @Post('resume')
  async resumeQueue(): Promise<{ status: string }> {
    await this.queueService.resumeQueue();
    return { status: 'resumed' };
  }
}
