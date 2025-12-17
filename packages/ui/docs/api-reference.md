# API Reference

This document provides comprehensive documentation for all API endpoints in the Blazar Pay Merchant App.

## Base URL

All API endpoints are prefixed with `/api`:

```
http://localhost:3000/api
```

## Authentication

Most API endpoints require authentication. Authentication is handled via:

- **HTTP-only Cookie**: Contains Firebase ID token
- **Cookie Name**: Defined in `AUTH_COOKIE` constant
- **Token Validation**: Server-side validation on each request

### Protected Endpoints

Protected endpoints use the `withAuth` wrapper which:
- Extracts the ID token from cookies
- Validates the token with Firebase
- Provides user data to the handler function
- Returns 401 if authentication fails

## API Endpoints

### Authentication Endpoints

#### Verify ID Token

**Endpoint**: `POST /api/auth/verify-id-token`

**Description**: Verifies a Firebase ID token and returns user information.

**Request Body**:
```json
{
  "idToken": "firebase_id_token_string"
}
```

**Response**:
```json
{
  "valid": true,
  "decodedData": {
    "uid": "user_id",
    "email": "user@example.com",
    "email_verified": true
  }
}
```

**Status Codes**:
- `200`: Token is valid
- `400`: Invalid request
- `401`: Token is invalid or expired

---

#### Set Authentication Cookie

**Endpoint**: `POST /api/auth/set-cookie`

**Description**: Sets the authentication cookie after successful login.

**Request Body**:
```json
{
  "idToken": "firebase_id_token_string"
}
```

**Response**:
```json
{
  "success": true
}
```

**Status Codes**:
- `200`: Cookie set successfully
- `400`: Invalid request
- `401`: Invalid token

---

#### Create User

**Endpoint**: `POST /api/create-user`

**Description**: Creates a new user account in Firebase.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "secure_password",
  "displayName": "User Name"
}
```

**Response**:
```json
{
  "uid": "user_id",
  "email": "user@example.com"
}
```

**Status Codes**:
- `200`: User created successfully
- `400`: Invalid request or user already exists
- `500`: Server error

---

#### Password Recovery

**Endpoint**: `POST /api/password-recovery`

**Description**: Initiates password recovery process.

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

**Status Codes**:
- `200`: Recovery email sent
- `400`: Invalid email
- `404`: User not found
- `500`: Server error

---

#### reCAPTCHA Verification

**Endpoint**: `POST /api/recaptcha`

**Description**: Verifies reCAPTCHA token.

**Request Body**:
```json
{
  "token": "recaptcha_token"
}
```

**Response**:
```json
{
  "success": true
}
```

**Status Codes**:
- `200`: reCAPTCHA verified
- `400`: Invalid token
- `500`: Server error

---

### Email Endpoints

#### Send Email

**Endpoint**: `POST /api/send-email`

**Description**: Sends an email using SendGrid.

**Request Body**:
```json
{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "html": "<p>Email content</p>",
  "text": "Email content (plain text)"
}
```

**Response**:
```json
{
  "success": true,
  "messageId": "sendgrid_message_id"
}
```

**Status Codes**:
- `200`: Email sent successfully
- `400`: Invalid request
- `500`: Server error

---

#### Send Verification Email

**Endpoint**: `POST /api/send-verification-email`

**Description**: Sends email verification link to user.

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response**:
```json
{
  "success": true
}
```

**Status Codes**:
- `200`: Verification email sent
- `400`: Invalid request
- `500`: Server error

---

#### Check Email

**Endpoint**: `POST /api/check-email`

**Description**: Checks if an email address is already registered.

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response**:
```json
{
  "exists": true
}
```

**Status Codes**:
- `200`: Email check completed
- `400`: Invalid request

---

### Hydra Payment Endpoints

#### Query Funds

**Endpoint**: `GET /api/hydra/query-funds`

**Description**: Queries funds available in Hydra Layer 2 for an address.

**Query Parameters**:
- `address` (required): Cardano address

**Example**:
```
GET /api/hydra/query-funds?address=addr1...
```

**Response**:
```json
{
  "fundsInL1": "1000000",
  "fundsInL2": "500000",
  "totalInL1": "1000000",
  "totalInL2": "500000"
}
```

**Status Codes**:
- `200`: Query successful
- `400`: Invalid address
- `500`: Server error

---

#### Deposit

**Endpoint**: `POST /api/hydra/deposit`

**Description**: Deposits funds from Cardano mainnet to Hydra Layer 2.

**Authentication**: Required

**Request Body**:
```json
{
  "amount": "1000000",
  "address": "addr1...",
  "asset": "ADA"
}
```

**Response**:
```json
{
  "success": true,
  "transactionId": "tx_hash"
}
```

**Status Codes**:
- `200`: Deposit initiated
- `400`: Invalid request
- `401`: Unauthorized
- `500`: Server error

---

#### Withdraw

**Endpoint**: `POST /api/hydra/withdraw`

**Description**: Withdraws funds from Hydra Layer 2 to Cardano mainnet.

**Authentication**: Required

**Request Body**:
```json
{
  "amount": "1000000",
  "address": "addr1...",
  "asset": "ADA"
}
```

**Response**:
```json
{
  "success": true,
  "transactionId": "tx_hash"
}
```

**Status Codes**:
- `200`: Withdrawal initiated
- `400`: Invalid request
- `401`: Unauthorized
- `500`: Server error

---

#### Pay Merchant

**Endpoint**: `POST /api/hydra/pay-merchant`

**Description**: Processes a payment to a merchant through Hydra.

**Authentication**: Required

**Request Body**:
```json
{
  "amount": "1000000",
  "merchantAddress": "addr1...",
  "asset": "ADA"
}
```

**Response**:
```json
{
  "success": true,
  "transactionId": "tx_hash"
}
```

**Status Codes**:
- `200`: Payment processed
- `400`: Invalid request
- `401`: Unauthorized
- `500`: Server error

---

### Cryptographic Endpoints

#### Get Private Key

**Endpoint**: `POST /api/get-private-key`

**Description**: Derives a Cardano private key from a seed phrase.

**Authentication**: Required

**Request Body**:
```json
{
  "seedPhrase": "word1 word2 ... word12"
}
```

**Response**:
```json
{
  "privateKey": "ed25519_private_key",
  "publicKey": "ed25519_public_key",
  "address": "addr1..."
}
```

**Status Codes**:
- `200`: Key derived successfully
- `400`: Invalid seed phrase
- `401`: Unauthorized
- `500`: Server error

**Security Notes**:
- Seed phrase is validated (BIP39 format)
- Sensitive data is cleared from memory after use
- Operation is logged for security auditing

---

#### Get Account Key

**Endpoint**: `POST /api/account-key`

**Description**: Derives a Cardano account key from a seed phrase.

**Authentication**: Required

**Request Body**:
```json
{
  "seedPhrase": "word1 word2 ... word12"
}
```

**Response**:
```json
{
  "privateKey": "ed25519_private_key",
  "publicKey": "ed25519_public_key",
  "address": "addr1..."
}
```

**Status Codes**:
- `200`: Key derived successfully
- `400`: Invalid seed phrase
- `401`: Unauthorized
- `500`: Server error

**Security Notes**:
- Same security measures as Get Private Key endpoint
- Used for account-level operations

---

### Configuration Endpoints

#### Get Configuration

**Endpoint**: `GET /api/config`

**Description**: Returns public configuration for the application.

**Response**:
```json
{
  "firebase": {
    "apiKey": "public_api_key",
    "authDomain": "project.firebaseapp.com",
    "projectId": "project_id"
  },
  "captcha": {
    "siteKey": "recaptcha_site_key"
  }
}
```

**Status Codes**:
- `200`: Configuration returned

**Note**: Only public configuration values are returned. Sensitive keys are excluded.

---

### Data Endpoints

#### Coin Prices

**Endpoint**: `GET /api/coin-prices`

**Description**: Returns current cryptocurrency prices.

**Response**:
```json
{
  "ADA": {
    "price": 0.50,
    "currency": "USD"
  },
  "WBTC": {
    "price": 45000.00,
    "currency": "USD"
  }
}
```

**Status Codes**:
- `200`: Prices returned
- `500`: Server error

---

#### Sanity CMS Query

**Endpoint**: `POST /api/sanity`

**Description**: Executes a Sanity CMS query.

**Request Body**:
```json
{
  "query": "*[_type == 'page']",
  "params": {}
}
```

**Response**:
```json
{
  "data": [...]
}
```

**Status Codes**:
- `200`: Query executed successfully
- `400`: Invalid query
- `500`: Server error

---

### Terminal Endpoints

#### Terminal Operations

**Endpoint**: `POST /api/terminal`

**Description**: Handles Bluetooth terminal operations.

**Request Body**:
```json
{
  "service": "scan" | "connect" | "disconnect"
}
```

**Response**:
```json
{
  "message": "Success"
}
```

**Status Codes**:
- `200`: Operation successful
- `400`: Invalid request
- `405`: Method not allowed
- `500`: Server error

**Note**: This endpoint requires native Bluetooth support and may not work in all environments.

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

- `INTERNAL_ERROR`: Server-side error
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid input data
- `RATE_LIMIT_EXCEEDED`: Too many requests

## Rate Limiting

API endpoints may implement rate limiting to prevent abuse. If rate limited, the response will include:

```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

## Request/Response Format

- **Content-Type**: `application/json`
- **Accept**: `application/json`
- **Encoding**: UTF-8

## CORS

CORS is configured to allow requests from the application's origin. Cross-origin requests may be restricted.

## Security Considerations

1. **Authentication**: Always include authentication cookies for protected endpoints
2. **HTTPS**: Use HTTPS in production to protect sensitive data
3. **Input Validation**: All inputs are validated server-side
4. **Error Messages**: Error messages don't expose sensitive information
5. **Logging**: All API operations are logged for security auditing

## Testing

API endpoints can be tested using:

- **cURL**: Command-line HTTP client
- **Postman**: API testing tool
- **Browser DevTools**: Network tab for debugging
- **Unit Tests**: Test files in the codebase (e.g., `route.test.ts`)

## Versioning

Currently, there is no API versioning. All endpoints are under `/api`. Future versions may introduce versioning (e.g., `/api/v1/`).

