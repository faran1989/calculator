\# UI Contract (Phase A — Visual Lock)



این سند قرارداد UI برای Template مشترک ابزارهای تخمینو است.

هیچ بازطراحی یا تغییر خارج از قفل‌ها مجاز نیست.



---



\## 1) ساختار 6 بخش Template (قفل‌شده)



1\) \*\*Background سراسری\*\* (گرادیانت ملایم)

2\) \*\*Header\*\* (Glass تیره قوی)

3\) \*\*Hero\*\* (Glass تیره قوی: H1 + subtitle + tabs)

4\) \*\*Main Container روشن\*\* (بدون blur، چسبیده به Hero)

5\) \*\*Related Tools مستقل\*\* (بعد از Main، بدون glass/blur)

6\) \*\*Footer\*\* (Glass تیره)



> قفل: \*\*Glass فقط در Header / Hero / Footer\*\* و هیچ blur در Main و Related.



---



\## 2) کلاس‌های کلیدی Shell (مرجع دقیق)



\### Root Wrapper

\- `min-h-screen text-slate-100 flex flex-col overflow-x-hidden`

\- `bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950`

\- `selection:bg-blue-500/20`

\- `dir="rtl"`

\- Font: `Vazirmatn` (`vazirmatn.className`)



---



\### Header (Glass)

\- Wrapper: `fixed top-0 inset-x-0 z-50`

\- Glass: `backdrop-blur-2xl bg-slate-950/80 border-b border-white/10`

\- Height: `h-\[56px] sm:h-\[60px]`

\- Container: `max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between`



---



\### Hero (Glass)

\- Section spacing: `w-full pt-\[80px] sm:pt-\[92px]`

\- Card:

&nbsp; - `backdrop-blur-2xl bg-slate-950/75 border border-white/10`

&nbsp; - `rounded-\[28px] md:rounded-\[32px]`

&nbsp; - `px-6 py-8 md:px-10 md:py-10`

&nbsp; - `shadow-\[0\_30px\_90px\_rgba(0,0,0,0.45)]`

&nbsp; - `max-h-\[40vh]`

\- Overlay: `absolute inset-0 bg-gradient-to-b from-white/6 via-transparent to-transparent`



---



\### Tabs داخل Hero

\- Tablist shell: `p-1 rounded-2xl bg-white/8 border border-white/10`

\- Active tab: `${ACCENT.solid} text-white shadow-sm`

\- Inactive tab: `text-white/80 hover:bg-white/6`

\- Focus ring: `focus-visible:ring-2 focus-visible:ring-blue-500/45 ...`



---



\### Main Container (روشن، بدون blur، چسبیده به Hero)

\- Overlap: `-mt-5 md:-mt-6`

\- Background: `bg-slate-50/95 text-slate-900`

\- Radius: `rounded-\[28px] md:rounded-\[32px]`

\- Shadow: `shadow-\[0\_18px\_70px\_rgba(0,0,0,0.18)]`

\- Border: `border border-white/10`

\- Padding: `p-6 md:p-10`



---



\### Related Tools (روشن، ساده — بدون blur/glass)

\- Title: `text-white` (H2)

\- Divider: `h-px flex-1 bg-white/10 ...`

\- Cards:

&nbsp; - `rounded-\[20px] border border-slate-200/70 bg-slate-50/95`

&nbsp; - `px-5 py-4 shadow-sm`

\- Mobile constraint: `idx >= 2 → hidden sm:block` (حداکثر ۲ کارت روی موبایل)



---



\### Footer (Glass)

\- Shell: `backdrop-blur-xl bg-slate-950/70 border-t border-white/10`

\- Container: `max-w-6xl mx-auto px-4 sm:px-6 py-6`



---



\## 3) تایپوگرافی (قفل‌شده)



\- \*\*H1 (فقط یک عدد در کل صفحه، داخل Hero):\*\*

&nbsp; - `text-2xl md:text-4xl font-black text-white leading-tight`

\- \*\*Subtitle زیر H1:\*\*

&nbsp; - `text-white/75 text-sm md:text-base leading-7 max-w-2xl`

\- \*\*H2 در About (دقیقاً ۵ بخش InnerSectionCard):\*\*

&nbsp; - `text-lg md:text-xl font-black text-slate-900`

\- \*\*Body متن‌ها:\*\*

&nbsp; - غالباً `text-slate-700` با `leading-8` یا `leading-7`

\- \*\*Caption/ریزمتن‌ها:\*\*

&nbsp; - `text-xs` یا `text-\[13px]` با `text-slate-600`



---



\## 4) Spacing Rules + Breakpoints



\- Breakpoints فعال: `sm`, `md`

\- Layout width ثابت: `max-w-6xl mx-auto px-4 sm:px-6`

\- Hero → Main overlap ثابت: `-mt-5 md:-mt-6`

\- Card radii استاندارد: Hero/Main `28px → md:32px`

\- Input heights: `h-\[56px]`

\- CTA height: `h-\[60px]`



