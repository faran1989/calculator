// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/jwt";

function clearAuthCookie(res: NextResponse) {
  res.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function GET(req: NextRequest) {
  const redirectTo = new URL("/", req.url);
  const res = NextResponse.redirect(redirectTo, { status: 302 });
  clearAuthCookie(res);
  res.headers.set("cache-control", "no-store");
  return res;
}

export async function POST(req: NextRequest) {
  const redirectTo = new URL("/", req.url);
  const res = NextResponse.redirect(redirectTo, { status: 303 }); // 303 برای POST استانداردتره
  clearAuthCookie(res);
  res.headers.set("cache-control", "no-store");
  return res;
}
