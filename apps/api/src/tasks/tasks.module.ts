import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Pipeline } from './entities/pipeline.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Pipeline])],
  exports: [TypeOrmModule],
})
export class TasksModule {}
