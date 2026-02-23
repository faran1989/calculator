\# No-Drift Checklist (Phase A — Visual Lock)



این چک‌لیست برای جلوگیری از انحراف Template است.

هر PR یا تغییر UI باید با این چک‌لیست پاس شود.



---



\## 1) قوانین قفل (همیشه باید درست بماند)



\- \[ ] `page.tsx` = Server Component و فقط `metadata` (بدون `next/head`)

\- \[ ] JSON-LD فقط با `next/script` (سه Script: `webapp` / `breadcrumb` / `faq`)

\- \[ ] Hash routing برای About = `#about`

\- \[ ] فقط \*\*یک H1\*\* در کل صفحه (داخل Hero)

\- \[ ] About = دقیقاً \*\*۵ بخش استاندارد با H2\*\* + بخش ۵ = FAQ آکاردئونی

\- \[ ] Related Tools مستقل بعد از Main و قبل Footer

\- \[ ] Glass فقط Header/Hero/Footer

\- \[ ] Main روشن، بدون blur، چسبیده به Hero (`-mt-5 md:-mt-6`)

\- \[ ] معماری SEO فنی دست نخورد (metadata/JSON-LD/canonical)



---



\## 2) قوانین UI Drift ممنوع



\- \[ ] هیچ blur/backdrop در Main یا Related اضافه نشود

\- \[ ] Hero/Header/Footer باید تیره و glass باقی بمانند (همان خانواده opacity/blur)

\- \[ ] ساختار 6 بخش Template جابه‌جا نشود

\- \[ ] تب‌ها حتماً داخل Hero بمانند

\- \[ ] Related Tools روی موبایل حداکثر ۲ کارت نمایش دهد (`hidden sm:block` برای کارت سوم)



---



\## 3) قوانین Interaction Drift ممنوع



\- \[ ] About باید با hash قابل لینک و share باشد: `/tools/...#about`

\- \[ ] back/forward باید state تب را همگام کند (`popstate` فعال)

\- \[ ] ورود به About باید scroll smooth به `panel-about` انجام دهد

\- \[ ] برگشت به Tool باید scroll smooth به top انجام دهد

\- \[ ] duration انیمیشن‌ها ثابت بماند (`0.22`)



