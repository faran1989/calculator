// app/tools/financial-taste/data/financialTaste.questions.v1.ts

import type { Q32OptionKey } from "../engine/financialTaste.q32.v1";

export type QuestionType = "single4" | "likert5" | "multi";

export type Question = {
  id: number;
  sectionId: number;
  sectionTitle: string;
  title: string;
  type: QuestionType;
  hint?: string;
  options:
    | { value: number; label: string }[]
    | { key: Q32OptionKey; label: string }[];
};

export type Section = {
  id: number;
  title: string;
  description?: string;
  questionIds: number[];
};

export const SECTIONS_V1: Section[] = [
  {
    id: 1,
    title: "اطلاعات پایه و ظرفیت ریسک",
    description:
      "این بخش بیشتر درباره «توان واقعی شما برای تحمل ضرر و زمان لازم برای جبران» است، نه احساسات لحظه‌ای.",
    questionIds: [1, 2, 3, 4, 5],
  },
  {
    id: 2,
    title: "تحمل ریسک روانشناختی",
    description:
      "این بخش واکنش ذهنی/احساسی شما به نوسان و زیان را می‌سنجد.",
    questionIds: [6, 7, 8, 9],
  },
  {
    id: 3,
    title: "سبک خرج‌کردن و ذائقه مصرفی",
    description:
      "این بخش نشان می‌دهد پول اضافی را بیشتر ذخیره می‌کنید یا به تجربه/کیفیت/ظاهر اختصاص می‌دهید.",
    questionIds: [10, 11, 12],
  },
  {
    id: 4,
    title: "سوگیری‌های رفتاری و شخصیت تصمیم‌گیری",
    description:
      "این بخش خطاهای رایج ذهنی در سود/ضرر و میزان تاثیرپذیری از دیگران را بررسی می‌کند.",
    questionIds: [13, 14, 15, 16],
  },
  {
    id: 5,
    title: "Money Personality (باورهای پولی)",
    description:
      "باورهای عمیق‌تر درباره پول؛ با مقیاس ۱ تا ۵ (کاملاً مخالف تا کاملاً موافق).",
    questionIds: [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28],
  },
  {
    id: 6,
    title: "تجربه‌های واقعی گذشته",
    description:
      "این بخش به رفتار واقعی شما در سود/ضرر و تصمیم‌های احساسی گذشته نگاه می‌کند.",
    questionIds: [29, 30, 31],
  },
  {
    id: 7,
    title: "اهداف و ارزش‌های پول",
    description:
      "این بخش جهت‌گیری اصلی شما از پول را مشخص می‌کند.",
    questionIds: [32, 33, 34],
  },
  {
    id: 8,
    title: "سوالات تکمیلی (برای تمایز دقیق‌تر)",
    description:
      "چند سؤال اضافی برای دقیق‌تر کردن تیپ Money Personality.",
    questionIds: [35, 36, 37, 38, 39, 40],
  },
];

const likertOptions = [
  { value: 1, label: "کاملاً مخالف" },
  { value: 2, label: "مخالف" },
  { value: 3, label: "نظری ندارم" },
  { value: 4, label: "موافق" },
  { value: 5, label: "کاملاً موافق" },
] as const;

export const QUESTIONS_V1: Question[] = [
  // ─────────────────────────────────────────────────────────────
  // Section 1 — Risk Capacity
  // ─────────────────────────────────────────────────────────────
  {
    id: 1,
    sectionId: 1,
    sectionTitle: SECTIONS_V1[0].title,
    title: "سن شما در کدام بازه است؟",
    hint: "هدف: تخمین ظرفیت زمانی برای جبران نوسان (نه قضاوت شخصی).",
    type: "single4",
    options: [
      { value: 1, label: "زیر ۳۰ سال" },
      { value: 2, label: "۳۰ تا ۴۵ سال" },
      { value: 3, label: "۴۶ تا ۵۵ سال" },
      { value: 4, label: "بالای ۵۵ سال" },
    ],
  },
  {
    id: 2,
    sectionId: 1,
    sectionTitle: SECTIONS_V1[0].title,
    title:
      "پولی که برای سرمایه‌گذاری کنار می‌گذارید، تا چه مدت احتمالاً به آن نیاز نخواهید داشت؟",
    hint:
      "منظور: همان مبلغی که قصد دارید سرمایه‌گذاری کنید (نه کل دارایی و نه هزینه‌های روزمره).",
    type: "single4",
    options: [
      { value: 1, label: "کمتر از ۳ سال" },
      { value: 2, label: "۳ تا ۷ سال" },
      { value: 3, label: "۷ تا ۱۵ سال" },
      { value: 4, label: "بیش از ۱۵ سال / برای بازنشستگی" },
    ],
  },
  {
    id: 3,
    sectionId: 1,
    sectionTitle: SECTIONS_V1[0].title,
    title:
      "به‌طور معمول چه درصدی از درآمد ماهانه‌تان را پس‌انداز یا سرمایه‌گذاری می‌کنید؟",
    hint: "اگر نوسان درآمد دارید، میانگین چند ماه اخیر را در نظر بگیرید.",
    type: "single4",
    options: [
      { value: 1, label: "کمتر از ۱۰٪" },
      { value: 2, label: "۱۰ تا ۲۰٪" },
      { value: 3, label: "۲۰ تا ۴۰٪" },
      { value: 4, label: "بیش از ۴۰٪" },
    ],
  },
  {
    id: 4,
    sectionId: 1,
    sectionTitle: SECTIONS_V1[0].title,
    title:
      "در حال حاضر، چقدر از هزینه‌های زندگی‌تان به درآمد/سود این سرمایه‌گذاری وابسته است؟",
    hint:
      "مثلاً اگر ماهانه بدون سود سرمایه‌گذاری نمی‌توانید هزینه‌ها را پوشش دهید، وابستگی بالا است.",
    type: "single4",
    options: [
      { value: 1, label: "کاملاً وابسته (بیش از ۵۰٪ هزینه‌ها)" },
      { value: 2, label: "زیاد (۲۰ تا ۵۰٪)" },
      { value: 3, label: "کم (کمتر از ۲۰٪)" },
      { value: 4, label: "اصلاً وابسته نیستم" },
    ],
  },
  {
    id: 5,
    sectionId: 1,
    sectionTitle: SECTIONS_V1[0].title,
    title:
      "اگر ارزش سرمایه‌گذاری‌تان ناگهان ۳۰–۴۰٪ کاهش پیدا کند، تاثیرش روی زندگی و اهداف اصلی شما چیست؟",
    hint:
      "هدف اصلی: خانه/ازدواج/تحصیل/بازنشستگی/امنیت زندگی. واقع‌بینانه پاسخ دهید.",
    type: "single4",
    options: [
      { value: 1, label: "شدیداً اهداف و زندگی‌ام به خطر می‌افتد" },
      { value: 2, label: "تا حدی به خطر می‌افتد" },
      { value: 3, label: "فقط ناراحت‌کننده است" },
      { value: 4, label: "تقریباً تاثیری ندارد" },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // Section 2 — Risk Tolerance
  // ─────────────────────────────────────────────────────────────
  {
    id: 6,
    sectionId: 2,
    sectionTitle: SECTIONS_V1[1].title,
    title:
      "اگر امروز یک مبلغ قابل‌توجه (مثلاً ۱۰۰ میلیون تومان یا معادلش برای شما) برای سرمایه‌گذاری کنار بگذارید، نزدیک‌ترین انتخاب شما کدام است؟",
    hint:
      "این سؤال «ترجیح واقعی» را می‌سنجد. اگر ۱۰۰ میلیون برای شما کم/زیاد است، همان «مبلغ معادل برای شما» را در ذهن بگذارید.",
    type: "single4",
    options: [
      { value: 1, label: "۱۰۰٪ سپرده بانکی / صندوق درآمد ثابت (کم‌نوسان)" },
      {
        value: 2,
        label:
          "بخش عمده طلا یا دلار (یا صندوق طلا/ارزی) + کمی گزینه‌های دیگر",
      },
      { value: 3, label: "بخش عمده سهام/صندوق سهامی (نوسان بالا)" },
      { value: 4, label: "بخش عمده گزینه‌های پرریسک‌تر (کریپتو/استارتاپ/…)" },
    ],
  },
  {
    id: 7,
    sectionId: 2,
    sectionTitle: SECTIONS_V1[1].title,
    title:
      "اگر سبد شما در ۶ ماه حدود ۲۵٪ افت کند، احتمالاً چه واکنشی دارید؟",
    hint: "پاسخ را براساس واکنش واقعی‌تان بنویسید، نه واکنش ایده‌آل.",
    type: "single4",
    options: [
      { value: 1, label: "خیلی نگران می‌شوم و احتمالاً می‌فروشم" },
      { value: 2, label: "نگران می‌شوم اما صبر می‌کنم" },
      { value: 3, label: "زیاد نگران نمی‌شوم (نوسان را طبیعی می‌دانم)" },
      { value: 4, label: "فرصت می‌بینم و احتمالاً بیشتر می‌خرم" },
    ],
  },
  {
    id: 8,
    sectionId: 2,
    sectionTitle: SECTIONS_V1[1].title,
    title:
      "فرض کنید یک فرصت سرمایه‌گذاری دارید که «۷۰٪ احتمال سود +۵۰٪» و «۳۰٪ احتمال ضرر −۴۰٪» دارد. چه سهمی از سرمایهٔ قابل‌سرمایه‌گذاری‌تان را وارد می‌کنید؟",
    hint:
      "منظور از «سرمایهٔ قابل‌سرمایه‌گذاری» پولی است که به هزینه‌های ضروری زندگی وابسته نیست.",
    type: "single4",
    options: [
      { value: 1, label: "۰٪ — اصلاً وارد نمی‌شوم" },
      { value: 2, label: "کمتر از ۲۰٪ سرمایهٔ سرمایه‌گذاری‌ام" },
      { value: 3, label: "۲۰٪ تا ۵۰٪ سرمایهٔ سرمایه‌گذاری‌ام" },
      { value: 4, label: "بیش از ۵۰٪ سرمایهٔ سرمایه‌گذاری‌ام" },
    ],
  },
  {
    id: 9,
    sectionId: 2,
    sectionTitle: SECTIONS_V1[1].title,
    title: "وقتی در ضرر هستید، معمولاً کدام رفتار به شما نزدیک‌تر است؟",
    hint: "واقعی پاسخ دهید؛ همین بخش برای هشدارهای رفتاری مهم است.",
    type: "single4",
    options: [
      { value: 1, label: "سریع می‌فروشم تا ضرر بیشتر نشود" },
      { value: 2, label: "نگه می‌دارم تا حداقل به سربه‌سر برگردد" },
      { value: 3, label: "اگر تحلیلم مثبت باشد اضافه می‌کنم" },
      { value: 4, label: "بلندمدت فکر می‌کنم و به استراتژی پایبندم" },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // Section 3 — Spending Taste
  // ─────────────────────────────────────────────────────────────
  {
    id: 10,
    sectionId: 3,
    sectionTitle: SECTIONS_V1[2].title,
    title:
      "وقتی پول اضافه به دستتان می‌رسد (پاداش/سود/هدیه/...) معمولاً چه می‌کنید؟",
    type: "single4",
    options: [
      { value: 1, label: "تقریباً همه را پس‌انداز/سرمایه‌گذاری می‌کنم" },
      { value: 2, label: "بیشترش پس‌انداز، کمی خرج لذت" },
      { value: 3, label: "نصف‌نصف" },
      { value: 4, label: "بیشترش را خرج می‌کنم (سفر/خرید/تفریح)" },
    ],
  },
  {
    id: 11,
    sectionId: 3,
    sectionTitle: SECTIONS_V1[2].title,
    title: "در خریدها، برند/کیفیت/ظاهر لوکس چقدر برایتان مهم است؟",
    hint: "منظور: در مقایسه با گزینه‌های اقتصادیِ قابل‌قبول.",
    type: "single4",
    options: [
      { value: 1, label: "اقتصادی‌ترین گزینه مناسب را انتخاب می‌کنم" },
      { value: 2, label: "کیفیت مهم است، برند خیلی نه" },
      { value: 3, label: "برند و ظاهر برایم مهم است" },
      { value: 4, label: "ترجیح می‌دهم بهترین و لوکس‌ترین را بخرم" },
    ],
  },
  {
    id: 12,
    sectionId: 3,
    sectionTitle: SECTIONS_V1[2].title,
    title: "در رستوران/سفر/تفریح، نزدیک‌ترین انتخاب شما کدام است؟",
    type: "single4",
    options: [
      { value: 1, label: "اقتصادی‌ترین گزینه" },
      { value: 2, label: "متوسط و معقول" },
      { value: 3, label: "کیفیت خوب و تجربه بهتر" },
      { value: 4, label: "بهترین و گران‌ترین گزینه" },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // Section 4 — Behavioral Bias
  // ─────────────────────────────────────────────────────────────
  {
    id: 13,
    sectionId: 4,
    sectionTitle: SECTIONS_V1[3].title,
    title:
      "سهامی را ۱۰۰۰ خریده‌اید و حالا ۷۰۰ شده؛ اما هنوز از نظر تحلیل، آن را «ارزشمند» می‌دانید. چه می‌کنید؟",
    hint: "هدف: سنجش رفتار واقعی در ضرر (Discipline vs Bias).",
    type: "single4",
    options: [
      { value: 1, label: "می‌فروشم تا ضرر بیشتر نشود" },
      { value: 2, label: "نگه می‌دارم تا حداقل به ۱۰۰۰ برگردد" },
      { value: 3, label: "اگر پول اضافه داشتم، بیشتر می‌خرم" },
      { value: 4, label: "اول تحلیل جدید می‌کنم، بعد تصمیم می‌گیرم" },
    ],
  },
  {
    id: 14,
    sectionId: 4,
    sectionTitle: SECTIONS_V1[3].title,
    title: "وقتی یک سرمایه‌گذاری حدود ۵۰٪ سود می‌دهد، معمولاً چه می‌کنید؟",
    hint: "هدف: رفتار در سود (قفل سود vs ادامه روند).",
    type: "single4",
    options: [
      { value: 1, label: "سریع می‌فروشم تا سود قطعی شود" },
      { value: 2, label: "نگه می‌دارم چون هنوز جا دارد" },
      { value: 3, label: "بخشی می‌فروشم و بخشی را نگه می‌دارم" },
      { value: 4, label: "بیشتر می‌خرم چون روند صعودی است" },
    ],
  },
  {
    id: 15,
    sectionId: 4,
    sectionTitle: SECTIONS_V1[3].title,
    title:
      "برای تصمیم سرمایه‌گذاری، چقدر تحت تاثیر نظرات شبکه‌های اجتماعی/گروه‌ها قرار می‌گیرید؟",
    type: "single4",
    options: [
      { value: 1, label: "خیلی زیاد (اغلب دنباله‌رو هستم)" },
      { value: 2, label: "تا حدی اثر می‌گذارد" },
      { value: 3, label: "کم؛ تصمیم نهایی با خودم است" },
      { value: 4, label: "تقریباً هیچ؛ تحلیل خودم اولویت دارد" },
    ],
  },
  {
    id: 16,
    sectionId: 4,
    sectionTitle: SECTIONS_V1[3].title,
    title:
      "در مقایسه با متوسط سرمایه‌گذاران، خودتان را در تحلیل و تصمیم‌گیری چطور می‌بینید؟",
    hint: "هدف: اندازه‌گیری اعتمادبه‌نفس (برای هشدار overconfidence).",
    type: "single4",
    options: [
      { value: 1, label: "ضعیف‌تر" },
      { value: 2, label: "متوسط یا کمی ضعیف‌تر" },
      { value: 3, label: "متوسط تا کمی بهتر" },
      { value: 4, label: "خیلی بهتر (اعتمادبه‌نفس بالا)" },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // Section 5 — Money Personality (Likert)
  // ─────────────────────────────────────────────────────────────
  {
    id: 17,
    sectionId: 5,
    sectionTitle: SECTIONS_V1[4].title,
    title: "پول چیز بدی است و افراد ثروتمند اغلب حریص یا فاسد می‌شوند.",
    type: "likert5",
    options: [...likertOptions],
  },
  {
    id: 18,
    sectionId: 5,
    sectionTitle: SECTIONS_V1[4].title,
    title: "من واقعاً مستحق پول زیاد نیستم؛ مخصوصاً وقتی دیگران کمتر دارند.",
    type: "likert5",
    options: [...likertOptions],
  },
  {
    id: 19,
    sectionId: 5,
    sectionTitle: SECTIONS_V1[4].title,
    title:
      "فکر کردن به مسائل مالی مضطربم می‌کند و ترجیح می‌دهم از آن دوری کنم.",
    type: "likert5",
    options: [...likertOptions],
  },

  {
    id: 20,
    sectionId: 5,
    sectionTitle: SECTIONS_V1[4].title,
    title:
      "پول بیشتر تقریباً همیشه خوشحال‌ترم می‌کند و مشکلاتم را حل خواهد کرد.",
    type: "likert5",
    options: [...likertOptions],
  },
  {
    id: 21,
    sectionId: 5,
    sectionTitle: SECTIONS_V1[4].title,
    title: "هرگز پول کافی برای همه چیزهایی که می‌خواهم وجود ندارد.",
    type: "likert5",
    options: [...likertOptions],
  },
  {
    id: 22,
    sectionId: 5,
    sectionTitle: SECTIONS_V1[4].title,
    title: "داشتن پول زیاد زندگی را به‌طور محسوسی بهتر می‌کند.",
    type: "likert5",
    options: [...likertOptions],
  },

  {
    id: 23,
    sectionId: 5,
    sectionTitle: SECTIONS_V1[4].title,
    title: "ارزش شخصی من تا حد زیادی با میزان پول و دارایی‌ام تعریف می‌شود.",
    type: "likert5",
    options: [...likertOptions],
  },
  {
    id: 24,
    sectionId: 5,
    sectionTitle: SECTIONS_V1[4].title,
    title: "افراد موفق‌تر معمولاً کسانی هستند که پول بیشتری دارند.",
    type: "likert5",
    options: [...likertOptions],
  },
  {
    id: 25,
    sectionId: 5,
    sectionTitle: SECTIONS_V1[4].title,
    title:
      "برای نشان دادن موفقیت، خریدهای گران یا سبک زندگی لوکس لازم است.",
    type: "likert5",
    options: [...likertOptions],
  },

  {
    id: 26,
    sectionId: 5,
    sectionTitle: SECTIONS_V1[4].title,
    title:
      "برای من مهم است همیشه پس‌انداز کنم و خرج‌های غیرضروری را کم کنم.",
    type: "likert5",
    options: [...likertOptions],
  },
  {
    id: 27,
    sectionId: 5,
    sectionTitle: SECTIONS_V1[4].title,
    title:
      "ترجیح می‌دهم درباره مسائل مالی‌ام با دیگران صحبت نکنم (رازداری).",
    type: "likert5",
    options: [...likertOptions],
  },
  {
    id: 28,
    sectionId: 5,
    sectionTitle: SECTIONS_V1[4].title,
    title: "فقط زمانی ریسک مالی می‌پذیرم که احساس کنم تقریباً مطمئن هستم.",
    type: "likert5",
    options: [...likertOptions],
  },

  // ─────────────────────────────────────────────────────────────
  // Section 6 — Past experience
  // ─────────────────────────────────────────────────────────────
  {
    id: 29,
    sectionId: 6,
    sectionTitle: SECTIONS_V1[5].title,
    title:
      "بزرگ‌ترین ضرر مالی‌ای که تجربه کرده‌اید چگونه بوده و واکنش اولیه شما چه بوده؟",
    hint: "هدف: رفتار واقعی در زیان، نه دانش تئوری.",
    type: "single4",
    options: [
      { value: 1, label: "ضرر کوچک (کمتر از ۱۰٪) و سریع فروختم" },
      { value: 2, label: "ضرر متوسط و نگه داشتم تا برگردد" },
      { value: 3, label: "ضرر بزرگ و نگه داشتم یا اضافه کردم" },
      { value: 4, label: "ضرر بزرگ خاصی نداشته‌ام / خیلی کم بوده" },
    ],
  },
  {
    id: 30,
    sectionId: 6,
    sectionTitle: SECTIONS_V1[5].title,
    title:
      "آخرین باری که یک سرمایه‌گذاری‌تان سود قابل‌توجهی داد (مثلاً حدود +۵۰٪)، در عمل چه کردید؟",
    hint:
      "هدف: سنجش رفتار واقعی شما در سود (با سؤال ۱۴ فرق دارد: این یکی «واقعی و تجربی» است).",
    type: "single4",
    options: [
      { value: 1, label: "سریع بخشی/همه را فروختم تا سود قفل شود" },
      { value: 2, label: "نگه داشتم چون فکر می‌کردم رشد بیشتری دارد" },
      { value: 3, label: "بخشی را فروختم و بخشی را نگه داشتم" },
      { value: 4, label: "بیشتر خریدم چون ترس از جا ماندن داشتم (FOMO)" },
    ],
  },
  {
    id: 31,
    sectionId: 6,
    sectionTitle: SECTIONS_V1[5].title,
    title:
      "آیا تا حالا به خاطر ترس از جا ماندن از فرصت (FOMO) یا ترس از ضرر (FUD)، تصمیم احساسی گرفته‌اید؟",
    hint: "این سؤال برای هشدارهای رفتاری استفاده می‌شود.",
    type: "single4",
    options: [
      { value: 1, label: "خیلی زیاد" },
      { value: 2, label: "گاهی" },
      { value: 3, label: "کم" },
      { value: 4, label: "تقریباً هیچوقت" },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // Section 7 — Goals & Motivation
  // ─────────────────────────────────────────────────────────────
  {
    id: 32,
    sectionId: 7,
    sectionTitle: SECTIONS_V1[6].title,
    title:
      "پول برای شما بیشتر قرار است چه کاری انجام دهد؟ (می‌توانید چند گزینه انتخاب کنید)",
    hint: "ترجیح واقعی‌تان را انتخاب کنید، نه چیزی که «بهتر به نظر می‌رسد».",
    type: "multi",
    options: [
      { key: "security", label: "امنیت مالی و آرامش خاطر" },
      { key: "freedom", label: "آزادی و استقلال (زمان/سفر/انتخاب)" },
      { key: "luxury", label: "لذت و تجربه‌های باکیفیت/لوکس" },
      { key: "giving", label: "کمک به خانواده/دیگران/خیریه" },
      { key: "status", label: "قدرت و جایگاه اجتماعی" },
      { key: "growth", label: "رشد و ساخت آینده بهتر" },
    ],
  },
  {
    id: 33,
    sectionId: 7,
    sectionTitle: SECTIONS_V1[6].title,
    title: "پول را بیشتر شبیه کدام می‌بینید؟",
    hint: "فقط یک گزینه؛ نزدیک‌ترین تعریف را انتخاب کنید.",
    type: "single4",
    options: [
      { value: 1, label: "ابزاری برای امنیت و حفاظت" },
      { value: 2, label: "منبع لذت و خوشبختی" },
      { value: 3, label: "وسیله‌ای برای کمک به دیگران" },
      { value: 4, label: "معیار موفقیت و ارزش شخصی" },
    ],
  },
  {
    id: 34,
    sectionId: 7,
    sectionTitle: SECTIONS_V1[6].title,
    title:
      "اگر مبلغ بزرگی (مثلاً ۵ میلیارد تومان) ناگهان به دستتان برسد، اولین اقدام محتمل شما چیست؟",
    type: "single4",
    options: [
      { value: 1, label: "بیشترش را امن پس‌انداز/سرمایه‌گذاری می‌کنم" },
      { value: 2, label: "بخشی را خرج تجربه و لذت می‌کنم" },
      { value: 3, label: "به خانواده/دوستان کمک می‌کنم" },
      { value: 4, label: "بدهی‌ها را تسویه می‌کنم و بقیه را نگه می‌دارم" },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // Section 8 — Extra Likert (Less repetitive, more angle-based)
  // ─────────────────────────────────────────────────────────────
  {
    id: 35,
    sectionId: 8,
    sectionTitle: SECTIONS_V1[7].title,
    title:
      "معمولاً جزئیات درآمد/پس‌انداز/سرمایه‌گذاری‌ام را با دیگران مطرح نمی‌کنم.",
    type: "likert5",
    options: [...likertOptions],
  },
  {
    id: 36,
    sectionId: 8,
    sectionTitle: SECTIONS_V1[7].title,
    title: "پول زیاد اغلب آدم‌ها را تغییر می‌دهد و معمولاً بدترشان می‌کند.",
    type: "likert5",
    options: [...likertOptions],
  },
  {
    id: 37,
    sectionId: 8,
    sectionTitle: SECTIONS_V1[7].title,
    title: "اگر پول بیشتری داشتم، بخش بزرگی از مشکلاتم عملاً حل می‌شد.",
    type: "likert5",
    options: [...likertOptions],
  },
  {
    id: 38,
    sectionId: 8,
    sectionTitle: SECTIONS_V1[7].title,
    title: "آدم‌ها را (خواسته یا ناخواسته) با میزان دارایی‌شان قضاوت می‌کنم.",
    type: "likert5",
    options: [...likertOptions],
  },
  {
    id: 39,
    sectionId: 8,
    sectionTitle: SECTIONS_V1[7].title,
    title:
      "قبل از خرید، معمولاً چند قیمت را مقایسه می‌کنم و دنبال بهترین قیمت می‌گردم.",
    type: "likert5",
    options: [...likertOptions],
  },
  {
    id: 40,
    sectionId: 8,
    sectionTitle: SECTIONS_V1[7].title,
    title:
      "وقتی خریدهای باکیفیت/گران می‌کنم، دوست دارم دیده شود یا حس جایگاه به من بدهد.",
    type: "likert5",
    options: [...likertOptions],
  },
];
