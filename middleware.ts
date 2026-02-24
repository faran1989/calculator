import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth/jwt";

function makeB64(payload: any) {
  const json = JSON.stringify(payload);
  return Buffer.from(json, "utf-8").toString("base64");
}

const PROTECTED_PAGES = ["/dashboard"];
const PROTECTED_APIS  = ["/api/tool-runs", "/api/auth/me", "/api/auth/change-password"];

function isProtectedPage(pathname: string) {
  return PROTECTED_PAGES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}
function isProtectedApi(pathname: string) {
  return PROTECTED_APIS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

const CLEAR_COOKIE = {
  name: AUTH_COOKIE_NAME,
  value: "",
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 0,
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const rawToken = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const payload  = rawToken ? await verifyAuthToken(rawToken) : null;
  const hadBadToken = !!rawToken && !payload;

  // ── بدون توکن معتبر ──────────────────────────────────────────
  if (!payload) {
    if (isProtectedApi(pathname)) {
      const res = NextResponse.json({ ok: false, error: "UNAUTHENTICATED" }, { status: 401 });
      res.headers.set("cache-control", "no-store");
      if (hadBadToken) res.cookies.set(CLEAR_COOKIE);
      return res;
    }

    if (isProtectedPage(pathname)) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", pathname);
      const res = NextResponse.redirect(loginUrl, { status: 302 });
      res.headers.set("cache-control", "no-store");
      if (hadBadToken) res.cookies.set(CLEAR_COOKIE);
      return res;
    }

    // صفحه عمومی — فقط pass through (بدون x-auth-user)
    return NextResponse.next();
  }

  // ── توکن معتبر: x-auth-user رو برای همه صفحات set کن ────────
  const res = NextResponse.next();
  res.headers.set("x-auth-user", makeB64(payload));
  res.headers.set("cache-control", "no-store");
  return res;
}

// همه صفحات و API ها — به جز فایل‌های استاتیک و Next.js internals
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
