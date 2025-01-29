import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { FirebaseService } from '../config/firebase.service';
import { PdfService } from './services/pdf.service';

@Module({
  controllers: [FilesController],
  providers: [FilesService, FirebaseService, PdfService],
  exports: [FilesService],
})
export class FilesModule {}
