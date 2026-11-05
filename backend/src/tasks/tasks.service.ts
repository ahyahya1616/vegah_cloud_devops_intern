import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Task, TaskStatus } from './task.entity.js';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    @InjectQueue('tasks')
    private readonly taskQueue: Queue,
  ) {}

  async createTask(title: string, payload?: string): Promise<Task> {
    const task = this.taskRepo.create({
      title,
      payload: payload || '',
      status: TaskStatus.PENDING,
    });
    const saved = await this.taskRepo.save(task);

    // Enqueue to Redis
    await this.taskQueue.add('process-task', {
      taskId: saved.id,
      title: saved.title,
      payload: saved.payload,
    });

    return saved;
  }

  async getAllTasks(): Promise<Task[]> {
    return this.taskRepo.find({
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async getTaskById(id: string): Promise<Task> {
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
    return task;
  }
}

