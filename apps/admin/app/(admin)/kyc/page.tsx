import { cookies } from "next/headers";
import { adminSections } from "@BARQ/i18n";
import { AdminShell } from "../../../components/AdminShell";
import { apiFetch } from "../../../lib/api";
import { KycQueue, type KycApplicationDto } from "../../../components/KycQueue";
import { ApiUnavailable } from "../../../components/ApiUnavailable";

export default async function KycPage() {
  const token = cookies().get("BARQ_admin_token")?.value;
  let apps: KycApplicationDto[] = [];
  let error: string | null = null;
  try {
    apps = await apiFetch<KycApplicationDto[]>("/kyc", token);
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load KYC queue";
  }

  return (
    <AdminShell title={adminSections.kyc} crumb={adminSections.kyc.crumb}>
      {error ? <ApiUnavailable detail={error} /> : <KycQueue applications={apps} />}
    </AdminShell>
  );
}
