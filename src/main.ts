import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { Controller, Get } from '@nestjs/common';
import * as bodyParser from 'body-parser';

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

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  // Registra o controlador principal
  // app.use('/', (req, res) => res.json({ message: 'API Online 🚀' }));

  app.enableCors({
    origin: '*', // 🔥 Permite qualquer origem (apenas para testes locais!)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  const PORT = process.env.PORT || 4000;
  await app.listen(PORT, '0.0.0.0', () =>
    console.log(`🚀 Server running on port ${PORT}`),
  );
}

bootstrap();
