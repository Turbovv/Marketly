"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function ConfirmPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleConfirmEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code) {
      return alert("Please enter the confirmation code.");
    }

    try {
      const response = await axios.post("http://localhost:3001/api/confirm-email", {
        email,
        confirmationCode: code,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);

        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error confirming email:", error);
      alert("Failed to confirm email. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-center mb-4">Confirm Email</h2>
      {error && <p className="text-red-500 text-center mb-2">{error}</p>}
      <form onSubmit={handleConfirmEmail}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-3 border rounded"
        />
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full p-2 mb-3 border rounded"
          placeholder="Confirmation Code"
        />
        <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded">
          Confirm Email
        </button>
      </form>
    </div>
  );
}
