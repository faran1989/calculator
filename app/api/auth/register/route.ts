import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE_NAME, signAuthToken } from "@/lib/auth/jwt";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const BodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).optional(),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`register:${ip}`, { limit: 3, windowMs: 60 * 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "تعداد تلاش‌های ثبت‌نام بیش از حد مجاز است. لطفاً یک ساعت دیگر امتحان کنید." },
      { status: 429 }
    );
  }

  try {
    const body = BodySchema.parse(await req.json());

    const normalizedEmail = body.email.toLowerCase().trim();

    const exists = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (exists) {
      return NextResponse.json(
        { ok: false, error: "این ایمیل قبلاً ثبت شده است." },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(body.password, 12);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashed,
        name: body.name ?? null,
        profile: {
          create: {
            totalToolRuns: 0,
            lastActiveAt: new Date(),
          },
        },
      },
      select: { id: true, email: true },
    });

    const token = await signAuthToken({ userId: user.id, email: user.email });

    const res = NextResponse.json({ ok: true, user });

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
