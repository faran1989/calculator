import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { verifyAuthToken, AUTH_COOKIE_NAME } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma";

const BodySchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function POST(req: NextRequest) {
  // Auth check via cookie
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ ok: false, error: "لطفاً ابتدا وارد شوید." }, { status: 401 });
  }

  const auth = await verifyAuthToken(token);
  if (!auth) {
    return NextResponse.json({ ok: false, error: "جلسه نامعتبر است. لطفاً دوباره وارد شوید." }, { status: 401 });
  }

  try {
    const body = BodySchema.parse(await req.json());

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { password: true },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "کاربر یافت نشد." }, { status: 404 });
    }

    const matches = await bcrypt.compare(body.currentPassword, user.password);
    if (!matches) {
      return NextResponse.json({ ok: false, error: "رمز عبور فعلی اشتباه است." }, { status: 400 });
    }

    const hashed = await bcrypt.hash(body.newPassword, 12);
    await prisma.user.update({ where: { id: auth.userId }, data: { password: hashed } });

    return NextResponse.json({ ok: true, message: "رمز عبور با موفقیت تغییر کرد." });
  } catch (e: any) {
    if (e?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: "ورودی نامعتبر است." }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "خطای داخلی سرور." }, { status: 500 });
  }
}
