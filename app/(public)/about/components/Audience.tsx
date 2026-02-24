"use client";

import { motion } from "framer-motion";
import { fadeUp } from "../motion/variants";
import { spacing, typography } from "../theme/tokens";

export default function Audience() {
  return (
    <section className={`${spacing.sectionY} ${spacing.container} grid md:grid-cols-2 gap-10`}>
      
      <motion.div {...fadeUp} className="border border-gray-200 dark:border-gray-700 p-6 rounded-xl">
        <h3 className={`${typography.h3} mb-4`}>مناسب برای</h3>
        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
          <li>✓ جوان‌ها</li>
          <li>✓ کارمندان</li>
          <li>✓ خریداران خانه</li>
          <li>✓ افراد سردرگم در اقتصاد تورمی</li>
          <li>✓ کسانی که می‌خواهند آگاهی مالی‌شان را بسنجند</li>
        </ul>
      </motion.div>

      <motion.div {...fadeUp} className="border border-gray-200 dark:border-gray-700 p-6 rounded-xl">
        <h3 className={`${typography.h3} mb-4`}>مناسب نیست برای</h3>
        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
          <li>✗ تریدر روزانه</li>
          <li>✗ سفته‌باز</li>
          <li>✗ دنبال‌کننده سیگنال</li>
        </ul>
      </motion.div>

    </section>
  );
}
