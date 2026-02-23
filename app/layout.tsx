// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  // ✅ وزن‌هایی که در UI تخمینو عملاً نیاز داری (متن، نیمه‌بولد، بولد، اکسترا بولد/بلک)
  weight: ["300", "400", "600", "700", "800", "900"],
  // ✅ این باعث میشه حتی اگر جای دیگری font-family تعریف شد، ما بتوانیم با var کنترل کنیم
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  title: "تخمینو",
  description: "پلتفرم تصمیم‌سازی مالی با ابزارهای تخمینی",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      {/* ✅ کل سایت Vazirmatn */}
      <body className={vazirmatn.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}