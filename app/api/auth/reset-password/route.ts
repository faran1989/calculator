import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const BodySchema = z.object({
  token: z.string().length(64),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = BodySchema.parse(await req.json());

    const reset = await prisma.passwordReset.findUnique({
      where: { token: body.token },
      select: { id: true, userId: true, expiresAt: true, usedAt: true },
    });

    if (!reset) {
      return NextResponse.json({ ok: false, error: "لینک نامعتبر است." }, { status: 400 });
    }
    if (reset.usedAt) {
      return NextResponse.json({ ok: false, error: "این لینک قبلاً استفاده شده است." }, { status: 400 });
    }
    if (reset.expiresAt < new Date()) {
      return NextResponse.json({ ok: false, error: "لینک منقضی شده است. لطفاً دوباره درخواست بازیابی بدهید." }, { status: 400 });
    }

    const hashed = await bcrypt.hash(body.password, 12);

    await prisma.$transaction([
      prisma.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
      prisma.user.update({ where: { id: reset.userId }, data: { password: hashed } }),
    ]);

    return NextResponse.json({ ok: true, message: "رمز عبور با موفقیت تغییر کرد." });
  } catch (e: any) {
    if (e?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: "ورودی نامعتبر است." }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "خطای داخلی سرور." }, { status: 500 });
  }
}
