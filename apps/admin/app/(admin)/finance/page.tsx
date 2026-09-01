import { cookies } from "next/headers";
import { adminSections } from "@tanafus/i18n";
import { AdminShell } from "../../../components/AdminShell";
import { Blueprint } from "../../../components/Blueprint";
import { apiFetch } from "../../../lib/api";
import { ApiUnavailable } from "../../../components/ApiUnavailable";
import { PayoutActions } from "../../../components/PayoutActions";

interface FinanceData {
  heldOmr: number;
  commissionOmr: number;
  payouts: { id: string; amountOmr: number; createdAt: string; provider: { nameAr: string; nameEn: string } }[];
}

export default async function FinancePage() {
  const token = cookies().get("tanafus_admin_token")?.value;
  let data: FinanceData | null = null;
  let error: string | null = null;
  try {
    data = await apiFetch<FinanceData>("/admin/finance", token);
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load the financial centre";
  }

  return (
    <AdminShell title={adminSections.fin} crumb={adminSections.fin.crumb}>
      {error || !data ? (
        <ApiUnavailable detail={error} />
      ) : (
        <div className="grid grid-cols-2 gap-4 items-start">
          <Blueprint className="p-4 flex flex-col gap-3">
            <div className="lbl"><span className="ar">حساب الضمان البنكي</span><span className="en">Escrow bank account</span></div>
            <div className="mono text-[30px] font-semibold leading-none">
              {data.heldOmr.toFixed(3).split(".")[0]}
              <span className="text-[16px]">.{data.heldOmr.toFixed(3).split(".")[1]}</span>
            </div>
            <div className="mono text-[10px] text-ink/50">OMR · BANK MUSCAT · IBAN OM.. 9001</div>
            <div className="flex border border-divider mt-0.5">
              <div className="flex-1 px-2.5 py-2 border-e border-divider">
                <div className="lbl text-[8.5px]"><span className="ar">محجوز</span><span className="en">HELD</span></div>
                <div className="mono text-[14px] font-semibold mt-0.5">{data.heldOmr.toFixed(0)}</div>
              </div>
              <div className="flex-1 px-2.5 py-2">
                <div className="lbl text-[8.5px]"><span className="ar">عمولات</span><span className="en">COMMISSION</span></div>
                <div className="mono text-[14px] font-semibold mt-0.5 text-accent-700">{data.commissionOmr.toFixed(0)}</div>
              </div>
            </div>
          </Blueprint>

          <div className="border border-divider">
            <div className="flex gap-2.5 px-3.5 py-2.5 border-b border-divider bg-neutral-200">
              <span className="lbl flex-1 text-[8.5px]"><span className="ar">طلبات السحب</span><span className="en">WITHDRAWAL REQUESTS</span></span>
              <span className="lbl w-[84px] text-[8.5px]"><span className="ar">المبلغ</span><span className="en">AMOUNT</span></span>
              <span className="lbl w-[96px] text-[8.5px]"><span className="ar">إجراء</span><span className="en">ACTION</span></span>
            </div>
            {data.payouts.length === 0 && <div className="p-4 text-[12px] text-ink/50">No pending withdrawal requests.</div>}
            {data.payouts.map((p) => (
              <div key={p.id} className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-divider last:border-b-0">
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium">
                    <span className="ar">{p.provider.nameAr}</span>
                    <span className="en">{p.provider.nameEn}</span>
                  </div>
                  <div className="mono text-[9.5px] text-ink/48 mt-0.5">{new Date(p.createdAt).toLocaleDateString()}</div>
                </div>
                <span className="mono w-[84px] text-[11.5px] font-semibold">{p.amountOmr.toFixed(3)}</span>
                <PayoutActions id={p.id} />
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminShell>
  );
}
