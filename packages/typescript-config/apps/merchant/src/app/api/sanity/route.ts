import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/sanity/client";
import { secureLogError } from "@/lib/logging";
import { toPublicError, CommonErrors } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    const { query, params } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const data = await client.fetch(query, params || {});
    return NextResponse.json(data);
  } catch (error) {
    // Log securely with context
    secureLogError(error, {
      operation: "executeSanityQuery",
      endpoint: "/api/sanity",
    });

    // Return sanitized error response
    const publicError = toPublicError(error, CommonErrors.INTERNAL_ERROR);
    return NextResponse.json(
      { error: publicError.message },
      { status: publicError.status },
    );
  }
}
