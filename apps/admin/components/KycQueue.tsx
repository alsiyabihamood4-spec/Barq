"use client";

import { useState, useTransition } from "react";
import { Blueprint } from "./Blueprint";
import { decideKyc } from "../lib/actions";

export interface KycApplicationDto {
  id: string;
  providerType: "BROKER" | "CARRIER" | "DRIVER";
  status: "PENDING" | "MISSING_DOCS" | "IN_REVIEW" | "APPROVED" | "REJECTED";
  submittedAt: string;
  applicant: { nameAr: string; nameEn: string; mobile: string };
  documents: { key: string; labelAr: string; labelEn: string; uploaded: boolean }[];
  requestedPorts: { code: string }[];
}

export function KycQueue({ applications }: { applications: KycApplicationDto[] }) {
  const [selected, setSelected] = useState(0);
  const [isPending, startTransition] = useTransition();
  const sel = applications[selected];

  if (applications.length === 0) {
    return <div className="border border-divider p-6 text-center text-[13px] text-ink/60">Queue is empty — nothing pending review.</div>;
  }

  return (
    <div className="grid grid-cols-[1.5fr_1fr] gap-4 items-start">
      <div className="border border-divider">
        <div className="flex gap-2.5 px-3.5 py-2.5 border-b border-divider bg-neutral-200">
          <span className="lbl flex-1 text-[8.5px]">
            <span className="ar">مقدّم الطلب</span>
            <span className="en">APPLICANT</span>
          </span>
          <span className="lbl w-[92px] text-[8.5px]">
            <span className="ar">الصفة</span>
            <span className="en">TYPE</span>
          </span>
          <span className="lbl w-[76px] text-[8.5px]">
            <span className="ar">الوثائق</span>
            <span className="en">DOCS</span>
          </span>
          <span className="lbl w-[82px] text-[8.5px]">
            <span className="ar">الحالة</span>
            <span className="en">STATUS</span>
          </span>
        </div>
        {applications.map((a, i) => {
          const doneDocs = a.documents.filter((d) => d.uploaded).length;
          const on = i === selected;
          return (
            <button
              key={a.id}
              onClick={() => setSelected(i)}
              className={`w-full text-start flex items-center gap-2.5 px-3.5 py-2.5 border-b border-divider border-s-[3px] ${
                on ? "border-s-accent bg-accent-100" : "border-s-transparent"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-medium">
                  <span className="ar">{a.applicant.nameAr}</span>
                  <span className="en">{a.applicant.nameEn}</span>
                </div>
                <div className="mono text-[9.5px] text-ink/48 mt-0.5">
                  {a.applicant.mobile} · SUBMITTED {new Date(a.submittedAt).toLocaleDateString()}
                </div>
              </div>
              <span className="mono w-[92px] text-[10.5px]">{a.providerType}</span>
              <span className="mono w-[76px] text-[10.5px]">{doneDocs} / {a.documents.length}</span>
              <span className={`mono w-[82px] text-[9.5px] ${a.status === "IN_REVIEW" ? "text-accent-700" : "text-neutral-700"}`}>
                {a.status === "IN_REVIEW" ? "READY" : a.status}
              </span>
            </button>
          );
        })}
      </div>

      {sel && (
        <Blueprint className="p-4 flex flex-col gap-3.5">
          <div>
            <div className="lbl">
              <span className="ar">تدقيق الطلب</span>
              <span className="en">Review application</span>
            </div>
            <div className="text-[19px] font-semibold tracking-wide mt-1.5">
              <span className="ar">{sel.applicant.nameAr}</span>
              <span className="en">{sel.applicant.nameEn}</span>
            </div>
            <div className="mono text-[10px] text-ink/50 mt-0.5">{sel.applicant.mobile}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {sel.documents.map((d) => (
              <div key={d.key} className="border border-divider p-2.5 flex flex-col gap-1.5">
                <div className="h-14 border border-divider bg-[repeating-linear-gradient(135deg,theme(colors.neutral.300)_0_4px,theme(colors.neutral.100)_4px_8px)]" />
                <div className="text-[11px] leading-tight">
                  <span className="ar">{d.labelAr}</span>
                  <span className="en">{d.labelEn}</span>
                </div>
                <div className={`mono text-[9px] ${d.uploaded ? "text-accent-700" : "text-neutral-700"}`}>
                  {d.uploaded ? "VERIFIED" : "MISSING"}
                </div>
              </div>
            ))}
          </div>
          <div className="border border-divider px-3 py-2.5 flex flex-col gap-1.5">
            <div className="lbl text-[8.5px]">
              <span className="ar">المنافذ المطلوبة</span>
              <span className="en">REQUESTED PORTS</span>
            </div>
            <div className="mono text-[11px]">{sel.requestedPorts.map((p) => p.code).join(", ") || "—"}</div>
          </div>
          <div className="flex gap-2">
            <button
              disabled={isPending}
              onClick={() => startTransition(() => decideKyc(sel.id, true))}
              className="flex-1 bg-accent text-bg py-2.5 text-[12.5px] font-semibold tracking-wide disabled:opacity-50"
            >
              <span className="ar">تفعيل الحساب</span>
              <span className="en">APPROVE</span>
            </button>
            <button
              disabled={isPending}
              onClick={() => startTransition(() => decideKyc(sel.id, false, "Please re-check the flagged document."))}
              className="flex-1 border border-divider py-2.5 text-[12.5px] font-semibold tracking-wide text-neutral-800 disabled:opacity-50"
            >
              <span className="ar">رفض</span>
              <span className="en">REJECT</span>
            </button>
          </div>
        </Blueprint>
      )}
    </div>
  );
}
