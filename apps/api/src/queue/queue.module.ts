import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueueService } from './queue.service';
import { TasksProcessor } from './tasks.processor';
import { QueueController } from './queue.controller';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    BullModule.registerQueue({
      name: 'analyze',
    }),
    WebsocketModule,
  ],
  controllers: [QueueController],
  providers: [QueueService, TasksProcessor],
  exports: [QueueService],
})
export class QueueModule {}
