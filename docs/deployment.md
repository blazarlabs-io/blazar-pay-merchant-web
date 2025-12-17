# Deployment Guide

This guide provides instructions for deploying the Blazar Pay Merchant App to various platforms.

## Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All environment variables are configured
- [ ] Application builds successfully (`pnpm build`)
- [ ] All tests pass (`pnpm test:run`)
- [ ] Type checking passes (`pnpm type-check`)
- [ ] Linting passes (`pnpm lint`)
- [ ] CSP allowlist is configured (`csp.allowlist.json`)
- [ ] Firebase project is set up
- [ ] Domain name is configured (if using custom domain)
- [ ] SSL certificate is configured (HTTPS required)

## Environment Variables

Ensure all required environment variables are set in your deployment environment. See [Getting Started](./getting-started.md#environment-variables) for the complete list.

### Production Environment Variables

**Important**: In production, ensure:
- Server-only variables (without `NEXT_PUBLIC_`) are NOT exposed to the client
- All sensitive keys are properly secured
- `NODE_ENV` is set to `production`
- `APP_URL` points to your production domain

## Build Process

### Local Build Test

Before deploying, test the build locally:

```bash
# Install dependencies
pnpm install

# Build the application
pnpm build

# Test production build locally
cd apps/merchant
pnpm start
```

### Build Output

The build process creates:
- **`.next/`**: Next.js build output
- **Static assets**: Optimized images and files
- **Server bundles**: Server-side code

## Deployment Platforms

### Vercel (Recommended)

Vercel is the recommended platform for Next.js applications.

#### Setup

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Link Project**:
   ```bash
   vercel link
   ```

4. **Configure Project**:
   - Root Directory: Leave as default (root)
   - Build Command: `pnpm build`
   - Output Directory: `apps/merchant/.next`
   - Install Command: `pnpm install`

#### Environment Variables

Add environment variables in Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add all required variables
3. Set for Production, Preview, and Development as needed

#### Deploy

**Via CLI**:
```bash
vercel --prod
```

**Via Dashboard**:
1. Push to your Git repository
2. Vercel automatically deploys on push
3. Or manually trigger deployment from dashboard

#### Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. SSL certificate is automatically provisioned

#### Monorepo Configuration

For Turborepo monorepos, configure:
- **Root Directory**: `/`
- **Build Command**: `cd apps/merchant && pnpm build`
- **Output Directory**: `apps/merchant/.next`

### Docker Deployment

#### Dockerfile

Create a `Dockerfile` in the root:

```dockerfile
FROM node:20.17.0-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/merchant/package.json ./apps/merchant/
COPY packages/*/package.json ./packages/*/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Production image
FROM node:20.17.0-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built application
COPY --from=base /app/apps/merchant/.next ./apps/merchant/.next
COPY --from=base /app/apps/merchant/public ./apps/merchant/public
COPY --from=base /app/apps/merchant/package.json ./apps/merchant/
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./

EXPOSE 3000

ENV PORT=3000

CMD ["node", "apps/merchant/node_modules/.bin/next", "start"]
```

#### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    restart: unless-stopped
```

#### Build and Run

```bash
# Build image
docker build -t blazar-pay-merchant .

# Run container
docker run -p 3000:3000 --env-file .env.production blazar-pay-merchant
```

### Traditional Node.js Server

#### Requirements

- Node.js 20.17.0 or higher
- pnpm 9.12.0 or higher
- Process manager (PM2 recommended)

#### Setup

1. **Clone Repository**:
   ```bash
   git clone <repository-url>
   cd blazar-pay-merchant-app
   ```

2. **Install Dependencies**:
   ```bash
   pnpm install
   ```

3. **Build Application**:
   ```bash
   pnpm build
   ```

4. **Set Environment Variables**:
   Create `.env.production` with all required variables

5. **Start Application**:
   ```bash
   cd apps/merchant
   pnpm start
   ```

#### Using PM2

1. **Install PM2**:
   ```bash
   npm install -g pm2
   ```

2. **Create PM2 Config** (`ecosystem.config.js`):
   ```javascript
   module.exports = {
     apps: [{
       name: 'blazar-pay-merchant',
       script: 'apps/merchant/node_modules/.bin/next',
       args: 'start',
       cwd: '/path/to/app',
       instances: 2,
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   };
   ```

3. **Start with PM2**:
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

### Cloud Platforms

#### AWS (Elastic Beanstalk / EC2)

1. **Build Application**:
   ```bash
   pnpm build
   ```

2. **Create Deployment Package**:
   - Include `.next/`, `public/`, `package.json`, `node_modules/`

3. **Configure Environment Variables**:
   - Set in Elastic Beanstalk environment or EC2 instance

4. **Deploy**:
   - Upload via Elastic Beanstalk console or use AWS CLI

#### Google Cloud Platform

1. **Build Application**:
   ```bash
   pnpm build
   ```

2. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy blazar-pay-merchant \
     --source . \
     --platform managed \
     --region us-central1
   ```

3. **Set Environment Variables**:
   ```bash
   gcloud run services update blazar-pay-merchant \
     --set-env-vars KEY=VALUE
   ```

#### Azure

1. **Build Application**:
   ```bash
   pnpm build
   ```

2. **Deploy to Azure App Service**:
   - Use Azure CLI or Azure Portal
   - Configure environment variables in App Settings

## Post-Deployment

### Verification

1. **Health Check**:
   - Visit the application URL
   - Verify pages load correctly
   - Check API endpoints

2. **Authentication**:
   - Test login/signup flows
   - Verify email verification works

3. **Payment Features**:
   - Test wallet connection
   - Verify payment processing

4. **Error Monitoring**:
   - Set up error tracking (e.g., Sentry)
   - Monitor application logs

### Monitoring

#### Application Logs

Monitor application logs for:
- Errors and exceptions
- Authentication failures
- API errors
- Performance issues

#### Performance Monitoring

Monitor:
- Page load times
- API response times
- Error rates
- User sessions

#### Security Monitoring

Monitor for:
- Unauthorized access attempts
- Suspicious API calls
- Failed authentication attempts
- CSP violations

## Content Security Policy

### Production CSP

In production, the CSP uses hash-based script validation:

- Scripts must match allowed hashes
- Inline scripts are restricted
- External scripts must be in allowlist

### Updating CSP Allowlist

Edit `apps/merchant/csp.allowlist.json`:

```json
{
  "connect": ["https://api.example.com"],
  "img": ["https://cdn.example.com"],
  "script": ["https://cdn.example.com"],
  "style": ["https://fonts.googleapis.com"],
  "font": ["https://fonts.gstatic.com"],
  "frame": []
}
```

## SSL/TLS Configuration

### Requirements

- HTTPS is required in production
- Valid SSL certificate
- HSTS header enabled (automatic in production)

### Certificate Management

- **Vercel**: Automatic SSL certificates
- **Cloud Platforms**: Use platform-managed certificates
- **Self-Hosted**: Use Let's Encrypt or commercial certificates

## Scaling

### Horizontal Scaling

- Use load balancer for multiple instances
- Ensure session storage is shared (if using sessions)
- Configure sticky sessions if needed

### Vertical Scaling

- Increase server resources (CPU, RAM)
- Optimize database queries
- Use CDN for static assets

### Caching

- **Next.js Caching**: Automatic caching for static pages
- **CDN**: Use CDN for static assets
- **API Caching**: Implement API response caching where appropriate

## Backup and Recovery

### Database Backups

- **Firebase**: Automatic backups (if using Firestore)
- **Manual Backups**: Export data regularly

### Code Backups

- **Git Repository**: Primary backup
- **Deployment History**: Keep deployment history

### Recovery Plan

1. **Document Recovery Procedures**
2. **Test Recovery Process**
3. **Keep Backup Credentials Secure**

## Troubleshooting

### Common Deployment Issues

1. **Build Fails**:
   - Check environment variables
   - Verify Node.js version
   - Check dependency installation

2. **Application Won't Start**:
   - Check environment variables
   - Verify port availability
   - Check application logs

3. **Runtime Errors**:
   - Check server logs
   - Verify external service connections
   - Check database connectivity

4. **Performance Issues**:
   - Monitor resource usage
   - Check database query performance
   - Review API response times

## Rollback Procedure

### Vercel

1. Go to Deployments
2. Select previous deployment
3. Click "Promote to Production"

### Docker

1. Tag previous image
2. Deploy previous image
3. Update load balancer

### Git-based Deployments

1. Revert to previous commit
2. Redeploy
3. Verify functionality

## Security Checklist

- [ ] All environment variables are secure
- [ ] HTTPS is enabled
- [ ] CSP is configured correctly
- [ ] Security headers are set
- [ ] Authentication is working
- [ ] API endpoints are protected
- [ ] Error messages don't expose sensitive data
- [ ] Logging doesn't include sensitive information
- [ ] Dependencies are up to date
- [ ] Security patches are applied

## Support

For deployment issues:
1. Check application logs
2. Review error messages
3. Consult platform documentation
4. Contact development team

