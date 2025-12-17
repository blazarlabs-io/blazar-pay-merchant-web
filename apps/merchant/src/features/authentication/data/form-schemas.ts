import { z } from "zod";

export const signUpFormSchema = z
  .object({
    email: z.string().email(),
    password: z
      .string()
      .regex(new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/), {
        message:
          "Password must be at least 8 characters and contain an uppercase letter, lowercase letter, and number",
      }),
    confirmPassword: z.string(),
    // .regex(new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/), {
    //   message:
    //     "Password must be at least 8 characters and contain an uppercase letter, lowercase letter, and number",
    // }),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
        path: ["confirmPassword"],
      });
    }
  });
export type signUpFormProps = z.infer<typeof signUpFormSchema>;

export const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const contactFormSchema = z.object({
  email: z.string().email(),
  message: z.string().min(8, "Required"),
});

export const changePasswordFormSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8)
      .regex(new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$"), {
        message:
          "Password must be at least 8 characters and contain an uppercase letter, lowercase letter, and number",
      }),
    newPassword: z
      .string()
      .min(8)
      .regex(new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$"), {
        message:
          "Password must be at least 8 characters and contain an uppercase letter, lowercase letter, and number",
      }),
    confirmNewPassword: z
      .string()
      .min(8)
      .regex(new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$"), {
        message:
          "Password must be at least 8 characters and contain an uppercase letter, lowercase letter, and number",
      }),
  })
  .superRefine(({ confirmNewPassword, newPassword }, ctx) => {
    if (confirmNewPassword !== newPassword) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
        path: ["confirmPassword"],
      });
    }
  });

export const autosaveFormSchema = z.object({
  autosave: z.boolean().default(true).optional(),
});

export const passwordResetFormSchema = z
  .object({
    newPassword: z
      .string()
      .min(8)
      .regex(new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$"), {
        message:
          "Password must be at least 8 characters and contain an uppercase letter, lowercase letter, and number",
      }),
    confirmNewPassword: z
      .string()
      .min(8)
      .regex(new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$"), {
        message:
          "Password must be at least 8 characters and contain an uppercase letter, lowercase letter, and number",
      }),
  })
  .superRefine(({ confirmNewPassword, newPassword }, ctx) => {
    if (confirmNewPassword !== newPassword) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
        path: ["confirmPassword"],
      });
    }
  });
