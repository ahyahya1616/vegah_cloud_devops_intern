import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { WorkerModule } from './worker.module.js';

async function bootstrap() {
  const logger = new Logger('WorkerService');
  const app = await NestFactory.createApplicationContext(WorkerModule);
  app.enableShutdownHooks();
  logger.log('🚀 Redis Background Worker started and listening for jobs...');

  setInterval(() => {}, 60000);
}

bootstrap().catch((err) => {
  console.error('Fatal worker error', err);
  process.exit(1);
});
