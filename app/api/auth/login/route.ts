import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE_NAME, signAuthToken } from "@/lib/auth/jwt";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const BodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`login:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "تعداد تلاش‌های ورود بیش از حد مجاز است. لطفاً چند دقیقه صبر کنید." },
      { status: 429 }
    );
  }

  try {
    const body = BodySchema.parse(await req.json());

    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase().trim() },
      select: { id: true, email: true, password: true, emailVerified: true },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "ایمیل یا رمز عبور اشتباه است." },
        { status: 401 }
      );
    }

    const ok = await bcrypt.compare(body.password, user.password);
    if (ok && !user.emailVerified) {
      return NextResponse.json(
        { ok: false, error: "لطفاً ابتدا ایمیل خود را تأیید کنید. لینک تأیید به ایمیل شما ارسال شده است.", code: "EMAIL_NOT_VERIFIED" },
        { status: 403 }
      );
    }
    if (!ok) {
      return NextResponse.json(
        { ok: false, error: "ایمیل یا رمز عبور اشتباه است." },
        { status: 401 }
      );
    }

    const token = await signAuthToken({ userId: user.id, email: user.email });

    const res = NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email },
    });

    res.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (e: any) {
    if (e?.name === "ZodError") {
      return NextResponse.json(
        { ok: false, error: "ورودی نامعتبر است.", details: e?.issues ?? null },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: false, error: "خطای داخلی سرور." },
      { status: 500 }
    );
  }
}
