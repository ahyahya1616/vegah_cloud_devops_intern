import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './task.entity.js';

@Processor('tasks')
export class TasksProcessor extends WorkerHost {
  private readonly logger = new Logger(TasksProcessor.name);

  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
  ) {
    super();
  }

  async process(job: Job<{ taskId: string; title: string; payload?: string }>): Promise<any> {
    const { taskId, title } = job.data;
    this.logger.log(`[Worker] Started processing task: ${taskId} ("${title}")`);

    // 1. Update task to PROCESSING
    await this.taskRepo.update(taskId, {
      status: TaskStatus.PROCESSING,
    });

    // 2. Simulate asynchronous workload (e.g. 4 seconds data computation / image processing)
    await new Promise((resolve) => setTimeout(resolve, 4000));

    // 3. Complete task with output result
    const resultMessage = `Successfully processed "${title}" at ${new Date().toISOString()}`;
    await this.taskRepo.update(taskId, {
      status: TaskStatus.COMPLETED,
      result: resultMessage,
    });

    this.logger.log(`[Worker] Completed task: ${taskId}`);
    return { result: resultMessage };
  }
}

