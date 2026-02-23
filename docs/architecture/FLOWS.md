# FLOWS (As-Is)
## Takhmino — Path C / Phase 0 (NON-BREAKING)

> هدف: قفل کردن جریان‌های حیاتی سیستم به‌صورت As-Is.
> Phase 0 فقط مستندسازی + ثبت debt است.

---

## 0) Hard Constraints (Locked)
- هیچ Breaking Change مجاز نیست.
- Route Groups `(light)` و `(dark)` حفظ شوند.
- JWT cookie: `takhmino_auth` ثابت.
- Middleware verify + set `x-auth-user` ثابت.
- Server-side auth helpers از header می‌خوانند (As-Is).
- guard/requireAuth رفتار فعلی را حفظ می‌کنند.
- API routes stable.

---

# 1) Auth Flow (As-Is)

## 1.1 Components (File-level anchors where known)

### Login UI
- `app/(dark)/login/page.tsx`
- `app/(dark)/login/LoginClient.tsx`

### Auth API
- `app/api/auth/login/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/auth/me/route.ts`
- `app/api/auth/register/route.ts`

### Private surfaces
- `app/(dark)/dashboard/page.tsx`
- `app/(dark)/dashboard/DashboardGuardClient.tsx`
- `app/(dark)/dashboard/NoBfcache.tsx`
- `app/(dark)/tools/*`

### Auth helpers (LOCKED)
- Route protection: `lib/auth/requireAuth.ts`
- Server auth helpers (header read): `lib/auth/server.ts`
- JWT utilities: `lib/auth/jwt.ts`
- Session utilities: `lib/auth/session.ts`

### Middleware (behavior locked, file path TBD)
- Verifies JWT cookie `takhmino_auth`
- Sets header `x-auth-user`
- File path not found in provided `tree middleware*` output (see TOPOLOGY_LOCK.md)

---

## 1.2 Login Sequence
1) `GET /login` → render login UI  
2) submit → `POST /api/auth/login`  
3) server validates → issues JWT → sets HttpOnly cookie `takhmino_auth`  
4) client navigates/redirects to private surface (As-Is)

**Locked:** cookie name/HttpOnly + middleware bridge رفتاراً ثابت.

---

## 1.3 Middleware Bridge
1) request hits middleware  
2) reads `takhmino_auth`  
3) verify JWT  
4) if valid → set header `x-auth-user`  
5) if invalid/missing → header absent/empty + route behavior As-Is

**Locked:** header name `x-auth-user` و verify logic پابرجا.

---

## 1.4 Server-side Auth Read (As-Is)
- Server components/handlers use `lib/auth/server.ts`
- Reads `x-auth-user` header
- Returns user context or null

---

## 1.5 Route Protection (As-Is)
- Dashboard:
  - client guard: `app/(dark)/dashboard/DashboardGuardClient.tsx`
  - bfcache mitigation: `app/(dark)/dashboard/NoBfcache.tsx`
  - server protection (where applicable): `lib/auth/requireAuth.ts`
- Tools:
  - private routes under `app/(dark)/tools/*`
  - protection As-Is (may be server checks +/or client guards per tool)

---

## 1.6 Logout Sequence
1) `POST /api/auth/logout`  
2) server clears cookie `takhmino_auth` (Max-Age=0 or expire)  
3) redirect As-Is (previously noted: 303 → `/login`)  
4) middleware no longer sees valid cookie → private surfaces behave unauthenticated

---

## 1.7 Auth Debts (File-level)
- D-AUTH-01: ambiguity بین `lib/auth/jwt.ts` و `lib/auth/session.ts`
- D-AUTH-02: header `x-auth-user` بدون schema/version رسمی (با وجود server.ts consumer)
- D-AUTH-03: دوگانه‌بودن guard (DashboardGuardClient) و server checks (requireAuth) در برخی مسیرها

---

# 2) Tool Execution Flow (As-Is)

## 2.1 Discovery → Execution
1) Public list:
- `GET /(light)/tools`
- `app/(light)/tools/page.tsx`
- reads `app/tools/registry/tools.registry.ts`

2) Navigate to tool:
- `GET /(dark)/tools/<slug>`
- `app/(dark)/tools/<slug>/page.tsx`
- renders Client component (per tool)

3) Auth context:
- middleware sets `x-auth-user`
- server helpers in `lib/auth/server.ts` may read it (As-Is)
- client guards may exist As-Is

4) User inputs + compute:
- computed mostly in client (As-Is)
- tool-local engine/data/lib used (notably `financial-taste/*`)

5) Optional persistence/logging:
- call `POST /api/tool-runs` → `app/api/tool-runs/route.ts` (As-Is contract)

---

## 2.2 Tool Composition Patterns (As-Is)
- Pattern A: `page.tsx` + Client + `tool.config.ts`
  - financial-literacy, financial-taste, loan
- Pattern B: `page.tsx` + Client (no tool.config visible)
  - home-buy
- Pattern C: placeholder `page.tsx` only
  - gold-goal, purchasing-power

---

## 2.3 Tool Debts
- D-TOOL-01: template duplication across tools (copy/paste)
- D-TOOL-02: inconsistent presence of `tool.config.ts`
- D-TOOL-03: domain rules mixed into client/tool-local engines (testability/portability)

---

# 3) ToolRun Logging Flow (As-Is) + Schema v0/v1 (Document-level)

## 3.1 Actors / Components (Anchors)
- Tool UI (client) inside `app/(dark)/tools/*`
- Dashboard add-run: `app/(dark)/dashboard/add-run/page.tsx`
- ToolRun API: `app/api/tool-runs/route.ts`
- ToolRun libs (As-Is):
  - `lib/toolRunLogger.client.ts`
  - `lib/toolRun/client.ts`
- Storage:
  - `lib/prisma.ts` (Prisma client)

---

## 3.2 As-Is Flow
1) User executes a tool (client computes result)
2) UI decides to persist a run (manual or automatic As-Is)
3) Client sends request:
   - `POST /api/tool-runs`
   - payload includes tool identity + inputs/outputs snapshot (As-Is)
4) API authenticates user context (via existing bridge)
5) API writes ToolRun record via Prisma
6) Dashboard reads/renders runs history (As-Is)

---

## 3.3 ToolRun Schema — v0 (Current, Document-level)
> چون مدل Prisma و route handler را در Phase 0 parse نکرده‌ایم، v0 را «حداقلی و سازگار با As-Is» ثبت می‌کنیم.

- `id`
- `userId`
- `toolSlug`
- `createdAt`
- `input` (json | optional)
- `output` (json | optional)
- `meta` (json | optional)

**Rule:** Phase 0 هیچ فیلدی را الزام نمی‌کند.

---

## 3.4 ToolRun Schema — v1 (Target, Document-only)
- `schemaVersion`: `"1"`
- `tool`: `{ slug, version }`
- `timestamps`: `{ createdAt, completedAt? }`
- `payload`: `{ inputs, outputs }`
- `telemetry?`: `{ durationMs, client?, flags? }`

**Compatibility:** v1 باید non-breaking و قابل انطباق با v0 باشد (Phase 1+).

---

## 3.5 ToolRun Debts
- D-LOG-01: schema not versioned (v0 undocumented in code)
- D-LOG-02: inconsistent logging trigger policy
- D-LOG-03: payload size & PII policy undefined