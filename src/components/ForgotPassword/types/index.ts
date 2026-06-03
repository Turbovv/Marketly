import { z, type ZodType } from "zod";

export type ForgotPasswordEmailFormType = {
  email: string;
};

export type ForgotPasswordCodeFormType = {
  resetCode: string;
};

export type ForgotPasswordResetFormType = {
  newPassword: string;
};

export const ForgotPasswordEmailFormSchema = z.object({
  email: z.string({ message: "required" }).email({ message: "email" }),
}) satisfies ZodType<ForgotPasswordEmailFormType>;

export const ForgotPasswordCodeFormSchema = z.object({
  resetCode: z.string({ message: "required" }).length(6, { message: "code-length" }),
}) satisfies ZodType<ForgotPasswordCodeFormType>;

export const ForgotPasswordResetFormSchema = z.object({
  newPassword: z.string({ message: "required" }).min(6, { message: "password-short" }),
}) satisfies ZodType<ForgotPasswordResetFormType>;
