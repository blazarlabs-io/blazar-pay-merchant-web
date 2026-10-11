import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/api-auth";
import { CheckIdTokenResp } from "@/features/authentication/types";
import { forwardPaymentRequest } from "@/lib/hydra/payments-proxy";
import { PaymentSchema } from "@/types/payment-contract";

async function handleGetPayment(request: NextRequest, user: CheckIdTokenResp) {
  // withAuth drops the route context, so the id is read from the path.
  const id = PaymentSchema.shape.paymentId.safeParse(
    new URL(request.url).pathname.split("/").pop(),
  );
  if (!id.success) {
    return NextResponse.json({ error: "Invalid payment id" }, { status: 400 });
  }

  return forwardPaymentRequest(`/payments/${id.data}`, user);
}

export const GET = withAuth(handleGetPayment);
