# Folder Responsibility Contract
## Takhmino — Path C / Phase 0 (NON-BREAKING)

> هدف: مالکیت فولدرها + قوانین import + مرز لایه‌ها به شکلی که در Review قابل enforce باشد.
> Phase 0 فقط قفل مستندات است (بدون تغییر کد/رفتار).

---

## 0) Hard Constraints (Locked)
- هیچ Breaking Change مجاز نیست.
- `(light)` و `(dark)` حفظ شوند.
- Auth (JWT cookie `takhmino_auth` + middleware header `x-auth-user`) بدون تغییر رفتار.
- Dashboard و ابزارهای فعلی نباید خراب شوند.
- API routes stable بمانند.

---

## 1) Ownership Map (Folder → Owner → Responsibility)

### 1.1 `app/` (Root App Shell)
**Owner:** Presentation  
**Responsibility:** Layout/CSS/Favicon
- `app/layout.tsx`
- `app/globals.css`
- `app/favicon.ico`

---

### 1.2 `app/(light)/**` (Public)
**Owner:** Presentation  
**Responsibility:** صفحات عمومی
- `app/(light)/page.tsx` (Landing)
- `app/(light)/academy/*`
- `app/(light)/tools/page.tsx` (Tools list)

**Hard rule:** `(light)` نباید به `(dark)` import کند.

---

### 1.3 `app/(dark)/**` (Private + Auth UI As-Is)
**Owner:** Presentation  
**Responsibility:** صفحات خصوصی + login (As-Is)
- `app/(dark)/dashboard/*`
- `app/(dark)/tools/*`
- `app/(dark)/login/*`

---

### 1.4 `app/(dark)/tools/<tool>/**` (Tool-local)
**Owner:** Presentation (Tool UI)  
**Responsibility:** UI/logic داخلی هر ابزار (As-Is)
**Hard rules:**
- Tool A نباید از Tool B import کند.
- tool-local code فقط داخل همان tool folder مصرف شود.

---

### 1.5 `app/tools/registry/tools.registry.ts` (Registry)
**Owner:** Application boundary (Registry)  
**Hard rules:**
- Registry نباید UI از `app/(dark)/tools/**` import کند.
- Registry باید side-effect-free باشد.

---

### 1.6 `app/api/**` (HTTP boundary)
**Owner:** Infrastructure  
**Hard rule:** route contracts stable (Phase 0 بدون تغییر).

---

### 1.7 `app/_internal/**` (Internal reference)
**Owner:** Internal (Non-production)  
**Hard rule:** production code نباید از `_internal` import کند.

---

## 2) Infrastructure libs (LOCKED)

### 2.1 `lib/prisma.ts`
**Owner:** Infrastructure  
**Responsibility:** Prisma client (DB access boundary)

### 2.2 `lib/auth/*`
**Owner:** Infrastructure (Auth primitives)  
**Files (LOCKED):**
- `lib/auth/jwt.ts`
- `lib/auth/session.ts`
- `lib/auth/requireAuth.ts`
- `lib/auth/server.ts`

**Hard rules:**
- UI می‌تواند از `requireAuth/server` استفاده کند به عنوان boundary (As-Is).
- تعریف contract های auth در Phase 0 فقط مستند است (تغییر کد ممنوع).

### 2.3 `lib/toolRun/*` + `lib/toolRunLogger.client.ts`
**Owner:** Infrastructure/Application edge  
**Responsibility:** ToolRun logging client helpers (As-Is)

---

## 3) Import Rules (Hard)

### Allowed
- Presentation → Registry ✅
- Presentation → `lib/auth/*` (guard/helpers) ✅
- API routes → `lib/auth/*`, `lib/prisma.ts`, toolRun libs ✅
- Tool UI → tool-local modules ✅

### Forbidden (Must not introduce)
- `(light)` → `(dark)` ❌
- Registry → tool UI ❌
- Tool A → Tool B ❌
- Production → `_internal` ❌
- UI → import مستقیم از `app/api/**` route files ❌ (به جای آن fetch)

---

## 4) Phase 0 Rule: No New Coupling
- در Phase 0 هیچ coupling جدید اضافه نمی‌کنیم.
- coupling بد As-Is فقط در Debt Register ثبت می‌شود.