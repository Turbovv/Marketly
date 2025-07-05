"use client"
import { useState } from "react";
import Sidebar from "~/components/sidebar";

export default function CartLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-7xl mx-auto flex gap-8 py-16">
        <div className="hidden lg:block">
          <Sidebar setShowMobileSidebar={setShowMobileSidebar} />
        </div>
        <div className="">{children}</div>
      </div>
    </div>
  );
}
