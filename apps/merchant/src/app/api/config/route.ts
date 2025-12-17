import "server-only";
import { NextResponse } from "next/server";
import { env, firebaseConfig, captchaConfig } from "@/lib/env";

export async function GET() {
  // Return only harmless values that are truly needed by the client
  // Never expose secrets, API keys, or sensitive configuration
  const publicConfig = {
    firebase: {
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId,
      appId: firebaseConfig.appId,
      measurementId: firebaseConfig.measurementId,
    },
    captcha: {
      siteKey: captchaConfig.siteKey, // This is safe to expose as it's meant for client-side use
    },
    googleMaps: {
      apiKey: env.GOOGLE_MAPS_API_KEY, // This is safe to expose as it's meant for client-side use
    },
    app: {
      url: env.APP_URL,
    },
  };

  return NextResponse.json(publicConfig);
}
