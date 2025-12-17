# Blazar Pay Merchant App Documentation

Welcome to the Blazar Pay Merchant App documentation. This monorepo contains a Next.js-based merchant application for processing Cardano-based payments using Hydra technology.

## Documentation Structure

This documentation is organized into the following sections:

- **[Getting Started](./getting-started.md)** - Quick start guide for setting up and running the application
- **[Architecture Overview](./architecture.md)** - High-level architecture and technical decisions
- **[Application Features](./features.md)** - Detailed documentation of all application features
- **[API Reference](./api-reference.md)** - Complete API endpoint documentation
- **[Development Guide](./development.md)** - Guidelines for developers working on the codebase
- **[Deployment](./deployment.md)** - Instructions for deploying the application

## Project Overview

The Blazar Pay Merchant App is a full-stack Next.js application that enables merchants to:

- Accept Cardano-based payments through Hydra layer 2 technology
- Manage wallet connections and balances
- Process deposits, withdrawals, and payments
- Handle authentication and user management
- Integrate with payment terminals via Bluetooth

## Technology Stack

- **Framework**: Next.js 15.5.4 (App Router)
- **Language**: TypeScript 5.5.4
- **UI Framework**: React 18.3.1
- **Styling**: Tailwind CSS with Shadcn UI components
- **State Management**: React Context API
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **Blockchain**: Cardano (via Lucid, Mesh SDK, Blockfrost)
- **Payment Layer**: Hydra (Cardano Layer 2)
- **Monorepo**: Turborepo with pnpm workspaces
- **Internationalization**: next-intl (English, German)

## Quick Links

- [Installation Guide](./getting-started.md#installation)
- [Environment Setup](./getting-started.md#environment-variables)
- [Running the Application](./getting-started.md#running-the-application)
- [API Endpoints](./api-reference.md)

## Support

For questions or issues, please refer to the development team or check the relevant documentation section.

