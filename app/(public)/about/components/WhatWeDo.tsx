"use client";

import { motion } from "framer-motion";
import { fadeUp } from "../motion/variants";
import { spacing, typography } from "../theme/tokens";

const tools = [
  "تخمین زمان خرید خانه",
  "هدف‌گذاری با طلا",
  "محاسبه وام و اقساط",
  "تحلیل قدرت خرید",
  "سناریوهای تورم",
];

export default function WhatWeDo() {
  return (
    <section className={`${spacing.sectionY} ${spacing.container} space-y-16`}>
      
      {/* Tools */}
      <div>
        <motion.h2 {...fadeUp} className={`${typography.h2} mb-6`}>
          ابزارهای تخمین مالی
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-6">
          {tools.map((t, i) => (
            <motion.div
              key={i}
              {...fadeUp}
              className="border border-gray-200 dark:border-gray-700 p-5 rounded-xl"
            >
              {t}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Adaptive */}
      <div>
        <motion.h2 {...fadeUp} className={`${typography.h2} mb-4`}>
          سنجش آگاهی مالی (Adaptive)
        </motion.h2>
        <motion.p {...fadeUp} className={typography.body}>
          یک ابزار تطبیقی که سطح دانش مالی شما را در ۵ حوزه می‌سنجد...
        </motion.p>
      </div>

      {/* Academy */}
      <div>
        <motion.h2 {...fadeUp} className={`${typography.h2} mb-4`}>
          آکادمی
        </motion.h2>
        <motion.p {...fadeUp} className={typography.body}>
          مفاهیم مالی را ساده و کاربردی توضیح می‌دهیم...
        </motion.p>
      </div>
    </section>
  );
}
