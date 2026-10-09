import { Payment, TERMINAL_STATES } from "@/types/payment-contract";

export async function fetchPayment(
  paymentId: string,
  signal?: AbortSignal,
): Promise<Payment> {
  const res = await fetch(`/api/hydra/payments/${paymentId}`, { signal });
  if (!res.ok) throw new Error(`Payment status request failed (${res.status})`);
  return res.json();
}

/**
 * Polls the payment every `intervalMs` until it is confirmed, failed or expired, or `signal` aborts.
 * A failed poll is reported and retried: the backend record stays the source of truth.
 */
export async function pollPayment(
  paymentId: string,
  {
    onUpdate,
    onError,
    signal,
    intervalMs = 1000,
    getPayment = fetchPayment,
  }: {
    onUpdate: (payment: Payment) => void;
    onError: (error: unknown) => void;
    signal: AbortSignal;
    intervalMs?: number;
    getPayment?: (paymentId: string, signal?: AbortSignal) => Promise<Payment>;
  },
): Promise<Payment | undefined> {
  while (!signal.aborted) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    if (signal.aborted) return undefined;
    try {
      const payment = await getPayment(paymentId, signal);
      onUpdate(payment);
      if (TERMINAL_STATES.includes(payment.state)) return payment;
    } catch (error) {
      if (!signal.aborted) onError(error);
    }
  }
  return undefined;
}
