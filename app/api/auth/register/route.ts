import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { sendVerificationEmail } from "@/lib/email/resend";
import { verifyTurnstile } from "@/lib/captcha";

const BodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  captchaToken: z.string().nullish(),
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

    // ── Captcha verify ────────────────────────────────────────────
    const captchaOk = await verifyTurnstile(body.captchaToken);
    if (!captchaOk) {
      return NextResponse.json(
        { ok: false, error: "تأیید کپچا ناموفق بود. لطفاً دوباره امتحان کنید." },
        { status: 400 }
      );
    }

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
        name: body.name.trim(),
        emailVerified: false,
        profile: {
          create: {
            totalToolRuns: 0,
            lastActiveAt: new Date(),
          },
        },
      },
      select: { id: true, email: true },
    });

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.emailVerification.create({
      data: { userId: user.id, token, expiresAt },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const verifyUrl = `${appUrl}/verify-email?token=${token}`;

    await sendVerificationEmail(user.email, verifyUrl);

    return NextResponse.json({
      ok: true,
      message: "ایمیل تأییدیه ارسال شد. لطفاً صندوق ورودی خود را بررسی کنید.",
    });
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
