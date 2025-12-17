import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { validateRequiredParam } from "@/lib/validation/http";
import { secureLogError } from "@/lib/logging";
import { toPublicError, CommonErrors } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Validate address parameter
    const addressResult = validateRequiredParam(searchParams, "address");
    if (!addressResult.ok) {
      return NextResponse.json({ error: addressResult.error }, { status: 400 });
    }

    console.log("ROUTE", addressResult);

    const address = addressResult.value;
    const queryUrl = `${env.HYDRA_API_URL}/query-funds?address=${address}`;

    console.log("\naddress", address, address.length);
    console.log("env.HYDRA_API_URL", queryUrl, "\n");

    // Additional validation for address format (basic check)
    // if (address.length < 10 || address.length > 100) {
    //   return NextResponse.json(
    //     { error: "Invalid address format" },
    //     { status: 400 },
    //   );
    // }

    const response = await fetch(queryUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Hydra API responded with status: ${response.status}`);
    }

    const data = await response.json();

    console.log("env.HYDRA_API_URL", env.HYDRA_API_URL);
    console.log("data", data);
    console.log("data.fundsInL1", data.fundsInL1);
    console.log("data.fundsInL2", data.fundsInL2);
    console.log("data.totalInL1", data.totalInL1);
    console.log("data.totalInL2", data.totalInL2);
    return NextResponse.json(data);
  } catch (error) {
    // Log securely with context
    secureLogError(error, {
      operation: "queryFunds",
      endpoint: "/api/hydra/query-funds",
    });

    // Return sanitized error response
    const publicError = toPublicError(error, CommonErrors.INTERNAL_ERROR);
    return NextResponse.json(
      { error: publicError.message },
      { status: publicError.status },
    );
  }
}
