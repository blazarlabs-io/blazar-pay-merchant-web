import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { parseBearerToken } from "@/lib/validation/http";
import { secureLogError } from "@/lib/logging";
import { toPublicError, CommonErrors } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    // Validate JSON body
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing token" },
        { status: 400 },
      );
    }

    // Set the auth cookie with secure flags
    const response = NextResponse.json({ success: true });
    response.cookies.set("auth", token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    // Log securely with context
    secureLogError(error, {
      operation: "setCookie",
      endpoint: "/api/auth/set-cookie",
    });

    // Return sanitized error response
    const publicError = toPublicError(error, CommonErrors.INTERNAL_ERROR);
    return NextResponse.json(
      { error: publicError.message },
      { status: publicError.status },
    );
  }
}
