"use client";

import { useTransition } from "react";
import { resolveDispute } from "../lib/actions";

export function DisputeActions({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <div className="flex flex-col gap-1.5">
      <button
        disabled={isPending}
        onClick={() => startTransition(() => resolveDispute(id, "release_provider"))}
        className="bg-accent text-bg py-2.5 text-[12.5px] font-semibold tracking-wide disabled:opacity-50"
      >
        <span className="ar">تحرير المبلغ للمزوّد</span>
        <span className="en">RELEASE TO PROVIDER</span>
      </button>
      <button
        disabled={isPending}
        onClick={() => startTransition(() => resolveDispute(id, "refund_client"))}
        className="border border-divider py-2.5 text-[12.5px] font-semibold tracking-wide text-accent-800 disabled:opacity-50"
      >
        <span className="ar">استرداد للعميل</span>
        <span className="en">REFUND THE CLIENT</span>
      </button>
      <button
        disabled={isPending}
        onClick={() => startTransition(() => resolveDispute(id, "split"))}
        className="py-2 text-[11.5px] text-ink/55 disabled:opacity-50"
      >
        <span className="ar">تقسيم المبلغ بين الطرفين</span>
        <span className="en">Split between both parties</span>
      </button>
    </div>
  );
}
