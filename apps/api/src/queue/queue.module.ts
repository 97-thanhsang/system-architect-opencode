import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueService } from './queue.service';
import { TasksProcessor } from './tasks.processor';
import { QueueController } from './queue.controller';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'analyze',
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
  ],
  controllers: [QueueController],
  providers: [QueueService, TasksProcessor],
  exports: [QueueService],
})
export class QueueModule {}
