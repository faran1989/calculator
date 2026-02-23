\# Baseline Snapshot Definition (Phase A — Visual Lock)



این سند «مرجع ثابت تصویری» برای Template مشترک ابزارهای تخمینو است.

هیچ تغییری خارج از قفل‌ها مجاز نیست.



---



\## قوانین عمومی Snapshot



\- \*\*محیط تست:\*\* Chrome (Desktop) + Safari/Chrome (Mobile) یا Chrome با DevTools Device Emulation

\- \*\*تم/فونت:\*\* همان Vazirmatn (بدون تغییر)

\- \*\*URL پایه ابزار:\*\*

&nbsp; - Tool tab: `/tools/home-buy`

&nbsp; - About tab: `/tools/home-buy#about`

\- \*\*قبل از گرفتن عکس:\*\*

&nbsp; - یک‌بار refresh

&nbsp; - Tool: اسکرول در بالا (top=0)

&nbsp; - About: روی ابتدای `#panel-about` (طبق scrollIntoView)



---



\## Desktop Snapshots (۴ حالت قطعی)



\### D1 — Desktop / Tool tab / Initial (قبل از محاسبه)

\- \*\*Viewport:\*\* 1440×900

\- \*\*URL:\*\* `/tools/home-buy`

\- \*\*انتظار:\*\*

&nbsp; - Hero شیشه‌ای با H1 و subtitle و تب‌ها

&nbsp; - Main روشن و چسبیده به Hero (`-mt-5 md:-mt-6`)

&nbsp; - داخل Tool: ۳ input + دکمه “تخمین بزن”

&nbsp; - Related Tools پایین‌تر دیده شود (۳ کارت در desktop)



\### D2 — Desktop / About tab (Hash)

\- \*\*Viewport:\*\* 1440×900

\- \*\*URL:\*\* `/tools/home-buy#about`

\- \*\*انتظار:\*\*

&nbsp; - تب “درباره ابزار” Active

&nbsp; - اسکرول نرم به ابتدای پنل About (element id=`panel-about`)

&nbsp; - About شامل دقیقاً ۵ بخش استاندارد (۵ کارت InnerSectionCard با H2)



\### D3 — Desktop / Tool tab / Filled (Result state)

\- \*\*Viewport:\*\* 1440×900

\- \*\*URL:\*\* `/tools/home-buy`

\- \*\*مسیر اجرا:\*\*

&nbsp; 1) روی `/tools/home-buy` بمان

&nbsp; 2) دکمه “تخمین بزن” را بزن

&nbsp; 3) بعد از پایان loading، اسنپ‌شات بگیر

\- \*\*انتظار:\*\*

&nbsp; - متن “نتیجه تخمین صادقانه”

&nbsp; - خروجی بزرگ آبی (rangeText یا “همین الان ✅”)

&nbsp; - Insight Box و دکمه “تغییر اعداد و محاسبه مجدد”



\### D4 — Desktop / Tool tab / Loading (حالت غیرعادی)

\- \*\*Viewport:\*\* 1440×900

\- \*\*URL:\*\* `/tools/home-buy`

\- \*\*روش گرفتن:\*\*

&nbsp; - بلافاصله بعد از کلیک “تخمین بزن” (در بازه ۷۰۰ms) عکس بگیر

\- \*\*انتظار:\*\*

&nbsp; - دکمه Disabled

&nbsp; - اسپینر و متن “در حال محاسبه…”



---



\## Mobile Snapshots (۴ حالت قطعی)



\### M1 — Mobile / Tool tab / Initial

\- \*\*Viewport:\*\* 390×844 (iPhone 13/14)

\- \*\*URL:\*\* `/tools/home-buy`

\- \*\*انتظار:\*\*

&nbsp; - Header ثابت شیشه‌ای

&nbsp; - Hero شیشه‌ای

&nbsp; - تب‌ها در Hero تمام‌عرض

&nbsp; - Main روشن

&nbsp; - Related Tools: حداکثر ۲ کارت (کارت سوم hidden)



\### M2 — Mobile / About tab (Hash)

\- \*\*Viewport:\*\* 390×844

\- \*\*URL:\*\* `/tools/home-buy#about`

\- \*\*انتظار:\*\*

&nbsp; - تب About Active

&nbsp; - اسکرول نرم به `panel-about`

&nbsp; - ۵ بخش About پشت سر هم



\### M3 — Mobile / Tool tab / Filled (Result state)

\- \*\*Viewport:\*\* 390×844

\- \*\*اجرا:\*\* مثل D3

\- \*\*انتظار:\*\*

&nbsp; - خروجی بزرگ

&nbsp; - Insight Box

&nbsp; - دکمه محاسبه مجدد



\### M4 — Mobile / Tool tab / Loading

\- \*\*Viewport:\*\* 390×844

\- \*\*اجرا:\*\* مثل D4

\- \*\*انتظار:\*\*

&nbsp; - اسپینر داخل CTA



