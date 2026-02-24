"use client";

import { motion } from "framer-motion";
import { fadeUp } from "../motion/variants";
import { spacing, typography } from "../theme/tokens";

export default function Problem() {
  return (
    <section className={`${spacing.sectionY} ${spacing.container}`}>
      <motion.h2 {...fadeUp} className={`${typography.h2} mb-6`}>
        مسئله‌ای که حل می‌کنیم
      </motion.h2>

      <motion.p {...fadeUp} className={typography.body}>
        در اقتصادی که هر روز تغییر می‌کند، برنامه‌ریزی مالی سخت است...
      </motion.p>

      <motion.ul
        {...fadeUp}
        className="mt-6 space-y-3 text-gray-600 dark:text-gray-300"
      >
        <li>• چند سال طول می‌کشد خانه بخرند</li>
        <li>• اثر تورم روی پولشان چیست</li>
        <li>• بین طلا، دلار، سرمایه‌گذاری یا پس‌انداز کدام بهتر است</li>
        <li>• سطح آگاهی مالی‌شان چقدر است</li>
      </motion.ul>
    </section>
  );
}
