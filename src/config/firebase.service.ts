import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Datastore } from '@google-cloud/datastore';
import { Bucket } from '@google-cloud/storage';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private bucket: Bucket;
  private datastore: Datastore;

  async onModuleInit() {
    if (!process.env.SERVICE_ACCOUNT_KEY) {
      throw new Error(
        'SERVICE_ACCOUNT_KEY não foi encontrada nas variáveis de ambiente.',
      );
    }

    // Corrigir a private_key substituindo \\n por \n
    const serviceAccount = JSON.parse(
      process.env.SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n'),
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
  }

  getBucket() {
    return this.bucket;
  }

  getDatastore() {
    return this.datastore;
  }
}
