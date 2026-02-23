import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth/jwt";

function makeB64(payload: any) {
  const json = JSON.stringify(payload);
  return Buffer.from(json, "utf-8").toString("base64");
}

function isApiPath(pathname: string) {
  return pathname.startsWith("/api/");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  // اگر توکن نیست:
  if (!token) {
    // API خصوصی => 401
    if (isApiPath(pathname)) {
      const res = NextResponse.json({ ok: false, error: "UNAUTHENTICATED" }, { status: 401 });
      res.headers.set("cache-control", "no-store");
      return res;
    }

    // صفحه خصوصی => redirect به login (با next برای برگشت بعد از login)
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    const res = NextResponse.redirect(loginUrl, { status: 302 });
    res.headers.set("cache-control", "no-store");
    res.headers.set("x-auth-user", "");
    return res;
  }

  // توکن هست، verify
  const payload = await verifyAuthToken(token);

  if (!payload) {
    // توکن نامعتبر/منقضی:
    if (isApiPath(pathname)) {
      const res = NextResponse.json({ ok: false, error: "INVALID_TOKEN" }, { status: 401 });
      // کوکی رو پاک کن تا گیر نکنه
      res.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: "",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
      });
      res.headers.set("cache-control", "no-store");
      return res;
    }

    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);

    const res = NextResponse.redirect(loginUrl, { status: 302 });
    res.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: "",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
    res.headers.set("cache-control", "no-store");
    res.headers.set("x-auth-user", "");
    return res;
  }

  // معتبر => ادامه بده + هدر x-auth-user برای Server Components
  const res = NextResponse.next();
  res.headers.set("x-auth-user", makeB64(payload));
  res.headers.set("cache-control", "no-store");
  return res;
}

// فقط مسیرهای خصوصی
export const config = {
  matcher: ["/dashboard/:path*", "/api/tool-runs/:path*", "/api/auth/me"],
};
