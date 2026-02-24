"use client";

// app/(public)/tools/financial-taste/FinancialTasteQuiz.tsx
// فقط منطق کوییز — بدون هدر، فوتر، تب، یا کانتینر تیره
// تمام منطق از FinancialTasteClient.tsx استخراج شده

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, RotateCcw, ChevronLeft } from "lucide-react";

import { QUESTIONS_V1, SECTIONS_V1 } from "./data/financialTaste.questions.v1";
import { runFinancialTasteEngineV1 } from "./engine/financialTaste.engine.v1";
import type { Q32OptionKey } from "./engine/financialTaste.q32.v1";
import { RadarChart } from "./components/RadarChart";
import { AccordionItem } from "./components/Accordion";
import { ssGet, ssRemove, ssSet } from "./lib/storage";
import { toPersianDigits, clamp } from "./lib/format";

/* ─── Types ─── */
type PersistedState = {
  qIndex: number;
  answers: Record<number, number>;
  q32Selected: Q32OptionKey[];
  completed: boolean;
};

const STORAGE_KEY = "takhmino:financial-taste:v1";

/* ─── Profile explanation ─── */
type Explain = { meaning: string; strengths: string[]; risks: string[]; actions: string[] };

function explainByTitle(title: string): Explain {
  const t = (title || "").trim();

  const DIRECT: Record<string, Explain> = {
    "لوکس‌پسند": {
      meaning: "پول برای شما فقط «عدد» نیست؛ کیفیت تجربه، راحتی و لذت نقش پررنگی دارد. اگر مدیریت نشود، خرج‌های هیجانی می‌تواند سرعت رشد مالی را کند کند.",
      strengths: ["انگیزه بالا برای ارتقای کیفیت زندگی", "قدرت تصمیم‌گیری سریع در خریدهای مهم", "توانایی لذت بردن بدون احساس گناه (در حد متعادل)"],
      risks: ["ریزخرج‌های تکرارشونده و نامحسوس", "تصمیم‌های لحظه‌ای تحت تاثیر احساس", "کم‌توجهی به سقف بودجه در دوره‌های پرفشار"],
      actions: ["برای «لذت» یک بودجه ماهانه ثابت تعیین کن (سقف قطعی).", "قبل از خریدهای بزرگ، قانون ۲۴ ساعت مکث را اجرا کن.", "یک هدف سرمایه‌گذاری خودکار (اتومات) تنظیم کن تا خرج، سرمایه‌گذاری را عقب نیندازد."],
    },
    "رقابتی جایگاه‌محور": {
      meaning: "جایگاه اجتماعی و «دیده شدن موفقیت» برای شما مهم است. این تیپ می‌تواند محرک رشد باشد، اما اگر افراطی شود تبدیل به فشار مالی و خریدهای نمایشی می‌شود.",
      strengths: ["انگیزه بالا برای پیشرفت", "هدف‌گذاری جاه‌طلبانه", "توانایی ساخت تصویر حرفه‌ای در کار/جامعه"],
      risks: ["خریدهای نمایشی برای تایید بیرونی", "افزایش هزینه‌های ثابت زندگی", "مقایسه دائمی و فشار روانی"],
      actions: ["بین «خرید برای نیاز» و «خرید برای دیده شدن» برچسب بزن.", "هزینه‌های ثابت را پایین نگه دار (قسط/تعهد بلندمدت).", "موفقیت را با شاخص‌های شخصی بسنج (نه فقط نگاه دیگران)."],
    },
    "ماجراجوی فرصت‌طلب": {
      meaning: "شما جذب فرصت‌ها و رشد سریع هستید و از نوسان کمتر می‌ترسید. اگر چارچوب نداشته باشید، ریسک‌های نامتقارن می‌تواند به ضررهای سنگین منجر شود.",
      strengths: ["تحمل نوسان بالاتر از میانگین", "عملکرد خوب در بازارهای رونددار", "جرأت ورود به فرصت‌های رشد"],
      risks: ["ریسک بیش از حد و عدم مدیریت اندازه موقعیت", "FOMO در موج‌ها", "کم‌توجهی به نقدشوندگی و سناریوهای بد"],
      actions: ["برای هر فرصت، «حداکثر درصد ورود» تعیین کن و قفلش کن.", "قانون تنوع‌بخشی را اجرا کن (یک دارایی نباید سرنوشت را تعیین کند).", "قبل از خرید، سناریوی بد را بنویس: اگر ۳۰٪ افت کند چه می‌کنم؟"],
    },
  };

  if (DIRECT[t]) return DIRECT[t];
  if (t.includes("لوکس")) return DIRECT["لوکس‌پسند"];
  if (t.includes("جایگاه") || t.includes("رقابتی") || t.includes("وضعیت")) return DIRECT["رقابتی جایگاه‌محور"];
  if (t.includes("ماجراجو") || t.includes("فرصت")) return DIRECT["ماجراجوی فرصت‌طلب"];
  if (t.includes("محافظه") || t.includes("محتاط")) {
    return {
      meaning: "اولویت اصلی شما حفظ سرمایه و آرامش ذهنی است. این رویکرد ریسک‌های بزرگ را کم می‌کند، اما اگر افراطی شود ممکن است از فرصت رشد جا بمانید.",
      strengths: ["انضباط بالا", "خطرپذیری کنترل‌شده", "تمرکز روی امنیت مالی"],
      risks: ["ترس از ورود و تعلل", "بازده کمتر در بلندمدت", "پارک‌کردن پول در گزینه‌های کم‌بازده"],
      actions: ["برای رشد، یک سهم کوچک اما ثابت به دارایی‌های رشددهنده اختصاص بده.", "اهداف را بلندمدت‌تر تعریف کن تا تصمیم‌ها کمتر احساسی شوند.", "تنوع بین «امنیت» و «رشد» را حفظ کن (نه صفر/صد)."],
    };
  }
  return {
    meaning: "این تیپ ترکیبی از چند ویژگی است و تفسیر دقیق آن با نگاه به امتیازهای رادار و تیپ‌های فرعی بهتر می‌شود.",
    strengths: ["ترکیب انعطاف‌پذیری و تجربه", "قابلیت یادگیری و تنظیم رفتار"],
    risks: ["عدم ثبات تصمیم در شرایط استرس", "اثرپذیری از موج‌های بازار"],
    actions: ["در یک جمله «هدف پول» را برای خودت تعریف کن.", "برای ریسک، سقف مشخص تعیین کن (حداکثر ریسک مجاز).", "یک برنامه ساده: پس‌انداز خودکار + بودجه لذت + بازبینی ماهانه."],
  };
}

/* ─── Main Quiz Component ─── */
export default function FinancialTasteQuiz() {
  const [qIndex, setQIndex]             = useState(0);
  const [answers, setAnswers]           = useState<Record<number, number>>({});
  const [q32Selected, setQ32Selected]   = useState<Q32OptionKey[]>([]);
  const [completed, setCompleted]       = useState(false);
  const [result, setResult]             = useState<ReturnType<typeof runFinancialTasteEngineV1> | null>(null);

  /* ── Restore from storage ── */
  useEffect(() => {
    const saved = ssGet<PersistedState>(STORAGE_KEY);
    if (!saved) return;
    setQIndex(clamp(saved.qIndex ?? 0, 0, QUESTIONS_V1.length - 1));
    setAnswers(saved.answers ?? {});
    setQ32Selected(saved.q32Selected ?? []);
    setCompleted(!!saved.completed);
    if (saved.completed) {
      const out = runFinancialTasteEngineV1({ answers: saved.answers ?? {}, q32Selected: saved.q32Selected ?? [] });
      setResult(out);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Persist to storage ── */
  useEffect(() => {
    ssSet(STORAGE_KEY, { qIndex, answers, q32Selected, completed } satisfies PersistedState);
  }, [qIndex, answers, q32Selected, completed]);

  const total          = QUESTIONS_V1.length;
  const current        = QUESTIONS_V1[qIndex];
  const currentSection = useMemo(() => SECTIONS_V1.find((s) => s.id === current.sectionId), [current.sectionId]);

  const answeredCount = useMemo(() => {
    const numericAnswered = Object.keys(answers).length;
    const q32Answered     = q32Selected.length > 0 ? 1 : 0;
    return numericAnswered + q32Answered;
  }, [answers, q32Selected]);

  const progress = Math.round((answeredCount / total) * 100);

  function resetAll() {
    setQIndex(0); setAnswers({}); setQ32Selected([]);
    setCompleted(false); setResult(null);
    ssRemove(STORAGE_KEY);
  }

  function goPrev() { setQIndex((i) => Math.max(0, i - 1)); }

  function goNext() {
    if (qIndex < total - 1) { setQIndex((i) => i + 1); return; }
    const out = runFinancialTasteEngineV1({ answers, q32Selected });
    setResult(out); setCompleted(true);
  }

  function answerSingle(id: number, value: number) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    window.setTimeout(() => {
      if (qIndex < total - 1) setQIndex((i) => i + 1);
      else {
        const out = runFinancialTasteEngineV1({ answers: { ...answers, [id]: value }, q32Selected });
        setResult(out); setCompleted(true);
      }
    }, 150);
  }

  function toggleQ32(key: Q32OptionKey) {
    setQ32Selected((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));
  }

  const isAnswered = useMemo(() => {
    if (current.type === "multi") return q32Selected.length > 0;
    return !!answers[current.id];
  }, [current, answers, q32Selected]);

  /* ─── Render ─── */
  return (
    <div dir="rtl" className="space-y-4">

      {/* ── Progress + Reset ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-xs text-slate-500 font-bold whitespace-nowrap shrink-0">پیشرفت</span>
          <div className="flex-1 h-2 rounded-full bg-black/6 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-black text-emerald-600 shrink-0 w-8 text-left">
            {toPersianDigits(progress)}٪
          </span>
        </div>
        {completed && (
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition font-bold shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            شروع مجدد
          </button>
        )}
      </div>

      {/* ── Main Quiz Card ── */}
      <div className="bg-white rounded-3xl border border-black/6 shadow-sm overflow-hidden">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key={`q-${qIndex}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="p-5 md:p-8"
            >
              {/* Question header */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-slate-900 font-black text-lg">
                    سؤال {toPersianDigits(qIndex + 1)} از {toPersianDigits(total)}
                  </div>
                  <div className="text-slate-500 text-sm mt-1">{currentSection?.title}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={qIndex === 0}
                    className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    قبلی
                  </button>
                  {current.type === "multi" && (
                    <button
                      type="button"
                      onClick={goNext}
                      disabled={!isAnswered}
                      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 text-white px-4 py-2 text-sm font-bold hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      ادامه
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Question card */}
              <div className="mt-6 rounded-3xl border border-black/8 bg-slate-50 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-slate-900 font-extrabold text-sm">
                      {toPersianDigits(current.id)}. {current.title}
                    </div>
                    {current.hint && (
                      <div className="mt-2 text-xs text-slate-500 leading-6">{current.hint}</div>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 shrink-0">
                    {current.type === "likert5" ? "۱ تا ۵" : current.type === "multi" ? "چندگزینه‌ای" : "۴ گزینه"}
                  </div>
                </div>

                <div className="mt-4 grid gap-2">
                  {current.type === "multi" ? (
                    (current.options as { key: Q32OptionKey; label: string }[]).map((opt) => {
                      const checked = q32Selected.includes(opt.key);
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => toggleQ32(opt.key)}
                          className={[
                            "w-full text-right rounded-2xl border px-3 py-3 text-sm transition-all",
                            checked
                              ? "border-emerald-300 bg-emerald-50 text-slate-900"
                              : "border-black/10 bg-white hover:bg-slate-50 text-slate-700",
                          ].join(" ")}
                        >
                          <span className="font-bold">{checked ? "✓ " : ""}</span>
                          {opt.label}
                        </button>
                      );
                    })
                  ) : (
                    (current.options as { value: number; label: string }[]).map((opt) => {
                      const selected = answers[current.id] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => answerSingle(current.id, opt.value)}
                          className={[
                            "w-full text-right rounded-2xl border px-3 py-3 text-sm transition-all",
                            selected
                              ? "border-emerald-300 bg-emerald-50 text-slate-900"
                              : "border-black/10 bg-white hover:bg-slate-50 text-slate-700",
                          ].join(" ")}
                        >
                          {opt.label}
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="mt-3 text-xs text-slate-400 leading-6">
                  {current.type === "multi"
                    ? "می‌توانید چند گزینه انتخاب کنید. سپس روی «ادامه» بزنید."
                    : "با انتخاب گزینه، سؤال بعدی خودکار نمایش داده می‌شود."}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="p-5 md:p-8"
            >
              {/* Results header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 text-emerald-700 font-black">
                    <CheckCircle2 className="h-5 w-5" />
                    نتیجه آماده است
                  </div>
                  <div className="mt-2 text-slate-900 font-black text-xl">{result.report.headline}</div>
                  <div className="mt-2 text-slate-600 text-sm leading-7">{result.report.subheadline}</div>
                </div>
                <button
                  type="button"
                  onClick={resetAll}
                  className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition shrink-0"
                >
                  <RotateCcw className="h-4 w-4" />
                  شروع مجدد
                </button>
              </div>

              {/* Charts */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-3xl border border-black/8 bg-slate-50 p-4">
                  <div className="text-slate-900 font-black mb-3">نمودار راداری</div>
                  <RadarChart
                    data={result.report.radarAxes.map((d) => ({ label: d.label, value: d.value }))}
                    height={280}
                  />
                  <div className="mt-3 text-xs text-slate-400">مقیاس ۰ تا ۱۰۰ — هرچه بالاتر، شدت آن ویژگی بیشتر.</div>
                </div>

                <div className="rounded-3xl border border-black/8 bg-slate-50 p-4">
                  <div className="text-slate-900 font-black mb-3">جمع‌بندی تیپ‌ها</div>
                  <div className="text-sm text-slate-700 leading-7">
                    <div>
                      <span className="font-black text-slate-900">تیپ غالب:</span>{" "}
                      {result.profiles.dominant.title} (امتیاز {toPersianDigits(result.profiles.dominant.score)})
                    </div>
                    <div className="mt-1">
                      <span className="font-black text-slate-900">اطمینان:</span>{" "}
                      {result.profiles.confidence === "high" ? "بالا" : result.profiles.confidence === "medium" ? "متوسط" : "کم"}
                    </div>
                    <div className="mt-2">
                      <span className="font-black text-slate-900">تیپ‌های فرعی:</span>
                      <ul className="mt-1 list-disc pr-5">
                        {result.profiles.secondary.map((s) => (
                          <li key={s.title}>{s.title} (امتیاز {toPersianDigits(s.score)})</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dominant profile explanation */}
              {(() => {
                const domTitle = result.profiles.dominant?.title || "";
                const ex = explainByTitle(domTitle);
                return (
                  <div className="mt-6 rounded-3xl border border-black/8 bg-slate-50 p-4">
                    <div className="text-slate-900 font-black mb-2">تیپ شما یعنی چه؟</div>
                    <div className="text-sm text-slate-700 leading-7">
                      <div className="font-black text-slate-900 mb-1">{domTitle}</div>
                      <p className="text-slate-600">{ex.meaning}</p>
                      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="rounded-2xl border border-black/8 bg-white p-3">
                          <div className="font-black text-slate-900 mb-2 text-sm">نقاط قوت</div>
                          <ul className="list-disc pr-5 text-xs text-slate-600 leading-6 space-y-0.5">
                            {ex.strengths.map((s, i) => <li key={i}>{s}</li>)}
                          </ul>
                        </div>
                        <div className="rounded-2xl border border-black/8 bg-white p-3">
                          <div className="font-black text-slate-900 mb-2 text-sm">ریسک‌های رفتاری</div>
                          <ul className="list-disc pr-5 text-xs text-slate-600 leading-6 space-y-0.5">
                            {ex.risks.map((s, i) => <li key={i}>{s}</li>)}
                          </ul>
                        </div>
                        <div className="rounded-2xl border border-black/8 bg-white p-3">
                          <div className="font-black text-slate-900 mb-2 text-sm">اقدام پیشنهادی</div>
                          <ul className="list-disc pr-5 text-xs text-slate-600 leading-6 space-y-0.5">
                            {ex.actions.map((s, i) => <li key={i}>{s}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Strengths & Growth areas */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-3xl border border-black/8 bg-slate-50 p-4">
                  <div className="text-slate-900 font-black mb-3">نقاط قوت</div>
                  <ul className="list-disc pr-5 text-sm text-slate-700 leading-7">
                    {result.report.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div className="rounded-3xl border border-black/8 bg-slate-50 p-4">
                  <div className="text-slate-900 font-black mb-3">نقاط قابل رشد</div>
                  <ul className="list-disc pr-5 text-sm text-slate-700 leading-7">
                    {result.report.growthAreas.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              </div>

              {/* Inline FAQ */}
              <div className="mt-6 rounded-3xl border border-black/8 bg-slate-50 p-4">
                <div className="text-slate-900 font-black mb-3">سوالات پرتکرار</div>
                <AccordionItem title="این نتیجه توصیه سرمایه‌گذاری است؟">
                  خیر. این ابزار برای شناخت الگوی تصمیم‌گیری شماست، نه ارائه توصیه قطعی خرید/فروش.
                </AccordionItem>
                <AccordionItem title="چرا یک سؤال در هر لحظه؟">
                  برای اینکه کاربر خسته نشود و کیفیت پاسخ بالا بماند؛ مخصوصاً در سوالات رفتاری.
                </AccordionItem>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
