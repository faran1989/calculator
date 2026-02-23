\# Interaction Contract (Phase A — Visual Lock)



این سند قرارداد رفتار (Interaction) برای Template مشترک ابزارهای تخمینو است.

Hash routing و motion باید دقیقاً مطابق این قرارداد باشد.



---



\## 1) Tab Behavior (قفل‌شده)



\- Tab keys: `tool` و `about`

\- About باید \*\*Hash-based\*\* باشد:

&nbsp; - About URL: `/tools/home-buy#about`

&nbsp; - Tool URL: `/tools/home-buy` (بدون hash)

\- Sync منابع تغییر:

&nbsp; 1) initial load

&nbsp; 2) hashchange

&nbsp; 3) popstate (back/forward)



---



\## 2) Hash → State



\- اگر `window.location.hash === '#about'`:

&nbsp; - `activeTab = 'about'`

&nbsp; - `pendingScrollToAboutRef = true`

\- در غیر این صورت:

&nbsp; - `activeTab = 'tool'`



---



\## 3) State → URL



\### رفتن به Tool

\- `history.replaceState(null, '', pathname + search)` (بدون hash)

\- `pendingScrollToTopRef = true`

\- سپس `activeTab = 'tool'`



\### رفتن به About

\- `history.replaceState(null, '', pathname + search + '#about')`

\- `pendingScrollToAboutRef = true`

\- سپس `activeTab = 'about'`



---



\## 4) Scroll Behavior (قفل‌شده)



\### About

\- وقتی About فعال شد و `pendingScrollToAboutRef = true`:

&nbsp; - تلاش برای یافتن `document.getElementById('panel-about')`

&nbsp; - اجرای `scrollIntoView({ behavior: 'smooth', block: 'start' })`

&nbsp; - با `requestAnimationFrame` دو مرحله + `setTimeout(0)` برای اطمینان از mount



\### Tool

\- وقتی Tool فعال شد و `pendingScrollToTopRef = true`:

&nbsp; - اجرای `window.scrollTo({ top: 0, behavior: 'smooth' })`



---



\## 5) Motion Contract (اگر motion فعال است)



\- Transition ثابت: `MOTION.fast = { duration: 0.22 }`

\- تب‌ها با `AnimatePresence mode="wait" initial={false}`



\### Panel Animation

\- enter: `{ opacity: 0, y: 10 } → { opacity: 1, y: 0 }`

\- exit: `{ opacity: 0, y: -10 }`

\- duration: `0.22`



\### FAQ Accordion Animation

\- enter: `{ opacity: 0, y: -6 } → { opacity: 1, y: 0 }`

\- exit: `{ opacity: 0, y: -6 }`

\- duration: `0.22`



---



\## 6) Tool State Machine (حداقل‌های Snapshot)



\- `isCalculated`:

&nbsp; - `false` → فرم ورودی + CTA

&nbsp; - `true` → نتیجه + Insight + دکمه محاسبه مجدد

\- `loading`:

&nbsp; - `true` → CTA disabled + spinner + “در حال محاسبه…”

&nbsp; - `false` → CTA فعال

\- زمان loading برای Snapshot Loading: `700ms` با `setTimeout`



