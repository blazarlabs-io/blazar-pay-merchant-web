/**
 * The session cookie this route writes must be the one the middleware and the API proxies read (AUTH_COOKIE).
 */

import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/logging", () => ({ secureLogError: vi.fn() }));

import { POST, DELETE } from "./route";
import { AUTH_COOKIE } from "@/features/authentication/data";

const post = (body: unknown) =>
  POST(
    new NextRequest("http://localhost/api/auth/set-cookie", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  );

describe("/api/auth/set-cookie", () => {
  it("POST sets the httpOnly AUTH_COOKIE with the token", async () => {
    const res = await post({ token: "id-token" });
    expect(res.status).toBe(200);
    const c = res.cookies.get(AUTH_COOKIE);
    expect(c?.value).toBe("id-token");
    expect(c?.httpOnly).toBe(true);
    expect(res.cookies.get("auth")).toBeUndefined();
  });

  it("POST without a token is 400 and sets nothing", async () => {
    const res = await post({});
    expect(res.status).toBe(400);
    expect(res.cookies.get(AUTH_COOKIE)).toBeUndefined();
  });

  it("DELETE expires AUTH_COOKIE", async () => {
    const res = await DELETE();
    expect(res.status).toBe(200);
    expect(res.cookies.get(AUTH_COOKIE)?.value).toBe("");
  });
});
