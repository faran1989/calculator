import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE_NAME, signAuthToken } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token || token.length !== 64) {
    return NextResponse.redirect(new URL("/verify-email?error=invalid", req.nextUrl.origin));
  }

  try {
    const verification = await prisma.emailVerification.findUnique({
      where: { token },
      include: { user: { select: { id: true, email: true, emailVerified: true } } },
    });

    if (!verification) {
      return NextResponse.redirect(new URL("/verify-email?error=invalid", req.nextUrl.origin));
    }

    if (verification.usedAt) {
      return NextResponse.redirect(new URL("/verify-email?error=used", req.nextUrl.origin));
    }

    if (verification.expiresAt < new Date()) {
      return NextResponse.redirect(new URL("/verify-email?error=expired", req.nextUrl.origin));
    }

    // Mark token as used + set user as verified (atomic transaction)
    await prisma.$transaction([
      prisma.emailVerification.update({
        where: { id: verification.id },
        data: { usedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: verification.userId },
        data: { emailVerified: true },
      }),
    ]);

    const jwtToken = await signAuthToken({
      userId: verification.user.id,
      email: verification.user.email,
    });

    const res = NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
    res.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: jwtToken,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch {
    return NextResponse.redirect(new URL("/verify-email?error=server", req.nextUrl.origin));
  }
}
