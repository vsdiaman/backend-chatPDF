import { Injectable } from '@nestjs/common';
import { PdfService } from './services/pdf.service';

@Injectable()
export class FilesService {
  constructor(private readonly pdfService: PdfService) {}

  async uploadFile(fileName: string, buffer: Buffer) {
    try {
      console.log('Extraindo texto do PDF...');
      const extractedText = await this.pdfService.extractTextFromPdf(buffer);
      console.log('Texto extraído:', extractedText);

      return {
        text: extractedText, // Retorna o texto extraído diretamente
      };
    } catch (error) {
      console.error('Erro ao processar o PDF:', error);
      throw new Error('Falha ao extrair o texto do PDF');
    }
  }
}
