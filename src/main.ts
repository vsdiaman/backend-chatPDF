import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { Controller, Get } from '@nestjs/common';
dotenv.config();

@Controller()
export class AppController {
  @Get()
  getHome() {
    return { message: 'API Online 🚀' };
  }
}
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['https://www.askpdf.cloud', 'http://localhost:3000'], // Adicione localhost para testes
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  const PORT = process.env.PORT || 4000;
  await app.listen(PORT, () =>
    console.log(`🚀 Server running on port ${PORT}`),
  );
  await app.listen(PORT, '0.0.0.0');
}
bootstrap();
