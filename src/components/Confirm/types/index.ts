import { z, type ZodType } from "zod";

export type ConfirmFormType = {
  code: string;
};

export const ConfirmFormSchema = z.object({
  code: z.string({ message: "required" }).length(6, { message: "code-length" }),
}) satisfies ZodType<ConfirmFormType>;
