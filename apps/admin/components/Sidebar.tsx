"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavItems } from "@tanafus/i18n";
import { LanguageSwitch } from "./LanguageSwitch";
import { SignOutButton } from "./SignOutButton";

const hrefFor: Record<(typeof adminNavItems)[number]["key"], string> = {
  overview: "/overview",
  kyc: "/kyc",
  ops: "/operations",
  fin: "/finance",
  disp: "/disputes",
};

const badges: Record<string, string> = { kyc: "14", ops: "186", fin: "9", disp: "3" };

export function Sidebar({ user }: { user: { nameAr: string; nameEn: string; mobile: string } | null }) {
  const pathname = usePathname();
  const initials = (user?.nameEn ?? "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="w-[212px] shrink-0 border-e border-divider bg-neutral-100 flex flex-col">
      <div className="px-4 py-4 border-b border-divider">
        <span className="mono text-[10px] bg-accent text-bg px-1.5 py-0.5 tracking-widest">TANAFUS ADMIN</span>
        <div className="mono text-[9.5px] text-ink/50 mt-2">SULTANATE OF OMAN · OPS</div>
        <div className="mt-3">
          <LanguageSwitch />
        </div>
      </div>
      <nav className="flex-1 py-2 flex flex-col">
        {adminNavItems.map((n) => {
          const href = hrefFor[n.key];
          const active = pathname === href;
          return (
            <Link
              key={n.key}
              href={href}
              className={`flex items-center gap-2 px-4 py-2.5 border-s-[3px] ${
                active ? "border-accent bg-bg" : "border-transparent"
              }`}
            >
              <span className={`mono text-[9px] w-6 shrink-0 ${active ? "text-accent-700" : "text-ink/42"}`}>{n.code}</span>
              <span className={`flex-1 text-[12.5px] ${active ? "font-semibold text-ink" : "font-normal text-ink/62"}`}>
                <span className="ar">{n.ar}</span>
                <span className="en">{n.en}</span>
              </span>
              {badges[n.key] && <span className={`mono text-[9.5px] ${active ? "text-accent-700" : "text-ink/42"}`}>{badges[n.key]}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-3 border-t border-divider flex items-center gap-2">
        <div className="mono w-7 h-7 border border-divider flex items-center justify-center text-[10px] font-semibold text-accent-800">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11.5px] font-medium truncate">
            <span className="ar">{user?.nameAr ?? "—"}</span>
            <span className="en">{user?.nameEn ?? "—"}</span>
          </div>
          <div className="mono text-[9px] text-ink/48">{user?.mobile ?? ""}</div>
        </div>
        <SignOutButton />
      </div>
    </div>
  );
}
