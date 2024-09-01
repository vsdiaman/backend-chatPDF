import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './chat/chat.module'; // Ajuste o caminho conforme a estrutura do seu projeto

@Module({
  imports: [
    ConfigModule.forRoot(), // Carrega variáveis de ambiente
    ChatModule, // Importa o módulo de chat
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
