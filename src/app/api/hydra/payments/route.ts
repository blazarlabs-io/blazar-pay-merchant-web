import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/api-auth";
import { CheckIdTokenResp } from "@/features/authentication/types";
import { forwardPaymentRequest } from "@/lib/hydra/payments-proxy";
import { CreatePaymentSchema } from "@/types/payment-contract";

async function handleCreatePayment(
  request: NextRequest,
  user: CheckIdTokenResp,
) {
  const body = CreatePaymentSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success) {
    return NextResponse.json(
      { error: "Invalid payment request" },
      { status: 400 },
    );
  }

  return forwardPaymentRequest("/payments", user, {
    method: "POST",
    body: JSON.stringify(body.data),
  });
}

export const POST = withAuth(handleCreatePayment);
