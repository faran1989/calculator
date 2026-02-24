import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { sendPasswordResetEmail } from "@/lib/email/resend";

const BodySchema = z.object({
  email: z.string().email(),
});

const SAFE_RESPONSE = {
  ok: true,
  message: "اگر این ایمیل در سیستم ثبت شده باشد، لینک بازیابی رمز ارسال شد.",
};

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`forgot-password:${ip}`, { limit: 3, windowMs: 60 * 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "تعداد تلاش‌ها بیش از حد مجاز است. لطفاً یک ساعت دیگر امتحان کنید." },
      { status: 429 }
    );
  }

  try {
    const body = BodySchema.parse(await req.json());
    const normalizedEmail = body.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true },
    });

    // Always return the same response to prevent user enumeration
    if (!user) {
      return NextResponse.json(SAFE_RESPONSE);
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordReset.create({
      data: { userId: user.id, token, expiresAt },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    await sendPasswordResetEmail(user.email, resetUrl);

    return NextResponse.json(SAFE_RESPONSE);
  } catch (e: any) {
    if (e?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: "ایمیل نامعتبر است." }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "خطای داخلی سرور." }, { status: 500 });
  }
}
