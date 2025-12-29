import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkIdToken } from "@/features/authentication/services";
import { AUTH_COOKIE } from "@/features/authentication/data";
import { CheckIdTokenResp } from "./features/authentication/types";

/**
 * Edge-safe base64 nonce generator (middleware runs on the Edge runtime).
 */
function toBase64(bytes: Uint8Array) {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function makeNonce() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return toBase64(bytes);
}

/**
 * script-src includes 'nonce-${nonce}'.
 */
function buildCsp(nonce: string) {
  const isProd = process.env.NODE_ENV === "production";

  const scriptSrc = isProd
    ? [
        "'self'",
        `'nonce-${nonce}'`,
        "'wasm-unsafe-eval'",
        "https://vercel.live",
        "https://maps.googleapis.com",
        "https://www.google.com",
        "https://www.gstatic.com",
        "https://apis.google.com",
      ]
    : [
        "'self'",
        `'nonce-${nonce}'`,
        "'unsafe-eval'",
        "'wasm-unsafe-eval'",
        "https://vercel.live",
        "https://maps.googleapis.com",
        "https://www.google.com",
        "https://www.gstatic.com",
        "https://apis.google.com",
      ];


  return [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    `connect-src 'self' https://hydrapay-dev.firebaseapp.com https://*.firebaseapp.com https://*.web.app https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebaseremoteconfig.googleapis.com https://firebaseinstallations.googleapis.com https://firebase.googleapis.com https://firestore.googleapis.com https://*.googleapis.com https://api.livecoinwatch.com https://cardano-mainnet.blockfrost.io https://cardano-preprod.blockfrost.io https://*.sanity.io https://api.sendgrid.net https://www.google.com https://api.iconify.design https://api.unisvg.com https://api.simplesvg.com http://localhost:* http://127.0.0.1:* https://blazar.local:* ws://localhost:* wss://blazar.local:*`,
    "img-src 'self' data: blob: https://firebasestorage.googleapis.com https://maps.googleapis.com https://maps.gstatic.com https://*.googleapis.com https://lh3.googleusercontent.com https://*.googleusercontent.com",
    `script-src ${scriptSrc.join(" ")}`,
    "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'",
    "font-src 'self' data: https://fonts.gstatic.com",
    "frame-src 'self' https://www.google.com https://tracecork-app-production.firebaseapp.com",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

const authProtectedRoutes = [
  "/login",
  "/signup",
  "/forgot-password",
  "/password-reset",
  "/password-rest-sent",
];

// Helper: attach CSP header consistently to *any* response we return.
function withCsp(
  req: NextRequest,
  res: NextResponse,
  nonce: string,
): NextResponse {
  const csp = buildCsp(nonce);

  // Make nonce available to app rendering (useful for next/script)
  res.headers.set("x-nonce", nonce);

  // Set CSP
  res.headers.set("Content-Security-Policy", csp);

  // Keep your no-cache behavior (matches your current headers)
  res.headers.set("Cache-Control", "private, no-cache, no-store, max-age=0, must-revalidate");

  return res;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const nonce = makeNonce();

  // Forward nonce to the app via request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  // Default response
  let response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const idToken = request.cookies.get(AUTH_COOKIE)?.value;
  let authData: CheckIdTokenResp | undefined = undefined;

  // if there is a token, check if it is valid if not delete it
  if (!!idToken) {
    try {
      authData = await checkIdToken(idToken, request.url);
      if (!authData) {
        response.cookies.delete(AUTH_COOKIE);
      }
    } catch {
      response.cookies.delete(AUTH_COOKIE);
    }
  }

  // Being user logged in, redirect by user privileges if necessary, otherwise continue with free access
  const onPrivateRoute = pathname.startsWith("/dashboard");
  const onConfirmEmail = pathname.startsWith("/confirm-email");
  const onVerifyEmail = pathname.startsWith("/verify-email");

  if (authData) {
    const onAuthRoute = authProtectedRoutes.some((authRoute) =>
      pathname.startsWith(authRoute),
    );
    const email_verified = true;

    // IF TRIES ACCESSING TO AN AUTH OR ROOT PAGE PREVENT ACCESS IF EMAIL IS VERIFIED
    if (pathname === "/" || onAuthRoute) {
      const redirectPath = email_verified ? "/dashboard/home" : "/verify-email";
      const res = NextResponse.redirect(new URL(redirectPath, request.url));
      return withCsp(request, res, nonce);
    }

    // IF TRIES ACCESSING TO A PRIVATE ROUTE, AND EMAIL IS NOT VERIFIED, REDIRECT TO VERIFY EMAIL PAGE
    if (onPrivateRoute && !email_verified) {
      const res = NextResponse.redirect(new URL("/verify-email", request.url));
      return withCsp(request, res, nonce);
    }

    // IF TRIES ACCESSING TO CONFIRM EMAIL OR VERIFY PAGE, AND BEING EMAIL ALREADY VERIFIED, REDIRECT TO DASHBOARD
    if ((onConfirmEmail || onVerifyEmail) && email_verified) {
      const res = NextResponse.redirect(new URL("/dashboard/home", request.url));
      return withCsp(request, res, nonce);
    }

    // Allow authenticated route
    return withCsp(request, response, nonce);
  } else {
    // BEING NOT LOGGED IN
    if (pathname === "/") {
      const res = NextResponse.redirect(new URL("/home", request.url));
      return withCsp(request, res, nonce);
    }

    // IF TRIES ACCESSING PRIVATE ROUTES, VERIFY EMAIL PAGE, REDIRECT TO LOGIN
    if (onPrivateRoute || onVerifyEmail) {
      const res = NextResponse.redirect(new URL("/login", request.url));
      return withCsp(request, res, nonce);
    }

    // Allow public route
    return withCsp(request, response, nonce);
  }
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/login",
    "/signup",
    "/home",
    "/forgot-password",
    "/password-reset",
    "/password-rest-sent",
    "/confirm-email",
    "/verify-email",
    "/api/((?!auth/verify-id-token|auth/set-cookie).*)",
  ],
};
