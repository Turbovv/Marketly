"use client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";

import { useConfirmForm } from "./useConfirmForm";

export default function Confirm() {
  const { form, handleCodeChange } = useConfirmForm();

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-center mb-4">Confirm Email</h2>
      <p className="text-gray-600 text-center mb-4">
        Please enter the 6-digit code sent to your email
      </p>
      <Form {...form}>
        <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmation Code</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    value={field.value}
                    onChange={(event) => handleCodeChange(event.target.value)}
                    className="mb-3 text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                  />
                </FormControl>
                <FormMessage className="text-center" />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}