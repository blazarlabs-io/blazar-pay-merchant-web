# Architecture Overview

This document provides a high-level overview of the Blazar Pay Merchant App architecture, including the monorepo structure, technology choices, and system design.

## Monorepo Structure

The project uses a **Turborepo** monorepo structure with **pnpm workspaces** for efficient dependency management and build orchestration.

### Workspace Organization

```
blazar-pay-merchant-app/
├── apps/
│   └── merchant/              # Main Next.js application
├── packages/
│   ├── ui/                    # Shared UI component library (Shadcn)
│   ├── eslint-config/         # Shared ESLint configurations
│   └── typescript-config/     # Shared TypeScript configurations
└── docs/                      # Documentation
```

### Package Dependencies

- **Merchant App** depends on `@repo/ui` for shared components
- All packages share common ESLint and TypeScript configurations
- Dependencies are managed through pnpm workspace protocol (`workspace:*`)

## Application Architecture

### Next.js App Router Structure

The application uses Next.js 15 with the App Router architecture:

```
apps/merchant/src/
├── app/                       # Next.js App Router
│   ├── (auth)/               # Authentication routes group
│   ├── (private)/            # Protected routes group
│   ├── (public)/             # Public routes group
│   └── api/                  # API routes
├── components/               # React components
│   ├── layouts/             # Layout components
│   ├── pages/               # Page components
│   ├── widgets/             # Widget components
│   └── ...
├── features/                 # Feature modules
│   └── authentication/       # Authentication feature
├── lib/                      # Utility libraries
│   ├── auth/                # Authentication utilities
│   ├── blockfrost/          # Blockfrost integration
│   ├── crypto/              # Cryptographic utilities
│   ├── firebase/            # Firebase services
│   └── ...
├── context/                  # React Context providers
├── hooks/                    # Custom React hooks
├── services/                 # Service layer
├── types/                    # TypeScript type definitions
└── utils/                    # Utility functions
```

### Route Groups

Next.js route groups (folders with parentheses) are used to organize routes:

- **`(auth)`**: Authentication-related pages (login, signup, password reset)
- **`(private)`**: Protected dashboard routes requiring authentication
- **`(public)`**: Public-facing pages (home, legal pages)

### Middleware

The application uses Next.js middleware (`src/middleware.ts`) for:

- **Authentication verification**: Validates Firebase ID tokens
- **Route protection**: Redirects unauthenticated users from protected routes
- **Email verification checks**: Ensures users verify their email before accessing dashboard
- **Cookie management**: Handles authentication cookie lifecycle

## Technology Stack

### Frontend

- **Next.js 15.5.4**: React framework with App Router
- **React 18.3.1**: UI library
- **TypeScript 5.5.4**: Type safety
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn UI**: Component library built on Radix UI
- **Framer Motion**: Animation library
- **next-intl**: Internationalization (i18n) support

### Backend & Services

- **Firebase Authentication**: User authentication
- **Firebase Firestore**: Database
- **Firebase Admin SDK**: Server-side Firebase operations
- **SendGrid**: Email delivery service
- **Sanity CMS**: Content management system

### Blockchain Integration

- **Cardano**: Blockchain network
- **Hydra**: Layer 2 scaling solution for Cardano
- **Lucid**: Cardano library for transaction building
- **Mesh SDK**: Cardano wallet integration
- **Blockfrost**: Cardano blockchain data provider

### Development Tools

- **Turborepo**: Monorepo build system
- **pnpm**: Package manager
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Vitest**: Testing framework
- **TypeScript**: Static type checking

## Security Architecture

### Content Security Policy (CSP)

The application implements a strict Content Security Policy:

- **Development**: Permissive CSP for easier development
- **Production**: Hash-based CSP for maximum security
- **Dynamic allowlist**: CSP rules are generated from `csp.allowlist.json`
- **Security headers**: X-Frame-Options, X-Content-Type-Options, HSTS, etc.

### Authentication Flow

1. User signs up/logs in via Firebase Authentication
2. ID token is stored in HTTP-only cookie
3. Middleware validates token on each request
4. Server-side API routes use `withAuth` wrapper for protection
5. Client-side uses React Context for auth state

### Cryptographic Operations

- **Seed phrase validation**: Validates BIP39 mnemonic phrases
- **Key derivation**: Secure derivation of Cardano keys from seed phrases
- **Memory security**: Sensitive data is securely cleared from memory
- **Server-only processing**: Cryptographic operations happen server-side

## State Management

### React Context API

The application uses React Context for global state:

- **Auth Context**: User authentication state
- **Wallet Context**: Cardano wallet connections and balances
- **Transaction Context**: Payment transaction state
- **Theme Context**: Dark/light mode theme
- **CMS Context**: Sanity CMS content

### Local State

- React hooks (`useState`, `useReducer`) for component-level state
- Form state managed by `react-hook-form`
- URL state via Next.js router

## Data Flow

### Client-Side Flow

1. User interacts with UI component
2. Component calls custom hook or service
3. Hook/service makes API request to Next.js API route
4. API route processes request (with authentication)
5. Response updates React Context or local state
6. UI re-renders with new data

### Server-Side Flow

1. API route receives request
2. Middleware validates authentication (if protected)
3. Route handler processes business logic
4. External services called (Firebase, Hydra API, etc.)
5. Response sent back to client

## API Architecture

### Next.js API Routes

API routes are organized by feature:

- **`/api/(auth)/`**: Authentication endpoints
- **`/api/(emails)/`**: Email-related endpoints
- **`/api/hydra/`**: Hydra payment operations
- **`/api/config/`**: Configuration endpoints
- **`/api/coin-prices/`**: Cryptocurrency price data

### API Authentication

Protected API routes use the `withAuth` wrapper:

```typescript
export async function POST(request: NextRequest) {
  return withAuth(request, handleFunction);
}
```

This wrapper:
- Extracts and validates the ID token from cookies
- Provides user data to the handler function
- Handles authentication errors consistently

## Internationalization

The application supports multiple languages using `next-intl`:

- **Supported locales**: English (`en`), German (`de`)
- **Default locale**: English
- **Translation files**: Located in `apps/merchant/messages/`
- **Locale detection**: Automatic based on browser settings

## Build System

### Turborepo Configuration

Turborepo manages the build pipeline:

- **Task dependencies**: `build` depends on `^build` (build dependencies first)
- **Caching**: Build outputs cached for faster rebuilds
- **Parallel execution**: Tasks run in parallel when possible

### Build Pipeline

1. **Dependencies**: Install all workspace dependencies
2. **Type checking**: TypeScript validation
3. **Linting**: ESLint code quality checks
4. **Building**: Next.js production build
5. **Output**: Optimized static and server assets

## Performance Optimizations

- **Code splitting**: Dynamic imports for large dependencies
- **Image optimization**: Next.js Image component with WebP support
- **Server Components**: Default to RSC for better performance
- **Client Components**: Only when interactivity is needed
- **Caching**: Turborepo build cache, Next.js static generation

## Error Handling

- **Centralized error handling**: `lib/errors.ts` for consistent error responses
- **Secure logging**: `lib/logging.ts` for server-side logging (no sensitive data)
- **User-friendly messages**: Public error messages, detailed logs server-side
- **Error boundaries**: React error boundaries for client-side errors

## Testing Strategy

- **Unit tests**: Vitest for utility functions and components
- **Type safety**: TypeScript for compile-time error detection
- **API tests**: Test files for API routes (e.g., `route.test.ts`)

## Deployment Architecture

The application is designed to be deployed as:

- **Vercel**: Recommended platform (Next.js optimized)
- **Docker**: Containerized deployment option
- **Node.js server**: Traditional Node.js hosting

See [Deployment Guide](./deployment.md) for detailed deployment instructions.

