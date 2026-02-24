"use client";

import React, { useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";

const BRAND = "#10B981";

export default function ChangePasswordForm() {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function reset() {
    setCurrentPassword(""); setNewPassword(""); setConfirm("");
    setError(null); setSuccess(false); setShowPass(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirm) { setError("رمزهای جدید با هم مطابقت ندارند."); return; }
    if (newPassword.length < 8) { setError("رمز جدید باید حداقل ۸ کاراکتر باشد."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) { setError(data?.error ?? "خطایی رخ داد."); return; }
      setSuccess(true);
      setTimeout(() => { setOpen(false); reset(); }, 2000);
    } catch {
      setError("خطای غیرمنتظره.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-black/8 bg-white overflow-hidden shadow-sm">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => { setOpen(!open); reset(); }}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-colors">
            <KeyRound className="w-4 h-4 text-slate-500 group-hover:text-emerald-600 transition-colors" />
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-800">تغییر رمز عبور</p>
            <p className="text-xs text-slate-400">رمز حسابت رو به‌روز کن</p>
          </div>
        </div>
        <span className={`text-slate-400 text-xs transition-transform duration-200 ${open ? "rotate-90" : ""}`}>
          &#8249;
        </span>
      </button>

      {/* Expandable form */}
      {open && (
        <div dir="rtl" className="border-t border-slate-100 p-5">
          {success ? (
            <div className="text-center py-4 space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-bold text-slate-700">رمز عبور تغییر کرد!</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">رمز عبور فعلی</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="رمز عبور فعلی"
                    required
                    autoComplete="current-password"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200/70 bg-white/70 text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">رمز جدید (حداقل ۸ کاراکتر)</label>
                <input
                  type={showPass ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="رمز جدید"
                  required
                  autoComplete="new-password"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200/70 bg-white/70 text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">تکرار رمز جدید</label>
                <input
                  type={showPass ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="تکرار رمز جدید"
                  required
                  autoComplete="new-password"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200/70 bg-white/70 text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:-translate-y-0.5 disabled:opacity-60"
                  style={{ background: `linear-gradient(270deg, ${BRAND} 0%, #14B8A6 100%)` }}
                >
                  {loading ? "در حال ذخیره..." : "ذخیره رمز جدید"}
                </button>
                <button
                  type="button"
                  onClick={() => { setOpen(false); reset(); }}
                  className="px-4 py-2.5 text-sm font-medium text-slate-500 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  انصراف
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
