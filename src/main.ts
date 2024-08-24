import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3001', // Ajuste para o URL do seu frontend
    methods: 'GET,POST',
    allowedHeaders: 'Content-Type',
  });
  await app.listen(4000); // Ajuste para a porta correta
}
bootstrap();
