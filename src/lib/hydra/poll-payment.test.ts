import { describe, it, expect, vi, afterEach } from "vitest";
import { pollPayment } from "./poll-payment";
import type { Payment, PaymentState } from "@/types/payment-contract";

const at = (state: PaymentState) => ({ paymentId: "p1", state }) as Payment;
const poll = (
  getPayment: (id: string) => Promise<Payment>,
  extra: Partial<Parameters<typeof pollPayment>[1]> = {},
) =>
  pollPayment("p1", {
    onUpdate: vi.fn(),
    onError: vi.fn(),
    signal: new AbortController().signal,
    intervalMs: 0,
    getPayment,
    ...extra,
  });

afterEach(() => {
  vi.useRealTimers();
});

describe("pollPayment", () => {
  it.each<PaymentState>(["confirmed", "failed", "expired"])(
    "stops at %s",
    async (final) => {
      const getPayment = vi
        .fn()
        .mockResolvedValueOnce(at("created"))
        .mockResolvedValueOnce(at("authorized"))
        .mockResolvedValueOnce(at("submitted"))
        .mockResolvedValueOnce(at(final))
        .mockResolvedValue(at("created")); // would be read if polling overshot
      const onUpdate = vi.fn();

      const result = await poll(getPayment, { onUpdate });

      expect(result?.state).toBe(final);
      expect(getPayment).toHaveBeenCalledTimes(4);
      expect(onUpdate.mock.calls.map(([p]) => p.state)).toEqual([
        "created",
        "authorized",
        "submitted",
        final,
      ]);
    },
  );

  it("reports a failed request and keeps polling", async () => {
    const getPayment = vi
      .fn()
      .mockRejectedValueOnce(new Error("Payment status request failed (502)"))
      .mockResolvedValueOnce(at("confirmed"));
    const onError = vi.fn();

    const result = await poll(getPayment, { onError });

    expect(onError).toHaveBeenCalledOnce();
    expect(result?.state).toBe("confirmed");
  });

  it("stops when aborted (sheet closed or widget unmounted)", async () => {
    const controller = new AbortController();
    const getPayment = vi.fn(async () => {
      controller.abort();
      return at("submitted");
    });

    const result = await poll(getPayment, { signal: controller.signal });

    expect(result).toBeUndefined();
    expect(getPayment).toHaveBeenCalledOnce();
  });

  it("polls every second by default", async () => {
    vi.useFakeTimers();
    const getPayment = vi.fn().mockResolvedValue(at("created"));
    const controller = new AbortController();
    void pollPayment("p1", {
      onUpdate: vi.fn(),
      onError: vi.fn(),
      signal: controller.signal,
      getPayment,
    });

    await vi.advanceTimersByTimeAsync(999);
    expect(getPayment).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(getPayment).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1000);
    expect(getPayment).toHaveBeenCalledTimes(2);
    controller.abort();
  });
});
