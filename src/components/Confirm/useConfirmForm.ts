import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { api } from "~/trpc/react";

import { ConfirmFormSchema, type ConfirmFormType } from "./types";

export function useConfirmForm() {
  const [searchParams, router] = [useSearchParams(), useRouter()];
  const token = searchParams.get("token");
  const form = useForm<ConfirmFormType>({
    resolver: zodResolver(ConfirmFormSchema),
    defaultValues: { code: "" },
  });
  const code = useWatch({
    control: form.control,
    name: "code",
  });

  const confirmEmail = api.user.confirmEmail.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      router.push("/");
    },
    onError: (error) => {
      form.setError("code", { message: error.message });
      form.reset({ code: "" });

      if (error.message.includes("expired")) {
        setTimeout(() => {
          router.push("/register");
        }, 1000);
      }
    },
  });

  useEffect(() => {
    if (code.length !== 6 || confirmEmail.isPending) {
      return;
    }

    if (!token) {
      form.setError("code", { message: "Invalid confirmation link." });
      return;
    }

    confirmEmail.mutate({ confirmationCode: code, token });
  }, [code, confirmEmail, form, token]);

  const handleCodeChange = (value: string) => {
    const digits = value.replace(/[^0-9]/g, "").slice(0, 6);
    form.setValue("code", digits, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: digits.length === 6,
    });
  };

  return {
    form,
    handleCodeChange,
    isPending: confirmEmail.isPending,
  };
}
