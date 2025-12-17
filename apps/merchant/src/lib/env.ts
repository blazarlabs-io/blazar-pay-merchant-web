import "server-only";
import { z } from "zod";

// Helper function to read env vars with fallback support for migration
function read(name: string): string | undefined {
  // Prefer server-only names, fallback to legacy NEXT_PUBLIC_ for *reading only* during migration
  return process.env[name] ?? process.env[`NEXT_PUBLIC_${name}`];
}

// Environment schema with validation
const schema = z
  .object({
    // Firebase Client (some may be needed for client initialization - will be handled via API)
    FB_API_KEY: z.string().min(1),
    FB_AUTH_DOMAIN: z.string().min(1),
    FB_PROJECT_ID: z.string().min(1),
    FB_STORAGE_BUCKET: z.string().min(1),
    FB_MESSAGING_SENDER_ID: z.string().min(1),
    FB_APP_ID: z.string().min(1),
    FB_MEASUREMENT_ID: z.string().optional(),

    // Firebase Admin (server-only)
    FIREBASE_PROJECT_ID: z.string().min(1),
    FIREBASE_STORAGE_BUCKET: z.string().min(1),
    FIREBASE_PRIVATE_KEY: z.string().min(1),
    FIREBASE_CLIENT_EMAIL: z.string().email(),

    // Captcha
    CAPTCHA_SITE_KEY: z.string().min(1),
    CAPTCHA_SECRET_KEY: z.string().min(1),

    // API Keys and URLs (server-only)
    APP_URL: z.string().url(),
    GOOGLE_MAPS_API_KEY: z.string().min(1),
    QR_CODES_URL: z.string().url(),
    SENDGRID_API_KEY: z.string().min(1),
    TRACECORK_EMAIL: z.string().email(),

    // Sanity CMS (server-only)
    SANITY_PROJECT_ID: z.string().min(1),
    SANITY_TOKEN: z.string().min(1),
    SANITY_DATASET: z.string().min(1),

    // Hydra API (server-only)
    HYDRA_API_URL: z.string().url(),

    // Blockfrost (server-only)
    BLOCKFROST_PROJECT_KEY: z.string().min(1),

    // CoinWatch API (server-only)
    LIVE_COIN_WATCH_API_KEY: z.string().min(1),

    // Transaction signing (server-only)
    TX_SIGN_KEY: z.string().min(1),

    // Cardano network (server-only)
    CARDANO_NETWORK: z.string().min(1),
  })
  .strict();

// Read all environment variables
const raw = {
  // Firebase Client (these are safe to expose as NEXT_PUBLIC_)
  FB_API_KEY: read("NEXT_PUBLIC_FB_API_KEY"),
  FB_AUTH_DOMAIN: read("NEXT_PUBLIC_FB_AUTH_DOMAIN"),
  FB_PROJECT_ID: read("NEXT_PUBLIC_FB_PROJECT_ID"),
  FB_STORAGE_BUCKET: read("NEXT_PUBLIC_FB_STORAGE_BUCKET"),
  FB_MESSAGING_SENDER_ID: read("NEXT_PUBLIC_FB_MESSAGING_SENDER_ID"),
  FB_APP_ID: read("NEXT_PUBLIC_FB_APP_ID"),
  FB_MEASUREMENT_ID: read("NEXT_PUBLIC_FB_MEASUREMENT_ID"),

  // Firebase Admin
  FIREBASE_PROJECT_ID: read("FIREBASE_PROJECT_ID"),
  FIREBASE_STORAGE_BUCKET: read("FIREBASE_STORAGE_BUCKET"),
  FIREBASE_PRIVATE_KEY: read("FIREBASE_PRIVATE_KEY"),
  FIREBASE_CLIENT_EMAIL: read("FIREBASE_CLIENT_EMAIL"),

  // Captcha
  CAPTCHA_SITE_KEY: read("CAPTCHA_SITE_KEY"),
  CAPTCHA_SECRET_KEY: read("CAPTCHA_SECRET_KEY"),

  // API Keys and URLs
  APP_URL: read("APP_URL"),
  GOOGLE_MAPS_API_KEY: read("GOOGLE_MAPS_API_KEY"),
  QR_CODES_URL: read("QR_CODES_URL"),
  SENDGRID_API_KEY: read("SENDGRID_API_KEY"),
  TRACECORK_EMAIL: read("TRACECORK_EMAIL"),

  // Sanity CMS
  SANITY_PROJECT_ID: read("SANITY_PROJECT_ID"),
  SANITY_TOKEN: read("SANITY_TOKEN"),
  SANITY_DATASET: read("SANITY_DATASET"),

  // Hydra API
  HYDRA_API_URL: read("HYDRA_API_URL"),

  // Blockfrost
  BLOCKFROST_PROJECT_KEY: read("BLOCKFROST_PROJECT_KEY"),

  // CoinWatch API
  LIVE_COIN_WATCH_API_KEY: read("LIVE_COIN_WATCH_API_KEY"),

  // Transaction signing
  TX_SIGN_KEY: read("TX_SIGN_KEY"),

  // Cardano network
  CARDANO_NETWORK: read("CARDANO_NETWORK"),
};

// Validate and parse environment variables
const env = schema.parse(raw);

export { env };

// Export specific configs for different services
export const firebaseConfig = {
  apiKey: env.FB_API_KEY,
  authDomain: env.FB_AUTH_DOMAIN,
  projectId: env.FB_PROJECT_ID,
  storageBucket: env.FB_STORAGE_BUCKET,
  messagingSenderId: env.FB_MESSAGING_SENDER_ID,
  appId: env.FB_APP_ID,
  measurementId: env.FB_MEASUREMENT_ID,
};

export const firebaseAdminConfig = {
  projectId: env.FIREBASE_PROJECT_ID,
  clientEmail: env.FIREBASE_CLIENT_EMAIL,
  storageBucket: env.FIREBASE_STORAGE_BUCKET,
  privateKey: env.FIREBASE_PRIVATE_KEY,
};

export const sanityConfig = {
  projectId: env.SANITY_PROJECT_ID,
  dataset: env.SANITY_DATASET,
  token: env.SANITY_TOKEN,
};

export const captchaConfig = {
  siteKey: env.CAPTCHA_SITE_KEY,
  secretKey: env.CAPTCHA_SECRET_KEY,
};
