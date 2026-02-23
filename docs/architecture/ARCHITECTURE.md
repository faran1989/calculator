# Takhmino — Enterprise Refactor (Path C)
## Phase 0: Architecture Lock (NON-BREAKING)

> هدف: قفل کردن معماری فعلی (As-Is) + تعریف Target لایه‌ای در حد «نقشه»، بدون ریفکتور سنگین و بدون Breaking Change.
> خروجی این Phase فقط مستندات قابل commit است.

---

## 0) Hard Constraints (Locked)

- هیچ تغییر شکننده (Breaking Change) مجاز نیست.
- Route Groups: `(light)` و `(dark)` باید حفظ شوند.
- JWT در HttpOnly Cookie با نام `takhmino_auth` باید همان‌طور بماند.
- Middleware توکن را verify می‌کند و header `x-auth-user` را set می‌کند.
- Server-side auth helpers از header می‌خوانند (As-Is).
- `requireAuth()`/guard ها مسیرهای خصوصی را محافظت می‌کنند (Dashboard و ابزارهای فعلی نباید خراب شوند).
- Prisma ORM پابرجا.
- API routes باید stable بمانند.
- رفتار production باید stable بماند.
- ابزارها: `/app/(dark)/tools/*` پابرجا.
- لیست ابزارها: `/app/(light)/tools/page.tsx` پابرجا.
- Tool registry: `/app/tools/registry/tools.registry.ts` پابرجا.
- Internal UI reference: `/app/_internal/ui-test` پابرجا.
- مشکل فعلی: ابزارها template را دستی copy می‌کنند — فعلاً فقط ثبت debt، نه اصلاح.

---

## 1) System Context (High-Level)

### 1.1 Product Definition
Takhmino پلتفرم «تخمین و تصمیم‌سازی مالی» است (نه پیش‌بینی قطعی) با:
- سطوح عمومی (landing / academy / tools list)
- سطوح خصوصی (dashboard / tool execution)
- Auth با JWT Cookie + Middleware bridge (x-auth-user)
- Tool execution + ثبت ToolRun

### 1.2 Runtime Model (Next.js App Router)
- Server Components برای صفحات و خواندن auth context از header
- Client Components برای UI تعاملی ابزارها
- Middleware برای verify و تزریق `x-auth-user`

---

## 2) Architecture Map — As-Is (Locked Snapshot)

### 2.1 App Shell
- `app/layout.tsx` (Root layout)
- `app/globals.css`
- `app/favicon.ico`

### 2.2 Route Groups
#### Public Surface — `app/(light)`
- `app/(light)/layout.tsx`
- `app/(light)/page.tsx`
- `app/(light)/academy/page.tsx` + `AcademyClient.tsx`
- `app/(light)/academy/articles/` (فعلاً empty)
- `app/(light)/tools/page.tsx` (Tools list)

#### Auth + Private Surface — `app/(dark)`
- `app/(dark)/layout.tsx`
- `app/(dark)/login/page.tsx` + `LoginClient.tsx`
- `app/(dark)/dashboard/page.tsx`
  - `DashboardGuardClient.tsx`
  - `NoBfcache.tsx`
- `app/(dark)/dashboard/add-run/page.tsx`
- `app/(dark)/tools/*` (اجرای ابزارها)

### 2.3 Tools (Private execution)
- `app/(dark)/tools/financial-literacy/`
  - `page.tsx`, `FinancialLiteracyClient.tsx`, `tool.config.ts`
- `app/(dark)/tools/financial-taste/`
  - `page.tsx`, `FinancialTasteClient.tsx`, `tool.config.ts`
  - `components/*`, `data/*`, `engine/*`, `lib/*`
- `app/(dark)/tools/home-buy/` → `page.tsx`, `HomeBuyClient.tsx`
- `app/(dark)/tools/loan/` → `page.tsx`, `loanClient.tsx`, `tool.config.ts`
- `app/(dark)/tools/gold-goal/page.tsx` (placeholder)
- `app/(dark)/tools/purchasing-power/page.tsx` (placeholder)

### 2.4 Tool Registry (Shared)
- `app/tools/registry/tools.registry.ts`

### 2.5 API Routes (Stable contract)
- Auth:
  - `app/api/auth/login/route.ts`
  - `app/api/auth/logout/route.ts`
  - `app/api/auth/me/route.ts`
  - `app/api/auth/register/route.ts`
- ToolRuns:
  - `app/api/tool-runs/route.ts`

### 2.6 Infrastructure libs (LOCKED anchors)
- Prisma:
  - `lib/prisma.ts`
- Auth primitives:
  - `lib/auth/jwt.ts`
  - `lib/auth/session.ts`
  - `lib/auth/server.ts`
  - `lib/auth/requireAuth.ts`
- ToolRun:
  - `lib/toolRunLogger.client.ts`
  - `lib/toolRun/client.ts`

### 2.7 Internal Reference (Non-production)
- `app/_internal/ui-test/*`
  - `page.tsx`, `tool.config.ts`, `UiTestClient.tsx`

---

## 3) Layer Boundaries — Target (Document-level, Non-Breaking Direction)

### 3.1 Presentation Layer (As-Is locked)
- `app/(light)/**`
- `app/(dark)/**`
- tool-local modules inside each tool folder

### 3.2 Application Layer (Target)
- Use-cases / orchestration (ExecuteTool, LogToolRun, ListTools, AuthGate)
- پیشنهاد محل: `src/application/**` یا `app/_core/application/**` (Phase 1 decision)

### 3.3 Domain Layer (Target)
- Entities/Value Objects (Tool, ToolRun, UserContext)
- پیشنهاد محل: `src/domain/**` یا `app/_core/domain/**`

### 3.4 Infrastructure Layer (As-Is + Target)
- `app/api/**`
- `lib/prisma.ts`
- `lib/auth/**`
- `lib/toolRun/**` + logger client

---

## 4) As-Is → Target: Non-Breaking Strategy

- Route Groups unchanged
- Middleware unchanged (file path هنوز قفل نشده ولی رفتار قفل است)
- Cookie name unchanged
- API contracts unchanged
- Phase 0: فقط docs + debt register
- Phase 1+: اضافه کردن لایه‌های application/domain به‌صورت incremental و non-breaking

---

## 5) Phase 0 Deliverables (This folder)
- `/docs/architecture/ARCHITECTURE.md` ✅
- `/docs/architecture/FOLDER_CONTRACT.md` ✅
- `/docs/architecture/FLOWS.md` ✅
- `/docs/architecture/DEBT_REGISTER.md` ✅
- `/docs/architecture/TOPOLOGY_LOCK.md` ✅

---

## 6) Success Criteria (Phase 0 — measurable + testable)

### 6.1 Repository / Docs
- [ ] مسیر `/docs/architecture/` وجود دارد.
- [ ] این فایل‌ها وجود دارند:
  - [ ] `ARCHITECTURE.md`
  - [ ] `FOLDER_CONTRACT.md`
  - [ ] `FLOWS.md`
  - [ ] `DEBT_REGISTER.md`
  - [ ] `TOPOLOGY_LOCK.md`
- [ ] قوانین import و مالکیت فولدرها در `FOLDER_CONTRACT.md` صریح و enforceable است.
- [ ] مسیرهای واقعی auth/prisma/toolrun libs در `TOPOLOGY_LOCK.md` قفل شده‌اند.

### 6.2 Build & Runtime Stability
- [ ] `npm run build` موفق است.
- [ ] `npm run dev` اجرا می‌شود و صفحات کلیدی باز می‌شوند:
  - [ ] `/(light)` landing
  - [ ] `/(light)/tools`
  - [ ] `/(light)/academy`

### 6.3 Auth Stability
- [ ] `GET /login` صفحه ورود load می‌شود.
- [ ] Login از UI → `POST /api/auth/login` موفق و cookie `takhmino_auth` ست می‌شود.
- [ ] `/dashboard` بعد از login قابل دسترسی است.
- [ ] Logout از UI → `POST /api/auth/logout` cookie را پاک می‌کند.
- [ ] بعد از logout، `/dashboard` رفتار unauthenticated As-Is را نشان می‌دهد.

### 6.4 Tools Stability
- [ ] بعد از login مسیرهای زیر باز می‌شوند:
  - [ ] `/tools/financial-literacy`
  - [ ] `/tools/financial-taste`
  - [ ] `/tools/home-buy`
  - [ ] `/tools/loan`
- [ ] لیست ابزارها در `/(light)/tools` از registry می‌خواند و لینک‌ها درست هستند.

### 6.5 ToolRun Stability
- [ ] `POST /api/tool-runs` موجود است و contract آن تغییر نکرده.
- [ ] logging libs مسیرشان قفل است (`lib/toolRun/*` و `lib/toolRunLogger.client.ts`).
- [ ] در `FLOWS.md` schema v0 و v1 (doc-level) تعریف شده بدون تحمیل تغییر کد.

### 6.6 Governance / Reviewability
- [ ] Reviewer می‌تواند با خواندن `FLOWS.md` مسیر Auth/Tool Execution/ToolRun را end-to-end دنبال کند.
- [ ] Debt ها در `DEBT_REGISTER.md` دارای شناسه، Severity، Risk، Fix Phase هستند.
- [ ] هیچ تصمیم اجرایی برای Phase 1+ در Phase 0 اعمال نشده (فقط doc-level target).

---

## 7) Definition of Done (Phase 0)
Phase 0 زمانی Done است که:
- تمام موارد Success Criteria تیک خورده باشند،
- و هیچ regression عملی در login/logout/dashboard/tools رخ نداده باشد،
- و docs در یک یا چند commit قابل review موجود باشند.