import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Datastore } from '@google-cloud/datastore';
import { Bucket } from '@google-cloud/storage';
import * as fs from 'fs';
// import * as path from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private bucket: Bucket;
  private datastore: Datastore;

  async onModuleInit() {
    console.log('SERVICE_ACCOUNT_KEY:', process.env.SERVICE_ACCOUNT_KEY);

    if (!process.env.SERVICE_ACCOUNT_KEY) {
      throw new Error(
        'SERVICE_ACCOUNT_KEY não foi encontrada nas variáveis de ambiente.',
      );
    }
    // const serviceAccountPath = path.resolve(process.env.SERVICE_ACCOUNT_KEY);

    // Corrigir a private_key substituindo \\n por \n
    const serviceAccount = JSON.parse(
      fs.readFileSync(
        process.env.SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n'),
        'utf8',
      ),
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
//so pra commitar
