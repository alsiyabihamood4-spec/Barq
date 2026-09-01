import { NextResponse } from "next/server";
import { API_URL } from "../../../lib/api";

export const dynamic = "force-dynamic";

/**
 * Dev convenience only: the design bundle has no admin sign-in screen (the
 * console is assumed pre-authenticated ops staff), so this exchanges the
 * seeded admin's mobile for a real JWT from apps/api and stores it in a
 * cookie, exactly the way a real SSO/sign-in step would hand off. Swap this
 * route for real staff auth (SSO, National Digital ID) before production.
 */
export async function GET() {
  const mobile = "+968900000";
  await fetch(`${API_URL}/auth/otp/request`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ mobile }),
  });
  const verifyRes = await fetch(`${API_URL}/auth/otp/verify`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ mobile, code: "482715", role: "client" }),
  });
  if (!verifyRes.ok) {
    return NextResponse.json({ error: "dev_login_failed", message: "Could not reach apps/api — is it running on :4000?" }, { status: 502 });
  }
  const { token } = (await verifyRes.json()) as { token: string };
  const res = NextResponse.redirect(new URL("/overview", process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3000"));
  res.cookies.set("tanafus_admin_token", token, { httpOnly: true, sameSite: "lax", path: "/" });
  return res;
}
