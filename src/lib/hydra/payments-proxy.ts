import "server-only";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { secureLogError } from "@/lib/logging";
import { CheckIdTokenResp } from "@/features/authentication/types";
import { PaymentSchema } from "@/types/payment-contract";

/**
 * Calls the backend payments API as the signed-in merchant and returns a validated `Payment`.
 * The backend verifies the Firebase ID token itself and maps it to the merchant account
 * (payment contract §3.3), so no extra secret is needed here.
 */
export async function forwardPaymentRequest(
  path: string,
  user: CheckIdTokenResp,
  init: RequestInit = {},
): Promise<NextResponse> {
  try {
    const response = await fetch(`${env.HYDRA_API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    });

    if (!response.ok) {
      // Keep the backend status (400/403/404/409/410/503); drop its body.
      return NextResponse.json(
        { error: `Hydra API responded with status ${response.status}` },
        { status: response.status },
      );
    }

    const parsed = PaymentSchema.safeParse(await response.json());
    if (!parsed.success) {
      secureLogError(parsed.error, {
        operation: "forwardPaymentRequest",
        endpoint: path,
        userId: user.decodedData?.uid,
      });
      return NextResponse.json(
        { error: "Invalid payment returned by Hydra API" },
        { status: 502 },
      );
    }

    return NextResponse.json(parsed.data, { status: response.status });
  } catch (error) {
    secureLogError(error, {
      operation: "forwardPaymentRequest",
      endpoint: path,
      userId: user.decodedData?.uid,
    });
    return NextResponse.json(
      { error: "Hydra API unreachable" },
      { status: 502 },
    );
  }
}
