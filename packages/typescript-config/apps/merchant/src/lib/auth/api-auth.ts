/**
 * API Authentication Helper
 * Provides reusable authentication functions for API routes
 */

import { NextRequest, NextResponse } from "next/server";
import { checkIdTokenSafely } from "@/features/authentication/services";
import { AUTH_COOKIE } from "@/features/authentication/data";
import { CheckIdTokenResp } from "@/features/authentication/types";
import { secureLogError } from "@/lib/logging";
import { toPublicError, CommonErrors } from "@/lib/errors";

/**
 * Authentication result for API routes
 */
export type AuthResult =
  | { success: true; user: CheckIdTokenResp }
  | { success: false; response: NextResponse };

/**
 * Authenticate API request using cookie-based token
 * @param request - NextRequest object
 * @returns AuthResult with user data or error response
 */
export async function authenticateApiRequest(
  request: NextRequest,
): Promise<AuthResult> {
  try {
    // Get token from cookie
    const idToken = request.cookies.get(AUTH_COOKIE)?.value;

    if (!idToken) {
      return {
        success: false,
        response: NextResponse.json(
          { error: "Authentication required" },
          { status: 401 },
        ),
      };
    }

    // Verify token
    const user = await checkIdTokenSafely(idToken, request.url);

    return {
      success: true,
      user,
    };
  } catch (error) {
    // Log securely with context
    secureLogError(error, {
      operation: "authenticateApiRequest",
      endpoint: new URL(request.url).pathname,
    });

    // Return sanitized error response
    const publicError = toPublicError(
      error,
      CommonErrors.AUTHENTICATION_FAILED,
    );
    return {
      success: false,
      response: NextResponse.json(
        { error: publicError.message },
        { status: publicError.status },
      ),
    };
  }
}

/**
 * Authenticate API request using Authorization header
 * @param request - NextRequest object
 * @returns AuthResult with user data or error response
 */
export async function authenticateApiRequestWithHeader(
  request: NextRequest,
): Promise<AuthResult> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        success: false,
        response: NextResponse.json(
          { error: "Missing or invalid Authorization header" },
          { status: 401 },
        ),
      };
    }

    const token = authHeader.slice(7); // Remove 'Bearer ' prefix

    // Verify token
    const user = await checkIdTokenSafely(token, request.url);

    return {
      success: true,
      user,
    };
  } catch (error) {
    // Log securely with context
    secureLogError(error, {
      operation: "authenticateApiRequestWithHeader",
      endpoint: new URL(request.url).pathname,
    });

    // Return sanitized error response
    const publicError = toPublicError(
      error,
      CommonErrors.AUTHENTICATION_FAILED,
    );
    return {
      success: false,
      response: NextResponse.json(
        { error: publicError.message },
        { status: publicError.status },
      ),
    };
  }
}

/**
 * Higher-order function to protect API routes with authentication
 * @param handler - The API route handler function
 * @returns Protected API route handler
 */
export function withAuth(
  handler: (
    request: NextRequest,
    user: CheckIdTokenResp,
  ) => Promise<NextResponse>,
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authResult = await authenticateApiRequest(request);

    if (!authResult.success) {
      return authResult.response;
    }

    return handler(request, authResult.user);
  };
}
