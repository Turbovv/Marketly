"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

export default function Dashboard() {
  const router = useRouter();
  const { data: userData, error } = api.user.getUser.useQuery(
    { token: typeof window !== 'undefined' ? localStorage.getItem("token") || "" : "" },
    { enabled: typeof window !== 'undefined' && !!localStorage.getItem("token") }
  );

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/login");
    }
  }, [router]);

  if (error) {
    return <div className="text-red-500">Failed to fetch user data</div>;
  }

  if (!userData) {
    return <div>Loading...</div>;
  }


  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-center mb-4">Dashboard</h2>
      <div>
        <h3 className="font-semibold">User Information</h3>
        <p><strong>Name:</strong> {userData?.name}</p>
        <p><strong>Email:</strong> {userData?.email}</p>
      </div>
    </div>
  );
};
