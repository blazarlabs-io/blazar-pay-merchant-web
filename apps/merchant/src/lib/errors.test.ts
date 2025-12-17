/**
 * Tests for error shaping utility (APPSEC-008)
 */

import { describe, it, expect } from "vitest";
import {
  toPublicError,
  createSanitizedError,
  CommonErrors,
  type PublicError,
} from "./errors";

describe("Error Shaping", () => {
  describe("toPublicError", () => {
    it("should map AuthError to 401", () => {
      const error = { name: "AuthError", message: "Invalid token" };
      const result = toPublicError(error);

      expect(result).toEqual({
        status: 401,
        message: "Authentication failed",
      });
    });

    it("should map auth/invalid-token to 401", () => {
      const error = { code: "auth/invalid-token", message: "Token invalid" };
      const result = toPublicError(error);

      expect(result).toEqual({
        status: 401,
        message: "Authentication failed",
      });
    });

    it("should map token expired errors to 401", () => {
      const error = { name: "TokenExpiredError", message: "Token expired" };
      const result = toPublicError(error);

      expect(result).toEqual({
        status: 401,
        message: "Authentication expired",
      });
    });

    it("should map validation errors to 400", () => {
      const error = { code: "VALIDATION_ERROR", message: "Invalid input" };
      const result = toPublicError(error);

      expect(result).toEqual({
        status: 400,
        message: "Invalid request data",
      });
    });

    it("should map permission errors to 403", () => {
      const error = { code: "PERMISSION_DENIED", message: "Access denied" };
      const result = toPublicError(error);

      expect(result).toEqual({
        status: 403,
        message: "Access denied",
      });
    });

    it("should map rate limit errors to 429", () => {
      const error = {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests",
      };
      const result = toPublicError(error);

      expect(result).toEqual({
        status: 429,
        message: "Too many requests",
      });
    });

    it("should map not found errors to 404", () => {
      const error = { code: "NOT_FOUND", message: "Resource not found" };
      const result = toPublicError(error);

      expect(result).toEqual({
        status: 404,
        message: "Resource not found",
      });
    });

    it("should use existing status code with generic message", () => {
      const error = { status: 422, message: "Detailed error message" };
      const result = toPublicError(error);

      expect(result).toEqual({
        status: 422,
        message: "Invalid data",
      });
    });

    it("should use fallback for unknown errors", () => {
      const error = { message: "Unknown error" };
      const fallback = { status: 418, message: "I'm a teapot" };
      const result = toPublicError(error, fallback);

      expect(result).toEqual(fallback);
    });

    it("should use default fallback for unknown errors", () => {
      const error = { message: "Unknown error" };
      const result = toPublicError(error);

      expect(result).toEqual({
        status: 500,
        message: "An unexpected error occurred",
      });
    });

    it("should handle null/undefined errors", () => {
      const result = toPublicError(null);

      expect(result).toEqual({
        status: 500,
        message: "An unexpected error occurred",
      });
    });
  });

  describe("createSanitizedError", () => {
    it("should create error with status code", () => {
      const publicError: PublicError = {
        status: 401,
        message: "Authentication failed",
      };
      const error = createSanitizedError(publicError);

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Authentication failed");
      expect(error.status).toBe(401);
    });
  });

  describe("CommonErrors", () => {
    it("should have all required error constants", () => {
      expect(CommonErrors.AUTHENTICATION_FAILED).toEqual({
        status: 401,
        message: "Authentication failed",
      });

      expect(CommonErrors.INVALID_REQUEST).toEqual({
        status: 400,
        message: "Invalid request",
      });

      expect(CommonErrors.ACCESS_DENIED).toEqual({
        status: 403,
        message: "Access denied",
      });

      expect(CommonErrors.NOT_FOUND).toEqual({
        status: 404,
        message: "Resource not found",
      });

      expect(CommonErrors.RATE_LIMITED).toEqual({
        status: 429,
        message: "Too many requests",
      });

      expect(CommonErrors.INTERNAL_ERROR).toEqual({
        status: 500,
        message: "Internal server error",
      });
    });
  });
});
