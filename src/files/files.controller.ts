import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import pdfParse from 'pdf-parse';
import { v4 as uuidv4 } from 'uuid';
import { FirebaseService } from '../config/firebase.service';

@Controller('files')
export class FilesController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // Mantém o nome correto do campo
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
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
      const jsonData = JSON.stringify({ text: pdfData.text });

      // Define o nome do arquivo JSON
      const fileName = `jsons/${uuidv4()}.json`;

      console.log('Salvando arquivo JSON:', fileName);

      // Obtém a instância do bucket do FirebaseService
      const bucket = this.firebaseService.getBucket();
      const fileUpload = bucket.file(fileName);

      await fileUpload.save(jsonData, {
        contentType: 'application/json',
      });

      return {
        message: 'Arquivo convertido e enviado com sucesso!',
        fileName,
        url: `https://storage.googleapis.com/${bucket.name}/${fileName}`,
        pdfText: pdfData.text, // 🔥 Retorna o texto extraído!
      };
    } catch (error) {
      console.error('Erro ao processar o arquivo:', error);
      return { message: 'Erro ao processar o arquivo.', error };
    }
  }
}
