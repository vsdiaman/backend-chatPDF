import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './chat/chat.module'; // Ajuste o caminho conforme a estrutura do seu projeto
import { FilesModule } from './files/files.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), FilesModule, ChatModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
