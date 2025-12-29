import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkIdToken } from "@/features/authentication/services";
import { AUTH_COOKIE } from "@/features/authentication/data";
import { CheckIdTokenResp } from "./features/authentication/types";
import cspAllowlist from "../csp.allowlist.json";

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
  const c = cspAllowlist;

  const scriptSrc = [
    ...c.script,              // your allowlist
    `'nonce-${nonce}'`,       // inject nonce
  ];

  const directives = [
    `default-src 'self'`,
    `base-uri 'self'`,
    `frame-ancestors 'none'`,
    `form-action 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
    `connect-src 'self' ${c.connect.join(" ")}`,
    `img-src 'self' ${c.img.join(" ")}`,
    `script-src ${scriptSrc.join(" ")}`,
    `style-src 'self' ${c.style.join(" ")}`,
    `font-src 'self' ${c.font.join(" ")}`,
    `frame-src 'self' ${c.frame.join(" ")}`,
  ];

  return directives.join("; ");
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
