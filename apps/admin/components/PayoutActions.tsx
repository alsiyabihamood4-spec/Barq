"use client";

import { useTransition } from "react";
import { payPayout, holdPayout } from "../lib/actions";

export function PayoutActions({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <div className="w-[96px] flex gap-1.5">
      <button
        disabled={isPending}
        onClick={() => startTransition(() => payPayout(id))}
        className="flex-1 text-center bg-accent text-bg py-1.5 text-[10px] font-semibold tracking-wide disabled:opacity-50"
      >
        PAY
      </button>
      <button
        disabled={isPending}
        onClick={() => startTransition(() => holdPayout(id))}
        className="flex-1 text-center border border-divider py-1.5 text-[10px] font-semibold tracking-wide text-neutral-800 disabled:opacity-50"
      >
        HOLD
      </button>
    </div>
  );
}
