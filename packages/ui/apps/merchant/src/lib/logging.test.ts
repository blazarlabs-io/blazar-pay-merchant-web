/**
 * Tests for secure logging utility (APPSEC-008)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  secureLogError,
  secureInfo,
  secureWarn,
  isProduction,
} from "./logging";

// Mock console methods
const mockConsoleError = vi
  .spyOn(console, "error")
  .mockImplementation(() => {});
const mockConsoleInfo = vi.spyOn(console, "info").mockImplementation(() => {});
const mockConsoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

// Mock NODE_ENV
const originalEnv = process.env.NODE_ENV;

describe("Secure Logging", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe("secureLogError", () => {
    it("should log error with structured format", () => {
      const error = new Error("Test error");
      const context = { userId: "123", operation: "test" };

      secureLogError(error, context);

      expect(mockConsoleError).toHaveBeenCalledTimes(1);
      const call = mockConsoleError.mock.calls[0][0];
      expect(call).toMatchObject({
        level: "error",
        message: "App error",
        service: "merchant",
        timestamp: expect.any(String),
        context: expect.objectContaining({
          error: expect.objectContaining({
            name: "Error",
            message: "Test error",
          }),
          userId: "123",
          operation: "test",
        }),
      });
    });

    it("should include stack trace in development", () => {
      process.env.NODE_ENV = "development";

      const error = new Error("Test error");
      secureLogError(error);

      const call = mockConsoleError.mock.calls[0][0];
      expect(call.context.error).toHaveProperty("stack");
    });

    it("should exclude stack trace in production", () => {
      process.env.NODE_ENV = "production";

      const error = new Error("Test error");
      secureLogError(error);

      const call = mockConsoleError.mock.calls[0][0];
      expect(call.context.error).not.toHaveProperty("stack");
    });

    it("should redact sensitive fields", () => {
      const context = {
        userId: "123",
        password: "secret123",
        token: "jwt-token",
        authorization: "Bearer token",
        privateKey: "private-key",
        credential: "credential-data",
      };

      secureLogError(new Error("Test"), context);

      const call = mockConsoleError.mock.calls[0][0];
      expect(call.context).toMatchObject({
        userId: "123",
        password: "[REDACTED]",
        token: "[REDACTED]",
        authorization: "[REDACTED]",
        privateKey: "[REDACTED]",
        credential: "[REDACTED]",
      });
    });

    it("should handle non-Error objects", () => {
      const error = "String error";
      secureLogError(error);

      expect(mockConsoleError).toHaveBeenCalledTimes(1);
      const call = mockConsoleError.mock.calls[0][0];
      expect(call.context.error).toMatchObject({
        name: "Error",
        message: "String error",
      });
    });

    it("should return safe error message", () => {
      const error = new Error("Test error");
      const message = secureLogError(error);

      expect(message).toBe("Test error");
    });
  });

  describe("secureInfo", () => {
    it("should log info with structured format", () => {
      const context = { operation: "test" };
      secureInfo("Test info", context);

      expect(mockConsoleInfo).toHaveBeenCalledTimes(1);
      const call = mockConsoleInfo.mock.calls[0][0];
      expect(call).toMatchObject({
        level: "info",
        message: "Test info",
        service: "merchant",
        timestamp: expect.any(String),
        context: { operation: "test" },
      });
    });
  });

  describe("secureWarn", () => {
    it("should log warning with structured format", () => {
      const context = { warning: "test" };
      secureWarn("Test warning", context);

      expect(mockConsoleWarn).toHaveBeenCalledTimes(1);
      const call = mockConsoleWarn.mock.calls[0][0];
      expect(call).toMatchObject({
        level: "warn",
        message: "Test warning",
        service: "merchant",
        timestamp: expect.any(String),
        context: { warning: "test" },
      });
    });
  });

  describe("isProduction", () => {
    it("should return true in production", () => {
      process.env.NODE_ENV = "production";
      expect(isProduction()).toBe(true);
    });

    it("should return false in development", () => {
      process.env.NODE_ENV = "development";
      expect(isProduction()).toBe(false);
    });
  });
});
