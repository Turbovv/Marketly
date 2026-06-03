"use client"
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";

import { useRegisterForm } from "./useRegisterForm";

export default function Register() {
  const {
    form,
    showPassword,
    serverError,
    handleSubmit,
    togglePasswordVisibility,
    handleDiscordSignIn,
    isPending,
  } = useRegisterForm();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-50 to-white">
      <div className="max-w-[420px] w-full bg-white/70 backdrop-blur-lg p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/40">
        <div className="mb-10 text-center">
          <div className="mb-3">

          </div>
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create Account
          </h2>
        </div>

        {serverError && (
          <div className="mb-6 p-4 bg-red-50/50 backdrop-blur-sm border border-red-100 rounded-xl text-sm text-red-500 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {serverError}
          </div>
        )}

        <Form {...form}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-gray-500">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        {...field}
                        className="h-auto rounded-xl border-gray-100 bg-gray-50/50 px-5 py-4 text-sm text-gray-700 shadow-none transition-all focus-visible:ring-2 focus-visible:ring-blue-500/20"
                        placeholder="Name"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage className="mt-2 text-xs text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-gray-500">Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        {...field}
                        className="h-auto rounded-xl border-gray-100 bg-gray-50/50 px-5 py-4 text-sm text-gray-700 shadow-none transition-all focus-visible:ring-2 focus-visible:ring-blue-500/20"
                        placeholder="Email"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage className="mt-2 text-xs text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-gray-500">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          {...field}
                          className="h-auto rounded-xl border-gray-100 bg-gray-50/50 px-5 py-4 pr-12 text-sm text-gray-700 shadow-none transition-all focus-visible:ring-2 focus-visible:ring-blue-500/20"
                          placeholder="Password"
                          disabled={isPending}
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-700"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          disabled={isPending}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="mt-2 text-xs text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="h-auto w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 py-4 text-sm font-medium text-white hover:from-blue-600 hover:to-purple-600 focus-visible:ring-2 focus-visible:ring-blue-500/20"
            >
              {isPending ? <Loader2 className="mx-auto animate-spin" size={18} /> : "Confirm"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-4 bg-white text-gray-400 tracking-wider">or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleDiscordSignIn}
              disabled={isPending}
              variant="ghost"
              className="h-auto w-full rounded-xl bg-[#5865F2]/5 py-4 text-sm font-medium text-[#5865F2] hover:bg-[#5865F2]/10 hover:text-[#5865F2]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028c.403-.751.767-1.54 1.226-1.994a.076.076 0 0 0-.041-.106c-.435-.24-.863-.491-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127c-.436.24-.864.491-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.182 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              Discord
            </Button>

            <p className="text-center text-gray-500 text-sm">
              Already have an account? -{' '}
              <Link href="/login" className="text-blue-500 hover:text-blue-600 transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        </Form>
      </div>
    </div>
  );
}
