"use client";

import { loginFormSchema } from "~/src/features/authentication/data/form-schemas";
import { toast } from "@repo/ui/hooks/use-toast";
import { auth } from "@/lib/firebase/client";
import { cn } from "@/utils/shadcn";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { usePublicConfig } from "@/hooks/use-public-config";
import { Button } from "@repo/ui/components/ui/button";
import { Form } from "@repo/ui/components/ui/form";
import { AuthInputField } from "../fields/auth-input-field";
import { PasswordInputField } from "../fields/password-input-field";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { AUTH_COOKIE, LOGIN_CREDENTIALS_KEY } from "../../data";
import { LoginStorage } from "../../types";
import { setToLocalStorage, getFromLocalStorage } from "@/utils/local-storage";
import { setCookie } from "cookies-next";
import { useAuth } from "../../context";
import { useCaptcha, useGoogleSignIn } from "../../hooks";
import { sendVerificationEmailService } from "../../services";

export const LoginForm = () => {
  // * FORM HOOKS
  const router = useRouter();
  const { config } = usePublicConfig();
  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email:
        getFromLocalStorage<LoginStorage>(LOGIN_CREDENTIALS_KEY)?.email || "",
      password: "",
    },
  });

  // * STATES
  const [isSubmitting, setIsSubmitting] = useState(false);

  // * AUTH HOOKS
  const { isGoogleLogin, handleSignInWithGoogle } = useGoogleSignIn();
  const { setUserHandler, user } = useAuth();
  // This avoid doing validation and showing errors after captcha validation if the input values are not dirty (different from the default values)
  const handleRefreshForm = useCallback(() => {
    try {
      if (form.formState.isDirty) form.trigger();
      return;
    } catch (e) {
      console.error(e);
    }
  }, [form.formState.isDirty]);
  const { recaptchaRef, isVerified, handleExpired, handleChange } = useCaptcha({
    synchWithFormState: handleRefreshForm,
  });

  // * HANDLERS
  const onSubmit = async (values: z.infer<typeof loginFormSchema>) => {
    try {
      setIsSubmitting(true);
      setToLocalStorage<LoginStorage>(LOGIN_CREDENTIALS_KEY, {
        email: values.email,
      });
      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password,
      );

      // Signed In
      const user = userCredential.user;
      await setUserHandler(user);
      const idToken = await user.getIdToken();
      setCookie(AUTH_COOKIE, idToken, {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      if (user.emailVerified) {
        toast({
          variant: "default",
          title: "Success",
          description: "Login successful",
        });
        router.replace("/dashboard/home");
      } else {
        toast({
          variant: "destructive",
          title: "Your email is not verified",
          description: "Please verify your email",
        });
        await sendVerificationEmailService(values.email);
        router.replace("/verify-email");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "error",
        description: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    router.push("/forgot-password");
  };

  /* 
    It will be on processing if the Google sign-in process is initiated (Google modal Open) and when form is submitting 
  */
  const isProcessing = isGoogleLogin || isSubmitting;

  return (
    <div className="flex w-full min-w-[360px] max-w-[360px] flex-col gap-3 rounded-[12px] p-6">
      <div className="mb-4">
        <h1 className="text-center text-2xl font-semibold">Login Hydrapay</h1>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            onClick={handleSignInWithGoogle}
            disabled={!isVerified || isSubmitting}
            type="button"
            className="flex w-full min-w-[320px] max-w-[320px] items-center justify-center gap-3 rounded-md border border-border bg-foreground px-4 py-2 text-base text-background disabled:bg-slate-400 disabled:text-slate-300"
          >
            <Image
              src="/images/google-color-icon.svg"
              alt="Logo"
              width={24}
              height={24}
              className={cn(!isVerified && "opacity-30 grayscale")}
            />
            Continue With Google
          </TooltipTrigger>
          <TooltipContent>
            <p>Please check the I&apos;m not a robot checkbox</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div className="flex items-center justify-center gap-4 py-2">
        <div className="h-[1px] w-full bg-border" />
        <span className="min-w-fit">or log in with</span>
        <div className="h-[1px] w-full bg-border" />
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-4"
        >
          <AuthInputField
            name="email"
            placeholder="Email"
            inputType="email"
            disabled={isProcessing}
            formControl={form.control}
          />
          <PasswordInputField
            name="password"
            disabled={isProcessing}
            placeholder="Password"
            formControl={form.control}
          />
          <div className="flex w-full items-center justify-end text-sm">
            <button
              type="button"
              // href="/forgot-password"
              className="text-sm font-medium text-primary underline"
              onClick={handleForgotPassword}
            >
              Forgot password?
            </button>
          </div>
          <div className="flex w-full items-center justify-center">
            {config?.captcha?.siteKey ? (
              <ReCAPTCHA
                sitekey={config.captcha.siteKey}
                ref={recaptchaRef}
                onChange={handleChange}
                onExpired={handleExpired}
              />
            ) : (
              <div className="text-sm text-muted-foreground">
                reCAPTCHA not configured
              </div>
            )}
          </div>
          <Button
            disabled={!isVerified || isProcessing || !form.formState.isValid}
            size="lg"
            type="submit"
            className="w-full"
          >
            Login
          </Button>
        </form>
      </Form>
      <div className="mt-4 flex items-center justify-center gap-2">
        <span className="text-sm">Don&apos;t have an account?</span>
        <Link
          href="/signup"
          className="text-sm font-medium text-primary underline"
        >
          Sign Up
        </Link>
      </div>
      <div className="mt-[16px] min-w-[320px] max-w-[320px]">
        <p className="text-xs leading-[20px] text-muted-foreground">
          By clicking on Login, Continue With Google or Continue With Facebook,
          I state that I have read and understood the
          <Link
            href="/legal/terms-and-conditions"
            className="font-bold text-primary underline"
          >
            Terms and Conditions
          </Link>{" "}
          and{" "}
          <Link
            href="/legal/privacy-policy"
            className="font-bold text-primary underline"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
};
