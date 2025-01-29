import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import * as path from 'path';

@Injectable()
export class PdfService {
  private readonly storage: Storage;

  constructor() {
    // Caminho relativo para o arquivo de credenciais JSON
    const keyFilename = path.join(
      __dirname,
      '../config/serviceAccountKey.json',
    );
    console.log('Path to service account key:', keyFilename); // Verifique o caminho

    // Inicialize o cliente do Google Cloud Storage
    this.storage = new Storage({ keyFilename });
  }

  async extractTextFromPdf(buffer: Buffer): Promise<string> {
    const pdf2jsonModule = await import('pdf2json');
    const PDFParser = pdf2jsonModule.default;

    return new Promise((resolve, reject) => {
      const pdfParser = new PDFParser();

      let fullText = '';

      pdfParser.on('pdfParser_dataError', (errData) => {
        reject(`Error parsing PDF: ${errData.parserError}`);
      });

      pdfParser.on('pdfParser_dataReady', () => {
        fullText = pdfParser.getRawTextContent();
        resolve(fullText);
      });

      pdfParser.parseBuffer(buffer);
    });
  }

  async saveJsonToFirebase(
    jsonContent: string,
    fileName: string,
  ): Promise<void> {
    const bucket = this.storage.bucket('zingchat-89423.appspot.com'); // Nome correto do seu bucket
    const file = bucket.file(fileName);

    return new Promise((resolve, reject) => {
      const stream = file.createWriteStream({
        metadata: {
          contentType: 'application/json',
          public: true,
        },
      });

      stream.on('finish', () => resolve());
      stream.on('error', (err) =>
        reject(`Error uploading JSON: ${err.message}`),
      );
      stream.end(jsonContent);
    });
  }
}
