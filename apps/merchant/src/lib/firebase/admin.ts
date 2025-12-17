import "server-only";

import admin from "firebase-admin";
import { firebaseAdminConfig } from "@/lib/env";

interface FirebaseAdminAppParams {
  projectId: string;
  clientEmail: string;
  storageBucket: string;
  privateKey: string;
}

function formatPrivateKey(key: string) {
  return key.replace(/\\n/g, "\n");
}

export function createFirebaseAdminApp(params: FirebaseAdminAppParams) {
  const privateKey = formatPrivateKey(params.privateKey);

  if (admin.apps.length > 0) {
    return admin.app();
  }

  const cert = admin.credential.cert({
    projectId: params.projectId,
    clientEmail: params.clientEmail,
    privateKey,
  });

  return admin.initializeApp({
    credential: cert,
    projectId: params.projectId,
    storageBucket: params.storageBucket,
  });
}

export async function initAdmin() {
  // Use the validated env config from the server-only module
  const params = {
    projectId: firebaseAdminConfig.projectId,
    clientEmail: firebaseAdminConfig.clientEmail,
    storageBucket: firebaseAdminConfig.storageBucket,
    privateKey: firebaseAdminConfig.privateKey,
  };

  return createFirebaseAdminApp(params);
}

// Lazy initialization - only initialize when needed
let _adminAuth: admin.auth.Auth | null = null;
let _adminFirestore: admin.firestore.Firestore | null = null;

export function getAdminAuth() {
  if (!_adminAuth) {
    if (admin.apps.length === 0) {
      throw new Error(
        "Firebase admin not initialized. Call initAdmin() first.",
      );
    }
    _adminAuth = admin.auth();
  }
  return _adminAuth;
}

export function getAdminFirestore() {
  if (!_adminFirestore) {
    if (admin.apps.length === 0) {
      throw new Error(
        "Firebase admin not initialized. Call initAdmin() first.",
      );
    }
    _adminFirestore = admin.firestore();
  }
  return _adminFirestore;
}
