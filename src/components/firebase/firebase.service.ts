import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  constructor() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
        console.log('✅ Firebase initialized successfully for project:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    }
  }

  async verifyIdToken(idToken: string) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      console.error('Error verifying ID token:', error);
      throw new InternalServerErrorException('Invalid or expired Firebase token');
    }
  }

  async createCustomToken(uid: string) {
    try {
      return await admin.auth().createCustomToken(uid);
    } catch (error) {
      console.error('Error creating custom token:', error);
      throw new InternalServerErrorException('Failed to create custom token');
    }
  }
}
