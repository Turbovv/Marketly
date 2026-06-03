import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import { useForm } from "react-hook-form";

import { api } from "~/trpc/react";
import { LoginFormSchema, type LoginFormType } from "./types";

export function useSigninForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const form = useForm<LoginFormType>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const login = api.user.login.useMutation();

  const handleSubmit = form.handleSubmit(async (values) => {
    setServerError(null);

    try {
      const data = await login.mutateAsync(values);
      Cookies.set("token", data.token, { expires: 7, sameSite: "lax", path: "/" });
      window.location.href = "/";
    } catch (mutationError) {
      const message = mutationError instanceof Error ? mutationError.message : "Unable to log in.";
      setServerError(message);
    }
  });

  const handleForgotPassword = () => {
    router.push("/forgot-password");
  };

  const handleDiscordSignIn = () => {
    void signIn("discord", { callbackUrl: "/" });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((previous) => !previous);
  };

  return {
    form,
    showPassword,
    serverError,
    handleSubmit,
    handleForgotPassword,
    handleDiscordSignIn,
    togglePasswordVisibility,
    isPending: login.isPending,
  };
}
