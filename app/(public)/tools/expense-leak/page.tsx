import type { Metadata } from 'next';
import { TrendingDown, Landmark, BookOpen } from 'lucide-react';
import ToolShell from '@/components/tools/ToolShell';
import { toolConfig } from './tool.config';
import ExpenseLeakClient from './ExpenseLeakClient';

export const metadata: Metadata = {
  title: toolConfig.seo.title,
  description: toolConfig.seo.description,
  alternates: { canonical: toolConfig.seo.canonical },
  openGraph: {
    title: toolConfig.seo.title,
    description: toolConfig.seo.description,
    url: toolConfig.seo.canonical,
    type: 'website',
  },
};

function MethodContent() {
  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div>
        <h3 className="text-base font-black text-slate-800 mb-3">نشت مالی چیست؟</h3>
        <p className="text-slate-600 text-sm leading-7">
          «نشت مالی» به هزینه‌هایی گفته می‌شود که بدون توجه و برنامه‌ریزی از درآمد خارج می‌شوند.
          اغلب در دسته‌هایی مثل بیرون‌خوری، خریدهای کوچک روزانه، اشتراک‌های فراموش‌شده یا
          تاکسی‌های اضافه پنهان می‌مانند.
        </p>
      </div>
      <div>
        <h3 className="text-base font-black text-slate-800 mb-3">روش تحلیل</h3>
        <ul className="space-y-2">
          {[
            'درآمد و هزینه‌های ماهانه را در دسته‌های اصلی وارد کنید',
            'ابزار سهم هر دسته از درآمد را محاسبه و با بازه‌های هدف مقایسه می‌کند',
            'دسته‌هایی که از بازه هدف خارج‌اند به‌عنوان «نشت» شناسایی می‌شوند',
            'بر اساس نشت‌ها، سه گام عملی برای یک ماه آینده پیشنهاد می‌شود',
          ].map((b, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              {b}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="text-base font-black text-slate-800 mb-3">نکته مهم</h3>
        <p className="text-slate-600 text-sm leading-7">
          اعداد «بازه هدف» تخمینی هستند و با توجه به سطح درآمد تنظیم می‌شوند. هدف این ابزار
          <strong> آگاهی</strong> است، نه تجویز رفتار مالی.
        </p>
      </div>
    </div>
  );
}

const faqItems = [
  {
    q: 'آیا اطلاعاتم ذخیره می‌شود؟',
    a: 'خیر. تمام محاسبات در مرورگر شما انجام می‌شود و هیچ عددی به سرور ارسال نمی‌شود.',
  },
  {
    q: 'با اعداد تقریبی هم کار می‌کند؟',
    a: 'بله، و حتی توصیه می‌شود. مهم‌تر از دقت عدد، الگوی کلی خرج‌کردن است که این ابزار آشکار می‌کند.',
  },
  {
    q: 'تفاوت حالت سریع و دقیق چیست؟',
    a: 'در حالت سریع فقط یک عدد کلی برای هر دسته وارد می‌کنید. در حالت دقیق می‌توانید جزئیات هر دسته را ببینید و بفهمید کدام آیتم بیشترین سهم را دارد.',
  },
  {
    q: 'هزینه‌های سالانه را چطور وارد کنم؟',
    a: 'در بخش «هزینه‌های بزرگ سالانه» مبلغ کل سالانه را وارد کنید. ابزار به‌صورت خودکار میانگین ماهانه آن را محاسبه می‌کند.',
  },
];

const relatedTools = [
  {
    href: '/tools/loan',
    title: 'ماشین‌حساب وام',
    desc: 'قسط ماهانه و جدول اقساط',
    icon: <Landmark className="w-5 h-5 text-blue-600" />,
  },
  {
    href: '/tools/financial-literacy',
    title: 'سواد مالی',
    desc: 'سطح آگاهی مالی خود را بسنج',
    icon: <BookOpen className="w-5 h-5 text-purple-600" />,
  },
];

export default function Page() {
  return (
    <ToolShell
      title={toolConfig.toolName}
      subtitle="الگوی خرج‌کردنت را شفاف کن — کجا پولت می‌رود؟"
      icon={<TrendingDown className="w-7 h-7" />}
      iconBg="bg-red-50 text-red-500"
      stats={[
        { value: 'رایگان', label: 'همیشه' },
        { value: 'محلی', label: 'بدون ذخیره' },
        { value: 'شفاف', label: 'فرمول باز' },
      ]}
      methodContent={<MethodContent />}
      faqItems={faqItems}
      relatedTools={relatedTools}
    >
      <ExpenseLeakClient />
    </ToolShell>
  );
}
