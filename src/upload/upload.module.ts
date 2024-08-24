import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { FirebaseModule } from '../config/firebase.module';

@Module({
  imports: [FirebaseModule],
  controllers: [UploadController],
})
export class UploadModule {}
