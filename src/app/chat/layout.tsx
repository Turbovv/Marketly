"use client"
import { useState } from "react";
import Sidebar from "~/components/sidebar";

export default function ChatLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-7xl mx-auto flex py-16">
        <div className="hidden lg:block">
        <Sidebar setShowMobileSidebar={setShowMobileSidebar} />
        </div>

        <div className="bg-white shadow-md rounded-lg flex-1">{children}</div>
      </div>
    </div>
  );
}
