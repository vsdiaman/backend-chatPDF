import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Datastore } from '@google-cloud/datastore';
import { Bucket } from '@google-cloud/storage';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private bucket: Bucket;
  private datastore: Datastore;
  private readonly logger = new Logger(FirebaseService.name);

  async onModuleInit() {
    const serviceAccountPath = path.join(
      process.cwd(),
      'src/config/serviceAccountKey.json',
    );

    if (!fs.existsSync(serviceAccountPath)) {
      this.logger.error(
        `Arquivo de credenciais não encontrado: ${serviceAccountPath}`,
      );
      throw new Error('Credenciais do Firebase não encontradas!');
    }

    this.logger.log(
      `Carregando credenciais do Firebase de: ${serviceAccountPath}`,
    );
    const serviceAccount = JSON.parse(
      Buffer.from(serviceAccountPath, 'base64').toString('utf-8'),
    );

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'zingchat-89423.appspot.com',
      });
    }

    this.bucket = admin.storage().bucket();

    // Configurar o cliente do Datastore
    this.datastore = new Datastore({
      projectId: serviceAccount.project_id,
      credentials: {
        private_key: serviceAccount.private_key,
        client_email: serviceAccount.client_email,
      },
    });

    this.logger.log('Firebase inicializado com sucesso!');
  }

  getBucket() {
    return this.bucket;
  }

  getDatastore() {
    return this.datastore;
  }
}
