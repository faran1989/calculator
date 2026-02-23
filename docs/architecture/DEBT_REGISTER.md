# Debt Register
## Takhmino — Path C / Phase 0 (NON-BREAKING)

> هدف: ثبت رسمی بدهی‌های معماری/تکرار/ریسک‌ها بدون تغییر کد.
> هر debt: شناسه یکتا، توصیف، شدت، ریسک، و فاز حل.

---

## Severity Scale
- **High:** احتمال drift/bug بالا یا مانع جدی مقیاس‌پذیری
- **Medium:** قابل مدیریت ولی در refactor آینده هزینه‌ساز
- **Low:** بهبودهای کوچک/کیفی

---

## A) Auth

### D-AUTH-01 — jwt vs session ambiguity (`lib/auth/jwt.ts` vs `lib/auth/session.ts`)
- **Severity:** Medium
- **Problem:** دو primitive مفهومی برای auth در کنار هم ممکن است منبع truth را مبهم کند.
- **Risk:** drift در claims/expiry/guards؛ سخت شدن refactor.
- **Fix Phase:** Phase 1 (یک قرارداد واحد + ownership شفاف، بدون breaking)

### D-AUTH-02 — `x-auth-user` lacks explicit schema/version (consumer: `lib/auth/server.ts`)
- **Severity:** High
- **Problem:** header payload بدون schema version رسمی و mapping مشخص.
- **Risk:** شکستن server-side reads و guard ها در refactor های آینده.
- **Fix Phase:** Phase 1 (تعریف contract نسخه‌دار + parse/validation)

### D-AUTH-03 — duplicated guarding strategy (client guard vs server guard)
- **Severity:** Medium
- **Problem:** `DashboardGuardClient.tsx` در کنار `lib/auth/requireAuth.ts` ممکن است رفتار دوبل ایجاد کند.
- **Risk:** edge cases (bfcache/back) و ناسازگاری در مسیرهای مختلف.
- **Fix Phase:** Phase 2 (policy واحد: server-first + client UX)

### D-AUTH-04 — middleware file path not locked yet
- **Severity:** Low (Phase 0 acceptable)
- **Problem:** فایل middleware در خروجی tree محدود پیدا نشد.
- **Risk:** مستندات file-level برای middleware ناقص می‌ماند.
- **Fix Phase:** Phase 1 (discover via repo-wide search, بدون تغییر رفتار)

---

## B) Tools / Template

### D-TOOL-01 — template duplication (copy/paste)
- **Severity:** High
- **Problem:** ابزارها template مشترک را دستی کپی می‌کنند.
- **Risk:** drift در UI/SEO/behavior، افزایش هزینه نگهداری.
- **Fix Phase:** Phase 1 (centralize template via shared components WITHOUT breaking routes)

### D-TOOL-02 — inconsistent `tool.config.ts`
- **Severity:** Medium
- **Problem:** برخی ابزارها config دارند، برخی ندارند.
- **Risk:** registry/SEO/features آینده سخت و ناهمگن.
- **Fix Phase:** Phase 1 (تعریف contract واحد tool.config + backfill non-breaking)

### D-TOOL-03 — domain logic mixed into client/tool-local engines
- **Severity:** Medium
- **Problem:** engine/scoring داخل client/tools folders بدون لایه domain/application.
- **Risk:** تست‌پذیری پایین، reuse سخت، drift منطقی.
- **Fix Phase:** Phase 2 (extract domain/application modules incrementally)

---

## C) ToolRun Logging

### D-LOG-01 — ToolRun schema not versioned
- **Severity:** High
- **Problem:** logging schema قرارداد رسمی نسخه‌دار ندارد.
- **Risk:** مهاجرت/تحلیل آینده شکننده، ناسازگاری داده‌ها.
- **Fix Phase:** Phase 1 (introduce schemaVersion + adapters)

### D-LOG-02 — inconsistent logging trigger policy
- **Severity:** Medium
- **Problem:** معلوم نیست run دقیقاً کی ثبت می‌شود (auto/manual/tool-by-tool).
- **Risk:** داده ناقص/غیرقابل اتکا در dashboard/history.
- **Fix Phase:** Phase 1 (policy واحد + instrumentation)

### D-LOG-03 — payload size & PII policy undefined
- **Severity:** Medium
- **Problem:** snapshot های inputs/outputs ممکن است حجیم یا شامل داده حساس شود.
- **Risk:** هزینه storage، performance، ریسک privacy.
- **Fix Phase:** Phase 2 (limits + redaction + retention policy)

---

## D) Internal / Dev Surfaces

### D-INT-01 — `/app/tools/test` could become production-coupled
- **Severity:** Low
- **Problem:** test page در مسیر production namespace وجود دارد.
- **Risk:** استفاده ناخواسته/وابستگی در production.
- **Fix Phase:** Phase 2 (move/lock behind internal flag, non-breaking)

---

## E) Documentation / Governance

### D-DOC-01 — flows locked but some details still code-confirmation dependent
- **Severity:** Low
- **Problem:** جزئیات claim های JWT و contract دقیق ToolRun payload نیازمند نگاه مستقیم به route.ts/prisma schema است.
- **Risk:** تفاوت بین doc-level و As-Is code-level در جزئیات.
- **Fix Phase:** Phase 0.5 یا Phase 1 (فقط تکمیل docs با quoting کم، بدون تغییر رفتار)