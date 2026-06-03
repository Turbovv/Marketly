import { z, type ZodType } from "zod";

export type LoginFormType = {
  email: string;
  password: string;
};

export const LoginFormSchema = z.object({
  email: z.string({ message: "required" }).email({ message: "email" }),
  password: z.string({ message: "required" }).min(1, { message: "required" }),
}) satisfies ZodType<LoginFormType>;
