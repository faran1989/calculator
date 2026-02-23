// app/tools/financial-taste/engine/financialTaste.engine.v1.ts
import { FINANCIAL_TASTE_QUESTION_SPECS_V1, type Axis } from "./financialTaste.questionSpecs.v1";
import { computeQ32AxisInjection, applyQ32InjectionToAxes, type Q32OptionKey } from "./financialTaste.q32.v1";

export type AnswersNumeric = Record<number, number>;

export interface FinancialTasteInputV1 {
  answers: AnswersNumeric;
  q32Selected?: Q32OptionKey[];
}

export interface Composite {
  realRisk: number;
  luxury: number;
  defensive: number;
  volatility: number;
  mismatch: number;
}

export type FlagKey =
  | "risk_mismatch"
  | "overconfidence"
  | "fomo_fud"
  | "disposition_effect"
  | "overspending_risk"
  | "anxiety_avoidance";

export interface FlagResult {
  key: FlagKey;
  title: string;
  score: number;
  level: "low" | "medium" | "high";
  reason: string;
  suggestions: string[];
}

export interface RankedProfile {
  key: string;
  title: string;
  score: number;
}

export interface ReportSection {
  title: string;
  bullets?: string[];
  paragraphs?: string[];
}

export interface FinancialTasteReport {
  headline: string;
  subheadline: string;
  radarAxes: { key: Axis; label: string; value: number }[];
  strengths: string[];
  growthAreas: string[];
  flags: FlagResult[];
  actionPlan: ReportSection[];
  suggestedTools: { title: string; href: string; why: string }[];
}

export interface FinancialTasteOutputV1 {
  axes: Record<Axis, number>;
  composite: Composite;
  profiles: {
    dominant: RankedProfile;
    secondary: RankedProfile[];
    confidence: "high" | "medium" | "low";
    scored: RankedProfile[];
  };
  flags: {
    all: FlagResult[];
    highlighted: FlagResult[];
  };
  report: FinancialTasteReport;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function answerToUnit(raw: number, scale: 4 | 5, reverse?: boolean) {
  const unit = (raw - 1) / (scale - 1);
  return reverse ? 1 - unit : unit;
}

function computeBaseAxes(answers: AnswersNumeric): Record<Axis, number> {
  const sum: Partial<Record<Axis, number>> = {};
  const wsum: Partial<Record<Axis, number>> = {};

  for (const spec of FINANCIAL_TASTE_QUESTION_SPECS_V1) {
    const raw = answers[spec.id];
    if (!raw) continue;

    const safeRaw = clamp(raw, 1, spec.scale);
    const unit = answerToUnit(safeRaw, spec.scale, spec.reverse);

    for (const [axis, w] of Object.entries(spec.axisWeights) as [Axis, number][]) {
      sum[axis] = (sum[axis] ?? 0) + unit * w;
      wsum[axis] = (wsum[axis] ?? 0) + w;
    }
  }

  const allAxes: Axis[] = [
    "risk_capacity",
    "risk_tolerance",
    "spending_taste",
    "behavioral_bias",
    "money_avoidance",
    "money_worship",
    "money_status",
    "money_vigilance",
    "money_motivation",
  ];

  const axes = {} as Record<Axis, number>;
  for (const a of allAxes) {
    const denom = wsum[a] ?? 0;
    axes[a] = denom <= 0 ? 50 : clamp(Math.round(((sum[a] ?? 0) / denom) * 100), 0, 100);
  }
  return axes;
}

function computeComposite(axes: Record<Axis, number>): Composite {
  const realRisk = Math.round((axes.risk_capacity + axes.risk_tolerance) / 2);

  const luxury = clamp(
    Math.round(0.45 * axes.spending_taste + 0.30 * axes.money_status + 0.25 * axes.money_worship),
    0, 100
  );

  const defensive = clamp(
    Math.round(0.55 * axes.money_vigilance + 0.45 * axes.money_avoidance),
    0, 100
  );

  const volatility = clamp(
    Math.round(0.55 * axes.behavioral_bias + 0.25 * axes.risk_tolerance + 0.20 * (100 - axes.money_vigilance)),
    0, 100
  );

  const mismatch = clamp(Math.round(Math.abs(axes.risk_capacity - axes.risk_tolerance) * 1.2), 0, 100);

  return { realRisk, luxury, defensive, volatility, mismatch };
}

// Profiles
type ProfileSpec = { key: string; title: string; weights: Partial<Record<Axis, number>>; bias?: number };

const PROFILE_SPECS_V1: ProfileSpec[] = [
  { key: "security_guardian", title: "محافظ امنیت", weights: { money_vigilance: 1.2, money_avoidance: 0.6, risk_tolerance: -0.8, risk_capacity: -0.4, spending_taste: -0.4, behavioral_bias: -0.2 } },
  { key: "rational_strategist", title: "استراتژیست منطقی", weights: { risk_capacity: 0.9, money_vigilance: 0.7, behavioral_bias: -0.6, risk_tolerance: 0.4, spending_taste: -0.2 } },
  { key: "opportunistic_adventurer", title: "ماجراجوی فرصت‌طلب", weights: { risk_tolerance: 1.1, risk_capacity: 0.6, money_worship: 0.4, money_status: 0.3, behavioral_bias: 0.3, money_vigilance: -0.3 } },
  { key: "impulsive_thrillseeker", title: "هیجانیِ پرریسک", weights: { risk_tolerance: 1.0, behavioral_bias: 1.0, risk_capacity: -0.4, money_worship: 0.4, money_vigilance: -0.6 } },
  { key: "luxury_enthusiast", title: "لوکس‌پسند", weights: { spending_taste: 1.1, money_status: 0.9, money_worship: 0.7, money_vigilance: -0.4, risk_tolerance: 0.2 } },
  { key: "status_competitor", title: "رقابتیِ جایگاه‌محور", weights: { money_status: 1.2, money_worship: 0.6, spending_taste: 0.6, behavioral_bias: 0.3, money_vigilance: -0.4 } },
  { key: "anxious_saver", title: "پس‌اندازگرِ مضطرب", weights: { money_avoidance: 1.0, money_vigilance: 0.8, risk_tolerance: -0.7, behavioral_bias: 0.2, spending_taste: -0.5 } },
  { key: "balanced_pragmatist", title: "عمل‌گرا و متعادل", weights: { behavioral_bias: -0.5, money_vigilance: 0.4, risk_tolerance: 0.3, risk_capacity: 0.3, spending_taste: 0.2 } },
];

function scoreProfile(axes: Record<Axis, number>, p: ProfileSpec) {
  let s = 0;
  let ws = 0;
  for (const [axis, w] of Object.entries(p.weights) as [Axis, number][]) {
    s += axes[axis] * w;
    ws += Math.abs(w);
  }
  const base = ws ? s / ws : 0;
  return clamp(Math.round(base + (p.bias ?? 0)), 0, 100);
}

function rankProfiles(axes: Record<Axis, number>) {
  const scored: RankedProfile[] = PROFILE_SPECS_V1
    .map((p) => ({ key: p.key, title: p.title, score: scoreProfile(axes, p) }))
    .sort((a, b) => b.score - a.score);

  const dominant = scored[0];
  const secondary = scored.slice(1, 3);

  const gap = (dominant?.score ?? 0) - (secondary[0]?.score ?? 0);
  const confidence: "high" | "medium" | "low" = gap >= 12 ? "high" : gap >= 6 ? "medium" : "low";

  return { dominant, secondary, confidence, scored };
}

// Flags
function to100From4(raw: number) {
  return clamp(Math.round(((raw - 1) / 3) * 100), 0, 100);
}

function flagRiskMismatch(c: Composite): FlagResult {
  const score = c.mismatch;
  const level = score >= 60 ? "high" : score >= 35 ? "medium" : "low";
  return {
    key: "risk_mismatch",
    title: "عدم‌تناسب تحمل و ظرفیت ریسک",
    score,
    level,
    reason: level === "low" ? "تحمل و ظرفیت ریسک شما نسبتاً همخوان است." : "بین تحمل ریسک روانی و ظرفیت واقعی ریسک شما فاصله معناداری دیده می‌شود.",
    suggestions: [
      "اگر تحمل ریسک بالاست ولی ظرفیت پایین: اندازه موقعیت‌ها را کوچک‌تر کنید و صندوق اضطراری را تقویت کنید.",
      "اگر ظرفیت بالاست ولی تحمل پایین: با سبد کم‌نوسان‌تر شروع کنید و مرحله‌ای ریسک را افزایش دهید.",
    ],
  };
}

function flagOverconfidence(answers: AnswersNumeric, axes: Record<Axis, number>): FlagResult {
  const q16 = answers[16] ?? 0;
  const q8 = answers[8] ?? 0;

  const self = q16 ? to100From4(clamp(q16, 1, 4)) : 0;
  const allocation = q8 ? to100From4(clamp(q8, 1, 4)) : 0;

  const score = clamp(Math.round(0.45 * self + 0.35 * allocation + 0.20 * axes.risk_tolerance), 0, 100);
  const level = score >= 70 ? "high" : score >= 45 ? "medium" : "low";

  return {
    key: "overconfidence",
    title: "ریسک اعتمادبه‌نفس بیش از حد",
    score,
    level,
    reason: level === "high" ? "ترکیب اعتمادبه‌نفس بالا و تمایل به وارد کردن درصد زیاد سرمایه می‌تواند باعث ریسک‌های غیرضروری شود." : "سطح اعتمادبه‌نفس شما در محدوده قابل کنترل است.",
    suggestions: ["برای هر تصمیم سقف ریسک تعریف کنید (مثلاً ۱–۲٪ کل سرمایه در هر معامله).", "قبل از ورود، سناریوی ضرر و حد خروج را از قبل بنویسید."],
  };
}

function flagFomoFud(answers: AnswersNumeric): FlagResult {
  const q31 = answers[31] ?? 0; // گزینه 1=زیاد
  const q15 = answers[15] ?? 0; // گزینه 1=زیاد
  const q14 = answers[14] ?? 0; // گزینه 4=trend

  const emotional = q31 ? (100 - to100From4(clamp(q31, 1, 4))) : 0;
  const social = q15 ? (100 - to100From4(clamp(q15, 1, 4))) : 0;
  const trend = q14 ? to100From4(clamp(q14, 1, 4)) : 0;

  const score = clamp(Math.round(0.55 * emotional + 0.25 * social + 0.20 * trend), 0, 100);
  const level = score >= 70 ? "high" : score >= 45 ? "medium" : "low";

  return {
    key: "fomo_fud",
    title: "ریسک تصمیم‌گیری احساسی (FOMO/FUD)",
    score,
    level,
    reason: level === "high" ? "نشانه‌هایی از تاثیرپذیری از هیجان بازار و تصمیم‌های عجولانه دیده می‌شود." : "ریسک تصمیم‌گیری احساسی شما در محدوده کنترل‌شده است.",
    suggestions: ["قانون ۲۴ ساعت: تصمیم خرید/فروش را یک روز عقب بیندازید مگر طبق پلن.", "مصرف شبکه‌های اجتماعی را محدود کنید و فقط بعد از تحلیل شخصی اقدام کنید."],
  };
}

function flagDisposition(answers: AnswersNumeric): FlagResult {
  const q14 = answers[14] ?? 0;
  const q13 = answers[13] ?? 0;
  const q30 = answers[30] ?? 0;

  const win = q14 ? (q14 === 1 ? 100 : q14 === 2 ? 40 : q14 === 3 ? 30 : 70) : 0;
  const loss = q13 ? (q13 === 2 ? 85 : q13 === 3 ? 75 : q13 === 4 ? 55 : 45) : 0;
  const win2 = q30 ? (q30 === 1 ? 100 : q30 === 2 ? 40 : q30 === 3 ? 30 : 75) : 0;

  const score = clamp(Math.round(0.40 * win + 0.35 * loss + 0.25 * win2), 0, 100);
  const level = score >= 70 ? "high" : score >= 45 ? "medium" : "low";

  return {
    key: "disposition_effect",
    title: "سوگیری نگه‌داشتن ضرر و قفل کردن سود (Disposition Effect)",
    score,
    level,
    reason: level === "high" ? "الگوی «سریع سود را می‌گیرم، ضرر را نگه می‌دارم» می‌تواند بازده بلندمدت را کاهش دهد." : "نشانه‌های سوگیری disposition در حد کنترل‌شده است.",
    suggestions: ["قواعد خروج از پیش تعریف‌شده داشته باشید (حد ضرر/حد سود یا زمان‌محور).", "اگر تحلیل عوض شد، خروج کنید—even اگر در ضرر هستید."],
  };
}

function flagOverspending(axes: Record<Axis, number>): FlagResult {
  const base = Math.round(0.45 * axes.spending_taste + 0.30 * axes.money_worship + 0.25 * axes.money_status);
  const amplifier = Math.round((100 - axes.money_vigilance) * 0.25);
  const score = clamp(base + amplifier, 0, 100);

  const level = score >= 70 ? "high" : score >= 45 ? "medium" : "low";
  return {
    key: "overspending_risk",
    title: "ریسک خرج‌کردن هیجانی/افراطی",
    score,
    level,
    reason: level === "high" ? "گرایش به خرج‌کردن برای لذت/جایگاه همراه با کنترل مالی پایین‌تر دیده می‌شود." : "ریسک خرج‌کردن افراطی شما پایین تا متوسط است.",
    suggestions: ["بودجه لذت ماهانه تعیین کنید و از آن فراتر نروید.", "قبل از خریدهای بزرگ، قانون «۳ روز فکر کردن» را اجرا کنید."],
  };
}

function flagAnxietyAvoidance(axes: Record<Axis, number>): FlagResult {
  const score = clamp(Math.round(0.55 * axes.money_avoidance + 0.25 * (100 - axes.risk_tolerance) + 0.20 * axes.money_vigilance), 0, 100);
  const level = score >= 70 ? "high" : score >= 45 ? "medium" : "low";
  return {
    key: "anxiety_avoidance",
    title: "اضطراب/اجتناب مالی",
    score,
    level,
    reason: level === "high" ? "نشانه‌هایی از اضطراب مالی یا تمایل به اجتناب از تصمیم‌های مالی دیده می‌شود." : "سطح اضطراب/اجتناب مالی شما در محدوده قابل مدیریت است.",
    suggestions: ["تصمیم‌ها را خرد کنید: به جای یک تصمیم بزرگ، چند تصمیم کوچک بگیرید.", "از چک‌لیست ساده (هدف/ریسک/پلن خروج) برای کاهش اضطراب استفاده کنید."],
  };
}

export const AXIS_LABELS: Record<Axis, string> = {
  risk_capacity: "ظرفیت ریسک",
  risk_tolerance: "تحمل ریسک",
  spending_taste: "سبک خرج‌کردن",
  behavioral_bias: "سوگیری رفتاری",
  money_avoidance: "پرهیز از پول",
  money_worship: "پرستش پول",
  money_status: "پول و جایگاه",
  money_vigilance: "هوشیاری مالی",
  money_motivation: "انگیزه پول",
};

const PROFILE_COPY: Record<string, { intro: string; strengths: string[]; growth: string[] }> = {
  security_guardian: { intro: "امنیت و کنترل برای شما اولویت دارد.", strengths: ["پس‌انداز و کنترل خرج", "احتیاط منطقی"], growth: ["ریسک عقب‌ماندن از رشد بلندمدت", "نیاز به سبد مرحله‌ای"] },
  rational_strategist: { intro: "تصمیم‌ها بیشتر مبتنی بر تحلیل و برنامه‌ریزی است.", strengths: ["تصمیم‌گیری منطقی", "تعادل رشد/امنیت"], growth: ["گاهی اقدام دیرهنگام", "نیاز به ساده‌سازی تصمیم"] },
  opportunistic_adventurer: { intro: "به فرصت‌های رشد علاقه دارید و با نوسان کنار می‌آیید.", strengths: ["پذیرش ریسک برای رشد", "انعطاف"], growth: ["ریسک هیجان بازار", "نیاز به قواعد مدیریت ریسک"] },
  impulsive_thrillseeker: { intro: "ریسک‌پذیری بالا و امکان تصمیم هیجانی.", strengths: ["جرئت اقدام", "تحمل نوسان"], growth: ["ضررهای غیرضروری", "نیاز به پلن خروج"] },
  luxury_enthusiast: { intro: "کیفیت و تجربه برای شما مهم است.", strengths: ["انگیزه رشد درآمد", "حساسیت به کیفیت"], growth: ["ریسک overspending", "نیاز به بودجه لذت"] },
  status_competitor: { intro: "تصویر اجتماعی روی تصمیم‌های مالی اثر دارد.", strengths: ["انگیزه پیشرفت", "هدف‌گذاری بلندپروازانه"], growth: ["ریسک خرید نمایشی", "تفکیک ارزش شخصی از دارایی"] },
  anxious_saver: { intro: "احتیاط بالا و امکان دغدغه مالی.", strengths: ["کنترل بالا", "پرهیز از عجله"], growth: ["اجتناب از تصمیم لازم", "قدم‌به‌قدم سرمایه‌گذاری"] },
  balanced_pragmatist: { intro: "نگاه عمل‌گرایانه و متعادل.", strengths: ["تعادل", "سازگاری"], growth: ["نیاز به مقصد مالی روشن‌تر"] },
};

function headlineFor(title: string, c: Composite) {
  return c.mismatch >= 60 ? `ذائقه مالی شما: ${title} (با عدم‌تناسب ریسک)` : `ذائقه مالی شما: ${title}`;
}

function subheadlineFor(c: Composite) {
  if (c.realRisk >= 70 && c.volatility >= 60) return "ریسک‌پذیری بالا دارید؛ کنترل هیجان کلید عملکرد شماست.";
  if (c.defensive >= 70) return "امنیت مالی برای شما اولویت است؛ با برنامه می‌توانید رشد را هم اضافه کنید.";
  if (c.luxury >= 70) return "سبک خرج‌کردن شما گرایش به تجربه و کیفیت دارد؛ بودجه‌بندی تعادل ایجاد می‌کند.";
  return "الگوی شما متعادل است؛ با چند اصلاح کوچک می‌توانید نتیجه‌ها را بهتر کنید.";
}

function deriveStrengthsGrowth(axes: Record<Axis, number>) {
  const strengths: string[] = [];
  const growth: string[] = [];

  const strengthText: Partial<Record<Axis, string>> = {
    money_vigilance: "هوشیاری مالی و توجه به پس‌انداز در شما بالاست.",
    risk_capacity: "ظرفیت ریسک شما برای تصمیم‌های بلندمدت مناسب است.",
    risk_tolerance: "تحمل نوسان شما خوب است.",
    behavioral_bias: "کمتر تحت تاثیر هیجان تصمیم می‌گیرید.",
  };

  const growthText: Partial<Record<Axis, string>> = {
    money_vigilance: "نظم مالی و بودجه‌بندی را قوی‌تر کنید.",
    risk_tolerance: "برای نوسان، سبد کم‌نوسان‌تر بچینید.",
    behavioral_bias: "قواعد ثابت تصمیم‌گیری را اجرا کنید.",
    money_avoidance: "اجتناب مالی را به تصمیم‌های کوچک تبدیل کنید.",
  };

  for (const [k, v] of Object.entries(axes) as [Axis, number][]) {
    if (v >= 70 && strengthText[k]) strengths.push(strengthText[k]!);
    if (v <= 35 && growthText[k]) growth.push(growthText[k]!);
  }

  return { strengths, growth };
}

function actionPlanFromFlags(highlighted: FlagResult[]): ReportSection[] {
  const plan: ReportSection[] = [];
  for (const f of highlighted.slice(0, 3)) {
    plan.push({ title: `اقدام پیشنهادی برای: ${f.title}`, paragraphs: [f.reason], bullets: f.suggestions });
  }
  if (!plan.length) {
    plan.push({
      title: "برنامه اقدام پیشنهادی",
      bullets: ["یک هدف مالی ۳ ماهه تعیین کنید.", "بودجه را ساده کنید (پس‌انداز/ثابت/لذت).", "برای سرمایه‌گذاری پلن خروج بنویسید."],
    });
  }
  return plan;
}

function suggestedTools(c: Composite, highlighted: FlagResult[]) {
  const tools: { title: string; href: string; why: string }[] = [];
  if (c.defensive >= 65) tools.push({ title: "ماشین‌حساب صندوق اضطراری", href: "/tools/emergency-fund", why: "برای تقویت امنیت مالی و کاهش اضطراب." });
  if (c.luxury >= 65) tools.push({ title: "ماشین‌حساب بودجه‌بندی ماهانه", href: "/tools/budget", why: "برای کنترل خرج‌کردن و حفظ تعادل." });
  if (highlighted.some((f) => f.key === "risk_mismatch")) tools.push({ title: "سنجش آگاهی مالی (تطبیقی)", href: "/tools/financial-literacy", why: "برای کاهش خطاهای ریسکی و تصمیم بهتر." });
  return tools.slice(0, 3);
}

export function runFinancialTasteEngineV1(input: FinancialTasteInputV1): FinancialTasteOutputV1 {
  const answers = input.answers ?? {};
  const q32Selected = input.q32Selected ?? [];

  const baseAxes = computeBaseAxes(answers);
  const injection = computeQ32AxisInjection(q32Selected);
  const axes = applyQ32InjectionToAxes(baseAxes, injection as any, { alpha: 0.25 }) as any;

  const composite = computeComposite(axes);
  const profiles = rankProfiles(axes);

  const allFlags: FlagResult[] = [
    flagRiskMismatch(composite),
    flagOverconfidence(answers, axes),
    flagFomoFud(answers),
    flagDisposition(answers),
    flagOverspending(axes),
    flagAnxietyAvoidance(axes),
  ];

  const highlighted = allFlags.filter((f) => f.level !== "low").sort((a, b) => b.score - a.score);

  const dominantCopy = PROFILE_COPY[profiles.dominant.key] ?? { intro: "", strengths: [], growth: [] };
  const derived = deriveStrengthsGrowth(axes);

  const report: FinancialTasteReport = {
    headline: headlineFor(profiles.dominant.title, composite),
    subheadline: subheadlineFor(composite),
    radarAxes: (Object.keys(AXIS_LABELS) as Axis[]).map((k) => ({ key: k, label: AXIS_LABELS[k], value: axes[k] })),
    strengths: [...dominantCopy.strengths, ...derived.strengths].slice(0, 6),
    growthAreas: [...dominantCopy.growth, ...derived.growth, ...highlighted.map((f) => `مراقب باشید: ${f.title}`)].slice(0, 6),
    flags: highlighted,
    actionPlan: actionPlanFromFlags(highlighted),
    suggestedTools: suggestedTools(composite, highlighted),
  };

  return {
    axes,
    composite,
    profiles,
    flags: { all: allFlags, highlighted },
    report,
  };
}
