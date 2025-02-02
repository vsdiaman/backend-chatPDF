import { Module } from '@nestjs/common';
import { FilesController } from './files/files.controller';
import { FirebaseService } from './config/firebase.service';
import { FilesModule } from './files/files.module';
import { ChatModule } from './chat/chat.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), FilesModule, ChatModule],
  controllers: [FilesController], // Garante que o controller está registrado
  providers: [FirebaseService],
})
export class AppModule {}
