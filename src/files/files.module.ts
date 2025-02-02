import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { FirebaseService } from '../config/firebase.service';

@Module({
  controllers: [FilesController],
  providers: [FilesService, FirebaseService],
})
export class FilesModule {}
