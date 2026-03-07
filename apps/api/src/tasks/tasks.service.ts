import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.taskRepository.create(createTaskDto);
    return await this.taskRepository.save(task);
  }

  async findAll(): Promise<Task[]> {
    return await this.taskRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    return task;
  }

  async findByJiraKey(jiraKey: string): Promise<Task[]> {
    return await this.taskRepository.find({
      where: { jiraKey },
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: TaskStatus): Promise<Task[]> {
    return await this.taskRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    Object.assign(task, updateTaskDto);
    return await this.taskRepository.save(task);
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    await this.taskRepository.remove(task);
  }

  async updateProgress(id: string, progress: number): Promise<Task> {
    const task = await this.findOne(id);
    task.metadata = { ...task.metadata, progress };
    return await this.taskRepository.save(task);
  }

  async addLog(id: string, log: string): Promise<Task> {
    const task = await this.findOne(id);
    const logs = task.metadata?.logs || [];
    logs.push(log);
    task.metadata = { ...task.metadata, logs };
    return await this.taskRepository.save(task);
  }
}
