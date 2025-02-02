import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../config/firebase.service';

@Injectable()
export class FilesService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async uploadJson(fileName: string, jsonData: string) {
    const bucket = this.firebaseService.getBucket();
    const fileReference = bucket.file(fileName);

    console.log('📝 Salvando arquivo JSON no Firebase:', fileName);

    try {
      await fileReference.save(jsonData, {
        contentType: 'application/json',
        public: true,
        metadata: {
          customMetadata: {
            uploadDate: new Date().toISOString(),
            fileId: fileName.split('/')[1].split('_')[0], // Extrai o fileId
          },
        },
      });

      console.log('✅ Upload do JSON concluído:', fileName);
    } catch (error) {
      console.error('❌ Erro ao fazer upload do JSON:', error);
      throw new Error('Failed to upload JSON');
    }
  }

  async getFileUrl() {
    const bucket = this.firebaseService.getBucket();
    const [files] = await bucket.getFiles({
      prefix: 'jsons/', // Busca apenas arquivos JSON
    });

    console.log(
      '🔍 Arquivos encontrados no Firebase:',
      files.map((f) => f.name),
    );

    return files.map((file) => ({
      name: file.name,
      url: `https://storage.googleapis.com/${bucket.name}/${file.name}`,
    }));
  }

  getBucketName() {
    return this.firebaseService.getBucket().name;
  }
}
