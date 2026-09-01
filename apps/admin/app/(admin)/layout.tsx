import type { ReactNode } from "react";
import { Sidebar } from "../../components/Sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen flex bg-bg text-ink overflow-hidden">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">{children}</div>
    </div>
  );
}
