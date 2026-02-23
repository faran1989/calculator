// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ ok: false }, { status: 401, headers: { "cache-control": "no-store" } });
  }

  const payload = await verifyAuthToken(token);
  if (!payload) {
    return NextResponse.json({ ok: false }, { status: 401, headers: { "cache-control": "no-store" } });
  }

  // نکته: اطلاعات حداقلی برگردونیم
  return NextResponse.json(
    { ok: true, user: { userId: payload.userId, email: payload.email } },
    { status: 200, headers: { "cache-control": "no-store" } }
  );
}
