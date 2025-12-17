/**
 * HTTP validation utilities for API routes
 * Provides lightweight, non-breaking validation for common HTTP inputs
 */

/**
 * Parse and validate Bearer token from Authorization header
 * @param authHeader - Authorization header value or null
 * @returns Object with success/failure status and token or error message
 */
export function parseBearerToken(
  authHeader: string | null,
): { ok: true; token: string } | { ok: false; error: string } {
  if (!authHeader) return { ok: false, error: "Missing Authorization header" };

  const prefix = "Bearer ";
  if (!authHeader.startsWith(prefix))
    return { ok: false, error: "Authorization must use Bearer scheme" };

  const token = authHeader.slice(prefix.length).trim();
  if (!token) return { ok: false, error: "Empty token" };

  if (!isPlausibleJwt(token))
    return { ok: false, error: "Invalid token format" };

  return { ok: true, token };
}

/**
 * Check if a token has plausible JWT format
 * Keeps validation lightweight to avoid breaking valid tokens
 * @param token - Token string to validate
 * @returns true if token appears to be a valid JWT format
 */
export function isPlausibleJwt(token: string | undefined | null): boolean {
  if (!token) return false;

  // Allow base64url-safe chars plus dots; typical JWT has 2 dots
  // Keep permissive to avoid regressions with valid tokens
  if (!/^[A-Za-z0-9._-]{10,}$/.test(token)) return false;

  // Soft check for 3 segments (header.payload.signature)
  // Do NOT strictly base64-decode to avoid perf/behavior changes
  const parts = token.split(".");
  return parts.length === 3 && parts.every((p) => p.length > 0);
}

/**
 * Validate required header exists and is non-empty
 * @param headers - Headers object
 * @param headerName - Name of header to validate
 * @returns Object with success/failure status and value or error message
 */
export function validateRequiredHeader(
  headers: Headers,
  headerName: string,
): { ok: true; value: string } | { ok: false; error: string } {
  const value = headers.get(headerName);
  if (!value || !value.trim())
    return { ok: false, error: `Missing ${headerName} header` };
  return { ok: true, value: value.trim() };
}

/**
 * Validate required query parameter exists and is non-empty
 * @param searchParams - URLSearchParams object
 * @param paramName - Name of parameter to validate
 * @returns Object with success/failure status and value or error message
 */
export function validateRequiredParam(
  searchParams: URLSearchParams,
  paramName: string,
): { ok: true; value: string } | { ok: false; error: string } {
  const value = searchParams.get(paramName);
  if (!value || !value.trim())
    return { ok: false, error: `Missing ${paramName} parameter` };
  return { ok: true, value: value.trim() };
}

/**
 * Validate JSON body size and parse safely
 * @param request - Request object
 * @param maxSize - Maximum allowed body size in bytes (default: 1MB)
 * @returns Object with success/failure status and parsed body or error message
 */
export async function validateJsonBody<T = any>(
  request: Request,
  maxSize: number = 1024 * 1024,
): Promise<{ ok: true; body: T } | { ok: false; error: string }> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > maxSize) {
    return {
      ok: false,
      error: `Request body too large (max ${maxSize} bytes)`,
    };
  }

  try {
    const body = await request.json();
    return { ok: true, body };
  } catch (error) {
    return { ok: false, error: "Invalid JSON in request body" };
  }
}

/**
 * Validate email format (basic RFC 5322 compliance)
 * @param email - Email string to validate
 * @returns true if email appears to be valid format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254; // RFC 5321 limit
}

/**
 * Validate password strength (basic requirements)
 * @param password - Password string to validate
 * @returns Object with success/failure status and error message if invalid
 */
export function validatePassword(
  password: string,
): { ok: true } | { ok: false; error: string } {
  if (!password) return { ok: false, error: "Password is required" };
  if (password.length < 8)
    return { ok: false, error: "Password must be at least 8 characters" };
  if (password.length > 128)
    return { ok: false, error: "Password must be less than 128 characters" };
  return { ok: true };
}
