import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/api-auth";
import { CheckIdTokenResp } from "@/features/authentication/types";
import { env } from "@/lib/env";
import { secureLogError } from "@/lib/logging";
import { toPublicError, CommonErrors } from "@/lib/errors";

async function handleWithdraw(request: NextRequest, user: CheckIdTokenResp) {
  try {
    const body = await request.json();

    const response = await fetch(`${env.HYDRA_API_URL}/withdraw`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Hydra API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Log the operation for security auditing
    secureLogError(new Error("Hydra withdraw operation"), {
      operation: "hydraWithdraw",
      userId: user.decodedData?.uid,
      endpoint: "/api/hydra/withdraw",
      hasRequestBody: !!body,
    });

    return NextResponse.json(data);
  } catch (error) {
    // Log securely with context
    secureLogError(error, {
      operation: "handleWithdraw",
      endpoint: "/api/hydra/withdraw",
      userId: user.decodedData?.uid,
    });

    // Return sanitized error response
    const publicError = toPublicError(error, CommonErrors.INTERNAL_ERROR);
    return NextResponse.json(
      { error: publicError.message },
      { status: publicError.status },
    );
  }
}

// Export the protected handler
export const POST = withAuth(handleWithdraw);
