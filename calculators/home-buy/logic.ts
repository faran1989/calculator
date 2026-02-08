export type HomeBuyInputs = {
  P: number; // قیمت خانه
  S: number; // پس‌انداز فعلی
  M: number; // پس‌انداز ماهانه
};

export type HomeBuyResult =
  | { ok: true; months: number; display: string }
  | { ok: false; error: string };

function formatLocked(months: number): string {
  // قانون نمایش قفل‌شده
  if (months < 12) return `حدود ${months} ماه`;
  return `حدود ${Math.ceil(months / 12)} سال`;
}

export function calculateHomeBuyMVP(raw: HomeBuyInputs): HomeBuyResult {
  const { P, S, M } = raw;

  // اعتبارسنجی قفل‌شده
  if (!Number.isFinite(P) || P <= 0) return { ok: false, error: "قیمت خانه باید عددی بزرگ‌تر از ۰ باشد." };
  if (!Number.isFinite(S) || S < 0) return { ok: false, error: "پس‌انداز فعلی باید عددی بزرگ‌تر یا مساوی ۰ باشد." };
  if (!Number.isFinite(M) || M < 0) return { ok: false, error: "پس‌انداز ماهانه باید عددی بزرگ‌تر یا مساوی ۰ باشد." };

  // اگر همین الان پولش رو داری
  if (S >= P) return { ok: true, months: 0, display: "همین الان" };

  // اگر پس‌انداز ماهانه صفره و هنوز کم داری => هرگز
  if (M === 0) return { ok: false, error: "با پس‌انداز ماهانه ۰، در این مدل MVP به قیمت خانه نمی‌رسی." };

  const remaining = P - S;
  const months = Math.ceil(remaining / M);

  return { ok: true, months, display: formatLocked(months) };
}
