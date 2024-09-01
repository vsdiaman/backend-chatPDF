import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../config/firebase.service';
// import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilesService {
  constructor(private readonly firebaseService: FirebaseService) {}

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
            fileId: fileName.split('/')[1].split('_')[0], // Extrai o fileId do nome do arquivo
          },
        },
      });
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
