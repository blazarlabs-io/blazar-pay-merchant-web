/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  forgotPasswordSchema,
  loginFormSchema,
  signUpFormSchema,
} from "~/src/features/authentication/data/form-schemas";
import type { Control, FieldPath } from "react-hook-form";
import { z } from "zod";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/ui/form";
import { Input } from "@repo/ui/components/ui/input";

export interface AuthInputFieldProps {
  name: FieldPath<z.infer<typeof signUpFormSchema>>;
  label?: string;
  placeholder: string;
  description?: string;
  inputType?: string;
  disabled?: boolean;
  formControl: Control<z.infer<typeof signUpFormSchema>>;
}

export const SignUpInputField: React.FC<AuthInputFieldProps> = ({
  name,
  label,
  placeholder,
  description,
  inputType,
  disabled = false,
  formControl,
}) => {
  return (
    <FormField
      control={formControl}
      name={name}
      disabled={disabled}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Input
              placeholder={placeholder}
              type={inputType || "text"}
              {...field}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
