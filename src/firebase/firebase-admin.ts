// src/firebase/firebase-admin.ts
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  const credential = process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? admin.credential.applicationDefault() // prefer ADC
    : admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON!));

  admin.initializeApp({
    credential,
  });
}

export const adminAuth = admin.auth();
