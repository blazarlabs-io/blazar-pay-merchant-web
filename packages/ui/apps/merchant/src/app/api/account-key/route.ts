import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/api-auth";
import { CheckIdTokenResp } from "@/features/authentication/types";
import { secureLogError } from "@/lib/logging";
import { toPublicError, CommonErrors } from "@/lib/errors";
import { 
  deriveSecureAccountKey, 
  validateSeedPhrase,
  secureClear 
} from "@/lib/crypto/secure-key-derivation";

async function handleAccountKey(request: NextRequest, user: CheckIdTokenResp) {
  let seedPhrase: string | undefined;
  
  try {
    if (request.method !== "POST") {
      return NextResponse.json(
        { message: "Only POST requests allowed" },
        { status: 405 },
      );
    }

    const data = await request.json();
    seedPhrase = data.seedPhrase;

    if (!seedPhrase) {
      return NextResponse.json(
        { message: "Seed Phrase not found" },
        { status: 400 },
      );
    }

    // Validate seed phrase format and strength
    const validation = validateSeedPhrase(seedPhrase);
    if (!validation.isValid) {
      return NextResponse.json(
        { message: validation.error },
        { status: 400 },
      );
    }

    // Securely derive account key using proper cryptographic methods
    const keyResult = deriveSecureAccountKey(seedPhrase, {
      accountIndex: 0,
    });

    // Log the operation for security auditing (no sensitive data)
    secureLogError(new Error("Account key generation"), {
      operation: "generateAccountKey",
      userId: user.decodedData?.uid,
      endpoint: "/api/account-key",
      keyHash: keyResult.keyHash,
      wordCount: validation.wordCount,
    });

    // Securely clear sensitive data from memory
    secureClear(seedPhrase);

    return NextResponse.json({ 
      privateKey: keyResult.privateKey,
      publicKey: keyResult.publicKey,
      address: keyResult.address,
    }, { status: 200 });
  } catch (error) {
    // Log securely with context (no sensitive data)
    secureLogError(error, {
      operation: "handleAccountKey",
      endpoint: "/api/account-key",
      userId: user.decodedData?.uid,
      error: "Account key derivation failed",
    });

    // Securely clear sensitive data from memory
    if (seedPhrase) {
      secureClear(seedPhrase);
    }

    // Return sanitized error response
    const publicError = toPublicError(error, CommonErrors.INTERNAL_ERROR);
    return NextResponse.json(
      { error: publicError.message },
      { status: publicError.status },
    );
  }
}

// Export the protected handler
export const POST = withAuth(handleAccountKey);
