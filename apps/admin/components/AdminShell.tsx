import type { ReactNode } from "react";
import type { Bi } from "@BARQ/i18n";

export function AdminShell({ title, crumb, children }: { title: Bi; crumb: string; children: ReactNode }) {
  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  return (
    <>
      <div className="flex items-center gap-3.5 px-5 py-3.5 border-b border-divider">
        <div className="flex-1">
          <div className="text-[22px] font-semibold tracking-wide leading-none">
            <span className="ar">{title.ar}</span>
            <span className="en">{title.en}</span>
          </div>
          <div className="mono text-[10px] text-ink/50 mt-1">{crumb}</div>
        </div>
        <div className="border border-divider px-2.5 py-1.5 text-[11.5px] text-ink/55">
          <span className="ar">اليوم · {today}</span>
          <span className="en">Today · {today}</span>
        </div>
        <button className="bg-accent text-bg px-3 py-2 text-[12px] font-semibold tracking-wide">
          <span className="ar">تصدير تقرير</span>
          <span className="en">EXPORT REPORT</span>
        </button>
      </div>
      <div className="flex-1 overflow-auto px-5 py-4 flex flex-col gap-4">{children}</div>
    </>
  );
}
