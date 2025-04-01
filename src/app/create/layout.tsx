import Sidebar from "~/components/sidebar";

export default function CreateLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-[260px_1fr] gap-8 p-6">
        <Sidebar />
        <div className="">{children}</div>
      </div>
    </div>
  );
}
