import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Datastore } from '@google-cloud/datastore';
import { Bucket } from '@google-cloud/storage';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class FirebaseService implements OnModuleInit {
  private bucket: Bucket;
  private datastore: Datastore;
  private readonly logger = new Logger(FirebaseService.name);

  async onModuleInit() {
    // Verifica se as variáveis necessárias estão definidas
    if (
      !process.env.FIREBASE_PROJECT_ID ||
      !process.env.FIREBASE_PRIVATE_KEY ||
      !process.env.FIREBASE_CLIENT_EMAIL
    ) {
      this.logger.error(
        '❌ Credenciais do Firebase não estão corretamente definidas no .env',
      );
      throw new Error('Credenciais do Firebase não encontradas!');
    }

    this.logger.log('🔥 Carregando credenciais do Firebase...');

    // Monta o objeto de credenciais manualmente
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Corrige quebras de linha
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(
          serviceAccount as admin.ServiceAccount,
        ),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    }

    this.bucket = admin.storage().bucket();

    this.datastore = new Datastore({
      projectId: serviceAccount.projectId,
      credentials: {
        private_key: serviceAccount.privateKey,
        client_email: serviceAccount.clientEmail,
      },
    });

    this.logger.log('✅ Firebase inicializado com sucesso!');
  }

  getBucket() {
    return this.bucket;
  }

  getDatastore() {
    return this.datastore;
  }
}
