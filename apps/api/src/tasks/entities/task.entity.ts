import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum TaskStatus {
  PENDING = 'pending',
  QUEUED = 'queued',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum TaskType {
  JIRA = 'jira',
  URL = 'url',
  TEXT = 'text',
}

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  jiraKey: string;

  @Column({
    type: 'varchar',
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @Column({
    type: 'varchar',
  })
  type: TaskType;

  @Column({ type: 'text' })
  input: string;

  @Column({ type: 'text', nullable: true })
  output: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata: {
    projectPath?: string;
    outputPath?: string;
    progress?: number;
    logs?: string[];
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
