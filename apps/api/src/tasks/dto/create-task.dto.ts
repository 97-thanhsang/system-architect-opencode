import { IsString, IsOptional, IsEnum, IsObject, IsNotEmpty } from 'class-validator';
import { TaskType, TaskStatus } from '../entities/task.entity';

export class CreateTaskDto {
  @IsString()
  @IsOptional()
  jiraKey?: string;

  @IsEnum(TaskType)
  @IsNotEmpty()
  type: TaskType;

  @IsString()
  @IsNotEmpty()
  input: string;

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
