"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { apiFetch } from "./api";

function token() {
  return cookies().get("BARQ_admin_token")?.value;
}

export async function decideKyc(id: string, approve: boolean, reviewerNote?: string) {
  await apiFetch(`/kyc/${id}/decision`, token(), {
    method: "POST",
    body: JSON.stringify({ approve, reviewerNote }),
  });
  revalidatePath("/kyc");
}

export async function payPayout(id: string) {
  await apiFetch(`/admin/payouts/${id}/pay`, token(), { method: "POST" });
  revalidatePath("/finance");
}

export async function holdPayout(id: string) {
  await apiFetch(`/admin/payouts/${id}/hold`, token(), { method: "POST" });
  revalidatePath("/finance");
}

export async function resolveDispute(id: string, resolution: "release_provider" | "refund_client" | "split") {
  await apiFetch(`/disputes/${id}/resolve`, token(), {
    method: "POST",
    body: JSON.stringify({ resolution }),
  });
  revalidatePath("/disputes");
}
