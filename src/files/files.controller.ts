import {
  Controller,
  Post,
  Get,
  UploadedFile,
  UseInterceptors,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import pdfParse from 'pdf-parse';
import { v4 as uuidv4 } from 'uuid';
import { FirebaseService } from '../config/firebase.service';

@Controller('files')
export class FilesController {
  constructor(private readonly firebaseService: FirebaseService) {}
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log('Arquivo recebido:', file);
    console.log(
      'Arquivo recebido no backend:',
      file.mimetype,
      file.originalname,
    );

    try {
      if (file.mimetype !== 'application/pdf') {
        return { message: 'Apenas arquivos PDF são permitidos.' };
      }

      // Converte o PDF para JSON
      const pdfData = await pdfParse(file.buffer);
      const jsonData = { text: pdfData.text }; // 🔥 Evita JSON.stringify()

      // Gera um ID único para o arquivo
      const fileId = uuidv4();
      const fileName = `jsons/${fileId}.json`;

      // Obtém a instância do bucket do FirebaseService
      const bucket = this.firebaseService.getBucket();
      const fileUpload = bucket.file(fileName);

      // 🔥 Salva o arquivo com metadados
      await fileUpload.save(JSON.stringify(jsonData), {
        contentType: 'application/json',
        metadata: {
          metadata: { fileId }, // 🔥 Salva o ID nos metadados do arquivo!
        },
      });

      return {
        message: 'Arquivo convertido e enviado com sucesso!',
        fileName,
        url: `https://storage.googleapis.com/${bucket.name}/${fileName}`,
        fileId,
        pdfText: pdfData.text, // 🔥 Retorna o texto extraído!
      };
    } catch (error) {
      console.error('Erro ao processar o arquivo:', error);
      return { message: 'Erro ao processar o arquivo.', error };
    }
  }
  @Get(':fileId')
  async getFile(@Param('fileId') fileId: string) {
    try {
      const filePath = `jsons/${fileId}.json`;
      const bucket = this.firebaseService.getBucket();
      const file = bucket.file(filePath);

      const [exists] = await file.exists();
      if (!exists) {
        return { message: 'Arquivo não encontrado.' };
      }

      const [content] = await file.download();
      const jsonData = JSON.parse(content.toString());

      return { fileId, data: jsonData };
    } catch (error) {
      console.error('Erro ao buscar arquivo:', error);
      return { message: 'Erro ao buscar o arquivo.', error };
    }
  }
}
