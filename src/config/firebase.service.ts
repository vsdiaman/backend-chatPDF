import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Datastore } from '@google-cloud/datastore';
import { Bucket } from '@google-cloud/storage';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class FirebaseService implements OnModuleInit {
  private bucket: Bucket;
  private datastore: Datastore;
  private readonly logger = new Logger(FirebaseService.name);

  async onModuleInit() {
    // let serviceAccount: any;

    // if (process.env.FIREBASE_CREDENTIALS) {
    //   // 🔥 Carregar credenciais do Railway
    //   this.logger.log(
    //     'Carregando credenciais do Firebase a partir das variáveis de ambiente...',
    //   );
    //   console.log('FIREBASE_CREDENTIALS:', process.env.FIREBASE_CREDENTIALS);
    //   serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
    // } else {
    //   // 📁 Carregar credenciais do arquivo local (para desenvolvimento)
    //   const serviceAccountPath = path.join(
    //     process.cwd(),
    //     'src/config/serviceAccountKey.json',
    //   );

    //   if (!fs.existsSync(serviceAccountPath)) {
    //     this.logger.error(
    //       `Arquivo de credenciais não encontrado: ${serviceAccountPath}`,
    //     );
    //     throw new Error('Credenciais do Firebase não encontradas!');
    //   }

    //   this.logger.log(
    //     `Carregando credenciais do Firebase de: ${serviceAccountPath}`,
    //   );
    //   serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
    // }

    let serviceAccount;

    if (process.env.FIREBASE_CREDENTIALS) {
      this.logger.log('🔥 Carregando credenciais do Firebase do Railway...');
      serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
    } else {
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
      serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
    }

    // 🔥 Inicializar Firebase
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'zingchat-89423.appspot.com',
      });
    }

    this.bucket = admin.storage().bucket();

    // 🔥 Configurar o Datastore
    this.datastore = new Datastore({
      projectId: serviceAccount.project_id,
      credentials: {
        private_key: serviceAccount.private_key.replace(/\\n/g, '\n'), // Corrigir quebras de linha
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
