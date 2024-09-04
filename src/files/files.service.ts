import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../config/firebase.service';
import pdfParse from 'pdf-parse';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilesService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async saveExtractedText(text: string) {
    const datastore = this.firebaseService.getDatastore();
    const chunkSize = 1500; // Tamanho máximo permitido para o conteúdo
    const textChunks = text.match(new RegExp(`.{1,${chunkSize}}`, 'g')) || [];

    // Salva cada pedaço de texto como uma entidade separada
    await Promise.all(
      textChunks.map(async (chunk, index) => {
        const key = datastore.key(['pdfContents', uuidv4()]); // Gera uma chave para o Datastore
        const entity = {
          key: key,
          data: {
            content: chunk,
            createdAt: new Date().toISOString(),
            chunkIndex: index,
            totalChunks: textChunks.length,
          },
        };
        await datastore.save(entity);
      }),
    );
  }

  async extractTextFromPdf(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  async uploadFile(fileName: string, buffer: Buffer) {
    const bucket = this.firebaseService.getBucket();
    const fileReference = bucket.file(fileName);

    try {
      await fileReference.save(buffer, {
        contentType: 'application/pdf',
        public: true,
        metadata: {
          customMetadata: {
            uploadDate: new Date().toISOString(),
            fileId: fileName.split('/')[1].split('_')[0],
          },
        },
      });
      const extractedText = await this.extractTextFromPdf(buffer);
      await this.saveExtractedText(extractedText);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  async getFileUrl(fileId: string) {
    const bucket = this.firebaseService.getBucket();
    const [files] = await bucket.getFiles({
      prefix: `pdfs/${fileId}`, // Filtra arquivos com base no fileId
    });

    if (files.length === 0) {
      throw new Error('File not found');
    }

    const fileName = files[0].name;
    return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
  }

  async getFiles() {
    const bucket = this.firebaseService.getBucket();
    const [files] = await bucket.getFiles({
      prefix: 'pdfs/', // Filtra arquivos dentro da pasta 'pdfs'
    });

    return files.map((file) => ({
      name: file.name,
      url: `https://storage.googleapis.com/${bucket.name}/${file.name}`,
    }));
  }

  getBucketName() {
    return this.firebaseService.getBucket().name;
  }
}
