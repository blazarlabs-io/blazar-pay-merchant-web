"use client";

// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getFunctions, Functions } from "firebase/functions";
import { usePublicConfig } from "@/hooks/use-public-config";
import { useEffect, useState } from "react";

interface FirebaseServices {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  storage: FirebaseStorage | null;
  functions: Functions | null;
}

// Initialize Firebase with config from API
export function useFirebase() {
  const { config, loading, error } = usePublicConfig();
  const [services, setServices] = useState<FirebaseServices>({
    app: null,
    auth: null,
    db: null,
    storage: null,
    functions: null,
  });

  useEffect(() => {
    if (!config || !config.firebase) return;

    try {
      const app = initializeApp(config.firebase);
      const auth = getAuth(app);
      const db = getFirestore(app);
      const storage = getStorage(app);
      const functions = getFunctions(app);

      setServices({ app, auth, db, storage, functions });
    } catch (err) {
      console.error("Failed to initialize Firebase:", err);
    }
  }, [config]);

  return { ...services, loading, error };
}

// For backward compatibility, create a singleton that initializes Firebase
let firebaseInitialized = false;
let firebaseServices: {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
  functions: Functions;
} | null = null;

// Initialize Firebase synchronously for backward compatibility
function initializeFirebaseSync() {
  if (firebaseInitialized && firebaseServices) return firebaseServices;

  try {
    // We need to get the config from the API synchronously
    // This is a temporary solution - ideally all components should use the hook
    const config = {
      apiKey: process.env.NEXT_PUBLIC_FB_API_KEY || "",
      authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN || "",
      projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID || "",
      storageBucket: process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET || "",
      messagingSenderId: process.env.NEXT_PUBLIC_FB_MESSAGING_SENDER_ID || "",
      appId: process.env.NEXT_PUBLIC_FB_APP_ID || "",
      measurementId: process.env.NEXT_PUBLIC_FB_MEASUREMENT_ID || "",
    };

    const app = initializeApp(config);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);
    const functions = getFunctions(app);

    firebaseServices = { app, auth, db, storage, functions };
    firebaseInitialized = true;
    return firebaseServices;
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
    // Return a fallback that will cause runtime errors but allow compilation
    throw new Error("Firebase initialization failed");
  }
}

// Export individual services for backward compatibility
const services = initializeFirebaseSync();
export const app = services.app;
export const auth = services.auth;
export const db = services.db;
export const storage = services.storage;
export const functions = services.functions;
