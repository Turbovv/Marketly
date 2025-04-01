import Sidebar from "~/components/sidebar";

export default function ChatLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-6xl mx-auto flex p-6">
        <Sidebar />
        <div className="bg-white shadow-md rounded-lg p-6 flex-1">{children}</div>
      </div>
    </div>
  );
}
