// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT;
  app.enableCors();
  await app.listen('Porta:' + port);
}
bootstrap();
setInterval(() => {
  const used = process.memoryUsage();
  console.log(`Heap: ${Math.round(used.heapUsed / 1024 / 1024)} MB`);
}, 10000); // A cada 10 segundos
