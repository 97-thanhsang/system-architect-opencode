import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';

export enum PipelineStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PAUSED = 'paused',
}

export enum PipelineStep {
  ANALYZE = 'analyze',
  SOLUTION = 'solution',
  EXECUTE = 'execute',
  REVIEW = 'review',
}

@Entity()
export class Pipeline {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'varchar',
    default: PipelineStatus.PENDING,
  })
  status: PipelineStatus;

  @Column({
    type: 'varchar',
    default: PipelineStep.ANALYZE,
  })
  currentStep: PipelineStep;

  @Column('simple-array')
  steps: PipelineStep[];

  @Column({ type: 'simple-json', nullable: true })
  checkpoint: {
    step: PipelineStep;
    data: any;
    timestamp: Date;
  };

  @ManyToOne(() => Task, { nullable: true })
  @JoinColumn()
  currentTask: Task;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
