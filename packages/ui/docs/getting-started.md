# Getting Started

This guide will help you set up and run the Blazar Pay Merchant App on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20.17.0 or higher
- **pnpm**: Version 9.12.0 or higher (package manager)
- **Git**: For cloning the repository

### Installing pnpm

If you don't have pnpm installed, you can install it globally:

```bash
npm install -g pnpm@9.12.0
```

Or using corepack (recommended):

```bash
corepack enable
corepack prepare pnpm@9.12.0 --activate
```

## Installation

1. **Clone the repository** (if you haven't already):

```bash
git clone <repository-url>
cd blazar-pay-merchant-app
```

2. **Install dependencies**:

```bash
pnpm install
```

This will install all dependencies for the monorepo, including:
- The merchant app (`apps/merchant`)
- Shared UI package (`packages/ui`)
- ESLint configuration (`packages/eslint-config`)
- TypeScript configurations (`packages/typescript-config`)

## Environment Variables

The application requires several environment variables to function properly. Create a `.env.local` file in the `apps/merchant` directory.

### Required Environment Variables

#### Firebase Configuration (Client)
```env
NEXT_PUBLIC_FB_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FB_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FB_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FB_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FB_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FB_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FB_MEASUREMENT_ID=your_firebase_measurement_id  # Optional
```

#### Firebase Admin Configuration (Server-only)
```env
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
```

#### reCAPTCHA Configuration
```env
CAPTCHA_SITE_KEY=your_recaptcha_site_key
CAPTCHA_SECRET_KEY=your_recaptcha_secret_key
```

#### API Keys and URLs
```env
APP_URL=http://localhost:3000
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
QR_CODES_URL=your_qr_codes_service_url
SENDGRID_API_KEY=your_sendgrid_api_key
TRACECORK_EMAIL=your_support_email@example.com
```

#### Sanity CMS Configuration
```env
SANITY_PROJECT_ID=your_sanity_project_id
SANITY_TOKEN=your_sanity_token
SANITY_DATASET=your_sanity_dataset
```

#### Hydra API Configuration
```env
HYDRA_API_URL=your_hydra_api_url
```

#### Blockfrost Configuration
```env
BLOCKFROST_PROJECT_KEY=your_blockfrost_project_key
```

#### CoinWatch API
```env
LIVE_COIN_WATCH_API_KEY=your_coinwatch_api_key
```

#### Transaction Signing
```env
TX_SIGN_KEY=your_transaction_signing_key
```

#### Cardano Network
```env
CARDANO_NETWORK=mainnet  # or 'testnet' for development
```

### Environment Variable Notes

- Variables prefixed with `NEXT_PUBLIC_` are exposed to the client-side code
- Variables without the prefix are server-only and should never be exposed to the client
- The application uses Zod schema validation to ensure all required environment variables are present
- Missing or invalid environment variables will cause the application to fail at startup

## Running the Application

### Development Mode

To start the development server:

```bash
pnpm dev
```

This will:
- Start the Next.js development server
- Enable hot module replacement
- Run on `http://localhost:3000` by default

The development server will automatically reload when you make changes to the code.

### Building for Production

To build the application for production:

```bash
pnpm build
```

This will:
- Build all packages in the monorepo
- Optimize the Next.js application
- Generate static assets
- Create a production-ready build in `.next` directory

### Running Production Build

After building, you can run the production server:

```bash
pnpm start
```

This starts the production server (typically on port 3000).

## Available Scripts

### Root Level Scripts

- `pnpm dev` - Start development server for all apps
- `pnpm build` - Build all apps and packages
- `pnpm lint` - Lint all code in the monorepo
- `pnpm format` - Format code using Prettier
- `pnpm ui` - Run shadcn CLI for UI component management

### Merchant App Scripts

Navigate to `apps/merchant` to run app-specific scripts:

- `pnpm dev` - Start development server
- `pnpm build` - Build the application
- `pnpm start` - Start production server
- `pnpm lint` - Lint the application code
- `pnpm type-check` - Run TypeScript type checking
- `pnpm test` - Run tests with Vitest
- `pnpm test:run` - Run tests once (no watch mode)

## Project Structure

```
blazar-pay-merchant-app/
├── apps/
│   └── merchant/          # Main Next.js application
│       ├── src/
│       │   ├── app/        # Next.js App Router pages
│       │   ├── components/ # React components
│       │   ├── features/   # Feature modules
│       │   ├── lib/        # Utility libraries
│       │   └── ...
│       └── package.json
├── packages/
│   ├── ui/                 # Shared UI components (Shadcn)
│   ├── eslint-config/      # Shared ESLint configuration
│   └── typescript-config/   # Shared TypeScript configurations
├── docs/                   # Documentation (this folder)
├── package.json            # Root package.json
├── pnpm-workspace.yaml     # pnpm workspace configuration
└── turbo.json              # Turborepo configuration
```

## Troubleshooting

### Common Issues

1. **Port already in use**: If port 3000 is already in use, Next.js will automatically try the next available port. You can also specify a port:
   ```bash
   PORT=3001 pnpm dev
   ```

2. **Environment variables not loading**: Ensure your `.env.local` file is in the `apps/merchant` directory, not the root.

3. **Dependencies not installing**: Try clearing the pnpm cache:
   ```bash
   pnpm store prune
   pnpm install
   ```

4. **TypeScript errors**: Run type checking to see detailed errors:
   ```bash
   cd apps/merchant
   pnpm type-check
   ```

5. **Build errors**: Ensure all environment variables are set correctly. The build process validates environment variables using Zod schemas.

## Next Steps

- Read the [Architecture Overview](./architecture.md) to understand the system design
- Check out [Application Features](./features.md) to learn about what the app can do
- Review the [API Reference](./api-reference.md) for endpoint documentation
- See the [Development Guide](./development.md) for coding standards and best practices

