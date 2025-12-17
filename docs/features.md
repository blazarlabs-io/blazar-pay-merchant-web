# Application Features

This document describes all the features available in the Blazar Pay Merchant App.

## Authentication Features

### User Registration

- **Sign Up**: New users can create an account with email and password
- **Email Verification**: Users must verify their email address before accessing the dashboard
- **Password Requirements**: Secure password validation
- **reCAPTCHA**: Bot protection during registration

### User Login

- **Email/Password Login**: Standard authentication flow
- **Session Management**: Persistent sessions via HTTP-only cookies
- **Token Validation**: Automatic token verification on each request
- **Auto-redirect**: Authenticated users are redirected from auth pages

### Password Management

- **Forgot Password**: Users can request password reset via email
- **Password Reset**: Secure password reset flow with email verification
- **Password Reset Confirmation**: Users receive confirmation when reset email is sent

### Email Verification

- **Email Confirmation**: Users receive verification emails upon signup
- **Verification Page**: Dedicated page for email verification status
- **Re-send Verification**: Option to resend verification emails
- **Protected Routes**: Dashboard access requires verified email

## Dashboard Features

### Home Dashboard

The main dashboard provides an overview of the merchant's account:

- **Welcome Message**: Personalized greeting with user's name
- **Balance Display**: Current account balance in USD and Cardano assets (ADA, USDM, WBTC)
- **Quick Actions**: Access to topup, cashout, send payment, and receive payment features

### Navigation

- **Sidebar Navigation**: Persistent sidebar with main navigation items
  - Home
  - History
  - Settings
- **User Menu**: Dropdown menu with user profile and logout
- **Theme Toggle**: Switch between light and dark themes
- **Locale Switcher**: Change language (English/German)

## Wallet Features

### Wallet Connection

- **Browser Wallet Support**: Connect Cardano wallets (Nami, Eternl, etc.)
- **Wallet Detection**: Automatic detection of installed wallets
- **Connection Status**: Visual indicator of wallet connection status
- **Disconnect**: Ability to disconnect wallets

### Balance Management

- **Multi-Asset Support**: Display balances for multiple Cardano assets
  - ADA (Cardano)
  - USDM (USD stablecoin)
  - WBTC (Wrapped Bitcoin)
- **USD Conversion**: Real-time USD value conversion for all assets
- **Total Balance**: Aggregated USD balance across all assets

## Payment Features

### Topup (Deposit)

- **Wallet Connection**: Connect Cardano wallet for topup
- **Asset Selection**: Choose which asset to deposit (ADA, USDM, WBTC)
- **Amount Input**: Specify deposit amount
- **Hydra Deposit**: Deposit funds to Hydra Layer 2
- **Transaction Confirmation**: Wallet confirmation for transactions
- **Balance Update**: Automatic balance refresh after deposit

### Cashout (Withdraw)

- **Withdrawal Process**: Withdraw funds from Hydra Layer 2 to mainnet
- **Amount Selection**: Specify withdrawal amount
- **Address Input**: Enter Cardano address for withdrawal
- **Transaction Processing**: Secure withdrawal transaction handling
- **Confirmation**: Transaction confirmation and status updates

### Send Payment

- **Payment Creation**: Create payment requests
- **Amount Specification**: Set payment amount
- **Recipient Information**: Enter recipient details
- **Payment Processing**: Process payments through Hydra
- **Transaction History**: Track sent payments

### Receive Payment

- **Payment Request**: Generate payment requests
- **QR Code Generation**: Generate QR codes for payment requests
- **Payment Animation**: Visual payment processing animation
- **Real-time Updates**: Real-time payment status updates
- **Payment Confirmation**: Confirm received payments

## Transaction Features

### Transaction History

- **Transaction List**: View all past transactions
- **Transaction Details**: Detailed information for each transaction
- **Filtering**: Filter transactions by type, date, status
- **Search**: Search transactions by various criteria
- **Export**: Export transaction history (if implemented)

### Transaction Types

- **Deposits**: Funds deposited to Hydra Layer 2
- **Withdrawals**: Funds withdrawn from Hydra Layer 2
- **Payments Sent**: Payments sent to other users
- **Payments Received**: Payments received from other users

## Terminal Integration

### Terminal Settings

- **Terminal Connection**: Connect to payment terminals via Bluetooth
- **Terminal Configuration**: Configure terminal settings
- **Connection Status**: Monitor terminal connection status
- **Terminal Management**: Manage multiple terminals

### Bluetooth Integration

- **BLE Scanning**: Scan for Bluetooth Low Energy devices
- **Device Discovery**: Discover payment terminals
- **Connection Management**: Establish and maintain connections
- **Error Handling**: Handle connection errors gracefully

## Settings Features

### Account Settings

- **Profile Management**: Update user profile information
- **Email Management**: Change email address
- **Password Change**: Update account password
- **Account Preferences**: Configure account preferences

### Application Settings

- **Theme Preferences**: Light/dark mode selection
- **Language Selection**: Choose interface language
- **Notification Settings**: Configure notification preferences
- **Privacy Settings**: Manage privacy options

## Public Pages

### Home Page

- **Landing Page**: Public-facing homepage
- **Product Information**: Information about Hydrapay
- **Call to Action**: Sign up or login buttons
- **Feature Highlights**: Key features showcase

### Legal Pages

- **Privacy Policy**: Privacy policy documentation
- **Terms and Conditions**: Terms of service

## Internationalization

### Supported Languages

- **English**: Default language
- **German**: Full German translation

### Localization Features

- **Dynamic Content**: All user-facing text is translatable
- **Locale Detection**: Automatic language detection
- **Manual Selection**: Users can manually change language
- **Persistent Selection**: Language preference is saved

## Security Features

### Content Security Policy

- **Strict CSP**: Content Security Policy for XSS protection
- **Dynamic Allowlist**: Configurable CSP rules
- **Hash-based Scripts**: Production uses hash-based script validation

### Security Headers

- **X-Frame-Options**: Prevent clickjacking
- **X-Content-Type-Options**: Prevent MIME type sniffing
- **HSTS**: HTTP Strict Transport Security (production)
- **Referrer Policy**: Control referrer information
- **CORS Policy**: Cross-Origin Resource Sharing configuration

### Authentication Security

- **HTTP-only Cookies**: Secure cookie storage
- **Token Validation**: Server-side token verification
- **Session Management**: Secure session handling
- **CSRF Protection**: Cross-site request forgery protection

## API Integration

### External Services

- **Hydra API**: Layer 2 payment processing
- **Blockfrost**: Cardano blockchain data
- **CoinWatch API**: Cryptocurrency price data
- **Google Maps**: Location services (if used)
- **SendGrid**: Email delivery
- **Sanity CMS**: Content management

### API Features

- **RESTful Design**: Standard REST API patterns
- **Error Handling**: Consistent error responses
- **Authentication**: Protected endpoints
- **Rate Limiting**: API rate limiting (if configured)
- **Logging**: Comprehensive API logging

## User Experience Features

### Responsive Design

- **Mobile Support**: Fully responsive mobile interface
- **Tablet Support**: Optimized for tablet devices
- **Desktop Support**: Full-featured desktop experience

### Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: ARIA labels and semantic HTML
- **Color Contrast**: WCAG compliant color schemes
- **Focus Management**: Proper focus handling

### Performance

- **Fast Loading**: Optimized asset loading
- **Code Splitting**: Automatic code splitting
- **Image Optimization**: Optimized image delivery
- **Caching**: Strategic caching for performance

## Notifications

### Toast Notifications

- **Success Messages**: Confirm successful operations
- **Error Messages**: Display error information
- **Info Messages**: Provide informational updates
- **Warning Messages**: Alert users to potential issues

### Email Notifications

- **Verification Emails**: Email verification links
- **Password Reset**: Password reset instructions
- **Transaction Confirmations**: Payment confirmations
- **Account Updates**: Important account changes

