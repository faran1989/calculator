"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { calculateHomeBuyMVP } from "@/calculators/home-buy/logic";

function formatWithCommas(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return "";
  const n = Number(digits);
  if (!Number.isFinite(n)) return "";
  return n.toLocaleString("en-US");
}

function parseCommaNumber(value: string) {
  const n = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function toman(n: number) {
  return n.toLocaleString("en-US") + " تومان";
}

function extractYears(display: string): number | null {
  if (!display) return null;
  if (display.includes("هرگز")) return null;
  if (display.includes("همین")) return 0;

  const m = display.match(/(\d+)/);
  if (!m) return null;

  const n = Number(m[1]);
  if (!Number.isFinite(n)) return null;

  if (display.includes("سال")) return n;
  if (display.includes("ماه")) return Math.ceil(n / 12);

  return null;
}

type ResultTone = "normal" | "warning" | "success";

type ResultState = {
  tone: ResultTone;
  text: string;
  warning?: string | null;
  helper?: { shortage: number; monthly: number } | null;
};

function buildShareShort(params: { resultText: string }) {
  const url = typeof window !== "undefined" ? window.location.href : "";
  return [params.resultText, url ? `لینک: ${url}` : ""].filter(Boolean).join("\n");
}

function buildShareDetailed(params: {
  P: number;
  S: number;
  M: number;
  resultText: string;
}) {
  const url = typeof window !== "undefined" ? window.location.href : "";
  return [
    params.resultText,
    "",
    `قیمت خانه: ${toman(params.P)}`,
    `پس‌انداز فعلی: ${toman(params.S)}`,
    `پس‌انداز ماهانه: ${toman(params.M)}`,
    "(اگر شرایط فعلی تغییر نکند)",
    url ? `لینک: ${url}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export default function HomeBuyPage() {
  const [price, setPrice] = useState("");
  const [savings, setSavings] = useState("");
  const [monthly, setMonthly] = useState("");

  const [result, setResult] = useState<ResultState | null>(null);

  const [shareMode, setShareMode] = useState<"short" | "detailed">("short");
  const [copied, setCopied] = useState(false);

  const priceRef = useRef<HTMLInputElement | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  const numbers = useMemo(() => {
    return {
      P: parseCommaNumber(price),
      S: parseCommaNumber(savings),
      M: parseCommaNumber(monthly),
    };
  }, [price, savings, monthly]);

  function scrollToResult() {
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function blurActiveElement() {
    const el = document.activeElement as HTMLElement | null;
    el?.blur?.();
  }

  function handleCalculate() {
    setCopied(false);

    // ✅ Edge Case #1: قیمت خانه باید > 0 باشد (قفل MVP)
    if (numbers.P <= 0) {
      setResult({
        tone: "warning",
        text: "⚠️ قیمت خانه باید بزرگ‌تر از صفر باشد.",
        warning: null,
        helper: null,
      });
      blurActiveElement();
      scrollToResult();
      return;
    }

    // از اینجا به بعد، اجازه می‌دهیم MVP با هر ترکیب ورودی کار کند
    // (اگر فقط قیمت وارد شود، نتیجه به شکل انسانی می‌گوید بدون پس‌انداز ماهانه ممکن نیست.)

    const output = calculateHomeBuyMVP(numbers);

    const display =
      typeof output === "string"
        ? output
        : typeof output === "object" && output && "display" in output
          ? String((output as any).display)
          : "";

    // Helper (دو خطی) — فقط وقتی قیمت معتبر است
    const shortage = Math.max(numbers.P - numbers.S, 0);
    const helper =
      numbers.P > 0 && (shortage > 0 || numbers.M === 0)
        ? { shortage, monthly: numbers.M }
        : null;

    // Edge case: همین الان
    if (numbers.S >= numbers.P && numbers.P > 0) {
      setResult({
        tone: "success",
        text: "🎉 شما همین حالا می‌توانید صاحب‌خانه شوید.",
        warning: null,
        helper: null,
      });
      blurActiveElement();
      scrollToResult();
      return;
    }

    // Edge case: غیرممکن (M=0 و کمبود)
    if (numbers.M === 0 && numbers.P > numbers.S) {
      setResult({
        tone: "warning",
        text: "⚠️ بدون پس‌انداز ماهانه، خرید خانه ممکن نیست.",
        warning: null,
        helper,
      });
      blurActiveElement();
      scrollToResult();
      return;
    }

    const years = extractYears(display);

    // Cap خیلی بزرگ‌ها
    if (years !== null && years > 100) {
      setResult({
        tone: "normal",
        text: "اگر شرایط فعلی تغییر نکند، خرید خانه بیش از ۱۰۰ سال زمان می‌برد.",
        warning:
          "این هدف با پس‌انداز ماهانه فعلی خیلی دور است. پیشنهاد: پس‌انداز ماهانه را بیشتر کنید یا قیمت هدف را پایین‌تر بگذارید.",
        helper,
      });
      blurActiveElement();
      scrollToResult();
      return;
    }

    setResult({
      tone: "normal",
      text: `اگر شرایط فعلی تغییر نکند، ${display} طول می‌کشد که شما صاحب‌خانه شوید.`,
      warning:
        years !== null && years > 50
          ? "این هدف با پس‌انداز ماهانه فعلی دور است. افزایش پس‌انداز ماهانه می‌تواند زمان را کاهش دهد."
          : null,
      helper,
    });

    blurActiveElement();
    scrollToResult();
  }

  function handleReset() {
    setPrice("");
    setSavings("");
    setMonthly("");
    setResult(null);
    setShareMode("short");
    setCopied(false);

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      priceRef.current?.focus();
    }, 50);
  }

  const shareText = useMemo(() => {
    if (!result) return "";
    if (shareMode === "short") {
      return buildShareShort({ resultText: result.text });
    }
    return buildShareDetailed({
      P: numbers.P,
      S: numbers.S,
      M: numbers.M,
      resultText: result.text,
    });
  }, [result, shareMode, numbers.P, numbers.S, numbers.M]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
      alert("کپی ناموفق بود ❌");
    }
  }

  async function handleShare() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const navAny: any = navigator as any;

    if (navAny?.share) {
      try {
        await navAny.share({
          title: "ماشین‌حساب خرید خانه",
          text: shareText,
          url: typeof window !== "undefined" ? window.location.href : undefined,
        });
        return;
      } catch {}
    }

    await handleCopy();
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-50 text-zinc-900"
      style={{
        fontFamily:
          'Vazirmatn, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial',
      }}
    >
      <div className="mx-auto w-full max-w-md px-4 pt-5 pb-10">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm font-bold text-zinc-800 shadow-sm active:scale-[0.99]"
          >
            <span className="text-base leading-none">→</span>
            ماشین‌حساب‌ها
          </Link>

          <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-bold text-zinc-600">
            MVP
          </span>
        </div>

        {/* Title */}
        <header className="mt-5">
          <h1 className="text-2xl font-black leading-9">
            چند سال دیگه می‌تونم خونه بخرم؟
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            سه عدد را وارد کن تا زمان تقریبی رسیدن به هدف مشخص شود.
          </p>
        </header>

        {/* Card */}
        <section className="mt-5 rounded-3xl border border-zinc-200 bg-white shadow-[0_18px_45px_rgba(0,0,0,0.10)]">
          <div className="px-5 pt-5 pb-4">
            <div className="text-sm font-black text-zinc-900">فرم محاسبه</div>
            <div className="mt-1 text-xs text-zinc-500">اعداد را با تومان وارد کنید.</div>
          </div>

          <div className="px-5 pb-5 space-y-4">
            <Field
              label="قیمت خانه"
              placeholder="مثلا: 10,000,000,000 تومان"
              value={price}
              onChange={(v) => setPrice(formatWithCommas(v))}
              inputRef={priceRef}
            />

            <Field
              label="پس‌انداز فعلی"
              placeholder="مثلا: 5,000,000,000 تومان"
              value={savings}
              onChange={(v) => setSavings(formatWithCommas(v))}
            />

            <Field
              label="پس‌انداز ماهانه"
              placeholder="مثلا: 6,000,000 تومان"
              value={monthly}
              onChange={(v) => setMonthly(formatWithCommas(v))}
            />

            {/* Primary */}
            <button
              onClick={handleCalculate}
              className="w-full rounded-2xl bg-zinc-900 py-3.5 text-sm font-black text-white shadow-lg shadow-zinc-900/20 active:scale-[0.99]"
            >
              محاسبه
            </button>
          </div>

          {/* Result + Share */}
          {result && (
            <div
              ref={resultRef}
              className="border-t border-zinc-100 px-5 py-5 space-y-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-indigo-700">نتیجه</span>
                <span className="h-1 w-1 rounded-full bg-indigo-400" />
              </div>

              <div
                className={[
                  "rounded-3xl border p-4",
                  result.tone === "success"
                    ? "border-emerald-200 bg-emerald-50"
                    : result.tone === "warning"
                      ? "border-amber-200 bg-amber-50"
                      : "border-zinc-200 bg-zinc-50",
                ].join(" ")}
              >
                <div className="text-base font-black leading-8 text-zinc-900">
                  {result.text}
                </div>
              </div>

              {/* Helper two lines */}
              {result.helper && (
                <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                  <div className="text-sm font-bold text-zinc-800">
                    کمبود سرمایه: {toman(result.helper.shortage)}
                  </div>
                  <div className="mt-1 text-sm font-bold text-zinc-800">
                    پس‌انداز ماهانه شما: {toman(result.helper.monthly)}
                  </div>
                </div>
              )}

              {/* Soft warning */}
              {result.warning ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800 leading-6">
                  {result.warning}
                </div>
              ) : null}

              {/* Share box */}
              <div className="rounded-3xl border border-zinc-200 bg-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-black text-zinc-900">اشتراک‌گذاری</div>
                  <ShareToggle value={shareMode} onChange={setShareMode} />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleShare}
                    className="rounded-2xl bg-indigo-600 py-3 text-sm font-black text-white shadow-lg shadow-indigo-600/20 active:scale-[0.99]"
                  >
                    اشتراک‌گذاری
                  </button>

                  <button
                    onClick={handleCopy}
                    className="rounded-2xl bg-zinc-800 py-3 text-sm font-black text-white shadow-lg shadow-zinc-900/10 active:scale-[0.99]"
                  >
                    {copied ? "کپی شد ✅" : "کپی"}
                  </button>
                </div>

                <div className="sr-only">{shareText}</div>
              </div>

              {/* Secondary */}
              <button
                onClick={handleReset}
                className="w-full rounded-2xl border border-zinc-200 bg-white py-3.5 text-sm font-black text-zinc-900 shadow-sm active:scale-[0.99]"
              >
                محاسبه جدید
              </button>

              <p className="text-center text-xs text-zinc-500 leading-5">
                این نسخه MVP است و فرض می‌کند شرایط فعلی تغییر نمی‌کند.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Field(props: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  inputRef?: React.MutableRefObject<HTMLInputElement | null>;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-zinc-900">{props.label}</span>

      <div className="mt-2">
        <input
          ref={props.inputRef}
          inputMode="numeric"
          placeholder={props.placeholder}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-sm font-bold text-zinc-900 shadow-sm outline-none
                     placeholder:font-semibold placeholder:text-zinc-400
                     focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/10"
        />
      </div>
    </label>
  );
}

function ShareToggle(props: {
  value: "short" | "detailed";
  onChange: (v: "short" | "detailed") => void;
}) {
  const isShort = props.value === "short";

  return (
    <button
      type="button"
      onClick={() => props.onChange(isShort ? "detailed" : "short")}
      className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-bold text-zinc-700 active:scale-[0.99]"
      aria-label="تغییر حالت متن اشتراک‌گذاری"
      title="تغییر حالت متن اشتراک‌گذاری"
    >
      {isShort ? "کوتاه" : "با جزئیات"}
      <span className="text-zinc-400">•</span>
      <span className="text-zinc-500">تغییر</span>
    </button>
  );
}
