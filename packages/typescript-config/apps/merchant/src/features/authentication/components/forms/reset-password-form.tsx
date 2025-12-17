"use client";

import { Eye, EyeOff } from "lucide-react";

import { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { DialogClose } from "@repo/ui/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/ui/form";
import { Input } from "@repo/ui/components/ui/input";
import { useResetPasswordForm } from "../../hooks";
import { z } from "zod";
import { passwordResetFormSchema } from "../../data";

type Props = {
  disabled: boolean;
  form: ReturnType<typeof useResetPasswordForm>;
  onSubmit: (values: z.infer<typeof passwordResetFormSchema>) => Promise<void>;
};

export const ResetPasswordForm = ({ disabled, form, onSubmit }: Props) => {
  // * HOOKS

  // * STATES
  const [passwordVisibility, setPasswordVisibility] = useState<boolean>(false);

  const handlePasswordVisibility = () => {
    setPasswordVisibility((old) => !old);
  };

  return (
    <>
      <div className="mb-4">
        <h1 className="text-center text-2xl font-semibold">
          {"authPages.resetPassword.title"}
        </h1>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-4"
        >
          <FormField
            control={form.control}
            name={"newPassword"}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {"authPages.resetPassword.newPassword.label"}
                </FormLabel>
                <FormControl>
                  <div className="relative flex items-center rounded-md border border-border bg-background text-foreground">
                    <Input
                      disabled={disabled}
                      type={passwordVisibility ? "text" : "password"}
                      placeholder={
                        "authPages.resetPassword.newPassword.placeholder"
                      }
                      {...field}
                      className="border-0 bg-transparent px-4 py-3 text-sm shadow-none"
                    />
                    <button
                      onClick={handlePasswordVisibility}
                      type="button"
                      className="absolute right-2"
                    >
                      {passwordVisibility ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={"confirmNewPassword"}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {"authPages.resetPassword.confirmNewPassword.label"}
                </FormLabel>
                <FormControl>
                  <div className="relative flex items-center rounded-md border border-border bg-background text-foreground">
                    <Input
                      disabled={disabled}
                      type={passwordVisibility ? "text" : "password"}
                      placeholder={
                        "authPages.resetPassword.confirmNewPassword.placeholder"
                      }
                      {...field}
                      className="border-0 bg-transparent px-4 py-3 text-sm shadow-none"
                    />
                    <button
                      onClick={handlePasswordVisibility}
                      type="button"
                      className="absolute right-2"
                    >
                      {passwordVisibility ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            disabled={!form.formState.isValid || disabled}
            size="lg"
            type="submit"
            className="w-full"
          >
            {"authPages.resetPassword.sendButtonLable"}
          </Button>
        </form>
      </Form>
    </>
  );
};
