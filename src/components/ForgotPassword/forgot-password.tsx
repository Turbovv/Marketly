"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";

export default function ForgotPasswordForm() {
  const [step, setStep] = useState<"email" | "code" | "reset">("email");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();

  const RESET_CODE_LENGTH = 6;

  const codeInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const forgotPasswordMutation = api.user.forgotPassword.useMutation({
    onSuccess: (data: any) => {
      setToken(data.token);
      setStep("code");
      setMessage("Check your email for the reset code.");
      setResendCooldown(30);
      setResetCode("");
      setCodeError(null);
      setTimeout(() => codeInputRef.current?.focus(), 100);
    },
    onError: (error) => setMessage(error.message),
  });

  const validateCodeMutation = api.user.validateResetCode.useMutation({
    onSuccess: () => {
      setStep("reset");
      setTimeout(() => passwordInputRef.current?.focus(), 100);
    },
    onError: (error) => {
      setCodeError(error.message);
    },
  });

  const resetPasswordMutation = api.user.resetPassword.useMutation({
    onSuccess: () => {
      setMessage("Password reset successful!");
      setStep("reset");
      setResetCode("");
      setNewPassword("");
      setTimeout(() => router.push("/login"), 1500);
    },
    onError: (error) => setCodeError(error.message),
  });

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    setMessage(null);
    setCodeError(null);
  }, [step]);

  const handleResend = () => {
    setMessage(null);
    setCodeError(null);
    forgotPasswordMutation.mutate({ email });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          {step === "email" && "Forgot Password"}
          {step === "code" && "Enter Reset Code"}
          {step === "reset" && "Set New Password"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {step === "email" && (
          <form
            onSubmit={e => {
              e.preventDefault();
              setMessage(null);
              forgotPasswordMutation.mutate({ email });
            }}
            className="space-y-4"
            aria-label="Forgot password form"
          >
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                disabled={forgotPasswordMutation.isPending}
              />
            </div>
            <Button
              className="w-full"
              type="submit"
              disabled={forgotPasswordMutation.isPending}
            >
              {forgotPasswordMutation.isPending ? "Sending..." : "Send Reset Code"}
            </Button>
            {message && <p className="mt-2 text-green-600">{message}</p>}
            {forgotPasswordMutation.isError && (
              <p className="mt-2 text-red-600">{forgotPasswordMutation.error.message}</p>
            )}
          </form>
        )}

        {step === "code" && (
          <form
            onSubmit={e => {
              e.preventDefault();
              if (resetCode.length !== RESET_CODE_LENGTH) {
                setCodeError("Please enter the full 6-digit code.");
                return;
              }
              validateCodeMutation.mutate({ token, resetCode });
            }}
            className="space-y-4"
            aria-label="Enter code form"
          >
            <div>
              <Label htmlFor="reset-code">Reset Code</Label>
              <Input
                id="reset-code"
                ref={codeInputRef}
                className="text-center text-2xl tracking-widest"
                type="text"
                placeholder="000000"
                value={resetCode}
                onChange={e => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  if (value.length <= RESET_CODE_LENGTH) setResetCode(value);
                }}
                maxLength={RESET_CODE_LENGTH}
                autoFocus
                disabled={validateCodeMutation.isPending}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={validateCodeMutation.isPending}
            >
              {validateCodeMutation.isPending ? "Verifying..." : "Verify Code"}
            </Button>

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleResend}
                disabled={resendCooldown > 0 || forgotPasswordMutation.isPending}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
              </Button>
              <span className="text-xs text-muted-foreground">
                {message || `Enter the code sent to your email`}
              </span>
            </div>

            {codeError && <p className="text-red-500 text-center mb-2">{codeError}</p>}
          </form>
        )}

        {step === "reset" && (
          <form
            onSubmit={e => {
              e.preventDefault();
              resetPasswordMutation.mutate({ token, resetCode, newPassword });
            }}
            className="space-y-4"
            aria-label="Set new password form"
          >
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                ref={passwordInputRef}
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                minLength={6}
                disabled={resetPasswordMutation.isPending}
              />
            </div>
            <Button
              className="w-full"
              type="submit"
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
            </Button>
            {message && <p className="mt-2 text-green-600">{message}</p>}
            {resetPasswordMutation.isError && (
              <p className="mt-2 text-red-600">{resetPasswordMutation.error.message}</p>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  );
}
