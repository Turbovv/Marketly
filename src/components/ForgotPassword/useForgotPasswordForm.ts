import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { api } from "~/trpc/react";

import {
  ForgotPasswordCodeFormSchema,
  type ForgotPasswordCodeFormType,
  ForgotPasswordEmailFormSchema,
  type ForgotPasswordEmailFormType,
  ForgotPasswordResetFormSchema,
  type ForgotPasswordResetFormType,
} from "./types";

export function useForgotPasswordForm() {
  const [step, setStep] = useState<"email" | "code" | "reset">("email");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();
  const codeInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const emailForm = useForm<ForgotPasswordEmailFormType>({
    resolver: zodResolver(ForgotPasswordEmailFormSchema),
    defaultValues: { email: "" },
  });

  const codeForm = useForm<ForgotPasswordCodeFormType>({
    resolver: zodResolver(ForgotPasswordCodeFormSchema),
    defaultValues: { resetCode: "" },
  });

  const resetForm = useForm<ForgotPasswordResetFormType>({
    resolver: zodResolver(ForgotPasswordResetFormSchema),
    defaultValues: { newPassword: "" },
  });

  const forgotPasswordMutation = api.user.forgotPassword.useMutation({
      onSuccess: (data) => {
        setMessage(data.message);
        
        if (!data.token) {
          return;
        }
      setToken(data.token);
      setStep("code");
      setServerError(null);
      setResendCooldown(30);
      codeForm.reset({ resetCode: "" });
      setTimeout(() => codeInputRef.current?.focus(), 100);
    },
    onError: (error) => {
      setMessage(null);
      setServerError(error.message);
    },
  });

  const validateCodeMutation = api.user.validateResetCode.useMutation({
    onSuccess: () => {
      setServerError(null);
      setStep("reset");
      setTimeout(() => passwordInputRef.current?.focus(), 100);
    },
    onError: (error) => {
      setServerError(error.message);
    },
  });

  const resetPasswordMutation = api.user.resetPassword.useMutation({
    onSuccess: () => {
      setMessage("Password reset successful!");
      setServerError(null);
      resetForm.reset({ newPassword: "" });
      setTimeout(() => router.push("/login"), 1500);
    },
    onError: (error) => {
      setServerError(error.message);
    },
  });

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timer = setTimeout(() => setResendCooldown((current) => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    setServerError(null);
  }, [step]);

  const handleEmailSubmit = emailForm.handleSubmit((values) => {
    setMessage(null);
    setServerError(null);
    forgotPasswordMutation.mutate(values);
  });

  const handleCodeSubmit = codeForm.handleSubmit((values) => {
    setServerError(null);
    validateCodeMutation.mutate({ token, resetCode: values.resetCode });
  });

  const handleResetSubmit = resetForm.handleSubmit((values) => {
    setServerError(null);
    resetPasswordMutation.mutate({
      token,
      resetCode: codeForm.getValues("resetCode"),
      newPassword: values.newPassword,
    });
  });

  const handleResend = () => {
    setMessage(null);
    setServerError(null);
    forgotPasswordMutation.mutate({ email: emailForm.getValues("email") });
  };

  const handleResetCodeChange = (value: string) => {
    const digits = value.replace(/[^0-9]/g, "").slice(0, 6);
    codeForm.setValue("resetCode", digits, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: digits.length === 6,
    });
  };

  return {
    step,
    message,
    serverError,
    resendCooldown,
    codeInputRef,
    passwordInputRef,
    emailForm,
    codeForm,
    resetForm,
    handleEmailSubmit,
    handleCodeSubmit,
    handleResetSubmit,
    handleResend,
    handleResetCodeChange,
    forgotPasswordPending: forgotPasswordMutation.isPending,
    validateCodePending: validateCodeMutation.isPending,
    resetPasswordPending: resetPasswordMutation.isPending,
  };
}
