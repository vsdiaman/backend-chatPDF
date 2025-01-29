import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { Express } from 'express';
import { memoryStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('pdf', { storage: memoryStorage() }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { statusCode: 400, message: 'No file uploaded.' };
    }
    const { originalname, buffer } = file;
    const fileId = uuidv4();
    const fileName = `pdfs/${fileId}_${Date.now()}_${originalname}`;

    const uploadDir = path.join(__dirname, '..', 'uploads', 'pdfs'); // Diretório onde os PDFs serão salvos

    // Verifica se o diretório 'pdfs' existe
    if (!fs.existsSync(uploadDir)) {
      // Cria o diretório 'pdfs' se ele não existir
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);

    try {
      // Salva o arquivo no diretório 'pdfs'
      fs.writeFileSync(filePath, buffer);

      // Retorna a URL para acessar o arquivo
      const fileUrl = `http://localhost:3000/listpdf/${fileName}`;

      return { statusCode: 200, fileId, fileUrl };
    } catch (error) {
      console.error('Error uploading file: ', error);
      return { statusCode: 500, message: 'Failed to upload file' };
    }
  }
}
