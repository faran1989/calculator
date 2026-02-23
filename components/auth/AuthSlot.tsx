"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AuthUser = {
  name?: string | null;
  email?: string | null;
};

type Props = {
  /**
   * وقتی بعداً endpoint /api/me یا session را وصل کردیم،
   * این prop پر می‌شود. فعلاً اگر null/undefined باشد، حالت ورود نمایش داده می‌شود.
   */
  user?: AuthUser | null;

  /**
   * ظاهر دکمه‌ها برای تم روشن/تیره
   */
  variant: "light" | "dark";

  /**
   * اگر خواستی در بعضی صفحات فقط دکمه داشبورد نمایش داده شود (اختیاری)
   */
  compact?: boolean;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function AuthSlot({ user, variant, compact }: Props) {
  const pathname = usePathname();
  const next = encodeURIComponent(pathname || "/");
  const loginHref = `/login?next=${next}`;

  const baseBtn =
    "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold transition active:scale-[0.98]";
  const outlineBtn = cx(
    baseBtn,
    variant === "dark"
      ? "border border-white/15 bg-white/5 text-white hover:bg-white/10"
      : "border border-gray-200 bg-white text-gray-900 hover:bg-gray-50"
  );
  const solidBtn = cx(
    baseBtn,
    variant === "dark"
      ? "bg-white text-gray-950 hover:bg-white/90"
      : "bg-gray-900 text-white hover:bg-gray-800"
  );

  // حالت لاگین نشده
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        {compact ? (
          <Link className={solidBtn} href={loginHref}>
            ورود
          </Link>
        ) : (
          <>
            <Link className={outlineBtn} href={loginHref}>
              ورود
            </Link>
            <Link className={solidBtn} href={loginHref}>
              ثبت‌نام
            </Link>
          </>
        )}
      </div>
    );
  }

  // حالت لاگین شده (فعلاً ساده؛ بعداً می‌تونیم Dropdown حرفه‌ای کنیم)
  const label = user.name || user.email || "حساب کاربری";

  return (
    <div className="flex items-center gap-2">
      <Link className={outlineBtn} href="/dashboard">
        داشبورد
      </Link>

      <div
        className={cx(
          "hidden sm:inline-flex items-center rounded-2xl px-3 py-2 text-sm font-medium",
          variant === "dark" ? "bg-white/5 text-white/90" : "bg-gray-100 text-gray-800"
        )}
        title={label}
      >
        {label}
      </div>

      {/* نکته: logout واقعی شما POST است.
          فعلاً لینک می‌ذاریم؛ مرحله بعدی دقیقاً دکمه POST Logout را اینجا قرار می‌دیم. */}
      <Link className={solidBtn} href="/logout">
        خروج
      </Link>
    </div>
  );
}
