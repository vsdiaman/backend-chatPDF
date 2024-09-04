import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [HttpModule, FilesModule, ConfigModule.forRoot()],
  providers: [ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
