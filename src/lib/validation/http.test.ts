import { describe, test, expect } from 'vitest';
import {
  parseBearerToken,
  isPlausibleJwt,
  validateRequiredHeader,
  validateRequiredParam,
  validateJsonBody,
  isValidEmail,
  validatePassword,
} from './http';

describe('parseBearerToken', () => {
  test('rejects missing authorization header', () => {
    expect(parseBearerToken(null)).toEqual({
      ok: false,
      error: 'Missing Authorization header'
    });
  });

  test('rejects non-bearer scheme', () => {
    expect(parseBearerToken('Basic abc123')).toEqual({
      ok: false,
      error: 'Authorization must use Bearer scheme'
    });
  });

  test('rejects empty token', () => {
    expect(parseBearerToken('Bearer ')).toEqual({
      ok: false,
      error: 'Empty token'
    });
  });

  test('rejects invalid token format', () => {
    expect(parseBearerToken('Bearer abc')).toEqual({
      ok: false,
      error: 'Invalid token format'
    });
  });

  test('accepts valid JWT token', () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    expect(parseBearerToken(`Bearer ${token}`)).toEqual({
      ok: true,
      token
    });
  });

  test('handles token with whitespace', () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    expect(parseBearerToken(`Bearer   ${token}   `)).toEqual({
      ok: true,
      token
    });
  });
});

describe('isPlausibleJwt', () => {
  test('rejects null/undefined', () => {
    expect(isPlausibleJwt(null)).toBe(false);
    expect(isPlausibleJwt(undefined)).toBe(false);
  });

  test('rejects short tokens', () => {
    expect(isPlausibleJwt('short')).toBe(false);
    expect(isPlausibleJwt('abc.def')).toBe(false);
  });

  test('rejects invalid characters', () => {
    expect(isPlausibleJwt('invalid@token#with$special%chars')).toBe(false);
  });

  test('rejects wrong number of segments', () => {
    expect(isPlausibleJwt('header.payload')).toBe(false);
    expect(isPlausibleJwt('header.payload.signature.extra')).toBe(false);
  });

  test('rejects empty segments', () => {
    expect(isPlausibleJwt('header..signature')).toBe(false);
    expect(isPlausibleJwt('.payload.signature')).toBe(false);
  });

  test('accepts valid JWT format', () => {
    const validJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    expect(isPlausibleJwt(validJwt)).toBe(true);
  });
});

describe('validateRequiredHeader', () => {
  const mockHeaders = new Headers([
    ['authorization', 'Bearer token123'],
    ['content-type', 'application/json'],
    ['empty-header', ''],
  ]);

  test('returns value for existing header', () => {
    const result = validateRequiredHeader(mockHeaders, 'authorization');
    expect(result).toEqual({
      ok: true,
      value: 'Bearer token123'
    });
  });

  test('rejects missing header', () => {
    const result = validateRequiredHeader(mockHeaders, 'missing-header');
    expect(result).toEqual({
      ok: false,
      error: 'Missing missing-header header'
    });
  });

  test('rejects empty header', () => {
    const result = validateRequiredHeader(mockHeaders, 'empty-header');
    expect(result).toEqual({
      ok: false,
      error: 'Missing empty-header header'
    });
  });
});

describe('validateRequiredParam', () => {
  const mockParams = new URLSearchParams([
    ['address', 'addr123456789'],
    ['empty-param', ''],
  ]);

  test('returns value for existing parameter', () => {
    const result = validateRequiredParam(mockParams, 'address');
    expect(result).toEqual({
      ok: true,
      value: 'addr123456789'
    });
  });

  test('rejects missing parameter', () => {
    const result = validateRequiredParam(mockParams, 'missing-param');
    expect(result).toEqual({
      ok: false,
      error: 'Missing missing-param parameter'
    });
  });

  test('rejects empty parameter', () => {
    const result = validateRequiredParam(mockParams, 'empty-param');
    expect(result).toEqual({
      ok: false,
      error: 'Missing empty-param parameter'
    });
  });
});

describe('isValidEmail', () => {
  test('accepts valid emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
    expect(isValidEmail('a@b.c')).toBe(true);
  });

  test('rejects invalid emails', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
    expect(isValidEmail('test.example.com')).toBe(false);
    expect(isValidEmail('test @example.com')).toBe(false);
  });

  test('rejects emails that are too long', () => {
    const longEmail = 'a'.repeat(250) + '@example.com';
    expect(isValidEmail(longEmail)).toBe(false);
  });
});

describe('validatePassword', () => {
  test('accepts valid passwords', () => {
    expect(validatePassword('password123')).toEqual({ ok: true });
    expect(validatePassword('MyStr0ng!Pass')).toEqual({ ok: true });
  });

  test('rejects empty passwords', () => {
    expect(validatePassword('')).toEqual({
      ok: false,
      error: 'Password is required'
    });
  });

  test('rejects short passwords', () => {
    expect(validatePassword('1234567')).toEqual({
      ok: false,
      error: 'Password must be at least 8 characters'
    });
  });

  test('rejects long passwords', () => {
    const longPassword = 'a'.repeat(129);
    expect(validatePassword(longPassword)).toEqual({
      ok: false,
      error: 'Password must be less than 128 characters'
    });
  });
});

describe('validateJsonBody', () => {
  test('accepts valid JSON', async () => {
    const mockRequest = new Request('http://localhost', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ test: 'data' }),
    });

    const result = await validateJsonBody(mockRequest);
    expect(result).toEqual({
      ok: true,
      body: { test: 'data' }
    });
  });

  test('rejects invalid JSON', async () => {
    const mockRequest = new Request('http://localhost', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'invalid json',
    });

    const result = await validateJsonBody(mockRequest);
    expect(result).toEqual({
      ok: false,
      error: 'Invalid JSON in request body'
    });
  });

  test('rejects oversized bodies', async () => {
    const largeBody = 'x'.repeat(1024 * 1024 + 1); // 1MB + 1 byte
    const mockRequest = new Request('http://localhost', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'content-length': largeBody.length.toString() },
      body: largeBody,
    });

    const result = await validateJsonBody(mockRequest, 1024 * 1024); // 1MB limit
    expect(result).toEqual({
      ok: false,
      error: 'Request body too large (max 1048576 bytes)'
    });
  });
});
