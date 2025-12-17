import { NextResponse } from "next/server";
import { getAdminAuth, initAdmin } from "@/lib/firebase/admin";
import { parseBearerToken } from "@/lib/validation/http";
import { secureLogError } from "@/lib/logging";
import { toPublicError, CommonErrors } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    // Validate Authorization header and token format
    const parsed = parseBearerToken(request.headers.get("Authorization"));
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { token } = parsed;

    // Initialize Firebase Admin and verify token
    await initAdmin();
    const auth = getAdminAuth();
    const decodedData = await auth.verifyIdToken(token);

    return NextResponse.json({ token, decodedData });
  } catch (error) {
    // Log securely with context, no stack traces in production
    secureLogError(error, {
      operation: "verifyIdToken",
      endpoint: "/api/auth/verify-id-token",
    });

    // Return sanitized error response
    const publicError = toPublicError(
      error,
      CommonErrors.AUTHENTICATION_FAILED,
    );
    return NextResponse.json(
      { error: publicError.message },
      { status: publicError.status },
    );
  }
}
