// File: calculator/app/gold-goal/page.tsx
'use client'

import React, { useMemo, useState } from 'react'

/**
 * ابزار: «رسیدن به هدف با پس‌انداز طلا» (نسخه توسعه‌یافته اما ساده)
 *
 * خروجی اصلی ضد قطعیت کاذب:
 * - Months < 12 → «حدود X ماه»
 * - Months >= 12 → «حدود ceil(Months/12) سال»
 * - نمایش ماه در خروجی سالانه مجاز نیست.
 */

type Inputs = {
  targetToman: string
  currentGoldGrams: string
  monthlySavingGrams: string
  goldPricePerGram: string

  // دلار
  currentUsdPrice: string
  dollarGrowthAnnual: string // تغییر جدید: رشد سالانه دلار٪

  // اقتصاد
  goldGrowthAnnual: string
  inflationAnnual: string
  bankRateAnnual: string

  // هزینه‌ها
  buyFeePercent: string
  buyTaxPercent: string
  sellFeePercent: string
  storageAnnualPercent: string

  // ریسک/شوک
  volatilityAnnual: string
  shockAnnualPercent: string

  // رفتار
  savingsAchievementRate: string
  adjustTargetForInflation: boolean
  enableMonteCarlo: boolean
}

type SingleResult = {
  months: number
  isUnrealistic: boolean

  nowValueToman: number
  remainingTomanNow: number

  targetAtReachToman: number
  finalGoldGrams: number
  liquidValueAtReach: number
}

type CombinedResult = {
  hasStarted: boolean

  base: SingleResult
  range?: { best: number; worst: number }
  bank?: { months: number; isUnrealistic: boolean }

  scenarios: {
    optimistic: SingleResult
    base: SingleResult
    pessimistic: SingleResult
  }

  note: string
}

// ✅ NEW: Key helpers to remove any safely (NO UI/logic change)
type BooleanKeys = {
  [K in keyof Inputs]: Inputs[K] extends boolean ? K : never
}[keyof Inputs]

type StringKeys = Exclude<keyof Inputs, BooleanKeys>

// ---------- Number helpers ----------
const toEnglishDigits = (str: string): string => {
  const persianDigits = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g]
  const arabicDigits = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g]
  let result = str ?? ''
  for (let i = 0; i < 10; i++) {
    result = result.replace(persianDigits[i], String(i)).replace(arabicDigits[i], String(i))
  }
  return result
}

const toPersianDigits = (str: string | number): string => {
  return String(str).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d, 10)])
}

// تغییر جدید: اگر کاربر "1." تایپ کرد، نقطه حذف نشود (علت اصلی عدم امکان ورود اعشار)
const formatWithCommas = (val: string): string => {
  const x = val.replace(/,/g, '')
  if (!x) return ''

  const endsWithDot = x.endsWith('.')
  const startsWithDot = x.startsWith('.')

  const [rawInt, rawDec = ''] = x.split('.')
  const intPart = rawInt || (startsWithDot ? '0' : '')
  const withComma = intPart ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0'

  if (endsWithDot) return `${withComma}.`
  if (rawDec !== '') return `${withComma}.${rawDec}`
  return withComma
}

// تغییر جدید: پشتیبانی بهتر از اعشار و جداکننده اعشار فارسی/عربی
const sanitizeNumeric = (raw: string): string => {
  const v = toEnglishDigits(raw)
    .replace(/,/g, '')
    .replace(/٫/g, '.') // Persian decimal separator
    .replace(/٬/g, '') // Arabic thousands separator

  let out = ''
  let dotSeen = false
  for (const ch of v) {
    if (ch >= '0' && ch <= '9') out += ch
    else if (ch === '.' && !dotSeen) {
      dotSeen = true
      out += '.'
    }
  }
  return out
}

const parseNumber = (val: string): number => {
  const clean = sanitizeNumeric(val)
  if (!clean || clean === '.') return 0
  const n = Number(clean)
  return Number.isFinite(n) ? n : 0
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

const formatToman = (n: number): string => {
  const safe = Math.max(0, Math.round(n))
  const s = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(safe)
  return toPersianDigits(s)
}

// تغییر جدید: اعشار گرم دقیق‌تر (۳ یا ۴ رقم)
const formatGrams = (n: number, maxFraction = 4): string => {
  const safe = Math.max(0, n)
  const s = new Intl.NumberFormat('en-US', { maximumFractionDigits: maxFraction }).format(safe)
  return toPersianDigits(s)
}

// ---------- Locked display rule ----------
const formatResultFromMonths = (months: number): string => {
  if (!Number.isFinite(months) || months <= 0) return 'همین الان'
  if (months > 240) return 'خیلی طولانی' // تغییر جدید
  if (months < 12) return `حدود ${toPersianDigits(String(Math.round(months)))} ماه`
  const years = Math.ceil(months / 12)
  return `حدود ${toPersianDigits(String(years))} سال`
}

const formatRangeFromMonths = (best: number, worst: number): string => {
  if (!Number.isFinite(best) || !Number.isFinite(worst)) return '—'
  const lo = Math.max(0, Math.min(best, worst))
  const hi = Math.max(best, worst)
  if (hi > 240) return 'خیلی طولانی' // تغییر جدید

  if (hi < 12) {
    const a = Math.max(0, Math.round(lo))
    const b = Math.max(0, Math.round(hi))
    if (a === b) return `حدود ${toPersianDigits(String(a))} ماه`
    return `حدود ${toPersianDigits(String(a))} تا ${toPersianDigits(String(b))} ماه`
  }

  const a = Math.max(0, Math.ceil(lo / 12))
  const b = Math.max(0, Math.ceil(hi / 12))
  if (a === b) return `حدود ${toPersianDigits(String(a))} سال`
  return `حدود ${toPersianDigits(String(a))} تا ${toPersianDigits(String(b))} سال`
}

// ---------- Random helpers ----------
const randn = (): number => {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

// ---------- Core simulation ----------
type SimParams = {
  targetToman: number
  currentGold: number
  monthlySavingGrams: number
  goldPrice: number

  dollarGrowthAnnual: number
  goldGrowthAnnual: number
  inflationAnnual: number
  bankRateAnnual: number

  buyFeePercent: number
  buyTaxPercent: number
  sellFeePercent: number
  storageAnnualPercent: number

  volatilityAnnual: number
  shockAnnualPercent: number

  savingsAchievementRate: number
  adjustTargetForInflation: boolean

  randomize: boolean
}

const simulateGold = (p: SimParams): SingleResult => {
  const MAX_MONTHS = 1200

  const goldMonthlyMean = Math.pow(1 + p.goldGrowthAnnual / 100, 1 / 12) - 1
  const inflMonthly = Math.pow(1 + p.inflationAnnual / 100, 1 / 12) - 1

  const hasDollarGrowth = Number.isFinite(p.dollarGrowthAnnual) && p.dollarGrowthAnnual !== 0
  const dollarMonthly = hasDollarGrowth ? Math.pow(1 + p.dollarGrowthAnnual / 100, 1 / 12) - 1 : 0

  // تغییر جدید: رشد موثر ماهانه (۰.۷ دلار + ۰.۳ طلا)
  const effectiveMonthly = hasDollarGrowth ? 0.7 * dollarMonthly + 0.3 * goldMonthlyMean : goldMonthlyMean

  const goldMonthlyStd = (p.volatilityAnnual / 100) / Math.sqrt(12)

  const effectiveMonthlySaving = p.monthlySavingGrams * (p.savingsAchievementRate / 100)

  const purchaseLossFactor = 1 + (p.buyFeePercent + p.buyTaxPercent) / 100
  const gramsAddedPerMonth = purchaseLossFactor > 0 ? effectiveMonthlySaving / purchaseLossFactor : 0

  let months = 0
  let grams = p.currentGold
  let price = p.goldPrice
  let targetInflAdj = p.targetToman

  const nowValue = grams * price
  const remainingNow = Math.max(0, p.targetToman - nowValue)

  if (!p.adjustTargetForInflation) {
    const liquidNow = nowValue * (1 - p.sellFeePercent / 100)
    if (liquidNow >= p.targetToman) {
      return {
        months: 0,
        isUnrealistic: false,
        nowValueToman: nowValue,
        remainingTomanNow: 0,
        targetAtReachToman: p.targetToman,
        finalGoldGrams: grams,
        liquidValueAtReach: liquidNow,
      }
    }
  }

  if (gramsAddedPerMonth <= 0) {
    return {
      months: MAX_MONTHS,
      isUnrealistic: true,
      nowValueToman: nowValue,
      remainingTomanNow: remainingNow,
      targetAtReachToman: targetInflAdj,
      finalGoldGrams: grams,
      liquidValueAtReach: nowValue * (1 - p.sellFeePercent / 100),
    }
  }

  const storageMonthly = (p.storageAnnualPercent / 100) / 12

  while (months < MAX_MONTHS) {
    months++

    if (p.adjustTargetForInflation) {
      targetInflAdj *= 1 + inflMonthly
    }

    let shockThisMonth = 0
    if (p.shockAnnualPercent > 0 && months % 12 === 0) {
      shockThisMonth = p.shockAnnualPercent / 100
    }

    const noise = p.randomize ? randn() * goldMonthlyStd : 0
    const monthlyGrowth = effectiveMonthly + noise

    price *= (1 + monthlyGrowth) * (1 + shockThisMonth)

    grams += gramsAddedPerMonth

    if (storageMonthly > 0) {
      price *= 1 - storageMonthly
    }

    const value = grams * price
    const liquid = value * (1 - p.sellFeePercent / 100)

    if (liquid >= targetInflAdj) {
      return {
        months,
        isUnrealistic: false,
        nowValueToman: nowValue,
        remainingTomanNow: remainingNow,
        targetAtReachToman: targetInflAdj,
        finalGoldGrams: grams,
        liquidValueAtReach: liquid,
      }
    }
  }

  const value = grams * price
  return {
    months: MAX_MONTHS,
    isUnrealistic: true,
    nowValueToman: nowValue,
    remainingTomanNow: remainingNow,
    targetAtReachToman: targetInflAdj,
    finalGoldGrams: grams,
    liquidValueAtReach: value * (1 - p.sellFeePercent / 100),
  }
}

const simulateBank = (p: SimParams): { months: number; isUnrealistic: boolean } => {
  const MAX_MONTHS = 1200

  const monthlyCash = p.monthlySavingGrams * p.goldPrice * (p.savingsAchievementRate / 100)
  const bankMonthly = Math.pow(1 + p.bankRateAnnual / 100, 1 / 12) - 1
  const inflMonthly = Math.pow(1 + p.inflationAnnual / 100, 1 / 12) - 1

  let months = 0
  let balance = p.currentGold * p.goldPrice
  let targetInflAdj = p.targetToman

  if (monthlyCash <= 0 && balance <= 0) return { months: MAX_MONTHS, isUnrealistic: true }

  while (months < MAX_MONTHS) {
    months++

    if (p.adjustTargetForInflation) {
      targetInflAdj *= 1 + inflMonthly
    }

    balance *= 1 + bankMonthly
    balance += monthlyCash

    if (balance >= targetInflAdj) return { months, isUnrealistic: false }
  }

  return { months: MAX_MONTHS, isUnrealistic: true }
}

const calculateAll = (inputs: Inputs): CombinedResult => {
  const targetToman = parseNumber(inputs.targetToman)
  const goldPrice = parseNumber(inputs.goldPricePerGram)

  const emptySingle: SingleResult = {
    months: 0,
    isUnrealistic: false,
    nowValueToman: 0,
    remainingTomanNow: 0,
    targetAtReachToman: 0,
    finalGoldGrams: 0,
    liquidValueAtReach: 0,
  }

  if (targetToman <= 0 || goldPrice <= 0) {
    return {
      hasStarted: false,
      base: emptySingle,
      scenarios: { optimistic: emptySingle, base: emptySingle, pessimistic: emptySingle },
      note: '',
    }
  }

  const paramsBase: SimParams = {
    targetToman,
    currentGold: Math.max(0, parseNumber(inputs.currentGoldGrams)),
    monthlySavingGrams: Math.max(0, parseNumber(inputs.monthlySavingGrams)),
    goldPrice,

    dollarGrowthAnnual: parseNumber(inputs.dollarGrowthAnnual),
    goldGrowthAnnual: parseNumber(inputs.goldGrowthAnnual),
    inflationAnnual: parseNumber(inputs.inflationAnnual),
    bankRateAnnual: parseNumber(inputs.bankRateAnnual),

    buyFeePercent: clamp(parseNumber(inputs.buyFeePercent), 0, 100),
    buyTaxPercent: clamp(parseNumber(inputs.buyTaxPercent), 0, 100),
    sellFeePercent: clamp(parseNumber(inputs.sellFeePercent), 0, 100),
    storageAnnualPercent: clamp(parseNumber(inputs.storageAnnualPercent), 0, 100),

    volatilityAnnual: clamp(parseNumber(inputs.volatilityAnnual), 0, 100),
    shockAnnualPercent: clamp(parseNumber(inputs.shockAnnualPercent), 0, 300),

    savingsAchievementRate: clamp(parseNumber(inputs.savingsAchievementRate), 0, 100),
    adjustTargetForInflation: inputs.adjustTargetForInflation,

    randomize: false,
  }

  const base = simulateGold({ ...paramsBase, randomize: false })

  let range: { best: number; worst: number } | undefined = undefined
  if (inputs.enableMonteCarlo) {
    const iters = 30
    const arr: number[] = []
    for (let i = 0; i < iters; i++) {
      arr.push(simulateGold({ ...paramsBase, randomize: true }).months)
    }
    arr.sort((a, b) => a - b)
    range = { best: arr[Math.floor(arr.length * 0.15)], worst: arr[Math.floor(arr.length * 0.85)] }
  }

  const bank = simulateBank(paramsBase)

  const optimistic = simulateGold({
    ...paramsBase,
    goldGrowthAnnual: paramsBase.goldGrowthAnnual + 10,
    dollarGrowthAnnual: paramsBase.dollarGrowthAnnual + 10,
    inflationAnnual: Math.max(0, paramsBase.inflationAnnual - 10),
    randomize: false,
  })

  const pessimistic = simulateGold({
    ...paramsBase,
    goldGrowthAnnual: Math.max(-50, paramsBase.goldGrowthAnnual - 10),
    dollarGrowthAnnual: Math.max(-50, paramsBase.dollarGrowthAnnual - 10),
    inflationAnnual: paramsBase.inflationAnnual + 10,
    randomize: false,
  })

  const noteParts: string[] = []
  noteParts.push('این ابزار «پیش‌بینی قطعی» نیست؛ یک تخمین بر اساس فرض‌های شماست.')
  noteParts.push('قیمت طلا ماهانه با ترکیب رشد طلا و رشد دلار به‌روزرسانی می‌شود.')
  if (inputs.adjustTargetForInflation) noteParts.push('هدف شما نیز با تورم رشد می‌کند.')
  if (inputs.enableMonteCarlo) noteParts.push('بازه‌ی نتیجه با شبیه‌سازی ساده‌ی ریسک محاسبه شده است.')
  if (base.months > 240) {
    noteParts.push(
      'هشدار: با این پس‌انداز و فرض‌ها، هدف نیاز به زمان بسیار طولانی دارد. افزایش پس‌انداز ماهانه می‌تواند کمک بزرگی کند.'
    )
  }
  noteParts.push('ریسک‌های واقعی می‌تواند نتایج را تغییر دهد.')

  return {
    hasStarted: true,
    base,
    range,
    bank,
    scenarios: { optimistic, base, pessimistic },
    note: noteParts.join(' '),
  }
}

// ---------- UI ----------
export default function GoldGoalPage() {
  const [inputs, setInputs] = useState<Inputs>({
    targetToman: '',
    currentGoldGrams: '',
    monthlySavingGrams: '',
    goldPricePerGram: '',

    currentUsdPrice: '',
    dollarGrowthAnnual: '۲۵',

    goldGrowthAnnual: '۲۰',
    inflationAnnual: '۴۴',
    bankRateAnnual: '۲۵',

    buyFeePercent: '۰',
    buyTaxPercent: '۹',
    sellFeePercent: '۳',
    storageAnnualPercent: '۰.۸',

    volatilityAnnual: '۸',
    shockAnnualPercent: '۰',

    savingsAchievementRate: '۱۰۰',
    adjustTargetForInflation: false,
    enableMonteCarlo: true,
  })

  const result = useMemo(() => calculateAll(inputs), [inputs])

  // ✅ no-any: restrict to string keys only
  const onChangeNumber =
    (name: StringKeys) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const cleaned = sanitizeNumeric(e.target.value)
      const pretty = toPersianDigits(formatWithCommas(cleaned))
      setInputs((p) => ({ ...p, [name]: pretty }))
    }

  // ✅ no-any: restrict to boolean keys only
  const toggle =
    (name: BooleanKeys) => () => {
      setInputs((p) => ({ ...p, [name]: !p[name] }))
    }

  const setAdjustTarget = (val: boolean) => setInputs((p) => ({ ...p, adjustTargetForInflation: val }))

  const onReset = () =>
    setInputs({
      targetToman: '',
      currentGoldGrams: '',
      monthlySavingGrams: '',
      goldPricePerGram: '',

      currentUsdPrice: '',
      dollarGrowthAnnual: '۲۵',

      goldGrowthAnnual: '۲۰',
      inflationAnnual: '۴۴',
      bankRateAnnual: '۲۵',

      buyFeePercent: '۰',
      buyTaxPercent: '۹',
      sellFeePercent: '۳',
      storageAnnualPercent: '۰.۸',

      volatilityAnnual: '۸',
      shockAnnualPercent: '۰',

      savingsAchievementRate: '۱۰۰',
      adjustTargetForInflation: false,
      enableMonteCarlo: true,
    })

  const mainText = !result.hasStarted
    ? '—'
    : result.base.isUnrealistic
      ? 'با این فرض‌ها، زمان رسیدن به هدف بسیار طولانی است.'
      : formatResultFromMonths(result.base.months)

  const rangeText =
    result.hasStarted && result.range
      ? formatRangeFromMonths(result.range.best, result.range.worst)
      : '—'

  const bankText =
    result.hasStarted && result.bank
      ? result.bank.isUnrealistic
        ? 'خیلی طولانی'
        : formatResultFromMonths(result.bank.months)
      : '—'

  const months = result.hasStarted ? result.base.months : 0
  const yearsCeil = months >= 12 ? Math.ceil(months / 12) : 0
  const showLongWarning = result.hasStarted && !result.base.isUnrealistic && yearsCeil >= 30

  const targetTomanNum = parseNumber(inputs.targetToman)
  const monthlyG = parseNumber(inputs.monthlySavingGrams)
  const suggestedG = monthlyG > 0 ? Math.max(3, Math.min(5, Math.round(monthlyG * 3))) : 3

  const shareText = result.hasStarted
    ? result.base.isUnrealistic
      ? `تخمینو | پس‌انداز طلا: با این فرض‌ها، زمان رسیدن به هدف بسیار طولانی است.`
      : `تخمینو | پس‌انداز طلا: ${mainText} تا رسیدن به هدف.`
    : `تخمینو | پس‌انداز طلا`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      alert('کپی شد ✅')
    } catch {
      alert('کپی انجام نشد. (اجازه مرورگر لازم است)')
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ text: shareText })
      } else {
        await handleCopy()
      }
    } catch {}
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 p-4 md:p-8 font-vazirmatn" dir="rtl">
      <style jsx global>{`
        .font-vazirmatn {
          font-family: Vazirmatn, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial,
            'Apple Color Emoji', 'Segoe UI Emoji';
        }
        .font-yekan {
          font-family: Yekan, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial,
            'Apple Color Emoji', 'Segoe UI Emoji';
        }
      `}</style>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-10 bg-amber-500 rounded-full" />
                <div>
                  <h1 className="text-xl md:text-2xl font-black">تخمین رسیدن به هدف با پس‌انداز طلا</h1>
                  <p className="text-[11px] text-slate-500 mt-1">پیش‌فرض‌های واقعی‌تر + نمایش ریسک و مقایسه بانکی.</p>
                </div>
              </div>

              <button
                onClick={onReset}
                className="text-[10px] bg-slate-100 px-3 py-1.5 rounded-full text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all font-bold"
              >
                بازنشانی
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="هدف نهایی (تومان)" value={inputs.targetToman} onChange={onChangeNumber('targetToman')} placeholder="مثلاً ۵۰۰,۰۰۰,۰۰۰" primary />
              <Input label="قیمت هر گرم طلا (تومان)" value={inputs.goldPricePerGram} onChange={onChangeNumber('goldPricePerGram')} placeholder="مثلاً ۳,۵۰۰,۰۰۰" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
              <Input label="دارایی فعلی (گرم)" value={inputs.currentGoldGrams} onChange={onChangeNumber('currentGoldGrams')} placeholder="مثلاً ۵" />
              <Input label="پس‌انداز ماهانه (گرم)" value={inputs.monthlySavingGrams} onChange={onChangeNumber('monthlySavingGrams')} placeholder="مثلاً ۱.۵" />
            </div>

            <div className="mt-6 p-5 rounded-[1.5rem] bg-slate-50 border border-slate-100 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[12px] font-black text-slate-700">تنظیمات (اختیاری)</p>

                <div className="flex gap-2">
                  <SmallToggle active={inputs.adjustTargetForInflation} onClick={toggle('adjustTargetForInflation')} label="تعدیل هدف با تورم" />
                  <SmallToggle active={inputs.enableMonteCarlo} onClick={toggle('enableMonteCarlo')} label="ریسک (بازه)" />
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Input compact label="رشد طلا٪ (سالانه)" value={inputs.goldGrowthAnnual} onChange={onChangeNumber('goldGrowthAnnual')} placeholder="۲۰" hint="پایه: ۲۰–۲۵٪ معمولاً منطقی است." />
                <Input compact label="رشد سالانه دلار٪" value={inputs.dollarGrowthAnnual} onChange={onChangeNumber('dollarGrowthAnnual')} placeholder="۲۵" hint="اگر خالی باشد، فقط رشد طلا لحاظ می‌شود." />
                <Input compact label="تورم٪ (سالانه)" value={inputs.inflationAnnual} onChange={onChangeNumber('inflationAnnual')} placeholder="۴۴" hint="پیش‌فرض: ۴۴٪." />
                <Input compact label="سود بانکی٪" value={inputs.bankRateAnnual} onChange={onChangeNumber('bankRateAnnual')} placeholder="۲۵" hint="برای مقایسه با سپرده." />
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Input compact label="کارمزد خرید٪" value={inputs.buyFeePercent} onChange={onChangeNumber('buyFeePercent')} placeholder="۰" hint="اجرت/کارمزد خرید." />
                <Input compact label="مالیات خرید٪" value={inputs.buyTaxPercent} onChange={onChangeNumber('buyTaxPercent')} placeholder="۹" hint="مثلاً VAT." />
                <Input compact label="کارمزد فروش٪" value={inputs.sellFeePercent} onChange={onChangeNumber('sellFeePercent')} placeholder="۳" hint="ارزش قابل نقد شدن کمتر می‌شود." />
                <Input compact label="نگهداری٪ (سالانه)" value={inputs.storageAnnualPercent} onChange={onChangeNumber('storageAnnualPercent')} placeholder="۰.۸" hint="صندوق/هزینه نگهداری." />
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Input compact label="نوسان طلا٪ (سالانه)" value={inputs.volatilityAnnual} onChange={onChangeNumber('volatilityAnnual')} placeholder="۸" hint="۵–۱۰٪ معمولاً منطقی است." />
                <Input compact label="شوک سالانه٪" value={inputs.shockAnnualPercent} onChange={onChangeNumber('shockAnnualPercent')} placeholder="۰" hint="هر ۱۲ ماه جهش." />
                <Input compact label="تحقق پس‌انداز٪" value={inputs.savingsAchievementRate} onChange={onChangeNumber('savingsAchievementRate')} placeholder="۱۰۰" hint="مثلاً ۷۰ یعنی فقط ۷۰٪ محقق می‌شود." />
                <Input compact label="دلار امروز (نمایشی)" value={inputs.currentUsdPrice} onChange={onChangeNumber('currentUsdPrice')} placeholder="مثلاً ۶۸,۰۰۰" hint="اختیاری." />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-[#0F172A] text-white rounded-[2.2rem] p-7 md:p-8 shadow-2xl sticky top-6 border border-slate-800 min-h-[640px] flex flex-col">
            {!result.hasStarted ? (
              <div className="m-auto text-center opacity-50 space-y-3">
                <div className="w-16 h-16 bg-slate-800 rounded-full mx-auto animate-pulse" />
                <p className="text-sm font-bold">برای شروع، «هدف» و «قیمت هر گرم» را وارد کن.</p>
              </div>
            ) : (
              <>
                <div className="text-center space-y-2">
                  <p className="text-[10px] text-slate-400 tracking-widest uppercase">زمان تقریبی رسیدن</p>

                  <div className="mt-2">
                    <p className="text-3xl md:text-4xl font-black text-amber-400 leading-tight font-yekan">
                      {result.base.isUnrealistic ? 'خیلی طولانی' : mainText}
                    </p>

                    <p className="text-[11px] text-slate-400 mt-2">اگر شرایط فعلی تغییر نکند و طبق فرض‌های انتخابی.</p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    <button onClick={handleCopy} className="text-[11px] font-black bg-slate-800/60 hover:bg-slate-800 px-4 py-2 rounded-full border border-slate-700 transition-all">
                      کپی نتیجه
                    </button>
                    <button onClick={handleShare} className="text-[11px] font-black bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-300 px-4 py-2 rounded-full border border-emerald-500/20 transition-all">
                      اشتراک‌گذاری
                    </button>

                    <button
                      onClick={() => setAdjustTarget(!inputs.adjustTargetForInflation)}
                      className={`text-[11px] font-black px-4 py-2 rounded-full border transition-all ${
                        inputs.adjustTargetForInflation
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-200 hover:bg-amber-500/15'
                          : 'bg-slate-800/40 border-slate-700 text-slate-200 hover:bg-slate-800/60'
                      }`}
                      type="button"
                      title="یک کلیک برای تست بدون رشد هدف با تورم"
                    >
                      {inputs.adjustTargetForInflation ? 'تعدیل هدف: روشن' : 'تعدیل هدف: خاموش'}
                    </button>
                  </div>
                </div>

                {showLongWarning && (
                  <div className="mt-6 p-5 rounded-[1.6rem] border border-amber-500/25 bg-amber-500/10">
                    <p className="text-[12px] font-black text-amber-200 mb-2">هشدار نتیجه‌ی خیلی بلندمدت</p>
                    <p className="text-[11px] text-slate-200 leading-relaxed">
                      با پس‌انداز ماهانه <span className="font-black text-white font-yekan">{formatGrams(monthlyG, 4)}</span> گرم و هدف{' '}
                      <span className="font-black text-white font-yekan">{formatToman(targetTomanNum)}</span> تومان، حتی در شرایط رشد خوب طلا،
                      رسیدن به هدف می‌تونه نیاز به دهه‌های طولانی داشته باشه.
                      <br />
                      افزایش پس‌انداز (مثلاً به <span className="font-black text-white font-yekan">{toPersianDigits(String(suggestedG))}</span> تا{' '}
                      <span className="font-black text-white font-yekan">۵</span> گرم در ماه) یا کاهش هدف می‌تونه زمان رو به زیر ۱۵ سال برسونه.
                    </p>
                  </div>
                )}

                <div className="mt-8 grid grid-cols-2 gap-4">
                  <Card label="ارزش دارایی فعلی" value={`${formatToman(result.base.nowValueToman)} تومان`} />
                  <Card label="کمبود تا هدف (امروز)" value={`${formatToman(result.base.remainingTomanNow)} تومان`} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <Card label="مجموع طلا در پایان" value={`${formatGrams(result.base.finalGoldGrams, 4)} گرم`} />
                  <Card label="ارزش قابل نقد در زمان دستیابی" value={`${formatToman(result.base.liquidValueAtReach)} تومان`} subtle />
                </div>

                <div className="mt-4">
                  <HighlightCard
                    label="ارزش هدف در زمان تقریبی رسیدن"
                    value={`${formatToman(result.base.targetAtReachToman)} تومان`}
                    hint={
                      inputs.adjustTargetForInflation
                        ? 'این عدد نشان می‌دهد اگر هدف با تورم رشد کند، «هدف واقعی» در آینده چقدر بزرگ می‌شود.'
                        : 'چون تعدیل تورم خاموش است، هدف ثابت فرض شده و این عدد نزدیک به هدف اولیه می‌ماند.'
                    }
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <Card label="سپرده بانکی (مقایسه)" value={bankText} subtle />
                  <Card label="بازه (ریسک)" value={rangeText} subtle />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <Card
                    label="سناریو بدبینانه"
                    value={result.scenarios.pessimistic.isUnrealistic ? 'خیلی طولانی' : formatResultFromMonths(result.scenarios.pessimistic.months)}
                    subtle
                  />
                  <Card
                    label="سناریو خوش‌بینانه"
                    value={result.scenarios.optimistic.isUnrealistic ? 'خیلی طولانی' : formatResultFromMonths(result.scenarios.optimistic.months)}
                    subtle
                  />
                </div>

                <div className="mt-4">
                  <Card label="سناریو پایه" value={result.scenarios.base.isUnrealistic ? 'خیلی طولانی' : formatResultFromMonths(result.scenarios.base.months)} subtle />
                </div>

                <div className="mt-6 p-5 rounded-[1.6rem] bg-slate-900/40 border border-slate-800 space-y-2">
                  <p className="text-[11px] text-slate-400 leading-relaxed">{result.note}</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">این خروجی «تخمین» است؛ برای تصمیم‌گیری قطعی کافی نیست.</p>
                </div>

                <div className="mt-auto pt-6 text-center text-[10px] text-slate-500">تخمینو | رسیدن به هدف با پس‌انداز طلا</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  primary,
  compact,
  hint,
}: {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  primary?: boolean
  compact?: boolean
  hint?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <label className={`text-[11px] font-extrabold ${primary ? 'text-slate-900' : 'text-slate-600'}`}>{label}</label>
        {hint ? <span className="text-[10px] text-slate-400 hidden md:inline">{hint}</span> : null}
      </div>

      <input
        inputMode="decimal" // تغییر جدید
        type="text"
        value={value}
        onChange={onChange}
        placeholder={toPersianDigits(placeholder || '')}
        className={`w-full rounded-2xl border-2 outline-none transition-all text-right font-yekan
          placeholder:text-slate-300 placeholder:font-vazirmatn placeholder:text-xs
          ${primary ? 'px-5 py-4 border-amber-400 bg-amber-50/10 text-lg focus:ring-8 focus:ring-amber-500/5' : ''}
          ${!primary && compact ? 'px-3 py-2 border-slate-100 text-sm focus:border-amber-200 bg-white' : ''}
          ${!primary && !compact ? 'px-4 py-3 border-slate-100 text-base focus:border-amber-200 bg-white' : ''}
        `}
        dir="rtl"
      />

      {hint ? <span className="text-[10px] text-slate-400 md:hidden">{hint}</span> : null}
    </div>
  )
}

function Card({ label, value, subtle }: { label: string; value: string; subtle?: boolean }) {
  return (
    <div className={`p-4 rounded-2xl border ${subtle ? 'bg-slate-800/20 border-slate-700/40' : 'bg-slate-800/30 border-slate-700/50'}`}>
      <p className="text-slate-500 text-[10px] mb-1 font-black">{label}</p>
      <p className="text-[14px] md:text-[15px] font-black text-white leading-snug font-yekan">{value}</p>
    </div>
  )
}

function HighlightCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="p-5 rounded-[1.7rem] border border-amber-500/30 bg-gradient-to-l from-amber-500/15 to-slate-800/30">
      <p className="text-amber-200 text-[10px] mb-1 font-black">{label}</p>
      <p className="text-[18px] md:text-[20px] font-black text-white font-yekan">{value}</p>
      <p className="text-[10px] text-slate-300 mt-2 leading-relaxed">{hint}</p>
    </div>
  )
}

function SmallToggle({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-full text-[11px] font-black border transition-all ${
        active ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
      }`}
      type="button"
    >
      {label}
    </button>
  )
}
