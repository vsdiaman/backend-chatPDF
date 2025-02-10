import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Datastore } from '@google-cloud/datastore';
import { Bucket } from '@google-cloud/storage';
import * as fs from 'fs';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private bucket: Bucket;
  private datastore: Datastore;
  private readonly logger = new Logger(FirebaseService.name);

  async onModuleInit() {
    try {
      this.logger.log('🔥 Carregando credenciais do Firebase...');

      // Lê e parseia o arquivo JSON
      const serviceAccount = JSON.parse(
        fs.readFileSync('src/config/zingchat-89423-a9335bee30a4.json', 'utf-8'),
      );

      // Inicializa o Firebase Admin SDK
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          storageBucket: serviceAccount.project_id + '.appspot.com',
        });
      }

      this.bucket = admin.storage().bucket();

      this.datastore = new Datastore({
        projectId: serviceAccount.project_id,
        credentials: {
          private_key: serviceAccount.private_key,
          client_email: serviceAccount.client_email,
        },
      });

      this.logger.log('✅ Firebase inicializado com sucesso!');
    } catch (error) {
      this.logger.error('❌ Erro ao inicializar Firebase:', error);
      throw new Error('Falha ao carregar credenciais do Firebase');
    }
  }

  getBucket() {
    return this.bucket;
  }

  getDatastore() {
    return this.datastore;
  }
}
