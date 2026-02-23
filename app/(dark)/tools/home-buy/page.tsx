import type { Metadata } from 'next';
import HomeBuyClient from './HomeBuyClient';

export const metadata: Metadata = {
  title: 'چند سال دیگه می‌تونم خونه بخرم؟ | تخمینو',
  description:
    'با وارد کردن چند عدد ساده، تخمینو یک تخمین تقریبی و صادقانه از زمان رسیدن به هدف خرید خانه ارائه می‌دهد.',
  alternates: {
    canonical: '/tools/home-buy',
  },
};

export default function Page() {
  return <HomeBuyClient />;
}
