import { z, type ZodType } from "zod";

export type RegisterFormType = {
  name: string;
  email: string;
  password: string;
};

export const RegisterFormSchema = z.object({
  name: z.string({ message: "required" }).min(1, { message: "required" }),
  email: z.string({ message: "required" }).email({ message: "email" }),
  password: z.string({ message: "required" }).min(1, { message: "required" }),
}) satisfies ZodType<RegisterFormType>;
