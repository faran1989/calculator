import { Resend } from "resend";

function getResendClient(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY environment variable is not set.");
  return new Resend(key);
}

const FROM_ADDRESS = "تخمینو <noreply@takhmino.com>";

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const resend = getResendClient();

  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "بازیابی رمز عبور تخمینو",
    html: `
<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:Vazirmatn,Tahoma,Arial,sans-serif;direction:rtl">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 16px">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#1e293b;border-radius:20px;border:1px solid rgba(255,255,255,0.08);padding:40px 32px">
          <tr>
            <td>
              <p style="margin:0 0 8px;font-size:22px;font-weight:800;color:#f1f5f9">تخمینو</p>
              <p style="margin:0 0 32px;font-size:14px;color:#94a3b8">پلتفرم سواد مالی</p>

              <p style="margin:0 0 16px;font-size:16px;color:#e2e8f0;line-height:1.7">
                سلام!<br>
                درخواست بازیابی رمز عبور برای حساب شما ثبت شد.<br>
                برای تعیین رمز جدید روی دکمه زیر کلیک کنید.
              </p>

              <div style="text-align:center;margin:32px 0">
                <a href="${resetUrl}"
                   style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:16px;font-weight:700">
                  تعیین رمز جدید
                </a>
              </div>

              <p style="margin:0 0 8px;font-size:12px;color:#64748b;line-height:1.7">
                این لینک تا ۱ ساعت معتبر است.<br>
                اگر درخواست بازیابی نداده‌اید، این ایمیل را نادیده بگیرید.
              </p>

              <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:24px 0">

              <p style="margin:0;font-size:11px;color:#475569">
                در صورت مشکل، این لینک را در مرورگر باز کنید:<br>
                <a href="${resetUrl}" style="color:#3b82f6;word-break:break-all">${resetUrl}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  });
}

export async function sendVerificationEmail(to: string, verifyUrl: string): Promise<void> {
  const resend = getResendClient();

  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "تأیید ایمیل تخمینو",
    html: `
<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:Vazirmatn,Tahoma,Arial,sans-serif;direction:rtl">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 16px">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#1e293b;border-radius:20px;border:1px solid rgba(255,255,255,0.08);padding:40px 32px">
          <tr>
            <td>
              <p style="margin:0 0 8px;font-size:22px;font-weight:800;color:#f1f5f9">تخمینو</p>
              <p style="margin:0 0 32px;font-size:14px;color:#94a3b8">پلتفرم سواد مالی</p>

              <p style="margin:0 0 16px;font-size:16px;color:#e2e8f0;line-height:1.7">
                سلام!<br>
                برای فعال‌سازی حساب کاربری‌تان روی دکمه زیر کلیک کنید.
              </p>

              <div style="text-align:center;margin:32px 0">
                <a href="${verifyUrl}"
                   style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:16px;font-weight:700">
                  تأیید ایمیل
                </a>
              </div>

              <p style="margin:0 0 8px;font-size:12px;color:#64748b;line-height:1.7">
                این لینک تا ۲۴ ساعت معتبر است.<br>
                اگر حساب کاربری نساخته‌اید، این ایمیل را نادیده بگیرید.
              </p>

              <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:24px 0">

              <p style="margin:0;font-size:11px;color:#475569">
                در صورت مشکل، این لینک را در مرورگر باز کنید:<br>
                <a href="${verifyUrl}" style="color:#3b82f6;word-break:break-all">${verifyUrl}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  });
}
