import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/api-auth";
import { CheckIdTokenResp } from "@/features/authentication/types";
import { secureLogError } from "@/lib/logging";
import { toPublicError, CommonErrors } from "@/lib/errors";
import { 
  deriveSecurePrivateKey, 
  validateSeedPhrase,
  secureClear 
} from "@/lib/crypto/secure-key-derivation";

async function handleGetPrivateKey(
  request: NextRequest,
  user: CheckIdTokenResp,
) {
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

    // Securely derive private key using proper cryptographic methods
    const keyResult = deriveSecurePrivateKey(seedPhrase, {
      addressType: "Base",
      accountIndex: 0,
      network: "Mainnet",
    });

    // Log the operation for security auditing (no sensitive data)
    secureLogError(new Error("Private key retrieval"), {
      operation: "getPrivateKey",
      userId: user.decodedData?.uid,
      endpoint: "/api/get-private-key",
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
      operation: "handleGetPrivateKey",
      endpoint: "/api/get-private-key",
      userId: user.decodedData?.uid,
      error: "Private key derivation failed",
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
export const POST = withAuth(handleGetPrivateKey);
