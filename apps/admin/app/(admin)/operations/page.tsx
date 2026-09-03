import { cookies } from "next/headers";
import { adminSections } from "@BARQ/i18n";
import { AdminShell } from "../../../components/AdminShell";
import { apiFetch } from "../../../lib/api";
import { ApiUnavailable } from "../../../components/ApiUnavailable";

interface OrderRow {
  id: string;
  code: string;
  portCode: string;
  stage: string;
  escrowOmr: number;
  client: { nameAr: string; nameEn: string };
  provider: { nameAr: string; nameEn: string };
  tender: { titleAr: string; titleEn: string };
}

const STAGE_LABEL: Record<string, { ar: string; en: string; done: number }> = {
  ASSIGNED: { ar: "تم التعيين", en: "Assigned", done: 1 },
  DECLARATION: { ar: "إعداد البيان", en: "Declaration filing", done: 1 },
  INSPECTION: { ar: "انتظار التفتيش", en: "Awaiting inspection", done: 2 },
  RELEASED: { ar: "تم الفسح", en: "Released", done: 3 },
  IN_TRANSIT: { ar: "في الطريق", en: "In transit", done: 3 },
  DELIVERED: { ar: "تم التسليم", en: "Delivered", done: 4 },
};

export default async function OperationsPage() {
  const token = cookies().get("BARQ_admin_token")?.value;
  let orders: OrderRow[] = [];
  let error: string | null = null;
  try {
    orders = await apiFetch<OrderRow[]>("/admin/ops", token);
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load operations";
  }

  return (
    <AdminShell title={adminSections.ops} crumb={adminSections.ops.crumb}>
      {error ? (
        <ApiUnavailable detail={error} />
      ) : orders.length === 0 ? (
        <div className="border border-divider p-6 text-center text-[13px] text-ink/60">No operations yet — seed the database or create a tender.</div>
      ) : (
        <div className="border border-divider">
          <div className="flex gap-2.5 px-3.5 py-2.5 border-b border-divider bg-neutral-200">
            <span className="lbl w-[88px] text-[8.5px]"><span className="ar">الطلب</span><span className="en">ORDER</span></span>
            <span className="lbl flex-1 text-[8.5px]"><span className="ar">العميل والمزوّد</span><span className="en">CLIENT / PROVIDER</span></span>
            <span className="lbl w-[78px] text-[8.5px]"><span className="ar">المنفذ</span><span className="en">PORT</span></span>
            <span className="lbl w-[150px] text-[8.5px]"><span className="ar">المرحلة</span><span className="en">STAGE</span></span>
            <span className="lbl w-[88px] text-[8.5px]"><span className="ar">الضمان</span><span className="en">ESCROW</span></span>
          </div>
          {orders.map((o) => {
            const stage = STAGE_LABEL[o.stage] ?? { ar: o.stage, en: o.stage, done: 0 };
            return (
              <div key={o.id} className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-divider last:border-b-0">
                <span className="mono w-[88px] text-[10.5px] font-medium">{o.code}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium">
                    <span className="ar">{o.client.nameAr}</span>
                    <span className="en">{o.client.nameEn}</span>
                  </div>
                  <div className="mono text-[9.5px] text-ink/48 mt-0.5">
                    <span className="ar">{o.provider.nameAr}</span>
                    <span className="en">{o.provider.nameEn}</span>
                  </div>
                </div>
                <span className="mono w-[78px] text-[10.5px]">{o.portCode}</span>
                <div className="w-[150px] flex flex-col gap-1">
                  <span className="text-[11px]">
                    <span className="ar">{stage.ar}</span>
                    <span className="en">{stage.en}</span>
                  </span>
                  <div className="flex gap-0.5">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className={`flex-1 h-[3px] ${i < stage.done ? "bg-accent" : "bg-neutral-300"}`} />
                    ))}
                  </div>
                </div>
                <span className="mono w-[88px] text-[11px] font-medium">{o.escrowOmr.toFixed(3)}</span>
              </div>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
