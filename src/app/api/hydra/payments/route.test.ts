import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/env", () => ({ env: { HYDRA_API_URL: "http://hydra.test" } }));
vi.mock("@/lib/logging", () => ({ secureLogError: vi.fn() }));
// Firebase verification is covered by withAuth itself; here the caller is already verified.
vi.mock("@/lib/auth/api-auth", () => ({
  withAuth:
    (handler: (request: NextRequest, user: unknown) => Promise<Response>) =>
    (request: NextRequest) =>
      handler(request, { token: "id-token", decodedData: { uid: "u1" } }),
}));

import { POST } from "./route";
import { GET } from "./[id]/route";

const PAYMENT_ID = "0b8f6a52-6d6e-4c1e-9a43-2f3f0b6a1c11";
const payment = {
  paymentId: PAYMENT_ID,
  merchantAddress: "addr_test1merchant",
  assetUnit: "lovelace",
  decimals: 6,
  amountBaseUnits: "1500000",
  state: "created",
  expiresAt: "2026-10-10T12:02:00.000Z",
  payerAddress: null,
  fundsInRef: null,
  hydraTxId: null,
  snapshotNumber: null,
  error: null,
  createdAt: "2026-10-10T12:00:00.000Z",
  updatedAt: "2026-10-10T12:00:00.000Z",
};
const create = {
  merchantAddress: "addr_test1merchant",
  assetUnit: "lovelace",
  amountBaseUnits: "1500000",
};

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
const post = (body: string) =>
  POST(
    new NextRequest("http://localhost/api/hydra/payments", {
      method: "POST",
      body,
    }),
  );
const get = (id: string) =>
  GET(new NextRequest(`http://localhost/api/hydra/payments/${id}`));

beforeEach(() => fetchMock.mockReset());

describe("POST /api/hydra/payments", () => {
  it.each([
    ["a float amount", { ...create, amountBaseUnits: 1.5 }],
    ["a human amount", { ...create, amountBaseUnits: "1.5" }],
    ["a zero amount", { ...create, amountBaseUnits: "0" }],
    ["an unknown asset", { ...create, assetUnit: "usd" }],
    ["an extra field", { ...create, decimals: 6 }],
    ["a missing merchant", { ...create, merchantAddress: undefined }],
  ])("rejects %s without calling the backend", async (_name, body) => {
    const res = await post(JSON.stringify(body));
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects invalid JSON", async () => {
    expect((await post("not json")).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards a valid request with the caller's ID token", async () => {
    fetchMock.mockResolvedValue(json(payment, 201));
    const res = await post(JSON.stringify(create));

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual(payment);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("http://hydra.test/payments");
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toBe("Bearer id-token");
    expect(JSON.parse(init.body)).toEqual(create);
  });

  it("keeps the backend error status", async () => {
    fetchMock.mockResolvedValue(json({ error: "merchant mismatch" }, 403));
    expect((await post(JSON.stringify(create))).status).toBe(403);
  });

  it("returns 502 when the backend answers with a malformed payment", async () => {
    fetchMock.mockResolvedValue(json({ ...payment, amountBaseUnits: 1500000 }, 201));
    expect((await post(JSON.stringify(create))).status).toBe(502);
  });

  it("returns 502 when the backend is unreachable", async () => {
    // Once: vitest 3.2.4 fails tests when a persistent rejecting mock meets mockReset.
    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));
    expect((await post(JSON.stringify(create))).status).toBe(502);
  });
});

describe("GET /api/hydra/payments/[id]", () => {
  it("rejects an id that is not a uuid without calling the backend", async () => {
    expect((await get("close-head")).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns the backend payment", async () => {
    const confirmed = {
      ...payment,
      state: "confirmed",
      payerAddress: "addr_test1payer",
      fundsInRef: `${"a".repeat(64)}#1`,
      hydraTxId: "b".repeat(64),
      snapshotNumber: 42,
    };
    fetchMock.mockResolvedValue(json(confirmed));
    const res = await get(PAYMENT_ID);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(confirmed);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`http://hydra.test/payments/${PAYMENT_ID}`);
    expect(init.headers.Authorization).toBe("Bearer id-token");
  });

  it("keeps a 410 from the backend", async () => {
    fetchMock.mockResolvedValue(json({ error: "expired" }, 410));
    expect((await get(PAYMENT_ID)).status).toBe(410);
  });
});
