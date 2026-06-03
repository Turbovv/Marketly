import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { api } from "~/trpc/react";
import { RegisterFormSchema, type RegisterFormType } from "./types";

export function useRegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const form = useForm<RegisterFormType>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const register = api.user.register.useMutation();

  const handleSubmit = form.handleSubmit(async (values) => {
    setServerError(null);

    try {
      const data = await register.mutateAsync(values);
      router.push(`/confirm?token=${data.token}`);
    } catch (mutationError) {
      const message = mutationError instanceof Error ? mutationError.message : "Unable to register.";
      setServerError(message);
    }
  });

  const togglePasswordVisibility = () => {
    setShowPassword((previous) => !previous);
  };

  const handleDiscordSignIn = () => {
    router.push("/api/auth/signin");
  };

  return {
    form,
    showPassword,
    serverError,
    handleSubmit,
    togglePasswordVisibility,
    handleDiscordSignIn,
    isPending: register.isPending,
  };
}