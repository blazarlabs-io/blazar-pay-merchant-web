# Security Audit Report - Hydra Turbo

**Report Version:** V4  
**Date:** October 4, 2025  
**Auditor:** AI Security Engineer  
**Scope:** Full repository security audit  
**Branch:** security-audit-4

## 1. Executive Summary

**Overall Risk Posture:** **Medium**

### Key Issues (Top 5)

1. **High:** Hardcoded secrets in environment files (API keys, private keys)
2. **High:** Vulnerable dependency `ip@2.0.1` with SSRF vulnerability
3. **Medium:** Insecure CSP configuration allowing unsafe-inline and unsafe-eval
4. **Medium:** Missing authentication on sensitive API endpoints
5. **Medium:** Insecure private key handling in API routes

### Recommended Next Actions

- Rotate all exposed API keys and secrets immediately
- Update vulnerable dependencies, particularly `ip` package
- Implement proper authentication on all sensitive endpoints
- Harden CSP configuration to remove unsafe directives
- Implement secure key management for cryptographic operations

## 2. Methodology

### Tools & Versions Used

- **detect-secrets:** 1.5.0
- **semgrep:** 1.139.0 (OSS rules)
- **pnpm audit:** Latest
- **Manual code review:** Authentication flows, API security, crypto operations

### Scope & Limitations

- **Scope:** Entire monorepo including apps/merchant, apps/docs, packages
- **Limitations:**
  - No container/IaC scanning (no Docker/Terraform files found)
  - Limited to OSS semgrep rules (1390 pro rules unavailable)
  - No runtime testing performed
  - SBOM generation failed due to dependency conflicts

### Commit/Branch Analyzed

- **Branch:** security-audit-4
- **Date:** October 4, 2025

## 3. Findings Overview

| ID         | Title                                                   | Severity | CVSS | Location                                             | Status |
| ---------- | ------------------------------------------------------- | -------- | ---- | ---------------------------------------------------- | ------ |
| APPSEC-001 | Hardcoded API keys in environment files                 | High     | 7.5  | `apps/merchant/.env.*`                               | Open   |
| APPSEC-002 | Vulnerable dependency: ip@2.0.1 SSRF                    | High     | 7.1  | `node_modules/ip@2.0.1`                              | Open   |
| APPSEC-003 | Insecure CSP with unsafe-inline/unsafe-eval             | Medium   | 6.1  | `apps/merchant/next.config.mjs:48`                   | Open   |
| APPSEC-004 | Missing authentication on sensitive endpoints           | Medium   | 6.5  | `apps/merchant/src/app/api/account-key/route.ts`     | Open   |
| APPSEC-005 | Insecure private key handling                           | Medium   | 6.8  | `apps/merchant/src/app/api/get-private-key/route.ts` | Open   |
| APPSEC-006 | Vulnerable dependency: min-document prototype pollution | Low      | 4.3  | `node_modules/min-document@2.19.0`                   | Open   |
| APPSEC-007 | JWT test tokens in codebase                             | Info     | 2.1  | `apps/merchant/src/lib/validation/http.test.ts`      | Open   |
| APPSEC-008 | Excessive logging in middleware                         | Info     | 1.8  | `apps/merchant/src/middleware.ts:21-25`              | Open   |

## 4. Detailed Findings

### APPSEC-001: Hardcoded API keys in environment files

**Severity:** High | **CVSS:** 7.5 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N)

**Description:** Environment files contain hardcoded API keys, private keys, and other sensitive credentials that are committed to version control.

**Evidence:**

```bash
# From .env.development and .env.production
NEXT_PUBLIC_FB_API_KEY="AIzaSyAczFOgrM4RBOVFXxZMmkp6r6R9tOTKBvc"
SENDGRID_API_KEY=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
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEA..."
```

**Impact:** Exposed credentials could lead to unauthorized access to Firebase, SendGrid, and other third-party services.

**Likelihood:** High - Files are in version control

**Remediation:**

1. Rotate all exposed API keys immediately
2. Move sensitive values to secure environment variable management
3. Add `.env*` files to `.gitignore`
4. Use environment-specific secret management (AWS Secrets Manager, Azure Key Vault, etc.)

**References:** OWASP A07:2021 - Identification and Authentication Failures

**Status:** Open

### APPSEC-002: Vulnerable dependency: ip@2.0.1 SSRF

**Severity:** High | **CVSS:** 7.1 (AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:H/A:N)

**Description:** The `ip@2.0.1` package has a known SSRF vulnerability due to improper categorization in `isPublic` function.

**Evidence:**

```bash
pnpm audit output:
│ high                │ ip SSRF improper categorization in isPublic            │
│ Package             │ ip                                                    │
│ Vulnerable versions │ <=2.0.1                                              │
│ Patched versions    │ <0.0.0                                               │
```

**Impact:** Could allow Server-Side Request Forgery attacks through the MeshSDK Cardano integration.

**Likelihood:** Medium - Requires specific attack vector

**Remediation:**

1. Update MeshSDK to latest version that doesn't depend on vulnerable `ip` package
2. Consider alternative Cardano SDK if MeshSDK doesn't provide fix
3. Implement network-level restrictions for outbound requests

**References:** CVE-2023-42282, GHSA-2p57-rm9w-gvfp

**Status:** Open

### APPSEC-003: Insecure CSP with unsafe-inline/unsafe-eval

**Severity:** Medium | **CVSS:** 6.1 (AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:L/A:N)

**Description:** Content Security Policy allows unsafe-inline and unsafe-eval directives, weakening XSS protection.

**Evidence:**

```javascript
// apps/merchant/next.config.mjs:48-49
const script = [self, "'unsafe-inline'", "'unsafe-eval'", ...allow.script];
const style = [self, "'unsafe-inline'", ...allow.style];
```

**Impact:** Reduces effectiveness of XSS protection, allowing inline scripts and eval() execution.

**Likelihood:** Medium - Requires XSS vulnerability to exploit

**Remediation:**

```diff
- const script = [self, "'unsafe-inline'", "'unsafe-eval'", ...allow.script];
+ const script = [self, ...allow.script];
- const style = [self, "'unsafe-inline'", ...allow.style];
+ const style = [self, ...allow.style];
```

1. Remove unsafe-inline and unsafe-eval from CSP
2. Implement nonce-based CSP for required inline scripts
3. Move inline styles to external stylesheets

**References:** OWASP A03:2021 - Injection, CSP Level 3

**Status:** Open

### APPSEC-004: Missing authentication on sensitive endpoints

**Severity:** Medium | **CVSS:** 6.5 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N)

**Description:** API endpoints handling sensitive operations lack proper authentication checks.

**Evidence:**

```typescript
// apps/merchant/src/app/api/account-key/route.ts:1-20
export async function POST(req: Request) {
  // No authentication check
  const data = await req.json();
  const { seedPhrase } = data;
  const privateKey = seedPhrase; // Direct assignment without validation
  return new Response(JSON.stringify({ privateKey }), { status: 200 });
}
```

**Impact:** Unauthorized access to private key generation and account management functions.

**Likelihood:** High - No authentication barriers

**Remediation:**

```diff
export async function POST(req: Request) {
+  // Add authentication check
+  const authHeader = req.headers.get('Authorization');
+  if (!authHeader || !await verifyToken(authHeader)) {
+    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
+  }
+
  const data = await req.json();
  const { seedPhrase } = data;
-  const privateKey = seedPhrase; // Direct assignment without validation
+  const privateKey = await generatePrivateKey(seedPhrase); // Proper key derivation
  return new Response(JSON.stringify({ privateKey }), { status: 200 });
}
```

**References:** OWASP A01:2021 - Broken Access Control

**Status:** Open

### APPSEC-005: Insecure private key handling

**Severity:** Medium | **CVSS:** 6.8 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:L/A:N)

**Description:** Private key operations are implemented insecurely with direct seed phrase exposure.

**Evidence:**

```typescript
// apps/merchant/src/app/api/get-private-key/route.ts:28
const privateKey = ""; //getPrivateKey(seedPhrase);
// Commented out implementation suggests incomplete security measures
```

**Impact:** Potential exposure of cryptographic keys and seed phrases.

**Likelihood:** Medium - Depends on implementation completion

**Remediation:**

1. Implement proper key derivation functions (PBKDF2, scrypt)
2. Never log or expose seed phrases
3. Use secure key storage mechanisms
4. Implement key rotation policies

**References:** OWASP A02:2021 - Cryptographic Failures

**Status:** Open

### APPSEC-006: Vulnerable dependency: min-document prototype pollution

**Severity:** Low | **CVSS:** 4.3 (AV:N/AC:L/PR:N/UI:R/S:U/C:N/I:L/A:N)

**Description:** The `min-document@2.19.0` package is vulnerable to prototype pollution.

**Evidence:**

```bash
pnpm audit output:
│ low                 │ min-document vulnerable to prototype pollution         │
│ Package             │ min-document                                          │
│ Vulnerable versions │ <=2.19.0                                             │
```

**Impact:** Potential prototype pollution attacks through MeshSDK dependencies.

**Likelihood:** Low - Requires specific attack conditions

**Remediation:**

1. Update MeshSDK to resolve transitive dependency
2. Implement input validation for user-controlled objects
3. Use Object.create(null) for safe object creation

**References:** GHSA-rx8g-88g5-qh64

**Status:** Open

### APPSEC-007: JWT test tokens in codebase

**Severity:** Info | **CVSS:** 2.1 (AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:N/A:N)

**Description:** Test files contain hardcoded JWT tokens that could be mistaken for real credentials.

**Evidence:**

```typescript
// apps/merchant/src/lib/validation/http.test.ts:42
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
```

**Impact:** Low risk, but could cause confusion in production environments.

**Likelihood:** Low - Test files typically not deployed

**Remediation:**

1. Use clearly marked test tokens with obvious test patterns
2. Add comments indicating these are test-only tokens
3. Consider using test-specific token generation

**Status:** Open

### APPSEC-008: Excessive logging in middleware

**Severity:** Info | **CVSS:** 1.8 (AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:N/A:N)

**Description:** Middleware logs sensitive information including token previews.

**Evidence:**

```typescript
// apps/merchant/src/middleware.ts:21-25
console.log(`[MIDDLEWARE] Has auth token: ${!!idToken}`);
console.log(
  `[MIDDLEWARE] Token preview: ${idToken ? idToken.substring(0, 20) + "..." : "none"}`,
);
```

**Impact:** Potential information disclosure through logs.

**Likelihood:** Low - Requires log access

**Remediation:**

1. Remove or reduce logging in production
2. Use structured logging with appropriate log levels
3. Implement log sanitization for sensitive data

**Status:** Open

## 5. Dependency & Supply Chain Risks

### Vulnerable Packages Summary

- **High:** 1 package (ip@2.0.1)
- **Low:** 1 package (min-document@2.19.0)
- **Total:** 2 vulnerabilities across transitive dependencies

### Key Dependencies

- **MeshSDK:** Contains vulnerable transitive dependencies
- **Firebase:** Up to date, no known vulnerabilities
- **Next.js:** Up to date, no known vulnerabilities

### Supply Chain Concerns

- No suspicious postinstall scripts detected
- All packages from reputable publishers
- No typosquatting or brandjacking detected

## 6. Infrastructure, Docker & IaC

**Status:** No Docker or Infrastructure as Code files found in repository.

**Recommendations:**

- Implement containerization with security best practices when deploying
- Use non-root users in containers
- Implement health checks and resource limits
- Pin base image versions

## 7. Secrets & Sensitive Data

### Secrets Scanner Results

- **Total findings:** 35,431 potential secrets detected
- **High-confidence:** API keys, private keys in environment files
- **False positives:** Many findings in build artifacts and cache files

### Key Findings

1. **Firebase API keys** in environment files
2. **SendGrid API keys** in environment files
3. **Private keys** in environment files
4. **Sanity CMS tokens** in environment files

### VCS History Concerns

- Environment files are tracked in git (high risk)
- No evidence of secrets in git history from current scan
- Recommend git history audit for complete assessment

## 8. Authentication, Authorization & Session

### Authentication Flow Analysis

- **Firebase Authentication:** Properly implemented with ID token verification
- **Session Management:** Uses httpOnly cookies with secure flags
- **Token Validation:** Implemented in middleware with proper error handling

### Authorization Issues

- **Missing checks:** Several API endpoints lack authentication
- **Inconsistent patterns:** Some endpoints have auth, others don't
- **Role-based access:** No evidence of role-based authorization

### Session Security

- **Cookie flags:** Properly configured (httpOnly, secure, sameSite)
- **Token expiration:** 7-day expiration (consider shorter for sensitive operations)
- **Session invalidation:** Implemented on token verification failure

## 9. Privacy & Data Protection

### PII Handling

- **Email addresses:** Collected and stored in Firebase
- **User data:** Minimal collection, stored in Firestore
- **Data retention:** No explicit retention policies found

### Encryption

- **In transit:** HTTPS enforced in production
- **At rest:** Firebase provides encryption at rest
- **Key management:** Environment-based, needs improvement

### Compliance Considerations

- **GDPR:** No explicit consent mechanisms found
- **Data minimization:** Generally followed
- **Right to deletion:** Not explicitly implemented

## 10. Security Headers & CSP

### Current Headers

```javascript
// Implemented security headers
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-site
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload (prod only)
```

### CSP Configuration

- **Dynamic CSP:** Implemented with allowlist approach
- **Unsafe directives:** unsafe-inline and unsafe-eval currently allowed
- **Coverage:** Comprehensive directive coverage

### Recommendations

1. Remove unsafe-inline and unsafe-eval from CSP
2. Implement nonce-based CSP for required inline scripts
3. Add more restrictive frame-ancestors policy
4. Consider implementing Subresource Integrity (SRI)

## 11. CI/CD & Process

### GitHub Actions

- **Found:** Basic CI workflow in apps/docs/.github/workflows/ci.yml
- **Security:** No obvious security issues in workflow
- **Dependencies:** No dependency pinning found

### Recommendations

1. Pin all action versions to specific commits
2. Implement dependency scanning in CI
3. Add security testing to CI pipeline
4. Implement secret scanning in CI

## 12. Risk Register & Roadmap

### 30-Day Priority (Critical)

1. **Rotate all exposed secrets** - APPSEC-001
2. **Update vulnerable dependencies** - APPSEC-002
3. **Implement authentication on sensitive endpoints** - APPSEC-004

### 60-Day Priority (High)

1. **Harden CSP configuration** - APPSEC-003
2. **Implement secure key management** - APPSEC-005
3. **Add comprehensive input validation**

### 90-Day Priority (Medium)

1. **Implement comprehensive logging strategy** - APPSEC-008
2. **Add dependency scanning to CI/CD**
3. **Implement security testing automation**

### Acceptance Criteria

- All High/Critical findings remediated
- Security testing integrated into CI/CD
- Regular dependency updates automated
- Security monitoring implemented

## 13. Appendices

### Tool Outputs

- **detect-secrets:** Full scan results in `secrets_scan.json`
- **semgrep:** SAST results in `semgrep_results.json`
- **pnpm audit:** Dependency vulnerability report included above

### Configuration Excerpts

- **CSP Allowlist:** `apps/merchant/csp.allowlist.json`
- **Environment Schema:** `apps/merchant/src/lib/env.ts`
- **Security Headers:** `apps/merchant/next.config.mjs:73-105`

### Commands to Re-run Tools

```bash
# Secrets scanning
~/.local/bin/detect-secrets scan --all-files > secrets_scan.json

# SAST analysis
~/.local/bin/semgrep --config=auto --output=semgrep_results.json .

# Dependency scanning
pnpm audit
```

---

**Report Generated:** October 4, 2025  
**Next Review:** Recommended within 30 days after remediation  
**Contact:** Security Team
