"use client";

import { TRPCReactProvider } from "~/trpc/react";
import { SessionProvider } from "next-auth/react";
import { Suspense, ReactNode } from "react";
import Navbar from "~/components/Navbar/navbar";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <TRPCReactProvider>
        <Navbar />
        <Suspense fallback={<div>Loading...</div>}>
          {children}
        </Suspense>
      </TRPCReactProvider>
    </SessionProvider>
  );
}
