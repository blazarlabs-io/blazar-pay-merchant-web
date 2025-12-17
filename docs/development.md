# Development Guide

This guide provides information for developers working on the Blazar Pay Merchant App codebase.

## Code Style and Standards

### TypeScript

- **Strict Mode**: TypeScript strict mode is enabled
- **Type Safety**: Prefer explicit types over `any`
- **Interfaces**: Use interfaces for object shapes
- **Type Imports**: Use `import type` for type-only imports

### React Components

- **Functional Components**: Use functional components with hooks
- **Server Components**: Default to Server Components (RSC) when possible
- **Client Components**: Use `"use client"` directive only when needed
- **Component Structure**: 
  ```typescript
  // Component exports
  // Subcomponents
  // Helpers
  // Types
  ```

### File Naming

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Utilities**: kebab-case (e.g., `format-date.ts`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Types**: kebab-case (e.g., `user-types.ts`)

### Directory Structure

- **Lowercase with dashes**: Use lowercase with dashes for directory names
- **Feature-based**: Organize by features when appropriate
- **Co-location**: Keep related files together

## Project Structure

### App Router Structure

```
src/app/
├── (auth)/          # Authentication routes
├── (private)/       # Protected routes
├── (public)/        # Public routes
└── api/             # API routes
```

### Component Organization

```
src/components/
├── layouts/         # Layout components
├── pages/           # Page components
├── widgets/         # Widget components
├── sections/        # Section components
└── ...
```

### Feature Modules

```
src/features/
└── authentication/
    ├── components/  # Feature-specific components
    ├── pages/       # Feature pages
    ├── services/    # Feature services
    ├── types/       # Feature types
    └── index.ts     # Public exports
```

## Development Workflow

### Starting Development

1. **Install Dependencies**:
   ```bash
   pnpm install
   ```

2. **Set Environment Variables**:
   Create `.env.local` in `apps/merchant/` with required variables

3. **Start Development Server**:
   ```bash
   pnpm dev
   ```

4. **Open Browser**:
   Navigate to `http://localhost:3000`

### Making Changes

1. **Create Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**: Edit files as needed

3. **Test Locally**: Ensure the app runs and works correctly

4. **Run Linter**:
   ```bash
   pnpm lint
   ```

5. **Type Check**:
   ```bash
   cd apps/merchant
   pnpm type-check
   ```

6. **Run Tests**:
   ```bash
   pnpm test
   ```

7. **Format Code**:
   ```bash
   pnpm format
   ```

8. **Commit Changes**:
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

## Code Quality

### Linting

The project uses ESLint with custom configurations:

- **Root Config**: `packages/eslint-config/`
- **Next.js Config**: Next.js-specific rules
- **React Config**: React-specific rules

Run linter:
```bash
pnpm lint
```

### Formatting

Code is formatted using Prettier:

- **Config**: `prettier.config.mjs`
- **Format All**: `pnpm format`
- **Auto-format**: Configure your editor to format on save

### Type Checking

TypeScript type checking:

```bash
cd apps/merchant
pnpm type-check
```

### Testing

Tests are written using Vitest:

```bash
# Run tests in watch mode
pnpm test

# Run tests once
pnpm test:run
```

## Best Practices

### React Best Practices

1. **Server Components First**: Default to Server Components
2. **Minimize Client Components**: Only use `"use client"` when necessary
3. **Avoid useEffect**: Prefer Server Components and data fetching patterns
4. **Optimize Re-renders**: Use `React.memo`, `useMemo`, `useCallback` appropriately
5. **Error Boundaries**: Implement error boundaries for error handling

### Next.js Best Practices

1. **App Router**: Use App Router patterns (not Pages Router)
2. **Data Fetching**: Use Server Components for data fetching
3. **Image Optimization**: Use `next/image` for images
4. **Dynamic Imports**: Use dynamic imports for code splitting
5. **Metadata**: Use metadata API for SEO

### Security Best Practices

1. **Environment Variables**: Never expose server-only variables to client
2. **Input Validation**: Validate all user inputs
3. **Authentication**: Always verify authentication server-side
4. **Error Messages**: Don't expose sensitive information in errors
5. **CSP**: Respect Content Security Policy rules

### Performance Best Practices

1. **Code Splitting**: Use dynamic imports for large dependencies
2. **Image Optimization**: Optimize images and use WebP
3. **Bundle Size**: Monitor and minimize bundle size
4. **Caching**: Use appropriate caching strategies
5. **Lazy Loading**: Lazy load components when possible

## Adding New Features

### 1. Create Feature Module

If creating a new feature, create a feature module:

```
src/features/your-feature/
├── components/
├── pages/
├── services/
├── types/
└── index.ts
```

### 2. Add Routes

Add routes in the appropriate route group:

- **Public**: `src/app/(public)/your-feature/`
- **Private**: `src/app/(private)/your-feature/`
- **Auth**: `src/app/(auth)/your-feature/`

### 3. Create API Routes

If needed, create API routes:

```
src/app/api/your-feature/
└── route.ts
```

### 4. Add Components

Create reusable components in:

- **Feature-specific**: `src/features/your-feature/components/`
- **Shared**: `src/components/`

### 5. Add Types

Define TypeScript types:

- **Feature-specific**: `src/features/your-feature/types/`
- **Shared**: `src/types/`

### 6. Add Tests

Write tests for your feature:

```
src/features/your-feature/
└── __tests__/
    └── your-feature.test.ts
```

## Working with UI Components

### Shadcn UI Components

The project uses Shadcn UI components from `@repo/ui`:

```typescript
import { Button } from "@repo/ui/components/ui/button";
import { Card } from "@repo/ui/components/ui/card";
```

### Adding New UI Components

1. **Navigate to UI Package**:
   ```bash
   cd packages/ui
   ```

2. **Run Shadcn CLI**:
   ```bash
   pnpm ui
   ```

3. **Select Component**: Choose from available components

4. **Use Component**: Import and use in your code

## Internationalization

### Adding Translations

1. **Edit Translation Files**:
   - English: `apps/merchant/messages/en.json`
   - German: `apps/merchant/messages/de.json`

2. **Use in Components**:
   ```typescript
   import { useTranslations } from "next-intl";
   
   const t = useTranslations();
   return <p>{t("your.key")}</p>;
   ```

### Adding New Locale

1. **Add Locale to Config**:
   ```typescript
   // src/i18n/config.ts
   export const locales = ["en", "de", "fr"] as const;
   ```

2. **Create Translation File**:
   ```
   apps/merchant/messages/fr.json
   ```

## Environment Variables

### Adding New Environment Variables

1. **Update Schema**:
   ```typescript
   // src/lib/env.ts
   const schema = z.object({
     // ... existing
     YOUR_NEW_VAR: z.string().min(1),
   });
   ```

2. **Add to Raw Object**:
   ```typescript
   const raw = {
     // ... existing
     YOUR_NEW_VAR: read("YOUR_NEW_VAR"),
   };
   ```

3. **Document**: Add to `.env.example` and documentation

## Debugging

### Development Tools

- **React DevTools**: Browser extension for React debugging
- **Next.js DevTools**: Built-in Next.js debugging
- **Browser DevTools**: Network, Console, etc.

### Logging

- **Client-side**: Use `console.log` (remove in production)
- **Server-side**: Use `secureLogError` from `lib/logging`
- **Never Log**: Sensitive data (passwords, tokens, keys)

### Common Issues

1. **Hydration Errors**: Check for client/server mismatches
2. **Type Errors**: Run `pnpm type-check` for details
3. **Build Errors**: Check environment variables
4. **Runtime Errors**: Check browser console and server logs

## Git Workflow

### Branch Naming

- **Features**: `feature/feature-name`
- **Bugs**: `fix/bug-description`
- **Docs**: `docs/documentation-update`

### Commit Messages

Follow conventional commits:

- `feat: add new feature`
- `fix: resolve bug`
- `docs: update documentation`
- `style: format code`
- `refactor: restructure code`
- `test: add tests`
- `chore: update dependencies`

## Dependencies

### Adding Dependencies

**Root Dependencies**:
```bash
pnpm add -w package-name
```

**App Dependencies**:
```bash
cd apps/merchant
pnpm add package-name
```

**Package Dependencies**:
```bash
cd packages/ui
pnpm add package-name
```

### Updating Dependencies

```bash
pnpm update
```

### Removing Dependencies

```bash
pnpm remove package-name
```

## Troubleshooting

### Common Problems

1. **Module Not Found**: Clear `.next` and `node_modules`, reinstall
2. **Type Errors**: Run `pnpm type-check` to see all errors
3. **Build Fails**: Check environment variables and dependencies
4. **Port in Use**: Change port or kill process using port 3000

### Getting Help

1. **Check Documentation**: Review relevant docs
2. **Search Issues**: Check for similar issues
3. **Ask Team**: Reach out to the development team
4. **Check Logs**: Review server and browser console logs

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn UI Documentation](https://ui.shadcn.com)

