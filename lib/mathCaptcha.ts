import { createHmac } from "crypto";

const EXPIRE_MS = 10 * 60 * 1000; // 10 minutes

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set");
  return s;
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function toFarsi(n: number) {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
}

export function generateMathCaptcha(): { question: string; token: string } {
  const ops = ["+", "-", "×"] as const;
  const op = ops[Math.floor(Math.random() * ops.length)];

  let a: number, b: number, answer: number;
  if (op === "+") {
    a = rand(1, 9); b = rand(1, 9);
    answer = a + b;
  } else if (op === "-") {
    a = rand(6, 15); b = rand(1, a - 1);
    answer = a - b;
  } else {
    a = rand(2, 7); b = rand(2, 7);
    answer = a * b;
  }

  const expiresAt = Date.now() + EXPIRE_MS;
  const payload = `${answer}:${expiresAt}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  const token = Buffer.from(`${payload}:${sig}`).toString("base64url");

  return { question: `${toFarsi(a)} ${op} ${toFarsi(b)}`, token };
}

export function verifyMathCaptcha(token: string, answer: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split(":");
    if (parts.length !== 3) return false;
    const [storedAnswer, expiresAtStr, sig] = parts;

    if (Date.now() > Number(expiresAtStr)) return false;

    const payload = `${storedAnswer}:${expiresAtStr}`;
    const expectedSig = createHmac("sha256", secret()).update(payload).digest("hex");
    if (sig !== expectedSig) return false;

    // normalize Persian/Arabic-Indic digits to ASCII
    const normalized = answer.trim().replace(/[۰-۹]/g, (d) =>
      String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))
    );
    return storedAnswer === normalized;
  } catch {
    return false;
  }
}
