import {
  Controller,
  Post,
  Get,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { Express } from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('pdf', { storage: multer.memoryStorage() }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { statusCode: 400, message: 'No file uploaded.' };
    }
    const { originalname, buffer } = file;
    const fileId = uuidv4();
    const fileName = `pdfs/${fileId}_${Date.now()}_${originalname}`;

    try {
      await this.filesService.uploadFile(fileName, buffer);
      const fileUrl = `https://storage.googleapis.com/${this.filesService.getBucketName()}/${fileName}`;
      return { statusCode: 200, fileId, fileUrl };
    } catch (error) {
      console.error('Error uploading file: ' + error);
      return { statusCode: 500, message: 'Failed to upload file' };
    }
  }

  @Get()
  async getFiles() {
    return this.filesService.getFiles();
  }
}
