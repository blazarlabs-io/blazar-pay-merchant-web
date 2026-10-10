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

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);
beforeEach(() => fetchMock.mockReset());

// Cashout: the backend authorizes the owner of the address by its Firebase ID token.
describe("POST /api/hydra/withdraw", () => {
  const body = { address: "addr_test1merchant", owner: "merchant" };
  it("forwards the body with the caller's ID token as Bearer", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ cborHex: "84" })));
    const res = await POST(
      new NextRequest("http://localhost/api/hydra/withdraw", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    );

    expect(res.status).toBe(200);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("http://hydra.test/withdraw");
    expect(init.headers.Authorization).toBe("Bearer id-token");
    expect(JSON.parse(init.body)).toEqual(body);
  });
});
