import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkIdToken } from "@/features/authentication/services";
import { AUTH_COOKIE } from "@/features/authentication/data";
import { CheckIdTokenResp } from "./features/authentication/types";

const authProtectedRoutes = [
  "/login",
  "/signup",
  "/forgot-password",
  "/password-reset",
  "/password-rest-sent",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();
  const idToken = request.cookies.get(AUTH_COOKIE)?.value;
  let authData: CheckIdTokenResp | undefined = undefined;

  console.log(`[MIDDLEWARE] Processing request to: ${pathname}`);
  console.log(`[MIDDLEWARE] Has auth token: ${!!idToken}`);
  console.log(
    `[MIDDLEWARE] Token preview: ${idToken ? idToken.substring(0, 20) + "..." : "none"}`,
  );

  // if there is a token, check if it is valid if not delete it
  if (!!idToken) {
    console.log(`[MIDDLEWARE] Verifying token...`);
    try {
      authData = await checkIdToken(idToken, request.url);
      console.log(`[MIDDLEWARE] Token verification result: ${!!authData}`);
      if (!authData) {
        console.log(`[MIDDLEWARE] Token invalid, deleting cookie`);
        response.cookies.delete(AUTH_COOKIE);
      }
    } catch (error) {
      console.log(`[MIDDLEWARE] Token verification error:`, error);
      response.cookies.delete(AUTH_COOKIE);
    }
  }

  // Being user logged in, redirect by user privileges if necessary, otherwise continue with free access
  const onPrivateRoute = pathname.startsWith("/dashboard");
  const onConfirmEmail = pathname.startsWith("/confirm-email");
  const OnVerifyEmail = pathname.startsWith("/verify-email");

  if (authData) {
    console.log(`[MIDDLEWARE] User is authenticated`);
    // const {
    //   decodedData: { email_verified },
    // } = authData;
    const onAuthRoute = authProtectedRoutes.some((authRoute) =>
      pathname.startsWith(authRoute),
    );
    let email_verified = true;

    console.log(
      `[MIDDLEWARE] Route analysis: onPrivateRoute=${onPrivateRoute}, onAuthRoute=${onAuthRoute}, onConfirmEmail=${onConfirmEmail}, OnVerifyEmail=${OnVerifyEmail}`,
    );

    //  * IF TRIES ACCESSING TO AN AUTH OR ROOT PAGE PREVENT ACCESS IF EMAIL IS VERIFIED
    if (pathname === "/" || onAuthRoute) {
      const redirectPath = email_verified ? "/dashboard/home" : "/verify-email";
      console.log(
        `[MIDDLEWARE] Redirecting authenticated user from auth/root route to: ${redirectPath}`,
      );
      // Use replace instead of redirect to prevent back button issues
      const response = NextResponse.redirect(
        new URL(redirectPath, request.url),
      );
      response.headers.set(
        "Cache-Control",
        "no-cache, no-store, must-revalidate",
      );
      return response;
    }
    // * IF TRIES ACCESSING TO A PRIVATE ROUTE, AND EMAIL IS NOT VERIFIED, REDIRECT TO VERIFY EMAIL PAGE
    if (onPrivateRoute && !email_verified) {
      console.log(
        `[MIDDLEWARE] Email not verified, redirecting to verify-email`,
      );
      return NextResponse.redirect(new URL("/verify-email", request.url));
    }
    // * IF TRIES ACCESSING TO CONFIRM EMAIL OR VERIFY PAGE, AND BEING EMAIL ALREADY VERIFIED, REDIRECT TO DASHBOARD
    if ((onConfirmEmail || OnVerifyEmail) && email_verified) {
      console.log(`[MIDDLEWARE] Email verified, redirecting to dashboard`);
      return NextResponse.redirect(new URL("/dashboard/home", request.url));
    }
    console.log(
      `[MIDDLEWARE] Allowing access to authenticated route: ${pathname}`,
    );
    return response;
  } else {
    console.log(`[MIDDLEWARE] User not authenticated`);
    // * BEING NOT LOGGED IN
    // * IF TRIES ACCESSING ROOT PAGE, REDIRECT TO HOME
    if (pathname === "/") {
      console.log(
        `[MIDDLEWARE] Redirecting unauthenticated user from root to /home`,
      );
      return NextResponse.redirect(new URL("/home", request.url));
    }
    // * IF TRIES ACCESSING PRIVATE ROUTES, VERIFY EMAIL PAGE, REDIRECT TO LOGIN
    if (onPrivateRoute || OnVerifyEmail) {
      console.log(`[MIDDLEWARE] Redirecting unauthenticated user to login`);
      return NextResponse.redirect(new URL("/login", request.url));
    }
    console.log(`[MIDDLEWARE] Allowing access to public route: ${pathname}`);
    return response;
  }

  // if (pathname.startsWith("/api")) {
  //   console.log("It is an api call");
  // }
}

// See "Matching Paths" below to learn more
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
    "/api/((?!auth/verify-id-token|auth/set-cookie).*)", // Exclude auth routes to prevent recursion
  ],
};
