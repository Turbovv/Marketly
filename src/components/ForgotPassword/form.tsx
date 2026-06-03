"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

import { useForgotPasswordForm } from "./useForgotPasswordForm";

export default function ForgotPasswordForm() {
  const {
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
    forgotPasswordPending,
    validateCodePending,
    resetPasswordPending,
  } = useForgotPasswordForm();

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
          <Form {...emailForm}>
            <form onSubmit={handleEmailSubmit} className="space-y-4" aria-label="Forgot password form">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Your email"
                        autoFocus
                        disabled={forgotPasswordPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className="w-full" type="submit" disabled={forgotPasswordPending}>
                {forgotPasswordPending ? "Sending..." : "Send Reset Code"}
              </Button>
              {message && <p className="mt-2 text-green-600">{message}</p>}
              {serverError && <p className="mt-2 text-red-600">{serverError}</p>}
            </form>
          </Form>
        )}

        {step === "code" && (
          <Form {...codeForm}>
            <form onSubmit={handleCodeSubmit} className="space-y-4" aria-label="Enter code form">
              <FormField
                control={codeForm.control}
                name="resetCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reset Code</FormLabel>
                    <FormControl>
                      <Input
                        ref={codeInputRef}
                        className="text-center text-2xl tracking-widest"
                        type="text"
                        placeholder="000000"
                        value={field.value}
                        onChange={(event) => handleResetCodeChange(event.target.value)}
                        maxLength={6}
                        autoFocus
                        disabled={validateCodePending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={validateCodePending}>
                {validateCodePending ? "Verifying..." : "Verify Code"}
              </Button>

              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || forgotPasswordPending}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                </Button>
                <span className="text-xs text-muted-foreground">
                  {message || "Enter the code sent to your email"}
                </span>
              </div>

              {serverError && <p className="mb-2 text-center text-red-500">{serverError}</p>}
            </form>
          </Form>
        )}

        {step === "reset" && (
          <Form {...resetForm}>
            <form onSubmit={handleResetSubmit} className="space-y-4" aria-label="Set new password form">
              <FormField
                control={resetForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        ref={passwordInputRef}
                        type="password"
                        placeholder="New password"
                        disabled={resetPasswordPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className="w-full" type="submit" disabled={resetPasswordPending}>
                {resetPasswordPending ? "Resetting..." : "Reset Password"}
              </Button>
              {message && <p className="mt-2 text-green-600">{message}</p>}
              {serverError && <p className="mt-2 text-red-600">{serverError}</p>}
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}

