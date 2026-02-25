import { NextResponse } from "next/server";
import { generateMathCaptcha } from "@/lib/mathCaptcha";

export async function GET() {
  try {
    const { question, token } = generateMathCaptcha();
    return NextResponse.json({ question, token });
  } catch {
    return NextResponse.json({ error: "خطای داخلی" }, { status: 500 });
  }
}
