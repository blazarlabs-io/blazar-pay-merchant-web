/**
 * Integration tests for verify-id-token API route (APPSEC-008)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock all dependencies before importing the route
vi.mock("@/lib/firebase/admin", () => ({
  getAdminAuth: vi.fn(),
  initAdmin: vi.fn(),
}));

vi.mock("@/lib/validation/http", () => ({
  parseBearerToken: vi.fn(),
}));

vi.mock("@/lib/logging", () => ({
  secureLogError: vi.fn(),
}));

vi.mock("@/lib/errors", () => ({
  toPublicError: vi.fn(),
  CommonErrors: {
    AUTHENTICATION_FAILED: { status: 401, message: "Authentication failed" },
  },
}));

vi.mock("server-only", () => ({}));

// Import after mocking
import { POST } from "./route";
import { secureLogError } from "@/lib/logging";
import { getAdminAuth, initAdmin } from "@/lib/firebase/admin";
import { parseBearerToken } from "@/lib/validation/http";
import { toPublicError } from "@/lib/errors";

const mockSecureLogError = vi.mocked(secureLogError);
const mockInitAdmin = vi.mocked(initAdmin);
const mockGetAdminAuth = vi.mocked(getAdminAuth);
const mockParseBearerToken = vi.mocked(parseBearerToken);
const mockToPublicError = vi.mocked(toPublicError);

describe("verify-id-token API route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return 400 for invalid authorization header", async () => {
    mockParseBearerToken.mockReturnValue({
      ok: false,
      error: "Missing Authorization header",
    });

    const request = new Request(
      "http://localhost:3000/api/auth/verify-id-token",
      {
        method: "POST",
        headers: {
          Authorization: "Invalid",
        },
      },
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: "Missing Authorization header",
    });
  });

  it("should return 401 for invalid token", async () => {
    mockParseBearerToken.mockReturnValue({
      ok: true,
      token: "invalid-token",
    });

    mockInitAdmin.mockResolvedValue(undefined);
    mockToPublicError.mockReturnValue({
      status: 401,
      message: "Authentication failed",
    });

    const mockAuth = {
      verifyIdToken: vi.fn().mockRejectedValue(new Error("Invalid token")),
    };
    mockGetAdminAuth.mockReturnValue(mockAuth);

    const request = new Request(
      "http://localhost:3000/api/auth/verify-id-token",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer invalid-token",
        },
      },
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({
      error: "Authentication failed",
    });

    // Verify secure logging was called
    expect(mockSecureLogError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        operation: "verifyIdToken",
        endpoint: "/api/auth/verify-id-token",
      }),
    );
  });

  it("should return 401 for expired token", async () => {
    mockParseBearerToken.mockReturnValue({
      ok: true,
      token: "expired-token",
    });

    mockInitAdmin.mockResolvedValue(undefined);
    mockToPublicError.mockReturnValue({
      status: 401,
      message: "Authentication failed",
    });

    const mockAuth = {
      verifyIdToken: vi.fn().mockRejectedValue(new Error("Token expired")),
    };
    mockGetAdminAuth.mockReturnValue(mockAuth);

    const request = new Request(
      "http://localhost:3000/api/auth/verify-id-token",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer expired-token",
        },
      },
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({
      error: "Authentication failed",
    });
  });

  it("should return 200 for valid token", async () => {
    const mockDecodedData = {
      uid: "user123",
      email: "test@example.com",
      exp: 1234567890,
    };

    mockParseBearerToken.mockReturnValue({
      ok: true,
      token: "valid-token",
    });

    mockInitAdmin.mockResolvedValue(undefined);

    const mockAuth = {
      verifyIdToken: vi.fn().mockResolvedValue(mockDecodedData),
    };
    mockGetAdminAuth.mockReturnValue(mockAuth);

    const request = new Request(
      "http://localhost:3000/api/auth/verify-id-token",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer valid-token",
        },
      },
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      token: "valid-token",
      decodedData: mockDecodedData,
    });

    // Verify secure logging was NOT called for successful requests
    expect(mockSecureLogError).not.toHaveBeenCalled();
  });

  it("should handle unexpected errors gracefully", async () => {
    mockParseBearerToken.mockReturnValue({
      ok: true,
      token: "test-token",
    });

    mockInitAdmin.mockRejectedValue(
      new Error("Firebase initialization failed"),
    );

    mockToPublicError.mockReturnValue({
      status: 500,
      message: "Internal server error",
    });

    const request = new Request(
      "http://localhost:3000/api/auth/verify-id-token",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer test-token",
        },
      },
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: "Internal server error",
    });

    // Verify secure logging was called
    expect(mockSecureLogError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        operation: "verifyIdToken",
        endpoint: "/api/auth/verify-id-token",
      }),
    );
  });
});
