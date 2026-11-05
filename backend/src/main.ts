import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });
  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`Backend API running on port ${port}`);
}
await bootstrap();
