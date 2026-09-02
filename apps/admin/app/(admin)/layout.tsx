import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "../../components/Sidebar";
import { apiFetch } from "../../lib/api";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Every section behind this layout requires a real signed-in ops-staff
  // session — no more auto-login. Per-page fetches still handle a token
  // that's present but expired/revoked (apiFetch throws, pages render
  // ApiUnavailable), this only catches the "never signed in" case.
  const token = cookies().get("tanafus_admin_token")?.value;
  if (!token) redirect("/sign-in");

  const user = await apiFetch<{ nameAr: string; nameEn: string; mobile: string }>("/auth/me", token).catch(() => null);

  return (
    <div className="h-screen flex bg-bg text-ink overflow-hidden">
      <Sidebar user={user} />
      <div className="flex-1 min-w-0 flex flex-col">{children}</div>
    </div>
  );
}
