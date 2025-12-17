import { CheckIdTokenResp } from "../types";
import { secureLogError } from "@/lib/logging";
import {
  toPublicError,
  createSanitizedError,
  CommonErrors,
} from "@/lib/errors";

export const checkIdToken = async (
  idToken: string,
  requestUrls: string,
): Promise<CheckIdTokenResp | undefined> => {
  try {
    if (!idToken || !requestUrls) {
      secureLogError(new Error("Missing required parameters"), {
        operation: "checkIdToken",
        hasIdToken: !!idToken,
        hasRequestUrls: !!requestUrls,
      });
      return undefined;
    }

    const resp = await fetch(
      new URL("/api/auth/verify-id-token", requestUrls),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      },
    );

    if (resp.status !== 200) {
      secureLogError(
        new Error(`Token verification failed with status ${resp.status}`),
        {
          operation: "checkIdToken",
          status: resp.status,
          statusText: resp.statusText,
        },
      );
      return undefined;
    }

    return (await resp.json()) as CheckIdTokenResp;
  } catch (error) {
    // Log safely with context, no stack traces in production
    secureLogError(error, {
      operation: "checkIdToken",
      requestUrls,
      hasToken: !!idToken,
    });
    return undefined;
  }
};

/**
 * Secure version that throws sanitized errors for API route handling
 */
export const checkIdTokenSafely = async (
  idToken: string,
  requestUrls: string,
): Promise<CheckIdTokenResp> => {
  try {
    if (!idToken || !requestUrls) {
      throw createSanitizedError(CommonErrors.INVALID_REQUEST);
    }

    const resp = await fetch(
      new URL("/api/auth/verify-id-token", requestUrls),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      },
    );

    if (resp.status !== 200) {
      const publicError = toPublicError(
        new Error(`Token verification failed with status ${resp.status}`),
        CommonErrors.AUTHENTICATION_FAILED,
      );
      throw createSanitizedError(publicError);
    }

    return (await resp.json()) as CheckIdTokenResp;
  } catch (error) {
    // Log safely with context
    secureLogError(error, {
      operation: "checkIdTokenSafely",
      requestUrls,
      hasToken: !!idToken,
    });

    // Re-throw sanitized error for API layer
    const publicError = toPublicError(
      error,
      CommonErrors.AUTHENTICATION_FAILED,
    );
    throw createSanitizedError(publicError);
  }
};
