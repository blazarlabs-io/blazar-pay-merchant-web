"use client";

import Image from "next/image";
import { Button } from "@repo/ui/components/ui/button";
import { ConfirmEmailParamsType } from "../types";
import { useConfirmEmailHandler } from "../hooks";

export const ConfirmEmailPage = (params: ConfirmEmailParamsType) => {
  const { isConfirming, isError, handleContinueToHydra } =
    useConfirmEmailHandler(params);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      {!isError && (
        <Image
          src="/images/email-confirmation.svg"
          alt="Logo"
          width={320}
          height={100}
        />
      )}
      {isError ? (
        <>
          <h1 className="text-3xl pb-4 font-medium text-center">Title</h1>
          <Button size="lg" onClick={handleContinueToHydra}>
            continue
          </Button>
        </>
      ) : isConfirming ? (
        <h1 className="text-3xl pb-4 font-medium text-center">Confirm?</h1>
      ) : (
        <>
          <h1 className="text-3xl font-medium text-center">Email</h1>
          <p className="py-6 text-base font-normal text-muted-foreground">
            confirm your email
          </p>
          <Button size="lg" onClick={handleContinueToHydra}>
            continue
          </Button>
        </>
      )}
    </div>
  );
};
