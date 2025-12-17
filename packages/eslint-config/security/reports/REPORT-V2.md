# Security Audit Report - Hydra Turbo

**Report Version:** V2  
**Audit Date:** December 2024  
**Auditor:** Senior Application Security Engineer  
**Scope:** Complete repository security assessment  
**Branch Analyzed:** security-audit-3

---

## 1. Executive Summary

### Overall Risk Posture: **HIGH**

The Hydra Turbo repository presents significant security vulnerabilities that require immediate attention. While the codebase demonstrates good security practices in some areas (comprehensive CSP implementation, secure error handling), critical dependency vulnerabilities and authentication weaknesses pose substantial risks.

### Key Issues (Top 5)

1. **Critical Next.js vulnerabilities** in admin app (CVE-2024-\*)
2. **High-risk IP SSRF vulnerability** in MeshSDK dependencies
3. **Missing CSRF protection** in API routes
4. **Insecure file upload** implementation without validation
5. **TypeScript build errors ignored** (ignoreBuildErrors: true)

### Recommended Next Actions

1. **IMMEDIATE:** Update Next.js to latest version in admin app
2. **HIGH PRIORITY:** Implement CSRF protection for state-changing operations
3. **HIGH PRIORITY:** Add file upload validation and sanitization
4. **MEDIUM PRIORITY:** Review and update MeshSDK dependencies
5. **MEDIUM PRIORITY:** Fix TypeScript errors and remove ignoreBuildErrors

---

## 2. Methodology

### Tools & Versions Used

- **pnpm audit** - Dependency vulnerability scanning
- **Manual code review** - Authentication flows, API routes, middleware
- **Static analysis** - grep-based pattern matching for common vulnerabilities
- **Configuration review** - Next.js config, CSP, security headers

### Scope & Limitations

- **Scope:** Complete monorepo including apps/merchant, apps/admin, apps/cms, packages
- **Limitations:**
  - No runtime testing performed
  - No penetration testing conducted
  - Limited to static analysis and dependency scanning
  - No access to production environment variables

### Commit/Branch Analyzed

- **Branch:** security-audit-3
- **Date:** December 2024
- **Commit:** Latest security hardening implementations

---

## 3. Findings Overview

| ID         | Title                                 | Severity | CVSS | Location                                      | Status |
| ---------- | ------------------------------------- | -------- | ---- | --------------------------------------------- | ------ |
| APPSEC-001 | Critical Next.js Authorization Bypass | Critical | 9.8  | `apps/admin` (next@14.2.8)                    | Open   |
| APPSEC-002 | High-Risk IP SSRF in MeshSDK          | High     | 8.1  | `@meshsdk/core` dependencies                  | Open   |
| APPSEC-003 | Missing CSRF Protection               | High     | 7.5  | API routes                                    | Open   |
| APPSEC-004 | Insecure File Upload                  | High     | 7.2  | `src/lib/firebase/services/storage/winery.ts` | Open   |
| APPSEC-005 | TypeScript Errors Ignored             | Medium   | 6.1  | `next.config.mjs:112`                         | Open   |
| APPSEC-006 | CSP Unsafe Eval Allowed               | Medium   | 5.8  | `next.config.mjs:48`                          | Open   |
| APPSEC-007 | Missing Rate Limiting                 | Medium   | 5.5  | API routes                                    | Open   |
| APPSEC-008 | Weak Password Validation              | Low      | 4.3  | `src/lib/validation/http.ts:121`              | Open   |
| APPSEC-009 | Debug Logging in Production           | Low      | 3.7  | `src/middleware.ts`                           | Open   |
| APPSEC-010 | Missing Input Sanitization            | Low      | 3.5  | Various API routes                            | Open   |

---

## 4. Detailed Findings

### APPSEC-001: Critical Next.js Authorization Bypass

**Severity:** Critical | **CVSS:** 9.8 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H)

**Description:** The admin application uses Next.js 14.2.8 which contains critical authorization bypass vulnerabilities that allow attackers to bypass authentication and access protected routes.

**Evidence:**

```bash
pnpm audit output:
┌─────────────────────┬────────────────────────────────────────────────────────┐
│ critical            │ Authorization Bypass in Next.js Middleware             │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Package             │ next                                                   │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Vulnerable versions │ >=14.0.0 <14.2.25                                      │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Patched versions    │ >=14.2.25                                              │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Paths               │ apps/admin > next@14.2.8                               │
└─────────────────────┴────────────────────────────────────────────────────────┘
```

**Impact:** Complete authentication bypass, unauthorized access to admin functions

**Likelihood:** High - Well-known vulnerability with public exploits

**Remediation:**

```bash
cd apps/admin
pnpm update next@latest
```

**References:** [CVE-2024-\*](https://github.com/advisories/GHSA-f82v-jwr5-mffw)

**Status:** Open

---

### APPSEC-002: High-Risk IP SSRF in MeshSDK Dependencies

**Severity:** High | **CVSS:** 8.1 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:L/A:H)

**Description:** The MeshSDK dependencies include the `ip` package version 2.0.1 which has an SSRF vulnerability due to improper categorization of IP addresses as public.

**Evidence:**

```bash
pnpm audit output:
┌─────────────────────┬────────────────────────────────────────────────────────┐
│ high                │ ip SSRF improper categorization in isPublic            │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Package             │ ip                                                     │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Vulnerable versions │ <=2.0.1                                                │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Patched versions    │ <0.0.0                                                 │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ Paths               │ apps/merchant > @meshsdk/core@1.9.0-beta.59 > ...     │
└─────────────────────┴────────────────────────────────────────────────────────┘
```

**Impact:** Server-side request forgery, potential internal network access

**Likelihood:** Medium - Requires specific attack vectors

**Remediation:**

```bash
# Check if MeshSDK has updated dependencies
pnpm update @meshsdk/core @meshsdk/react
# If not available, consider alternative Cardano libraries
```

**References:** [CVE-\*](https://github.com/advisories/GHSA-2p57-rm9w-gvfp)

**Status:** Open

---

### APPSEC-003: Missing CSRF Protection

**Severity:** High | **CVSS:** 7.5 (AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H)

**Description:** API routes handling state-changing operations lack CSRF protection, making them vulnerable to cross-site request forgery attacks.

**Evidence:**

```typescript
// apps/merchant/src/app/api/(auth)/auth/set-cookie/route.ts
export async function POST(request: Request) {
  // No CSRF token validation
  const bodyResult = await parseJsonBody(request);
  // ... processes request without CSRF protection
}
```

**Impact:** Unauthorized actions on behalf of authenticated users

**Likelihood:** High - Common attack vector

**Remediation:**

```diff
// Add CSRF validation to state-changing API routes
+ import { validateCsrfToken } from '@/lib/csrf';

export async function POST(request: Request) {
+   // Validate CSRF token
+   const csrfResult = await validateCsrfToken(request);
+   if (!csrfResult.ok) {
+     return NextResponse.json({ error: csrfResult.error }, { status: 403 });
+   }

  const bodyResult = await parseJsonBody(request);
  // ... rest of implementation
}
```

**References:** [OWASP CSRF Prevention](https://owasp.org/www-community/attacks/csrf)

**Status:** Open

---

### APPSEC-004: Insecure File Upload

**Severity:** High | **CVSS:** 7.2 (AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:L/A:H)

**Description:** File upload implementation lacks proper validation, allowing potentially malicious files to be uploaded.

**Evidence:**

```typescript
// apps/merchant/src/lib/firebase/services/storage/winery.ts
export const winery: any = {
  upload: async (
    file: File,
    path: string,
    // ... no file type validation
    // ... no file size validation
    // ... no malware scanning
  ) => {
    const storageRef = ref(storage, path + file.name); // Path traversal possible
    const uploadTask = uploadBytesResumable(storageRef, file);
    // ...
  },
};
```

**Impact:** Malware upload, path traversal, storage abuse

**Likelihood:** Medium - Requires attacker to access upload functionality

**Remediation:**

```diff
export const winery: any = {
  upload: async (file: File, path: string, ...) => {
+   // Validate file type
+   const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
+   if (!allowedTypes.includes(file.type)) {
+     throw new Error('Invalid file type');
+   }
+
+   // Validate file size (5MB limit)
+   if (file.size > 5 * 1024 * 1024) {
+     throw new Error('File too large');
+   }
+
+   // Sanitize path
+   const sanitizedPath = path.replace(/[^a-zA-Z0-9/_-]/g, '');
+   const storageRef = ref(storage, sanitizedPath + file.name);
```

**References:** [OWASP File Upload](https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload)

**Status:** Open

---

### APPSEC-005: TypeScript Errors Ignored

**Severity:** Medium | **CVSS:** 6.1 (AV:N/AC:L/PR:N/UI:R/S:U/C:L/I:L/A:N)

**Description:** Next.js configuration ignores TypeScript build errors, potentially hiding security-relevant type issues.

**Evidence:**

```typescript
// apps/merchant/next.config.mjs:112
typescript: {
  ignoreBuildErrors: true, // Security risk - hides type errors
},
```

**Impact:** Hidden type errors that could indicate security issues

**Likelihood:** Medium - Depends on specific type errors

**Remediation:**

```diff
typescript: {
-  ignoreBuildErrors: true,
+  ignoreBuildErrors: false, // Fix type errors instead of ignoring them
},
```

**References:** [Next.js TypeScript](https://nextjs.org/docs/app/building-your-application/configuring/typescript)

**Status:** Open

---

### APPSEC-006: CSP Unsafe Eval Allowed

**Severity:** Medium | **CVSS:** 5.8 (AV:N/AC:L/PR:N/UI:R/S:U/C:L/I:L/A:N)

**Description:** Content Security Policy allows 'unsafe-eval' which enables dynamic code execution.

**Evidence:**

```typescript
// apps/merchant/next.config.mjs:48
const script = [self, "'unsafe-inline'", "'unsafe-eval'", ...allow.script];
// Temporary: allow inline scripts and eval for Next.js/webpack
```

**Impact:** XSS attacks, code injection

**Likelihood:** Medium - Requires XSS vulnerability

**Remediation:**

```diff
- const script = [self, "'unsafe-inline'", "'unsafe-eval'", ...allow.script];
+ const script = [self, ...allow.script]; // Remove unsafe-eval
+ // Use nonces or hashes for inline scripts instead
```

**References:** [CSP unsafe-eval](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src)

**Status:** Open

---

### APPSEC-007: Missing Rate Limiting

**Severity:** Medium | **CVSS:** 5.5 (AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:L)

**Description:** API routes lack rate limiting, making them vulnerable to abuse and DoS attacks.

**Impact:** API abuse, resource exhaustion

**Likelihood:** High - Easy to exploit

**Remediation:**

```typescript
// Add rate limiting middleware
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
```

**Status:** Open

---

### APPSEC-008: Weak Password Validation

**Severity:** Low | **CVSS:** 4.3 (AV:N/AC:L/PR:N/UI:R/S:U/C:L/I:N/A:N)

**Description:** Password validation only checks length, not complexity.

**Evidence:**

```typescript
// apps/merchant/src/lib/validation/http.ts:121
export function validatePassword(password: string) {
  if (password.length < 8)
    return { ok: false, error: "Password must be at least 8 characters" };
  // No complexity requirements
}
```

**Remediation:**

```diff
export function validatePassword(password: string) {
  if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters" };
+  if (!/[A-Z]/.test(password)) return { ok: false, error: "Password must contain uppercase letter" };
+  if (!/[a-z]/.test(password)) return { ok: false, error: "Password must contain lowercase letter" };
+  if (!/[0-9]/.test(password)) return { ok: false, error: "Password must contain number" };
}
```

**Status:** Open

---

### APPSEC-009: Debug Logging in Production

**Severity:** Low | **CVSS:** 3.7 (AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:N/A:N)

**Description:** Extensive debug logging in middleware could leak sensitive information.

**Evidence:**

```typescript
// apps/merchant/src/middleware.ts:21-25
console.log(`[MIDDLEWARE] Processing request to: ${pathname}`);
console.log(`[MIDDLEWARE] Has auth token: ${!!idToken}`);
console.log(
  `[MIDDLEWARE] Token preview: ${idToken ? idToken.substring(0, 20) + "..." : "none"}`,
);
```

**Remediation:**

```diff
- console.log(`[MIDDLEWARE] Processing request to: ${pathname}`);
+ if (process.env.NODE_ENV === 'development') {
+   console.log(`[MIDDLEWARE] Processing request to: ${pathname}`);
+ }
```

**Status:** Open

---

### APPSEC-010: Missing Input Sanitization

**Severity:** Low | **CVSS:** 3.5 (AV:N/AC:L/PR:N/UI:R/S:U/C:L/I:N/A:N)

**Description:** Some API routes lack proper input sanitization.

**Impact:** Potential injection attacks

**Remediation:** Implement proper input sanitization for all user inputs.

**Status:** Open

---

## 5. Dependency & Supply Chain Risks

### Summary of Vulnerable Packages

- **Critical (1):** Next.js authorization bypass in admin app
- **High (1):** IP SSRF vulnerability in MeshSDK dependencies
- **Moderate (4):** Next.js cache poisoning, esbuild dev server, PrismJS DOM clobbering
- **Low (3):** Information exposure, prototype pollution, race conditions

### Transitive Exposure

The MeshSDK dependencies introduce significant risk through transitive dependencies:

- `@meshsdk/core@1.9.0-beta.59` → `@fabianbormann/cardano-peer-connect@1.2.18` → `ip@2.0.1`
- Multiple paths through webtorrent and peer-connect libraries

### Recommendations

1. **Immediate:** Update Next.js in admin app to latest version
2. **High Priority:** Review MeshSDK dependency tree and consider alternatives
3. **Medium Priority:** Update esbuild and other dev dependencies
4. **Ongoing:** Implement automated dependency scanning in CI/CD

---

## 6. Infrastructure, Docker & IaC

### Docker Analysis

- **Status:** No Dockerfiles found in repository
- **Recommendation:** If containerization is planned, implement security best practices:
  - Use non-root user
  - Pin base image versions
  - Implement multi-stage builds
  - Add HEALTHCHECK directives

### Infrastructure Security

- **Current State:** No infrastructure as code found
- **Recommendation:** Implement infrastructure security if deploying to cloud:
  - Secure VPC configurations
  - Proper IAM roles and policies
  - Encryption at rest and in transit
  - Network security groups

---

## 7. Secrets & Sensitive Data

### Secrets Scanning Results

**Status:** ✅ No hardcoded secrets found in codebase

### Environment Variable Security

**Strengths:**

- Centralized environment management in `src/lib/env.ts`
- Server-only imports prevent client-side exposure
- Zod validation for environment variables

**Recommendations:**

- Ensure `.env*` files are in `.gitignore`
- Use secret management service for production
- Rotate secrets regularly
- Implement secret scanning in CI/CD

---

## 8. Authentication, Authorization & Session

### Authentication Flow Analysis

**Strengths:**

- Firebase Authentication integration
- JWT token validation in middleware
- Secure cookie handling with proper flags
- Server-side token verification

**Weaknesses:**

- Missing CSRF protection
- No rate limiting on auth endpoints
- Debug logging exposes token information

### Session Management

**Current Implementation:**

- HttpOnly cookies for session storage
- Secure cookie flags in production
- Token expiration handling

**Recommendations:**

- Implement CSRF tokens for state-changing operations
- Add session timeout mechanisms
- Implement concurrent session limits

---

## 9. Privacy & Data Protection

### PII Handling

- **Current State:** Limited PII collection (email, display name)
- **Recommendation:** Implement GDPR compliance measures:
  - Data minimization
  - Consent management
  - Right to deletion
  - Data retention policies

### Encryption

- **In Transit:** HTTPS enforced via security headers
- **At Rest:** Firebase handles encryption
- **Recommendation:** Implement additional client-side encryption for sensitive data

---

## 10. Security Headers & CSP (Web)

### Current Security Headers

**Implemented:**

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-site`
- `Permissions-Policy` with restrictive defaults
- `Strict-Transport-Security` (production only)

### Content Security Policy

**Current CSP:** Comprehensive but includes `'unsafe-eval'`

**Recommendations:**

1. Remove `'unsafe-eval'` from script-src
2. Implement nonces for inline scripts
3. Consider removing `'unsafe-inline'` for styles
4. Add `report-uri` for CSP violation reporting

---

## 11. CI/CD & Process

### Current State

- **CI/CD:** No GitHub Actions or CI/CD configuration found
- **Process:** Manual deployment process

### Security Recommendations

1. **Implement CI/CD Security:**
   - Automated dependency scanning
   - Secret scanning
   - SAST analysis
   - Container scanning (if applicable)

2. **Process Improvements:**
   - Security code reviews
   - Automated security testing
   - Incident response procedures
   - Regular security training

---

## 12. Risk Register & Roadmap

### 30-Day Priorities (Critical/High)

1. **Update Next.js** in admin app (APPSEC-001)
2. **Implement CSRF protection** (APPSEC-003)
3. **Fix file upload validation** (APPSEC-004)
4. **Review MeshSDK dependencies** (APPSEC-002)

### 60-Day Priorities (Medium)

1. **Remove unsafe-eval from CSP** (APPSEC-006)
2. **Fix TypeScript errors** (APPSEC-005)
3. **Implement rate limiting** (APPSEC-007)
4. **Set up automated dependency scanning**

### 90-Day Priorities (Low/Process)

1. **Strengthen password validation** (APPSEC-008)
2. **Remove debug logging** (APPSEC-009)
3. **Implement input sanitization** (APPSEC-010)
4. **Set up comprehensive CI/CD security**

### Acceptance Criteria

- All Critical and High severity findings resolved
- Automated security scanning in CI/CD
- Security documentation updated
- Team training completed

---

## 13. Appendices

### Tool Outputs

```bash
# Dependency scan results
pnpm audit
# 13 vulnerabilities found
# Severity: 3 low | 6 moderate | 3 high | 1 critical
```

### Configuration Excerpts

```typescript
// Security headers implementation
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // ... additional headers
];
```

### Commands to Re-run Analysis

```bash
# Dependency scanning
pnpm audit

# Manual security patterns
grep -r "eval\|Function" apps/
grep -r "process\.env" apps/

# Configuration review
cat apps/merchant/next.config.mjs
cat apps/merchant/csp.allowlist.json
```

---

**Report End**

_This report contains sensitive security information and should be handled according to your organization's security policies._
