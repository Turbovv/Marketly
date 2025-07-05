"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";

export default function ConfirmPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const CONFIRMATION_CODE_LENGTH = 6;

  const { mutate: confirmEmail } = api.user.confirmEmail.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      router.push("/");
    },
    onError: (error) => {
      setError(error.message);
      setCode("");
      if (error.message.includes("expired")) {
        setTimeout(() => {
          router.push("/register");
        }, 1000);
      }
    },
  });

  useEffect(() => {
    if (code.length === CONFIRMATION_CODE_LENGTH) {
      if (!token) {
        setError("Invalid confirmation link.");
        return;
      }
      confirmEmail({ confirmationCode: code, token });
    }
  }, [code, token, confirmEmail]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= CONFIRMATION_CODE_LENGTH) {
      setCode(value);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-center mb-4">Confirm Email</h2>
      <p className="text-gray-600 text-center mb-4">
        Please enter the {CONFIRMATION_CODE_LENGTH}-digit code sent to your email
      </p>
      {error && <p className="text-red-500 text-center mb-2">{error}</p>}
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          value={code}
          onChange={handleCodeChange}
          className="w-full p-2 mb-3 border rounded text-center text-2xl tracking-widest"
          placeholder="000000"
          maxLength={CONFIRMATION_CODE_LENGTH}
          autoFocus
        />
      </form>
    </div>
  );
}