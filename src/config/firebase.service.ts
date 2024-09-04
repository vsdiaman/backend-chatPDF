import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as serviceAccount from '../config/serviceAccountKey.json'; // Ajuste o caminho conforme necessário
import { Datastore } from '@google-cloud/datastore';
import { Bucket } from '@google-cloud/storage';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private bucket: Bucket;
  private datastore: Datastore;

  async onModuleInit() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(
          serviceAccount as admin.ServiceAccount,
        ),
        storageBucket: 'zingchat-89423.appspot.com',
      });
    }
    this.bucket = admin.storage().bucket(); // Acesse o bucket

    // Configure o cliente do Datastore
    this.datastore = new Datastore({
      projectId: 'zingchat-89423',
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
