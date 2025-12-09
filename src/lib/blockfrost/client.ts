import { BlockfrostProvider } from "@meshsdk/core";

// Blockfrost project keys are typically safe to use client-side
// They're more like API identifiers than secret keys
export const blockfrost = new BlockfrostProvider(
  process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_KEY ||
    "preprodyKhy0LkB27HXlinsE8nrfoAH44OCaBvc",
);
