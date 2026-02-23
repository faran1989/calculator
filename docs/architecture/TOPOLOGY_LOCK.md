# Topology Lock (Phase 0)
## Middleware/Auth Utils — File-level Anchors

> هدف: قفل کردن مسیرهای واقعی فایل‌های middleware و auth utilities در ریپو.
> Phase 0 فقط مستندسازی است: هیچ تغییر کد/رفتاری انجام نمی‌شود.

---

## 1) Anchors (As-Is concepts)
- Auth uses JWT in HttpOnly cookie: `takhmino_auth`
- Middleware verifies token and sets header `x-auth-user`
- Server components read auth context via `getAuthUser()` (conceptual; در این ریپو مسیر واقعی در `lib/auth/server.ts` است)
- Route protection via `requireAuth()` (`lib/auth/requireAuth.ts`)
- Auth utilities:
  - JWT utilities: `lib/auth/jwt.ts`
  - Session utilities: `lib/auth/session.ts`

---

## 2) File-level paths (LOCKED)

### 2.1 Auth utilities (LOCKED)
- JWT util: `lib/auth/jwt.ts`
- Session util: `lib/auth/session.ts`
- Route protection: `lib/auth/requireAuth.ts`
- Server auth helpers: `lib/auth/server.ts`

### 2.2 Prisma & ToolRun libs (LOCKED supporting anchors)
- Prisma client: `lib/prisma.ts`
- ToolRun logger client (As-Is): `lib/toolRunLogger.client.ts`
- ToolRun client helper: `lib/toolRun/client.ts`

---

## 3) Middleware path (LOCKED - discovery status)

- Middleware file path: **NOT FOUND via `tree /f /a middleware*`**
- Expected locations to check (non-breaking, Phase 0 only):
  - `middleware.ts` at repo root
  - `src/middleware.ts` (src folder does not exist)
  - `app/middleware.ts` (App Router typically uses root `middleware.ts`)

> نتیجه Phase 0: فایل middleware در tree محدود ارائه‌شده پیدا نشد؛
> اما قرارداد رفتاری middleware (verify + set `x-auth-user`) در FLOWS/ARCHITECTURE قفل شده
> و مسیر دقیق فایل middleware در اولین مرحله Phase 1 باید با یک discover ساده (ripgrep/dir) قطعی شود
> بدون اینکه behavior تغییر کند.

---

## 4) Non-breaking rule
- در Phase 0 فقط مسیرها قفل می‌شوند.
- هیچ rename/move/merge انجام نمی‌شود.