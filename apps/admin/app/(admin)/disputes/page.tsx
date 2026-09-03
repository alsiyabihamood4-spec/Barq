import { cookies } from "next/headers";
import { adminSections } from "@BARQ/i18n";
import { AdminShell } from "../../../components/AdminShell";
import { Blueprint } from "../../../components/Blueprint";
import { apiFetch } from "../../../lib/api";
import { ApiUnavailable } from "../../../components/ApiUnavailable";
import { DisputeActions } from "../../../components/DisputeActions";

interface DisputeRow {
  id: string;
  code: string;
  subjectAr: string;
  subjectEn: string;
  meta: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  frozenOmr: number;
  clientClaimAr: string;
  clientClaimEn: string;
  providerResponseAr: string;
  providerResponseEn: string;
  openedAt: string;
}

export default async function DisputesPage() {
  const token = cookies().get("BARQ_admin_token")?.value;
  let disputes: DisputeRow[] = [];
  let error: string | null = null;
  try {
    disputes = await apiFetch<DisputeRow[]>("/disputes", token);
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load disputes";
  }

  const first = disputes[0];

  return (
    <AdminShell title={adminSections.disp} crumb={adminSections.disp.crumb}>
      {error ? (
        <ApiUnavailable detail={error} />
      ) : disputes.length === 0 ? (
        <div className="border border-divider p-6 text-center text-[13px] text-ink/60">
          No open disputes. When a client or provider raises one from an order, it appears here with escrow controls.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 items-start">
          <div className="border border-divider">
            <div className="flex gap-2.5 px-3.5 py-2.5 border-b border-divider bg-neutral-200">
              <span className="lbl w-20 text-[8.5px]"><span className="ar">التذكرة</span><span className="en">TICKET</span></span>
              <span className="lbl flex-1 text-[8.5px]"><span className="ar">الموضوع</span><span className="en">SUBJECT</span></span>
              <span className="lbl w-20 text-[8.5px]"><span className="ar">الأولوية</span><span className="en">PRIORITY</span></span>
            </div>
            {disputes.map((d) => (
              <div key={d.id} className={`flex items-center gap-2.5 px-3.5 py-2.5 border-b border-divider border-s-[3px] last:border-b-0 ${d.priority === "HIGH" ? "border-s-accent" : "border-s-transparent"}`}>
                <span className="mono w-20 text-[10.5px] font-medium">{d.code}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium">
                    <span className="ar">{d.subjectAr}</span>
                    <span className="en">{d.subjectEn}</span>
                  </div>
                  <div className="mono text-[9.5px] text-ink/48 mt-0.5">{d.meta}</div>
                </div>
                <span className={`mono w-20 text-[9.5px] ${d.priority === "HIGH" ? "text-accent-800" : "text-ink/52"}`}>{d.priority}</span>
              </div>
            ))}
          </div>

          {first && (
            <Blueprint className="p-4 flex flex-col gap-3.5">
              <div>
                <div className="lbl"><span className="ar">التحكم في أموال الضمان</span><span className="en">Escrow control</span></div>
                <div className="text-[19px] font-semibold tracking-wide mt-1.5">
                  <span className="ar">{first.code} — {first.subjectAr}</span>
                  <span className="en">{first.code} — {first.subjectEn}</span>
                </div>
                <div className="mono text-[10px] text-ink/50 mt-0.5">{first.meta} · OPENED {new Date(first.openedAt).toLocaleDateString()}</div>
              </div>
              <div className="border border-divider px-3 py-2.5 flex flex-col gap-2">
                <Row ar="المبلغ المجمّد" en="Frozen amount" value={first.frozenOmr.toFixed(3)} mono />
                <Row ar="مطالبة العميل" en="Client claim" value={first.clientClaimAr} valueEn={first.clientClaimEn} />
                <Row ar="ردّ المزوّد" en="Provider response" value={first.providerResponseAr} valueEn={first.providerResponseEn} />
              </div>
              <DisputeActions id={first.id} />
            </Blueprint>
          )}
        </div>
      )}
    </AdminShell>
  );
}

function Row({ ar, en, value, valueEn, mono }: { ar: string; en: string; value: string; valueEn?: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline gap-2 text-[12px]">
      <span className="flex-1 text-ink/60">
        <span className="ar">{ar}</span>
        <span className="en">{en}</span>
      </span>
      {mono ? (
        <span className="mono text-[14px] font-semibold">{value}</span>
      ) : (
        <span className="font-medium">
          <span className="ar">{value}</span>
          <span className="en">{valueEn}</span>
        </span>
      )}
    </div>
  );
}
