/**
 * Error shaping utility for APPSEC-008
 * Maps internal errors to safe client responses
 */

export type PublicError = { status: number; message: string };

/**
 * Maps internal errors to safe, generic client responses
 * @param err - Internal error to shape
 * @param fallback - Fallback error response
 * @returns Safe error response for clients
 */
export function toPublicError(
  err: unknown,
  fallback: PublicError = {
    status: 500,
    message: "An unexpected error occurred",
  },
): PublicError {
  // Map known cases to stable client messages; never leak internals
  if (err && typeof err === "object") {
    const e = err as {
      name?: string;
      code?: string;
      message?: string;
      status?: number;
    };

    // Authentication failures
    if (
      e.name === "AuthError" ||
      e.code === "AUTH_INVALID_TOKEN" ||
      e.code === "auth/invalid-token"
    ) {
      return { status: 401, message: "Authentication failed" };
    }

    if (e.name === "TokenExpiredError" || e.code === "auth/token-expired") {
      return { status: 401, message: "Authentication expired" };
    }

    // Validation errors
    if (e.code === "VALIDATION_ERROR" || e.name === "ValidationError") {
      return { status: 400, message: "Invalid request data" };
    }

    // Permission/authorization errors
    if (e.code === "PERMISSION_DENIED" || e.name === "PermissionError") {
      return { status: 403, message: "Access denied" };
    }

    // Rate limiting
    if (e.code === "RATE_LIMIT_EXCEEDED" || e.name === "RateLimitError") {
      return { status: 429, message: "Too many requests" };
    }

    // Not found
    if (e.code === "NOT_FOUND" || e.name === "NotFoundError") {
      return { status: 404, message: "Resource not found" };
    }

    // If error already has a status code, use it but sanitize the message
    if (typeof e.status === "number" && e.status >= 400 && e.status < 600) {
      return {
        status: e.status,
        message: getGenericMessageForStatus(e.status),
      };
    }
  }

  return fallback;
}

/**
 * Get generic message for HTTP status codes
 * @param status - HTTP status code
 * @returns Generic message for the status
 */
function getGenericMessageForStatus(status: number): string {
  switch (status) {
    case 400:
      return "Bad request";
    case 401:
      return "Authentication required";
    case 403:
      return "Access denied";
    case 404:
      return "Resource not found";
    case 409:
      return "Conflict";
    case 422:
      return "Invalid data";
    case 429:
      return "Too many requests";
    case 500:
      return "Internal server error";
    case 502:
      return "Bad gateway";
    case 503:
      return "Service unavailable";
    default:
      return "An error occurred";
  }
}

/**
 * Create a sanitized error that can be thrown from services
 * @param publicError - Public error response
 * @returns Error with status code for API layer handling
 */
export function createSanitizedError(
  publicError: PublicError,
): Error & { status: number } {
  const error = new Error(publicError.message) as Error & { status: number };
  error.status = publicError.status;
  return error;
}

/**
 * Common error responses for reuse
 */
export const CommonErrors = {
  AUTHENTICATION_FAILED: {
    status: 401,
    message: "Authentication failed",
  } as const,
  INVALID_REQUEST: { status: 400, message: "Invalid request" } as const,
  ACCESS_DENIED: { status: 403, message: "Access denied" } as const,
  NOT_FOUND: { status: 404, message: "Resource not found" } as const,
  RATE_LIMITED: { status: 429, message: "Too many requests" } as const,
  INTERNAL_ERROR: { status: 500, message: "Internal server error" } as const,
} as const;
