import { cookies } from "next/headers";
import { adminSections, ports } from "@BARQ/i18n";
import { AdminShell } from "../../../components/AdminShell";
import { Blueprint } from "../../../components/Blueprint";
import { StatRow } from "../../../components/StatCard";
import { apiFetch } from "../../../lib/api";
import { ApiUnavailable } from "../../../components/ApiUnavailable";

interface OverviewData {
  activeOperations: number;
  heldInEscrowOmr: number;
  commissionMonthToDateOmr: number;
  pendingKyc: number;
  commissionPct: number;
  splitByPort: { portCode: string; pct: number }[];
  volumeByDay: { date: string; clearance: number; freight: number }[];
  flags: { code: string; ar: string; en: string }[];
}

export default async function OverviewPage() {
  const token = cookies().get("BARQ_admin_token")?.value;
  let data: OverviewData | null = null;
  let error: string | null = null;
  try {
    data = await apiFetch<OverviewData>("/admin/overview", token);
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load overview";
  }

  return (
    <AdminShell title={adminSections.overview} crumb={adminSections.overview.crumb}>
      {error || !data ? (
        <ApiUnavailable detail={error} />
      ) : (
        <>
          <StatRow
            stats={[
              { ar: "عمليات نشطة", en: "ACTIVE OPERATIONS", v: String(data.activeOperations), note: "LIVE" },
              { ar: "محجوز بالضمان", en: "HELD IN ESCROW", v: fmt(data.heldInEscrowOmr), note: "OMR" },
              { ar: "عمولات محصّلة", en: "COMMISSION EARNED", v: fmt(data.commissionMonthToDateOmr), note: "OMR · MONTH TO DATE", accent: true },
              { ar: "طلبات تحقق معلّقة", en: "PENDING KYC", v: String(data.pendingKyc), note: "IN QUEUE" },
            ]}
          />

          <div className="grid grid-cols-[1.35fr_1fr] gap-4 items-start">
            <Blueprint className="p-4">
              <div className="flex items-baseline gap-2.5 mb-3.5">
                <span className="lbl flex-1">
                  <span className="ar">حجم العمليات — 14 يوماً</span>
                  <span className="en">Operations volume — 14 days</span>
                </span>
                <span className="mono text-[10px] text-accent-700">{data.activeOperations} ACTIVE</span>
              </div>
              <div className="flex items-end gap-1 h-[138px]">
                {data.volumeByDay.map((d, i) => {
                  const max = Math.max(1, ...data!.volumeByDay.map((x) => x.clearance + x.freight));
                  const h1 = (d.clearance / max) * 100;
                  const h2 = (d.freight / max) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col justify-end gap-0.5 h-full" title={d.date}>
                      <div className="bg-accent" style={{ height: `${h1}%` }} />
                      <div className="bg-accent-300" style={{ height: `${h2}%` }} />
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-4 mt-3 border-t border-divider pt-2.5">
                <Legend color="bg-accent" ar="تخليص" en="CLEARANCE" />
                <Legend color="bg-accent-300" ar="نقل" en="FREIGHT" />
              </div>
            </Blueprint>

            <div className="flex flex-col gap-4">
              <Blueprint className="p-4">
                <div className="lbl mb-3">
                  <span className="ar">التوزيع حسب المنفذ</span>
                  <span className="en">Split by port</span>
                </div>
                {data.splitByPort.length === 0 && <div className="text-[12px] text-ink/50">No orders yet.</div>}
                {data.splitByPort.map((p) => {
                  const port = ports.find((x) => x.code === p.portCode);
                  return (
                    <div key={p.portCode} className="flex flex-col gap-1 mb-2.5">
                      <div className="flex items-baseline gap-2">
                        <span className="flex-1 text-[12px]">
                          <span className="ar">{port?.ar ?? p.portCode}</span>
                          <span className="en">{port?.en ?? p.portCode}</span>
                        </span>
                        <span className="mono text-[11px] font-medium">{p.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-neutral-200">
                        <div className="h-full bg-accent" style={{ width: `${p.pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </Blueprint>

              <Blueprint accent className="p-4">
                <div className="lbl text-accent-700 mb-2.5">
                  <span className="ar">يحتاج تدخّلاً</span>
                  <span className="en">Needs intervention</span>
                </div>
                {data.flags.length === 0 && <div className="text-[12px] text-accent-800/70">Nothing flagged right now.</div>}
                {data.flags.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 py-1.5 border-b border-accent-400 last:border-b-0">
                    <span className="mono text-[9.5px] text-accent-700 w-[62px] shrink-0">{f.code}</span>
                    <span className="flex-1 text-[12px] text-accent-900">
                      <span className="ar">{f.ar}</span>
                      <span className="en">{f.en}</span>
                    </span>
                  </div>
                ))}
              </Blueprint>
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}

function Legend({ color, ar, en }: { color: string; ar: string; en: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2.5 h-2.5 ${color}`} />
      <span className="mono text-[10px] text-ink/58">
        <span className="ar">{ar}</span>
        <span className="en">{en}</span>
      </span>
    </div>
  );
}

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

