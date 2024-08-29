import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as serviceAccount from '../config/serviceAccountKey.json';
// import { join } from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private bucket;

  async onModuleInit() {
    if (!admin.apps.length) {
      // const serviceAccount = import(join(__dirname, 'serviceAccountKey.json'));

      admin.initializeApp({
        credential: admin.credential.cert(
          serviceAccount as admin.ServiceAccount,
        ),
        storageBucket: 'zingchat-89423.appspot.com',
      });
    }

    this.bucket = admin.storage().bucket();
  }

  getBucket() {
    return this.bucket;
  }
}
