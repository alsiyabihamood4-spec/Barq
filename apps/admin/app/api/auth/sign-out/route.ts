import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const response = NextResponse.redirect(new URL("/sign-in", req.url), 303);
  response.cookies.delete("tanafus_admin_token");
  return response;
}
