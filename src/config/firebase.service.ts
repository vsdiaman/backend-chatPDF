import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Datastore } from '@google-cloud/datastore';
import { Bucket } from '@google-cloud/storage';
import * as dotenv from 'dotenv';

dotenv.config(); // Carrega variáveis do .env

@Injectable()
export class FirebaseService implements OnModuleInit {
  private bucket: Bucket;
  private datastore: Datastore;
  private readonly logger = new Logger(FirebaseService.name);

  async onModuleInit() {
    try {
      this.logger.log('🔥 Carregando credenciais do Firebase...');

      // Criando o objeto de credenciais do Firebase
      const serviceAccount = {
        type: process.env.TYPE,
        project_id: process.env.PROJECT_ID,
        private_key_id: process.env.PRIVATE_KEY_ID,
        private_key: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.CLIENT_EMAIL,
        client_id: process.env.CLIENT_ID,
        auth_uri: process.env.AUTH_URI,
        token_uri: process.env.TOKEN_URI,
        auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_CERT_URL,
        client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
        universe_domain: process.env.UNIVERSE_DOMAIN,
      };

      if (!serviceAccount.private_key || !serviceAccount.client_email) {
        throw new Error('❌ Credenciais do Firebase ausentes no .env!');
      }

      // Inicializa o Firebase Admin SDK
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(
            serviceAccount as admin.ServiceAccount,
          ),
          storageBucket: `${serviceAccount.project_id}.appspot.com`,
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
