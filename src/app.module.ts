import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadModule } from './upload/upload.module';
import { FirebaseModule } from './config/firebase.module';

@Module({
  imports: [ConfigModule.forRoot(), UploadModule, FirebaseModule],
})
export class AppModule {}
