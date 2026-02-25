/**
 * Cloudflare Turnstile server-side verification
 * Docs: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // اگر secret تنظیم نشده (مثلاً dev بدون config) — رد کن
    console.warn("[captcha] TURNSTILE_SECRET_KEY is not set");
    return false;
  }

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    return data?.success === true;
  } catch {
    return false;
  }
}
