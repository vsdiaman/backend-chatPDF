import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { FirebaseService } from '../config/firebase.service';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

@Controller('/')
export class UploadController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Post()
  @UseInterceptors(FileInterceptor('pdf', { storage: multer.memoryStorage() }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { statusCode: 400, message: 'No file uploaded.' };
    }

    const { originalname, buffer } = file;
    const fileId = uuidv4();
    const fileName = `pdfs/${fileId}_${Date.now()}_${originalname}`;
    const bucket = this.firebaseService.getBucket();
    const fileReference = bucket.file(fileName);

    try {
      await fileReference.save(buffer, {
        contentType: 'application/pdf',
        public: true,
        metadata: {
          customMetadata: {
            uploadDate: new Date().toISOString(),
            fileId: fileId,
          },
        },
      });

      const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      return { statusCode: 200, fileUrl, fileId };
    } catch (error) {
      console.error('Error uploading file:', error);
      return { statusCode: 500, message: 'Failed to upload file.' };
    }
  }
}
