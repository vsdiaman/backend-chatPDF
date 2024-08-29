import { Module } from '@nestjs/common';
import { FilesModule } from './files/files.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [FilesModule, ChatModule],
})
export class AppModule {}
