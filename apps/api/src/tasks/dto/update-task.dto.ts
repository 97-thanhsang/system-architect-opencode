import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { TaskStatus } from '../entities/task.entity';

export class UpdateTaskDto {
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsString()
  @IsOptional()
  output?: string;

  @IsObject()
  @IsOptional()
  metadata?: {
    projectPath?: string;
    outputPath?: string;
    progress?: number;
    logs?: string[];
  };
}
