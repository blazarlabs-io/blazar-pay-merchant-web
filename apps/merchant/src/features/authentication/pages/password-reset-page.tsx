"use client";

import { auth } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConfirmEmailParamsType } from "../types";
import { checkActionCode, confirmPasswordReset } from "firebase/auth";
import { ResetPasswordForm } from "../components/";
import { passwordResetFormSchema } from "../data";
import { z } from "zod";
import {
  useConfirmResetPassword,
  useResetPasswordForm,
} from "~/src/features/authentication/hooks";
import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";

export const PasswordResetPage = ({ oobCode }: ConfirmEmailParamsType) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // * HOOKS
  const router = useRouter();

  const { isConfirming, isError } = useConfirmResetPassword(oobCode);

  const form = useResetPasswordForm();

  const onSubmit = async (values: z.infer<typeof passwordResetFormSchema>) => {
    try {
      setIsSubmitting(true);
      const action = await checkActionCode(auth, oobCode);
      if (action.operation !== "PASSWORD_RESET")
        throw new Error("Operation not allowed");
      const { newPassword } = values;
      await confirmPasswordReset(auth, oobCode, newPassword);
      router.replace("/login");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    router.replace("/login");
  };

  return (
    <div
      className={cn(
        "flex w-full max-w-[360px] flex-col gap-3",
        "rounded-[12px] border px-2 py-4 sm:p-6",
      )}
    >
      {isConfirming ? (
        <h1 className="text-3xl pb-4 font-medium text-center">
          {"authPages.resetPassword.confirmMessage"}
        </h1>
      ) : isError ? (
        <>
          <h1 className="text-3xl pb-4 font-medium text-center">
            {"authPages.resetPassword.errorMessage"}
          </h1>
          <Button size="lg" onClick={handleContinue}>
            {"authPages.resetPassword.backButtonLable"}
          </Button>
        </>
      ) : (
        <ResetPasswordForm
          form={form}
          onSubmit={onSubmit}
          disabled={isSubmitting}
        />
      )}
    </div>
  );
};
