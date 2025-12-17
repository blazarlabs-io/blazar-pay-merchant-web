# 🚨 URGENT: Secret Rotation Guide

## Critical Security Issue: APPSEC-001

**Status:** 🔴 CRITICAL - Immediate action required  
**CVSS Score:** 7.5 (High)  
**Issue:** Hardcoded secrets committed to version control

## Immediate Actions Required

### 1. Rotate All Exposed Secrets (URGENT - Do within 24 hours)

#### Firebase Credentials

- **API Key:** `AIzaSyAczFOgrM4RBOVFXxZMmkp6r6R9tOTKBvc`
- **Private Key:** The entire private key in .env files
- **Action:**
  1. Go to [Firebase Console](https://console.firebase.google.com/)
  2. Navigate to Project Settings > Service Accounts
  3. Generate new private key
  4. Update all environment files

#### SendGrid API Key

- **Key:** `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`
- **Action:**
  1. Go to [SendGrid Dashboard](https://app.sendgrid.com/)
  2. Navigate to Settings > API Keys
  3. Delete the compromised key
  4. Generate new API key
  5. Update all environment files

#### Sanity CMS Token

- **Token:** `sk00M1qEwR7514cZsubGLEb7BDlf1kDnKAyZbXYtiQrMw7pVBq3dQ4iQX9VmG1LzSpGIlb6vrfnSBg79f1zYm3cBydfcVCemQ86QFVSoNtYNtaLA5z8SnjHsV4k4D8DAF8Pvr3FBPKKXJ6EG8DVrZZTA2J2HxDQUPhp1P5GwDOBmnOfCr7Uc`
- **Action:**
  1. Go to [Sanity Dashboard](https://www.sanity.io/manage)
  2. Navigate to API > Tokens
  3. Delete the compromised token
  4. Generate new token
  5. Update all environment files

#### Google Maps API Key

- **Key:** `AIzaSyBjsLsFhm9R0NTzJvvgSqfv14izjSYfqjA`
- **Action:**
  1. Go to [Google Cloud Console](https://console.cloud.google.com/)
  2. Navigate to APIs & Services > Credentials
  3. Delete the compromised key
  4. Generate new API key
  5. Update all environment files

#### Blockfrost Project Key

- **Key:** `preprodyKhy0LkB27HXlinsE8nrfoAH44OCaBvc`
- **Action:**
  1. Go to [Blockfrost Dashboard](https://blockfrost.io/)
  2. Navigate to Project Settings
  3. Regenerate project key
  4. Update all environment files

#### LiveCoinWatch API Key

- **Key:** `47301887-ed40-4ead-a48f-b62053a7680b`
- **Action:**
  1. Go to [LiveCoinWatch Dashboard](https://www.livecoinwatch.com/)
  2. Navigate to API Settings
  3. Regenerate API key
  4. Update all environment files

#### Transaction Signing Key

- **Key:** `eff13db59e2ea2602fbc082b0cb218c3294267517d2e050e0c6bcaa6df0097c3`
- **Action:**
  1. Generate new signing key using secure method
  2. Update all environment files
  3. Ensure old key is invalidated

### 2. Update Environment Files

After rotating secrets, update these files:

- `apps/merchant/.env.development`
- `apps/merchant/.env.production`

### 3. Verify .gitignore is Updated

Ensure these patterns are in `.gitignore`:

```gitignore
# environment files with secrets (CRITICAL: Never commit these)
.env
.env.*
!.env.example
```

### 4. Remove Secrets from Git History (Optional but Recommended)

If you want to completely remove secrets from git history:

```bash
# WARNING: This rewrites git history - coordinate with team first
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch apps/merchant/.env.development apps/merchant/.env.production' \
  --prune-empty --tag-name-filter cat -- --all

# Force push (DANGEROUS - coordinate with team)
git push origin --force --all
```

## Long-term Security Improvements

### 1. Implement Secure Secret Management

#### For Development:

- Use `.env.local` files (already in .gitignore)
- Never commit actual secrets

#### For Production:

- **AWS:** Use AWS Secrets Manager or Parameter Store
- **Azure:** Use Azure Key Vault
- **Google Cloud:** Use Secret Manager
- **Vercel:** Use Vercel Environment Variables (encrypted)

### 2. Environment Variable Best Practices

```bash
# ✅ Good: Use .env.example with placeholders
NEXT_PUBLIC_FB_API_KEY="your-api-key-here"

# ❌ Bad: Never commit real secrets
NEXT_PUBLIC_FB_API_KEY="AIzaSyAczFOgrM4RBOVFXxZMmkp6r6R9tOTKBvc"
```

### 3. Automated Secret Scanning

Add to CI/CD pipeline:

```yaml
# GitHub Actions example
- name: Scan for secrets
  uses: trufflesecurity/trufflehog@main
  with:
    path: ./
    base: main
    head: HEAD
```

### 4. Team Training

- Never commit `.env` files
- Use `.env.example` as template
- Rotate secrets regularly
- Use secure secret management in production

## Verification Steps

After completing rotation:

1. ✅ All API keys rotated
2. ✅ All private keys regenerated
3. ✅ All environment files updated
4. ✅ .gitignore updated
5. ✅ .env.example created
6. ✅ Team notified of changes
7. ✅ Application tested with new credentials

## Emergency Contacts

If you need immediate assistance:

- **Security Team:** [Add contact]
- **DevOps Team:** [Add contact]
- **Project Lead:** [Add contact]

---

**Last Updated:** October 4, 2025  
**Next Review:** After all secrets are rotated  
**Priority:** 🔴 CRITICAL - Complete within 24 hours
