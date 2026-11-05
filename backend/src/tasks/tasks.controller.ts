import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TasksService } from './tasks.service.js';

@Controller('api/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(@Body() body: { title: string; payload?: string }) {
    const title = body?.title?.trim() || `Task-${Date.now()}`;
    return this.tasksService.createTask(title, body?.payload);
  }

  @Get()
  async findAll() {
    return this.tasksService.getAllTasks();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tasksService.getTaskById(id);
  }
}

