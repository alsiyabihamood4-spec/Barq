import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "../../../../lib/api";

export const dynamic = "force-dynamic";

/**
 * Real admin sign-in: verifies the OTP against apps/api like every other
 * role, then refuses the session unless the account's real role (from the
 * database, not anything the client claimed) is admin. Only accounts
 * seeded/created as ADMIN in Postgres can ever pass this — there is no
 * public admin self-registration path (apps/api's /auth/otp/verify only
 * allows client/broker/carrier/driver for brand-new accounts).
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${API_URL}/auth/otp/verify`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ message: "Invalid code" }));
    return NextResponse.json(data, { status: res.status });
  }
  const { token, user } = (await res.json()) as { token: string; user: { role: string } };
  if (user.role !== "admin") {
    return NextResponse.json({ error: "not_admin", message: "This mobile number is not registered as ops staff." }, { status: 403 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set("BARQ_admin_token", token, { httpOnly: true, sameSite: "lax", path: "/" });
  return response;
}
