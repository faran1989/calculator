/**
 * Cloudflare Turnstile server-side verification
 * Docs: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 *
 * اگر TURNSTILE_SECRET_KEY تنظیم نشده باشه (dev بدون config)، captcha skip می‌شه.
 * اگر تنظیم شده باشه، token اجباری است و باید verify بشه.
 */

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(token: string | undefined | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // اگر secret تنظیم نشده → captcha غیرفعال است، skip کن
  if (!secret) return true;

  // secret تنظیم شده → token اجباری است
  if (!token) return false;

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
