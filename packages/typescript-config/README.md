# Blazar Pay Merchant App

A Next.js-based merchant application for processing Cardano-based payments using Hydra Layer 2 technology. Built with TypeScript, React, and modern web technologies in a Turborepo monorepo structure.

## Overview

The Blazar Pay Merchant App enables merchants to accept fast, low-cost micropayments powered by Cardano's Hydra technology. The application provides a complete payment solution including wallet management, transaction processing, and terminal integration.

## Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment variables
# Copy .env.example to apps/merchant/.env.local and fill in values

# Start development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Documentation

Comprehensive documentation is available in the [`/docs`](./docs/) folder:

### 📚 Getting Started
- **[Getting Started Guide](./docs/getting-started.md)** - Installation, environment setup, and running the application
  - Prerequisites and installation steps
  - Environment variable configuration
  - Running in development and production
  - Troubleshooting common issues

### 🏗️ Architecture
- **[Architecture Overview](./docs/architecture.md)** - System design and technical decisions
  - Monorepo structure and organization
  - Next.js App Router architecture
  - Technology stack details
  - Security architecture
  - State management and data flow

### ✨ Features
- **[Application Features](./docs/features.md)** - Complete feature documentation
  - Authentication and user management
  - Dashboard and navigation
  - Wallet connection and management
  - Payment processing (Topup, Cashout, Send, Receive)
  - Transaction history
  - Terminal integration
  - Internationalization

### 🔌 API Reference
- **[API Reference](./docs/api-reference.md)** - Complete API endpoint documentation
  - Authentication endpoints
  - Email endpoints
  - Hydra payment endpoints
  - Cryptographic endpoints
  - Configuration and data endpoints
  - Request/response formats
  - Error handling

### 💻 Development
- **[Development Guide](./docs/development.md)** - Guidelines for developers
  - Code style and standards
  - Project structure
  - Development workflow
  - Best practices
  - Adding new features
  - Testing and debugging

### 🚀 Deployment
- **[Deployment Guide](./docs/deployment.md)** - Deployment instructions
  - Pre-deployment checklist
  - Vercel deployment (recommended)
  - Docker deployment
  - Traditional Node.js server setup
  - Cloud platform deployments
  - Post-deployment verification
  - Monitoring and scaling

## Project Structure

```
blazar-pay-merchant-app/
├── apps/
│   └── merchant/          # Main Next.js application
├── packages/
│   ├── ui/                # Shared UI component library
│   ├── eslint-config/     # Shared ESLint configurations
│   └── typescript-config/ # Shared TypeScript configurations
├── docs/                  # Documentation (you are here)
├── package.json           # Root package.json
├── pnpm-workspace.yaml    # pnpm workspace configuration
└── turbo.json             # Turborepo configuration
```

## Technology Stack

- **Framework**: Next.js 15.5.4 (App Router)
- **Language**: TypeScript 5.5.4
- **UI**: React 18.3.1, Tailwind CSS, Shadcn UI
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **Blockchain**: Cardano (Lucid, Mesh SDK, Blockfrost)
- **Payment Layer**: Hydra (Cardano Layer 2)
- **Monorepo**: Turborepo with pnpm workspaces
- **i18n**: next-intl (English, German)

## Available Scripts

### Root Level
- `pnpm dev` - Start development server for all apps
- `pnpm build` - Build all apps and packages
- `pnpm lint` - Lint all code in the monorepo
- `pnpm format` - Format code using Prettier
- `pnpm ui` - Run shadcn CLI for UI component management

### Merchant App
- `pnpm dev` - Start development server
- `pnpm build` - Build the application
- `pnpm start` - Start production server
- `pnpm lint` - Lint the application code
- `pnpm type-check` - Run TypeScript type checking
- `pnpm test` - Run tests with Vitest

## Prerequisites

- **Node.js**: Version 20.17.0 or higher
- **pnpm**: Version 9.12.0 or higher
- **Firebase Project**: For authentication and database
- **Environment Variables**: See [Getting Started](./docs/getting-started.md#environment-variables) for complete list

## Key Features

- 🔐 **Secure Authentication** - Firebase-based authentication with email verification
- 💳 **Cardano Payments** - Accept payments via Cardano blockchain
- ⚡ **Hydra Layer 2** - Fast, low-cost micropayments
- 👛 **Wallet Integration** - Connect and manage Cardano wallets
- 📊 **Transaction History** - Track all payments and transactions
- 🏪 **Terminal Support** - Bluetooth terminal integration
- 🌍 **Internationalization** - Multi-language support (English, German)
- 🎨 **Modern UI** - Responsive design with dark/light themes

## Contributing

Please refer to the [Development Guide](./docs/development.md) for:
- Code style and standards
- Development workflow
- Best practices
- Adding new features

## Security

The application implements multiple security measures:
- Content Security Policy (CSP)
- HTTP-only authentication cookies
- Server-side token validation
- Secure cryptographic operations
- Input validation and sanitization

See [Architecture](./docs/architecture.md#security-architecture) for more details.

## Support

For questions or issues:
1. Check the relevant documentation section
2. Review [Troubleshooting](./docs/getting-started.md#troubleshooting)
3. Contact the development team

## License

MIT

---

**Built with ❤️ by Blazar Labs**
