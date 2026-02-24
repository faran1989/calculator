# تخمینو — راهنمای Claude Code

این فایل توسط Claude Code خوانده می‌شود تا context پروژه در هر session حفظ شود.

---

## پروژه
- **نام:** تخمینو (Takhmino) — پلتفرم ماشین‌حساب مالی فارسی
- **Stack:** Next.js 15 App Router، React 19، TypeScript، Prisma 6، SQLite (dev) / Turso (prod)
- **Deployment:** Vercel — repo: github.com/faran1989/calculator
- **ایمیل:** Resend API
- **زبان UI:** فارسی (RTL)، فونت Vazirmatn
- **احراز هویت:** JWT (jose/HS256) در HttpOnly cookie `takhmino_auth`، 7 روز

---

## Route Groups
- `app/(dark)/` — صفحات با تم تیره: login، register، dashboard، forgot-password، reset-password
- `app/(light)/` — صفحات با تم روشن: صفحه اصلی، ابزارها، آکادمی
- `app/_shell/` — AppShell + PublicHeader + PublicFooter + AuthModal

---

## فازهای کامل شده ✅
1. Security (rate limit، bcrypt، SESSION_SECRET required)
2. DB migration (Prisma + SQLite/Turso)
3. Vercel deployment
4. Register + email verification (Resend)
5. Dashboard (luxury light theme)
6. Forgot password / Reset password flow
7. Gravatar avatar (MD5 hash، d=404 fallback به initials)
8. Change password (داخل داشبورد — ChangePasswordForm)
9. Auth-aware public header (avatar+dropdown برای logged-in، ورود/ثبت‌نام برای guest)
10. Dashboard nav links (صفحه اصلی، ابزارها، آکادمی در هدر داشبورد)

---

## فایل‌های کلیدی
| فایل | توضیح |
|------|-------|
| `middleware.ts` | x-auth-user header برای همه روت‌ها |
| `lib/auth/jwt.ts` | signAuthToken / verifyAuthToken |
| `lib/auth/server.ts` | getAuthUser (از x-auth-user header) |
| `lib/auth/requireAuth.ts` | requireAuth (redirect اگر لاگین نیست) |
| `lib/gravatar.ts` | getGravatarUrl(email, size) |
| `lib/email/resend.ts` | sendVerificationEmail + sendPasswordResetEmail |
| `lib/prisma.ts` | prisma client |
| `app/_shell/AppShell.tsx` | async server component، chrome="public" → user به PublicHeader |
| `app/_shell/public/PublicHeader.tsx` | auth-aware: avatar+dropdown یا ورود/ثبت‌نام |
| `app/_shell/public/AuthModal.tsx` | 3 state: login / register / forgot (inline) |
| `app/(dark)/dashboard/page.tsx` | luxury light theme، ChangePasswordForm، nav links |
| `components/AvatarWithFallback.tsx` | Gravatar با fallback به initials |
| `prisma/schema.prisma` | User + PasswordReset + ToolRun + UserProfile |

---

## API Routes
| Method | Route | توضیح |
|--------|-------|-------|
| POST | `/api/auth/login` | ورود |
| POST | `/api/auth/register` | ثبت‌نام |
| POST | `/api/auth/logout` | خروج (redirect به /) |
| GET | `/api/auth/verify-email` | تأیید ایمیل |
| POST | `/api/auth/forgot-password` | ارسال ایمیل reset (rate limit 3/hour) |
| POST | `/api/auth/reset-password` | تغییر پسورد با token |
| POST | `/api/auth/change-password` | تغییر پسورد (logged-in) |
| POST | `/api/tool-runs` | ذخیره نتیجه ابزار |

---

## Locked Contracts (بدون ثبت در PROJECT_LOCKS.md تغییر نده)
- Cookie name: `takhmino_auth`
- Route groups: `(light)` و `(dark)` باید بمانند
- API routes: `/api/auth/*` و `/api/tool-runs` قراردادهای پایدار
- Middleware: verify JWT → set x-auth-user header روی همه روت‌ها

---

## نکات مهم
- build محلی ممکنه EPERM بده (dev server DLL lock) — عادیه، push به Vercel کافیه
- `prisma.config.ts` env loading رو skip می‌کنه — برای CLI از `dotenv-cli -e .env.local` استفاده کن
- `.env.local` باید دستی ساخته بشه (git-ignored)، شامل: `DATABASE_URL`، `SESSION_SECRET`، `RESEND_API_KEY`
- Admin user: faranhastam@gmail.com
